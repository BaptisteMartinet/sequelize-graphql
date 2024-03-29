import { Model, InferAttributes, InferCreationAttributes } from 'sequelize';

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
