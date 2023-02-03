export const isValidJSONString = (str: string) => {
  try {
    JSON.parse(str);
  } catch {
    return false;
  }
  return true;
};

// A better JSON.stringify. Safely stringify circular references, Errors and undefined.
export const convertToString = (toStringify: unknown) => {
  return (
    JSON.stringify(
      toStringify,
      (() => {
        const visited = new WeakSet();
        return (_key: any, value: any) => {
          if (value instanceof Error) {
            value = Object.getOwnPropertyNames(value).reduce(
              (acc, propertyName) => ({
                ...acc,
                [propertyName]: value[propertyName],
              }),
              {}
            );
          }
          if (visited.has(value)) {
            return '[Circular reference]';
          }
          if (typeof value === 'object' && value !== null) {
            visited.add(value);
          }
          return value;
        };
      })()
    ) ?? 'undefined'
  );
};
