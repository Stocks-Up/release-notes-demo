// African currency support for multi-currency dashboards

const AFRICAN_CURRENCIES = {
  NGN: { name: 'Nigerian Naira', symbol: '₦', decimals: 2 },
  ZAR: { name: 'South African Rand', symbol: 'R', decimals: 2 },
  KES: { name: 'Kenyan Shilling', symbol: 'KSh', decimals: 2 },
  GHS: { name: 'Ghanaian Cedi', symbol: 'GH₵', decimals: 2 },
  EGP: { name: 'Egyptian Pound', symbol: 'E£', decimals: 2 },
  MAD: { name: 'Moroccan Dirham', symbol: 'MAD', decimals: 2 },
  XOF: { name: 'West African CFA Franc', symbol: 'CFA', decimals: 0 },
  XAF: { name: 'Central African CFA Franc', symbol: 'FCFA', decimals: 0 },
  TZS: { name: 'Tanzanian Shilling', symbol: 'TSh', decimals: 2 },
  UGX: { name: 'Ugandan Shilling', symbol: 'USh', decimals: 0 },
};

function formatCurrency(amount, currencyCode) {
  const currency = AFRICAN_CURRENCIES[currencyCode];
  if (!currency) return `${amount}`;
  const formatted = amount.toFixed(currency.decimals);
  return `${currency.symbol}${formatted}`;
}

function getSupportedCurrencies() {
  return Object.entries(AFRICAN_CURRENCIES).map(([code, info]) => ({
    code,
    ...info,
  }));
}

module.exports = { AFRICAN_CURRENCIES, formatCurrency, getSupportedCurrencies };
