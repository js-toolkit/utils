// https://stackoverflow.com/a/43016456
export default function calcAspectRatio(
  ratio: number,
  lim: number
): [width: number, height: number] {
  let lower: [number, number] = [0, 1];
  let upper: [number, number] = [1, 0];

  while (true) {
    const mediant: [number, number] = [lower[0] + upper[0], lower[1] + upper[1]];

    if (ratio * mediant[1] > mediant[0]) {
      if (lim < mediant[1]) {
        return upper;
      }
      lower = mediant;
    } else if (ratio * mediant[1] === mediant[0]) {
      if (lim >= mediant[1]) {
        return mediant;
      }
      if (lower[1] < upper[1]) {
        return lower;
      }
      return upper;
    } else {
      if (lim < mediant[1]) {
        return lower;
      }
      upper = mediant;
    }
  }
}
