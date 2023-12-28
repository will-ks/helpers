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

/**
 * Takes an unknown variable argument.
 * If the argument is null or undefined, throws a runtime error.
 * Otherwise, returns the argument asserted as NonNullable.
 * @throws {Error} If the first argument is null or undefined.
 */
export function getAsserted<T extends unknown>(
  assertedValue: T,
  options: {
    name?: string;
    errorConstructor?: ErrorConstructor;
  } = {}
) {
  const { errorConstructor = Error, name = 'Asserted value' } = options;
  if (assertedValue === null || assertedValue === undefined) {
    throw new errorConstructor(`${name} is null or undefined`);
  }

  return assertedValue as NonNullable<T>;
}

/**
 * Takes an array of unknown values as an argument.
 * If any of the array values is null or undefined, throws a runtime error.
 * Otherwise, returns a new array with the values asserted as NonNullable.
 * @throws {Error} If any element in the array is null or undefined.
 */
export function getManyAsserted<T extends unknown[]>(
  assertedValues: T[],
  options: {
    names?: string[];
    errorConstructor?: ErrorConstructor;
  } = {}
) {
  const { errorConstructor = Error, names = [] } = options;
  assertedValues.forEach((arg, ix) => {
    if (arg === null || arg === undefined) {
      throw new errorConstructor(
        `${names[ix] ?? `Asserted value at index ${ix}`} is null or undefined`
      );
    }
  });
  return assertedValues as {
    [K in keyof T]: NonNullable<T[K]>;
  };
}
