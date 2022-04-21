export function escapeRegExp(exp: string): string {
  return exp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
