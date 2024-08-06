/* eslint-disable @typescript-eslint/no-unused-vars */

interface ArrayConstructor {
  isArray<T extends readonly unknown[]>(arg: unknown): arg is T;
}
