export function tryGet<T, F>(thunk: () => T, fallback: F): T | F {
  try {
    return thunk();
  } catch (error) {
    return fallback;
  }
}
