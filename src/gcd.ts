/** Greatest common divisor. */
export function gcd(x: number, y: number): number {
  let a = Math.abs(x);
  let b = Math.abs(y);

  while (b > 0) {
    [a, b] = [b, a % b];
  }

  return a;
}
