import { mapRecord } from './object';

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

  it('should fail', () => {
    expect(false).toBe(true);
  })
});
