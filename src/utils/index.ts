import { AnyObject } from '../index';
import NoSuchElementError from '../fp/NoSuchElementError';

export function getEnumName(enumeration: AnyObject, value: string | number): string {
  if (typeof value === 'number') {
    return enumeration[value] as string;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const prop in enumeration) {
    if (enumeration[prop] === value) {
      return prop;
    }
  }

  throw new NoSuchElementError();
}

export function getEnumNames(enumeration: AnyObject): string[] {
  return Object.keys(enumeration).filter((prop) => Number.isNaN(+prop));
}

export function getEnumValues<Enum, K extends string>(enumeration: Record<K, Enum>): Enum[] {
  const names = getEnumNames(enumeration);
  return names.map((prop) => enumeration[prop] as Enum);
}
