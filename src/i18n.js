// Internationalization support - French locale

const locales = {
  en: {
    dashboard: 'Dashboard',
    reports: 'Reports',
    invoices: 'Invoices',
    settings: 'Settings',
    export: 'Export',
    currency: { symbol: '$', position: 'before' }
  },
  fr: {
    dashboard: 'Tableau de bord',
    reports: 'Rapports',
    invoices: 'Factures',
    settings: 'Paramètres',
    export: 'Exporter',
    currency: { symbol: '€', position: 'after' }
  }
};

function translate(key, locale = 'en') {
  const keys = key.split('.');
  let value = locales[locale];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}

function formatCurrency(amount, locale = 'en') {
  const { symbol, position } = locales[locale].currency;
  const formatted = amount.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US');
  return position === 'before' ? `${symbol}${formatted}` : `${formatted} ${symbol}`;
}

module.exports = { translate, formatCurrency, locales };
