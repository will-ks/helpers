export const getArrayItem = <T>(array: T[], index: number) => {
  return array.slice(index, index + 1).shift()
}

export const getFirstArrayItem = <T>(array: T[]) => getArrayItem(array, 0)

export const getLastArrayItem = <T>(array: T[]) =>
  getArrayItem(array, array.length - 1)

export const getArrayOfNumbers = (length: number, zeroIndexed = true) =>
  [...new Array(length)].map((_, i) => i + (zeroIndexed ? 0 : 1))
