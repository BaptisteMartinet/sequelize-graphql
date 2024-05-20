export type OptionalPromise<T> = T | Promise<T>;

export function isPromise<T>(value: OptionalPromise<T>): value is Promise<T> {
  if (value && (value as Promise<T>).then) return true;
  return false;
}

export function optionalPromiseThen<ValueT, ResultT>(
  value: OptionalPromise<ValueT>,
  handler: (value: ValueT) => OptionalPromise<ResultT>,
) {
  if (isPromise(value)) return value.then(handler);
  return handler(value);
}
