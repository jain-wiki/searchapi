
export function clampLatLng(value: number): number {
  // Only keep up to 6 decimal places
  return Math.round(value * 1e6) / 1e6;
}