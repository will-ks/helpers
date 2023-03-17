export const getEnumTypeGuard = <
  T extends { [s: string]: unknown } | ArrayLike<unknown>
>(
  e: T
) => (toCheck: unknown): toCheck is T[keyof T] =>
  Object.values(e).includes(toCheck as T[keyof T]);

export type UnknownObject =
  // all types which have typeof === 'object'
  | Record<string | number | symbol, unknown>
  | null
  | unknown[]
  | Error
  | Promise<unknown>
  | ArrayBuffer
  | DataView
  | Map<unknown, unknown>
  | Set<unknown>
  | Date;

export const isUnknownObject = (toCheck: unknown): toCheck is UnknownObject => {
  return typeof toCheck === 'object';
};

export const assertAndReturn = <T>(itemToAssert?: T, itemName = 'Object') => {
  if (!itemToAssert) {
    throw new Error(`Expected ${itemName}`);
  }
  return itemToAssert as NonNullable<T>;
};
