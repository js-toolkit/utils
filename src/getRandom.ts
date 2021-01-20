export default function getRandom(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
