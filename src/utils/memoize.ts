/**
 * Memoize a function
 * @example
 * ```ts
 * const add = (a: number, b: number) => a + b;
 * const addMemoized = memoize(add);
 * addMemoized(1, 2);
 * addMemoized(1, 2); // Return instantly as result was cached.
 * addMemoized(1, 3);
 * ```
 * @returns A copy of the given function with the ability to cache its results
 */
export function memoize<ArgsType extends Array<unknown>, ReturnType>(
  func: (...args: ArgsType) => ReturnType,
  /**  @default (args) => args.toString() */
  formatArgsId: (args: ArgsType) => string = (args) => args.toString(),
) {
  const cache = new Map<string, ReturnType>();

  return (...args: ArgsType) => {
    const argsId = formatArgsId(args);
    const cached = cache.get(argsId);
    if (cached) return cached;
    const res = func(...args);
    cache.set(argsId, res);
    return res;
  };
}

const MemoizerFunctionIdKey = Symbol('An expando attribute to uniquely identify functions');
const MemoizerArgsIdFormatterKey = Symbol('An expando attribute to access a func args formatter');

/**
 * Attaches an args formatter to the given function to be used by the memoizer.
 * This function mutates the function and return a reference to the same function.
 */
export function attachMemoizerArgsFormatter<ArgsType extends Array<unknown>, ReturnType>(
  func: (...args: ArgsType) => ReturnType,
  formatArgsId: (args: ArgsType) => string,
) {
  (func as any)[MemoizerArgsIdFormatterKey] = formatArgsId;
  return func;
}

/**
 * Create a memoizer function
 * @example
 * ```ts
 * const memo = memoizer();
 * const add = (a: number, b: number) => a + b;
 * memo(add, 1, 2);
 * memo(add, 1, 2); // Return instantly as result was cached.
 * memo(add, 1, 3);
 * const sub = (a: number, b: number) => a - b;
 * memo(sub, 42, 42);
 * memo(sub, 42, 42); // Return instantly as result was cached.
 * memo(sub, 42, 43)
 * ```
 * You might want to customize the way args are stringified to prevent collisions (defaults to `args.toString()`).
 * You can do so like this:
 * ```ts
 * attachMemoizerArgsFormatter(add, ([ a, b ]) => `${a}-${b}`);
 * ```
 * @returns A function that can memoize any given function
 */
export function memoizer() {
  const cache = new Map<Symbol, Map<string, unknown>>();

  return <ArgsType extends Array<any>, ReturnType>(
    func: (...args: ArgsType) => ReturnType,
    ...args: ArgsType
  ) => {
    const formatArgsId = (func as any)[MemoizerArgsIdFormatterKey];
    const argsId = formatArgsId ? formatArgsId(args) : args.toString();
    const identifier = (func as any)[MemoizerFunctionIdKey];
    const functionCache = identifier ? cache.get(identifier) : null;
    if (!functionCache) {
      const newIdentifier = Symbol();
      (func as any)[MemoizerFunctionIdKey] = newIdentifier;
      const res = func(...args);
      cache.set(newIdentifier, new Map([[argsId, res]]));
      return res;
    }
    const cached = functionCache.get(argsId);
    if (cached) return cached as ReturnType;
    const res = func(...args);
    functionCache.set(argsId, res);
    return res;
  };
}
