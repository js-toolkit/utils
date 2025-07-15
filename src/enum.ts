/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import { NoSuchElementError } from './NoSuchElementError';

export function getEnumName<K extends string>(
  enumeration: Record<K, string | number>,
  value: string | number
): K {
  if (typeof value === 'number') {
    // Check for plain objects
    if (value in enumeration) return enumeration[value as unknown as K] as K;
  }

  for (const prop in enumeration) {
    if (enumeration[prop] === value) {
      return prop;
    }
  }

  throw new NoSuchElementError(`Value ${value} not found in enumeration.`);
}

export function mapEnumNames<Enum extends string | number, K extends string, M = K>(
  enumeration: Record<K, Enum>,
  callback: (name: K) => M
): M[] {
  const result = [] as M[];
  for (const prop in enumeration) {
    const nameOrValue: PropertyKey = enumeration[prop as K];
    if (
      !(nameOrValue in enumeration) ||
      (Number.isNaN(+prop) && !Number.isNaN(nameOrValue)) ||
      prop === String(nameOrValue)
    ) {
      result.push(callback ? callback(prop) : (prop as unknown as M));
    }
  }
  return result;
}

export function getEnumNames<Enum extends string | number, K extends string>(
  enumeration: Record<K, Enum>
): K[] {
  return mapEnumNames(enumeration, (name) => name);
}

export function getEnumValues<Enum extends string | number, K extends string>(
  enumeration: Record<K, Enum>
): Enum[] {
  return mapEnumNames(enumeration, (prop) => enumeration[prop]);
}

export function reverseEnum<Enum extends string | number, K extends string>(
  enumeration: Record<K, Enum>
): Record<Enum, K> {
  const result: Record<Enum, K> = Object.create(null) as Record<Enum, K>;
  for (const prop in enumeration) {
    const val = enumeration[prop];
    result[val] = prop;
  }
  return result;
}
