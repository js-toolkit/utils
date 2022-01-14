/* eslint-disable no-unreachable-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */

export default function isEmptyObject<T extends AnyObject>(obj: T): boolean {
  for (const _ in obj) {
    return false;
  }
  return true;
}
