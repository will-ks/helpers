export function joinClasses(
  ...args: (string | false | undefined | null | 0)[]
) {
  return args.filter((arg) => !!arg).join(' ')
}
