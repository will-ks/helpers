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
 * Takes one or more nullable variables as arguments.
 * If any of the arguments are null or undefined, throws a runtime error.
 * Otherwise, returns the arguments with their type asserted as NonNullable.
 * @throws {Error} If any argument is null or undefined.
 */
export function getAsserted<T>(arg: T): NonNullable<T>;
export function getAsserted<T extends unknown[]>(
  ...args: T[]
): {
  [K in keyof T]: T[K] extends null | undefined ? never : NonNullable<T[K]>;
};
export function getAsserted<T extends unknown[]>(...args: unknown[]) {
  args.forEach((arg, ix) => {
    if (arg === null || arg === undefined) {
      throw new Error(`Argument at index ${ix} is null or undefined`);
    }
  });

  return args.length === 1
    ? (args[0] as NonNullable<T[0]>)
    : (args as {
        [K in keyof T]: T[K] extends null | undefined
          ? never
          : NonNullable<T[K]>;
      });
}
