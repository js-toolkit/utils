interface ArrayConstructor {
  isArray<T extends readonly unknown[]>(arg: unknown): arg is T;
}

interface ObjectConstructor {
  create(o: object | null, properties?: PropertyDescriptorMap & ThisType<any>): AnyObject;
}
