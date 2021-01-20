/** Greatest common divisor */
export default function gcd(x: number, y: number): number {
  let a = Math.abs(x);
  let b = Math.abs(y);

  while (b) {
    [a, b] = [b, a % b];
  }

  return a;
}
