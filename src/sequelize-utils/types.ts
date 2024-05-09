import type { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

/**
 * @description Used to infer Model typings
 * @example
 * ```ts
 * export interface BookModel extends InferSequelizeModel<BookModel> {
 *  id: CreationOptional<number>;
 *  authorId: ForeignKey<number>;
 *  title: string;
 * }
 * ```
 */
export type InferSequelizeModel<M extends Model> = Model<InferAttributes<M>, InferCreationAttributes<M>>;

/** The default sequelize-graphql id column type (ie. UUIDV4) */
export type IdType = string;

/** The default sequelize-graphql Model attributes */
export interface DefaultAttributes {
  id: CreationOptional<IdType>;
  createdAt: CreationOptional<number>;
  updatedAt: CreationOptional<number>;
}

export type InferSequelizeModelWithDefaults<M extends Model> = InferSequelizeModel<M & DefaultAttributes>;
