/**
 * Consistent formatting utilities across PSX StockKing
 * - Numbers in PKR with 2 decimals
 * - Percentages with sign (+/-) and 2 decimals
 * - Never prepend '+' to a value that is already negative
 */

export const formatPKR = (val, decimals = 2) => {
  const num = Number(val);
  if (isNaN(num)) return 'PKR 0.00';
  return `PKR ${num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
};

export const formatSignedNumber = (val, decimals = 2) => {
  const num = Number(val);
  if (isNaN(num)) return (0).toFixed(decimals);
  if (num > 0) return `+${num.toFixed(decimals)}`;
  if (num < 0) return num.toFixed(decimals);
  return (0).toFixed(decimals);
};

export const formatSignedPercent = (val, decimals = 2) => {
  const num = Number(val);
  if (isNaN(num)) return '0.00%';
  if (num > 0) return `+${num.toFixed(decimals)}%`;
  if (num < 0) return `${num.toFixed(decimals)}%`;
  return '0.00%';
};
