export const formatPrice = (value: unknown): string => {
  const num = Number(value ?? 0);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

export const toNumber = (value: unknown): number => {
  const num = Number(value ?? 0);
  return isNaN(num) ? 0 : num;
};
