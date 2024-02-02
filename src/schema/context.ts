import { ModelLoader } from '@definitions/index';

export interface Context {
  loader: ModelLoader;
}

export function makeContext(): Context {
  return {
    loader: new ModelLoader(),
  };
}
