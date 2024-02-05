import type { Model as SequelizeModel, Identifier } from 'sequelize';
import type Model from './model';

import { Op } from 'sequelize';
import DataLoader from 'dataloader';

export default class ModelLoader {
  private _loaders = new Map<string /*ModelName*/, DataLoader<Identifier, unknown>>();

  public getModelLoader<M extends SequelizeModel>(model: Model<M>) {
    const { name } = model;
    const loader = this._loaders.get(name);
    if (loader !== undefined) return loader as DataLoader<Identifier, M>;
    return this._initModelLoader(model);
  }

  private _initModelLoader<M extends SequelizeModel>(model: Model<M>) {
    const { name: modelName, model: sequelizeModel } = model;
    const { primaryKeyAttribute } = sequelizeModel;
    const loaderName = ModelLoader.makeModelLoaderName(model);

    const loader = new DataLoader<Identifier, M>(
      async (keys) => {
        const items = await sequelizeModel.findAll({
          where: { [primaryKeyAttribute]: { [Op.in]: keys } } as never,
        });
        return keys.map(
          (key) =>
            items.find((item) => item.dataValues[primaryKeyAttribute] === key) ??
            new Error(`${model.formatIdentifier(key)} could not be loaded`),
        ); // TODO slow for huge batches
      },
      { name: loaderName },
    );
    this._loaders.set(modelName, loader);
    return loader;
  }

  private static makeModelLoaderName<M extends SequelizeModel>(model: Model<M>) {
    return `${model.name}:Loader`;
  }
}
