export const debounce = (timeMs: number) =>
  new Promise((resolve) => setTimeout(resolve, timeMs));
