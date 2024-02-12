import { mapRecord, filterRecord, reduceRecord } from './object';

describe('mapRecord', () => {
  const baseObj = {
    a: 1,
    b: 2,
    c: 3,
  } as const;

  it('should increase record values by one', () => {
    expect(mapRecord(baseObj, (val, key) => val + 1)).toMatchObject({ a: 2, b: 3, c: 4 });
  });

  it('should replace record values by their keys', () => {
    expect(mapRecord(baseObj, (val, key) => key)).toMatchObject({ a: 'a', b: 'b', c: 'c' });
  });
});

describe('filterRecord', () => {
  const baseObj = {
    a: -10,
    b: -5,
    c: 42,
  } as const;

  it('should filter out all values', () => {
    expect(filterRecord(baseObj, () => false)).toMatchObject({});
  });

  it('should filter out negative values', () => {
    expect(filterRecord(baseObj, (val) => val >= 0)).toMatchObject({ c: 42 });
  });

  it('should filter out object keys that are not "b"', () => {
    expect(filterRecord(baseObj, (_, key) => key === 'b')).toMatchObject({ b: -5 });
  });
});

describe('reduceRecord', () => {
  const baseObj = {
    a: 1,
    b: 2,
    c: 3,
  } as const;

  it('should sum up object values', () => {
    expect(reduceRecord(baseObj, (prev, value) => prev + value, 0)).toEqual(6);
  });

  it('should concatenate object keys', () => {
    expect(reduceRecord(baseObj, (prev, _, key) => prev + key, '')).toEqual('abc');
  });
});
