// https://code.activestate.com/recipes/52317/
// https://stackoverflow.com/a/43016456

/** Converts a numeric to a rational.
 * @returns [numerator, denominator], [1,0] is infinity. */
export default function farey(
  value: number,
  /** Max denominator */
  limit: number
): [numerator: number, denominator: number] {
  let lower: [number, number] = [0, 1];
  let upper: [number, number] = [1, 0];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const mediant: [number, number] = [lower[0] + upper[0], lower[1] + upper[1]];

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

// console.log(farey(Math.PI, 50));
