import { ModelLoader } from '@definitions/index';
import { memoizer } from '@utils/memoize';

export type Context = ReturnType<typeof makeContext>;

export function makeContext() {
  return {
    modelLoader: new ModelLoader(),
    memoized: memoizer(),
  } as const;
}
