/* eslint-disable no-bitwise */

/**
 * Javascript implementation of java's string hashcode method.
 * @see https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
export function toHashCode(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;

  for (let i = 0; i < str.length; i += 1) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }

  return hash;
}

export default toHashCode;
