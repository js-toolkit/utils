/* eslint-disable @typescript-eslint/no-unused-vars */

interface ArrayConstructor {
  isArray<T extends readonly unknown[]>(arg: unknown): arg is T;
}

interface ObjectConstructor {
  create(o: object | null): AnyObject;
  create(o: object | null, properties: PropertyDescriptorMap & ThisType<any>): AnyObject;
}
