// https://code.activestate.com/recipes/52317/
// https://stackoverflow.com/a/43016456

/**
 * Rational approximation algorithm with adjustable level of fuzziness.
 * Converts a numeric to a rational.
 * @returns [numerator, denominator], [1,0] is infinity.
 */
export function farey(
  value: number,
  /** Max denominator */
  limit: number
): readonly [numerator: number, denominator: number] {
  let lower: readonly [number, number] = [0, 1];
  let upper: readonly [number, number] = [1, 0];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const mediant: readonly [number, number] = [lower[0] + upper[0], lower[1] + upper[1]];

    if (value * mediant[1] > mediant[0]) {
      if (limit < mediant[1]) return upper;
      lower = mediant;
    } else if (value * mediant[1] === mediant[0]) {
      if (limit >= mediant[1]) return mediant;
      if (lower[1] < upper[1]) return lower;
      return upper;
    } else {
      if (limit < mediant[1]) return lower;
      upper = mediant;
    }
  }
}

export default farey;

// console.log(farey(Math.PI, 50));
// console.log(farey(1035 / 582, 50));
