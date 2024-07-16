import type { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

/**
 * @description Used to infer Model attributes typings
 * @example
 * ```ts
 * export interface BookModel extends InferModelAttributes<BookModel> {
 *  id: CreationOptional<number>;
 *  authorId: ForeignKey<number>;
 *  title: string;
 *  createdAt: CreationOptional<number>,
 *  updatedAt: CreationOptional<number>,
 * }
 * ```
 */
export type InferModelAttributes<M extends Model> = Model<InferAttributes<M>, InferCreationAttributes<M>>;

/** The default sequelize-graphql id column type (ie. UUIDV4) */
export type IdType = string;

/** The default sequelize-graphql Model attributes */
export interface DefaultAttributes extends InferModelAttributes<DefaultAttributes> {
  id: CreationOptional<IdType>;
  createdAt: CreationOptional<number>;
  updatedAt: CreationOptional<number>;
}

/**
 * @description Same as InferModelAttributes but with default attributes (see {@link DefaultAttributes}).
 * @example
 * ```ts
 * export interface BookModel extends InferModelAttributesWithDefaults<BookModel> {
 *  authorId: ForeignKey<number>;
 *  title: string;
 * }
 * ```
 */
export type InferModelAttributesWithDefaults<M extends Model> = InferModelAttributes<M> & DefaultAttributes;
