import { sleep } from './time';
import { memoize, memoizer, attachMemoizerArgsFormatter } from './memoize';

describe('memoize', () => {
  let idx = 0;
  const increment = (value: number) => {
    return (idx += value);
  };
  const incrementMemoized = memoize(increment);

  it('should run the function normally', () => {
    expect(incrementMemoized(1)).toBe(1);
  });

  it('should return instantly', () => {
    expect(incrementMemoized(1)).toBe(1);
  });
});

describe('async memoize', () => {
  let idx = 0;
  const sleep1Sec = (value: number) => sleep(50).then(() => (idx += value));
  const sleep1SecMemoized = memoize(sleep1Sec, ([args]) => args.toString());

  it('should resolve the promise', async () => {
    expect(await sleep1SecMemoized(42)).toBe(42);
  });

  it('should return instantly', async () => {
    expect(await sleep1SecMemoized(42)).toBe(42);
  });

  it('should resolve promise again', async () => {
    expect(await sleep1SecMemoized(1)).toBe(43);
  });
});

describe('memoizer', () => {
  let idx = 0;
  const increment = (value: number) => {
    return (idx += value);
  };
  const memoized = memoizer();

  it('should run the function normally', () => {
    expect(memoized(increment, 42)).toBe(42);
  });

  it('should return instantly', () => {
    expect(memoized(increment, 42)).toBe(42);
  });

  it('should run the function normally again', () => {
    expect(memoized(increment, 1)).toBe(43);
  });
});

describe('memoizer with complicated args', () => {
  let idx = 0;
  const increment = (args: { value: number }) => {
    const { value } = args;
    return (idx += value);
  };
  attachMemoizerArgsFormatter(increment, ([args]) => args.value.toString());
  const memoized = memoizer();

  it('should run the function normally', () => {
    expect(memoized(increment, { value: 42 })).toBe(42);
  });

  it('should return instantly', () => {
    expect(memoized(increment, { value: 42 })).toBe(42);
  });

  it('should run the function normally again', () => {
    expect(memoized(increment, { value: 1 })).toBe(43);
  });
});
