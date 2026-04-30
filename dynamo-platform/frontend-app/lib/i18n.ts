export function t(
  config: any,
  locale: string,
  key: string
) {

  return (
    config?.i18n?.translations?.[
      locale
    ]?.[key]
    ||
    key
  );
}