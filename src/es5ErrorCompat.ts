/* eslint-disable no-proto */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

export function es5ErrorCompat<S extends Error, C extends AnyConstructor>(
  target: S,
  TargetCtor: C
): void {
  target.name = TargetCtor.name;
  // Workaround to make `instanceof` work in ES5
  target.constructor = TargetCtor;
  (target as AnyObject).__proto__ = TargetCtor.prototype;
}
