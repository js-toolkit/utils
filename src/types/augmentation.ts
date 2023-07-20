export type GetFilteredKeys<T extends AnyObject> = Extract<
  { [P in keyof T]: true extends T[P] ? P : never }[keyof T],
  string
>;

export type GetOverridedKeys<
  T extends string | number,
  U extends AnyObject = EmptyObject,
> = GetFilteredKeys<Merge<Record<T, true>, U>>;
