// shared/config.schema.ts
// Master schema for the config-driven platform

export type FieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'email'
  | 'password'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'json'
  | 'uuid';

export interface FieldConfig {
  name: string;
  type: FieldType;
  label?: string;
  required?: boolean;
  unique?: boolean;
  default?: unknown;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  hidden?: boolean;
  readOnly?: boolean;
}

export interface TableConfig {
  name: string;
  displayName?: string;
  fields: FieldConfig[];
  timestamps?: boolean; // auto add created_at, updated_at
  userScoped?: boolean; // filter by user_id
  softDelete?: boolean;
}

export interface DatabaseConfig {
  tables: TableConfig[];
}

// ─── Components ──────────────────────────────────────────────────────────────

export type ComponentType =
  | 'form'
  | 'table'
  | 'dashboard'
  | 'chart'
  | 'card'
  | 'csv-import'
  | 'notifications'
  | 'custom';

export interface BaseComponent {
  id?: string;
  type: ComponentType;
  title?: string;
  hidden?: boolean;
}

export interface FormComponent extends BaseComponent {
  type: 'form';
  dataSource: string; // table name
  fields?: string[]; // subset of table fields; defaults to all
  submitLabel?: string;
  redirectAfterSubmit?: string; // page id
  editMode?: boolean; // true = update existing record
}

export interface TableComponent extends BaseComponent {
  type: 'table';
  dataSource: string;
  columns?: string[];
  actions?: Array<'view' | 'edit' | 'delete'>;
  pagination?: boolean;
  pageSize?: number;
  searchable?: boolean;
  exportCsv?: boolean;
}

export interface DashboardComponent extends BaseComponent {
  type: 'dashboard';
  metrics: Array<{
    label: string;
    dataSource: string;
    aggregation: 'count' | 'sum' | 'avg';
    field?: string;
    icon?: string;
  }>;
}

export interface ChartComponent extends BaseComponent {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'area';
  dataSource: string;
  xField: string;
  yField: string;
  aggregation?: 'count' | 'sum' | 'avg';
}

export interface CsvImportComponent extends BaseComponent {
  type: 'csv-import';
  dataSource: string;
  fieldMapping?: Record<string, string>; // csv column -> table field
}

export interface NotificationsComponent extends BaseComponent {
  type: 'notifications';
}

export interface CustomComponent extends BaseComponent {
  type: 'custom';
  componentKey: string; // registered in component registry
  props?: Record<string, unknown>;
}

export type AnyComponent =
  | FormComponent
  | TableComponent
  | DashboardComponent
  | ChartComponent
  | CsvImportComponent
  | NotificationsComponent
  | CustomComponent;

// ─── Pages ───────────────────────────────────────────────────────────────────

export interface PageConfig {
  id: string;
  title: string;
  path?: string; // auto-derived from id if omitted
  icon?: string;
  components: AnyComponent[];
  auth?: boolean; // defaults to true
  roles?: string[]; // restrict to roles
  hidden?: boolean; // hide from nav
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthConfig {
  enabled?: boolean;
  methods?: Array<'email' | 'google' | 'github'>;
  ui?: {
    logo?: string;
    title?: string;
    subtitle?: string;
    primaryColor?: string;
  };
  roles?: string[];
  defaultRole?: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationTrigger = 'record.created' | 'record.updated' | 'record.deleted' | 'user.login' | 'csv.imported';

export interface NotificationRule {
  id: string;
  trigger: NotificationTrigger;
  dataSource?: string; // optional table filter
  channels: Array<'in-app' | 'email'>;
  template: {
    subject: string;
    body: string; // supports {{field}} interpolation
  };
}

// ─── i18n ─────────────────────────────────────────────────────────────────────

export interface I18nConfig {
  defaultLocale: string;
  supportedLocales: string[];
  translations?: Record<string, Record<string, string>>; // locale -> key -> value
}

// ─── App Config (Root) ────────────────────────────────────────────────────────

export interface AppConfig {
  app: {
    name: string;
    description?: string;
    version?: string;
    locale?: string;
    theme?: {
      primaryColor?: string;
      mode?: 'light' | 'dark';
    };
  };
  auth?: AuthConfig;
  database?: DatabaseConfig;
  pages?: PageConfig[];
  notifications?: NotificationRule[];
  i18n?: I18nConfig;
  api?: {
    baseUrl?: string;
    version?: string;
    rateLimit?: number;
  };
}

// ─── Validation & Sanitization ────────────────────────────────────────────────

export function sanitizeConfig(raw: unknown): AppConfig {
  const config = (raw ?? {}) as Partial<AppConfig>;

  return {
    app: {
      name: config.app?.name ?? 'Dynamo App',
      description: config.app?.description,
      version: config.app?.version ?? '1.0.0',
      locale: config.app?.locale ?? 'en',
      theme: {
        primaryColor: config.app?.theme?.primaryColor ?? '#6366f1',
        mode: config.app?.theme?.mode ?? 'light',
      },
    },
    auth: {
      enabled: config.auth?.enabled ?? true,
      methods: config.auth?.methods ?? ['email'],
      ui: config.auth?.ui ?? {},
      roles: config.auth?.roles ?? ['user', 'admin'],
      defaultRole: config.auth?.defaultRole ?? 'user',
    },
    database: {
      tables: (config.database?.tables ?? []).map(sanitizeTable),
    },
    pages: (config.pages ?? []).map(sanitizePage),
    notifications: config.notifications ?? [],
    i18n: {
      defaultLocale: config.i18n?.defaultLocale ?? 'en',
      supportedLocales: config.i18n?.supportedLocales ?? ['en'],
      translations: config.i18n?.translations ?? {},
    },
    api: {
      baseUrl: config.api?.baseUrl ?? 'http://localhost:4000',
      version: config.api?.version ?? 'v1',
      rateLimit: config.api?.rateLimit ?? 100,
    },
  };
}

function sanitizeTable(raw: Partial<TableConfig>): TableConfig {
  return {
    name: raw.name ?? `table_${Math.random().toString(36).slice(2, 7)}`,
    displayName: raw.displayName ?? raw.name,
    fields: (raw.fields ?? []).map(sanitizeField),
    timestamps: raw.timestamps ?? true,
    userScoped: raw.userScoped ?? false,
    softDelete: raw.softDelete ?? false,
  };
}

function sanitizeField(raw: Partial<FieldConfig>): FieldConfig {
  const validTypes: FieldType[] = [
    'text', 'number', 'boolean', 'date', 'datetime',
    'email', 'password', 'select', 'multiselect', 'textarea', 'json', 'uuid',
  ];
  return {
    name: raw.name ?? `field_${Math.random().toString(36).slice(2, 7)}`,
    type: validTypes.includes(raw.type as FieldType) ? (raw.type as FieldType) : 'text',
    label: raw.label ?? raw.name,
    required: raw.required ?? false,
    unique: raw.unique ?? false,
    default: raw.default,
    options: raw.options ?? [],
    validation: raw.validation ?? {},
    hidden: raw.hidden ?? false,
    readOnly: raw.readOnly ?? false,
  };
}

function sanitizePage(raw: Partial<PageConfig>): PageConfig {
  return {
    id: raw.id ?? `page_${Math.random().toString(36).slice(2, 7)}`,
    title: raw.title ?? 'Untitled Page',
    path: raw.path ?? `/${raw.id ?? 'page'}`,
    icon: raw.icon,
    components: (raw.components ?? []).map(sanitizeComponent),
    auth: raw.auth ?? true,
    roles: raw.roles,
    hidden: raw.hidden ?? false,
  };
}

function sanitizeComponent(raw: Partial<AnyComponent>): AnyComponent {
  const base = {
    id: (raw as any).id ?? `comp_${Math.random().toString(36).slice(2, 7)}`,
    type: (raw as any).type ?? 'custom',
    title: (raw as any).title,
    hidden: (raw as any).hidden ?? false,
  };

  switch (raw.type) {
    case 'form':
      return {
        ...base,
        type: 'form',
        dataSource: (raw as FormComponent).dataSource ?? '',
        fields: (raw as FormComponent).fields,
        submitLabel: (raw as FormComponent).submitLabel ?? 'Submit',
        redirectAfterSubmit: (raw as FormComponent).redirectAfterSubmit,
        editMode: (raw as FormComponent).editMode ?? false,
      };
    case 'table':
      return {
        ...base,
        type: 'table',
        dataSource: (raw as TableComponent).dataSource ?? '',
        columns: (raw as TableComponent).columns,
        actions: (raw as TableComponent).actions ?? ['view', 'edit', 'delete'],
        pagination: (raw as TableComponent).pagination ?? true,
        pageSize: (raw as TableComponent).pageSize ?? 10,
        searchable: (raw as TableComponent).searchable ?? true,
        exportCsv: (raw as TableComponent).exportCsv ?? false,
      };
    case 'dashboard':
      return {
        ...base,
        type: 'dashboard',
        metrics: (raw as DashboardComponent).metrics ?? [],
      };
    case 'csv-import':
      return {
        ...base,
        type: 'csv-import',
        dataSource: (raw as CsvImportComponent).dataSource ?? '',
        fieldMapping: (raw as CsvImportComponent).fieldMapping ?? {},
      };
    case 'notifications':
      return { ...base, type: 'notifications' };
    default:
      return {
        ...base,
        type: 'custom',
        componentKey: (raw as CustomComponent).componentKey ?? 'unknown',
        props: (raw as CustomComponent).props ?? {},
      };
  }
}

export default sanitizeConfig;