/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable dot-notation */
/* eslint-disable no-proto */
/* eslint-disable @typescript-eslint/ban-types */

export default function es5ErrorCompat<S extends Error, C extends Function>(
  this: S,
  Ctor: C
): void {
  this.name = Ctor.name;
  // Workaround to make `instanceof` work in ES5
  this.constructor = Ctor;
  this['__proto__'] = Ctor.prototype;
}
