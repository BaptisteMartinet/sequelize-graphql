import { makeRecordFromEntries } from '@utils/object';

export async function promiseAllRecord<T extends Readonly<Record<string, unknown>>>(record: T) {
  const keys = Object.keys(record);
  const values = await Promise.all(Object.values(record));
  return makeRecordFromEntries(keys.map((key, idx) => [key, values[idx]])) as {
    [K in keyof T]: Awaited<T[K]>;
  };
}
