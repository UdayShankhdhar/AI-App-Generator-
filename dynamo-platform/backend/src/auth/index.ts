// src/auth/index.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { query } from '../db/pool';

const JWT_SECRET = process.env.JWT_SECRET ?? 'fallback-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// ─── Password helpers ─────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// ─── Auth routes handler ──────────────────────────────────────────────────────

export async function registerHandler(req: Request, res: Response) {
  const { email, password, name, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, created_at`,
      [email.toLowerCase(), passwordHash, name ?? null, role ?? 'user']
    );

    const user = rows[0];
    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    return res.status(201).json({ user, token });
  } catch (err: any) {
    console.error('[Auth] Register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

export async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { rows } = await query(
      'SELECT id, email, name, role, password_hash FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const { password_hash: _, ...safeUser } = user;

    return res.json({ user: safeUser, token });
  } catch (err: any) {
    console.error('[Auth] Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
}

export async function meHandler(req: AuthRequest, res: Response) {
  try {
    const { rows } = await query(
      'SELECT id, email, name, role, locale, created_at FROM users WHERE id = $1',
      [req.user!.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
}

export async function updateLocaleHandler(req: AuthRequest, res: Response) {
  const { locale } = req.body;
  if (!locale) return res.status(400).json({ error: 'locale is required' });

  try {
    await query('UPDATE users SET locale = $1 WHERE id = $2', [locale, req.user!.userId]);
    return res.json({ success: true, locale });
  } catch {
    return res.status(500).json({ error: 'Failed to update locale' });
  }
}