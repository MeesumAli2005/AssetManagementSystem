export function formatCurrency(amount) {
  if (amount === null || amount === undefined || amount === '') return '—';
  const number = Number(amount);
  if (Number.isNaN(number)) return '—';
  return `PKR ${number.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 3 })}`;
}

