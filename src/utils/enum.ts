import { filterRecord } from './object';

export type EnumValueType = number | string;
export type EnumType<KeyType extends string = string> = Record<KeyType, EnumValueType>;

export function getEnumEntries<K extends string>(value: EnumType<K>) {
  return filterRecord(value, (_, key) => isNaN(Number(key))) as EnumType<K>;
}
