import { ModelLoader } from '@definitions/index';

export interface Context {
  modelLoader: ModelLoader;
}

export function makeContext(): Context {
  return {
    modelLoader: new ModelLoader(),
  };
}
