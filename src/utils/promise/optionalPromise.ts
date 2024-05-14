export type OptionalPromise<T> = T | Promise<T>;

export function isPromise<T>(value: OptionalPromise<T>): value is Promise<T> {
  if (value && (value as Promise<T>).then) return true;
  return false;
}
