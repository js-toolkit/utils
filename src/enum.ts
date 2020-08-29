/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import NoSuchElementError from './fp/NoSuchElementError';

export function getEnumName<K extends string>(
  enumeration: Record<K, string | number>,
  value: string | number
): K {
  if (typeof value === 'number') {
    return enumeration[value] as K;
  }

  for (const prop in enumeration) {
    if (enumeration[prop] === value) {
      return prop;
    }
  }

  throw new NoSuchElementError();
}

export function getEnumNames<Enum, K extends string>(enumeration: Record<K, Enum>): K[] {
  return Object.keys(enumeration).filter((prop) => Number.isNaN(+prop)) as K[];
}

export function getEnumValues<Enum, K extends string>(enumeration: Record<K, Enum>): Enum[] {
  const names = getEnumNames(enumeration);
  return names.map((prop) => enumeration[prop]);
}

export function getReverseEnum<Enum extends string | number, K extends string>(
  enumeration: Record<K, Enum>
): Record<Enum, K> {
  const result: Record<Enum, K> = {} as Record<Enum, K>;
  for (const prop in enumeration) {
    const val = enumeration[prop];
    result[val] = prop;
  }
  return result;
}
