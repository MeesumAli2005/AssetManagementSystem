// small formatting helpers, right now just money
export function formatCurrency(amount: number | string | null | undefined) {
  if (amount === null || amount === undefined || amount === "") return "—";
  const number = Number(amount);
  if (Number.isNaN(number)) return "—";
  return `PKR ${number.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 3 })}`;
}
