// Shared display formatters.

// Vietnamese đồng, e.g. 120000 → "120.000 ₫".
export const formatVnd = (n: number): string =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
