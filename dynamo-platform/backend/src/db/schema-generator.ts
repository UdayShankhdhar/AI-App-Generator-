// src/db/schema-generator.ts
// Converts TableConfig definitions into PostgreSQL DDL statements

import { TableConfig, FieldConfig, FieldType } from '../../../shared/config.schema';

const PG_TYPE_MAP: Record<FieldType, string> = {
  text: 'TEXT',
  number: 'NUMERIC',
  boolean: 'BOOLEAN',
  date: 'DATE',
  datetime: 'TIMESTAMPTZ',
  email: 'TEXT',
  password: 'TEXT',
  select: 'TEXT',
  multiselect: 'TEXT[]',
  textarea: 'TEXT',
  json: 'JSONB',
  uuid: 'UUID',
};

export function fieldToColumnDDL(field: FieldConfig): string {
  const pgType = PG_TYPE_MAP[field.type] ?? 'TEXT';
  const parts: string[] = [`"${field.name}" ${pgType}`];

  if (field.required) parts.push('NOT NULL');
  if (field.unique) parts.push('UNIQUE');
  if (field.default !== undefined) {
    if (field.type === 'boolean') {
      parts.push(`DEFAULT ${field.default ? 'TRUE' : 'FALSE'}`);
    } else if (field.type === 'json') {
      parts.push(`DEFAULT '${JSON.stringify(field.default)}'::JSONB`);
    } else if (typeof field.default === 'string') {
      parts.push(`DEFAULT '${field.default.replace(/'/g, "''")}'`);
    } else {
      parts.push(`DEFAULT ${field.default}`);
    }
  }

  return parts.join(' ');
}

export function generateCreateTableSQL(table: TableConfig): string {
  const columns: string[] = [
    '"id" UUID PRIMARY KEY DEFAULT gen_random_uuid()',
  ];

  // Add user_id for user-scoped tables
  if (table.userScoped) {
    columns.push('"user_id" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE');
  }

  // Add data columns
  for (const field of table.fields) {
    if (field.name === 'id') continue; // skip if user tried to define id
    columns.push(fieldToColumnDDL(field));
  }

  // Timestamps
  if (table.timestamps !== false) {
    columns.push('"created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()');
    columns.push('"updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()');
  }

  // Soft delete
  if (table.softDelete) {
    columns.push('"deleted_at" TIMESTAMPTZ');
  }

  return `
CREATE TABLE IF NOT EXISTS "${table.name}" (
  ${columns.join(',\n  ')}
);`.trim();
}

export function generateAlterTableSQL(
  table: TableConfig,
  existingColumns: string[]
): string[] {
  const statements: string[] = [];

  for (const field of table.fields) {
    if (!existingColumns.includes(field.name)) {
      const colDef = fieldToColumnDDL(field);
      statements.push(
        `ALTER TABLE "${table.name}" ADD COLUMN IF NOT EXISTS ${colDef};`
      );
    }
  }

  // Add timestamps if missing
  if (table.timestamps !== false) {
    if (!existingColumns.includes('created_at')) {
      statements.push(
        `ALTER TABLE "${table.name}" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW();`
      );
    }
    if (!existingColumns.includes('updated_at')) {
      statements.push(
        `ALTER TABLE "${table.name}" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW();`
      );
    }
  }

  return statements;
}

export function generateUpdatedAtTrigger(tableName: string): string {
  return `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_${tableName}_updated_at ON "${tableName}";
CREATE TRIGGER update_${tableName}_updated_at
  BEFORE UPDATE ON "${tableName}"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `.trim();
}