import { memoizer } from '@utils/memoize';
import { ModelLoader } from '@definitions/index';

export type Context = ReturnType<typeof makeContext>;

export function makeContext() {
  return {
    modelLoader: new ModelLoader(),
    memoized: memoizer(),
  } as const;
}
