type JSONComparable =
  | string
  | number
  | undefined
  | null
  | Array<JSONComparable>;

export const areObjectsEquivalent = (
  a: Record<string | number | symbol, JSONComparable>,
  b: Record<string | number | symbol, JSONComparable>
) =>
  JSON.stringify(Object.entries(a).sort()) ===
  JSON.stringify(Object.entries(b).sort());
