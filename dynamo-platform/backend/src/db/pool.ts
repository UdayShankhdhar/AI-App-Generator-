// src/db/pool.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function query<T = any>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number }> {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DB]', { query: text.slice(0, 80), duration: `${duration}ms`, rows: res.rowCount });
    }
    return { rows: res.rows, rowCount: res.rowCount ?? 0 };
  } catch (err: any) {
    console.error('[DB ERROR]', { query: text.slice(0, 80), error: err.message });
    throw err;
  }
}

export async function getClient() {
  return pool.connect();
}

export default pool;