export const getRandomString = (length?: number) =>
  [...new Array(length || 10)]
    .map(() => (~~(Math.random() * 36)).toString(36))
    .join('');

export const toTitleCase = (str: string) =>
  str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });

export const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const throwIfMissing = (name: string, value?: string) => {
  if (!value) {
    throw new Error(`Missing env variable ${name}`);
  }
  return value;
};

export const toCamelCase = (string: string) =>
  (string.slice(0, 1).toLowerCase() + string.slice(1))
    .replace(/([-_ ]){1,}/g, ' ')
    .split(/[-_ ]/)
    .reduce((cur, acc) => {
      return cur + acc[0].toUpperCase() + acc.substring(1);
    });
