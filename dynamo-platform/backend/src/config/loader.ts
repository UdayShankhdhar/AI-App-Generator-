// src/config/loader.ts
// Loads, validates, and caches the application configuration

import fs from 'fs';
import path from 'path';
import { AppConfig, sanitizeConfig } from '../../../shared/config.schema';
import { query } from '../db/pool';

let cachedConfig: AppConfig | null = null;
let configLoadedAt: Date | null = null;

export async function loadConfig(forceReload = false): Promise<AppConfig> {
  // Return cached config if fresh (within 60 seconds)
  if (
    !forceReload &&
    cachedConfig &&
    configLoadedAt &&
    Date.now() - configLoadedAt.getTime() < 60_000
  ) {
    return cachedConfig;
  }

  let rawConfig: unknown = null;

  // Try loading from file first
  const configPath = path.resolve(process.cwd(), 'Example.config.json');

  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      rawConfig = JSON.parse(content);
    } catch (err) {
      console.warn('[Config] Failed to parse config file, trying DB:', err);
    }
  }

  // Fallback to DB
  if (!rawConfig) {
    try {
      const { rows } = await query(
        'SELECT config FROM app_config ORDER BY created_at DESC LIMIT 1'
      );
      if (rows.length > 0) {
        rawConfig = rows[0].config;
      }
    } catch (err) {
      console.warn('[Config] Failed to load config from DB:', err);
    }
  }

  // Final fallback: empty config (system still works)
  if (!rawConfig) {
    console.warn('[Config] No config found, using defaults');
    rawConfig = {};
  }

  cachedConfig = sanitizeConfig(rawConfig);
  configLoadedAt = new Date();

  return cachedConfig;
}

export function clearConfigCache() {
  cachedConfig = null;
  configLoadedAt = null;
}

export async function getTableConfig(tableName: string) {
  const config = await loadConfig();
  return config.database?.tables.find((t) => t.name === tableName) ?? null;
}

export async function getPageConfig(pageId: string) {
  const config = await loadConfig();
  return config.pages?.find((p) => p.id === pageId) ?? null;
}

export async function getNotificationRules(trigger: string, dataSource?: string) {
  const config = await loadConfig();
  return (config.notifications ?? []).filter(
    (n) =>
      n.trigger === trigger &&
      (!n.dataSource || !dataSource || n.dataSource === dataSource)
  );
}
