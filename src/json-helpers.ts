export const isValidJSONString = (str: string) => {
  try {
    JSON.parse(str);
  } catch {
    return false;
  }
  return true;
};

export const circularReferenceSafeJSONStringify = (toStringify: any) => {
  return JSON.stringify(
    toStringify,
    (() => {
      const visited = new WeakSet();
      return (_key: any, value: any) => {
        if (visited.has(value)) {
          return '[Circular reference]';
        }
        if (typeof value === 'object' && value !== null) {
          visited.add(value);
        }
        return value;
      };
    })()
  );
};
