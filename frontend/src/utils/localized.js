export function localized(item, field, lang) {
  if (!item) return '';
  const translations = item.translations || {};
  const en = item[`${field}En`] ?? item[`${field}_en`] ?? translations.en?.[field] ?? translations[field]?.en;
  const te = item[`${field}Te`] ?? item[`${field}_te`] ?? translations.te?.[field] ?? translations[field]?.te;
  return (lang === 'te' ? te || en : en || item[field]) || item[field] || '';
}
