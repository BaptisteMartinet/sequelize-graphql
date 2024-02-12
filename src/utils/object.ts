export function mapRecord<KeyType extends string, ValueType, OutputType>(
  obj: Record<KeyType, ValueType>,
  fn: (value: ValueType, key: KeyType) => OutputType,
) {
  const newObj = {} as Record<KeyType, OutputType>;
  for (const key in obj) {
    const value = obj[key];
    newObj[key] = fn(value, key);
  }
  return newObj;
}

export function filterRecord<K extends string, V>(
  obj: Record<K, V>,
  fn: (value: V, key: K) => boolean,
) {
  const newObj: Partial<Record<K, V>> = {};
  for (const key in obj) {
    const value = obj[key];
    if (fn(value, key)) newObj[key] = value;
  }
  return newObj;
}

export function reduceRecord<KeyType extends string, ValueType, OutputType>(
  obj: Record<KeyType, ValueType>,
  fn: (prev: OutputType, current: ValueType, key: KeyType) => OutputType,
  initialValue: OutputType,
): OutputType {
  let acc = initialValue;
  for (const key in obj) {
    const value = obj[key];
    acc = fn(acc, value, key);
  }
  return acc;
}

export function makeRecordFromEntries<K extends string, V>(
  entries: Iterable<readonly [K, V]>,
): Record<K, V> {
  return Array.from(entries).reduce(
    (acc, [key, val]) => {
      acc[key] = val;
      return acc;
    },
    {} as Record<K, V>,
  );
}
