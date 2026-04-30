// src/db/migrate.ts
// Reads config and applies schema changes to PostgreSQL

import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { query } from './pool';
import { sanitizeConfig } from '../../../shared/config.schema';
import {
  generateCreateTableSQL,
  generateAlterTableSQL,
  generateUpdatedAtTrigger,
} from './schema-generator';

async function migrate() {
  console.log('🚀 Starting migration...');

  // 1. Create core tables (users, notifications)
  await query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      locale TEXT DEFAULT 'en',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      body TEXT,
      trigger_type TEXT,
      data_source TEXT,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      channels TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS csv_imports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      data_source TEXT NOT NULL,
      filename TEXT,
      rows_imported INTEGER DEFAULT 0,
      rows_failed INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      errors JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS app_config (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      config JSONB NOT NULL,
      version TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log('✅ Core tables ready');

  // 2. Load and parse app config
  const configPath = path.resolve(
    process.env.CONFIG_PATH ?? '../shared/example.config.json'
  );
  if (!fs.existsSync(configPath)) {
    console.warn(`⚠️  Config not found at ${configPath}, skipping dynamic tables`);
    return;
  }

  const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const config = sanitizeConfig(rawConfig);

  // 3. Store config in DB
  await query(
    `INSERT INTO app_config (config, version) VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [rawConfig, config.app.version]
  );

  // 4. Migrate dynamic tables
  for (const table of config.database?.tables ?? []) {
    console.log(`  → Processing table: ${table.name}`);

    // Check if table exists
    const { rows: existing } = await query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = $1 AND table_schema = 'public'`,
      [table.name]
    );

    if (existing.length === 0) {
      // Create table
      const sql = generateCreateTableSQL(table);
      await query(sql);
      console.log(`  ✅ Created table: ${table.name}`);
    } else {
      // Alter table — add missing columns
      const existingCols = existing.map((r) => r.column_name);
      const alterStatements = generateAlterTableSQL(table, existingCols);
      for (const stmt of alterStatements) {
        await query(stmt);
      }
      if (alterStatements.length > 0) {
        console.log(`  ✅ Altered table: ${table.name} (+${alterStatements.length} columns)`);
      } else {
        console.log(`  ✓  Table up-to-date: ${table.name}`);
      }
    }

    // Add updated_at trigger if timestamps enabled
    if (table.timestamps !== false) {
      await query(generateUpdatedAtTrigger(table.name));
    }
  }

  console.log('🎉 Migration complete!');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});