import type { Thunk } from '@utils/thunk';

import type {
  Sequelize,
  Model as SequelizeModel,
  DataType,
  ModelIndexesOptions,
  Association,
} from 'sequelize';
import type {
  GraphQLEnumType,
  GraphQLScalarType,
  GraphQLInputObjectType,
  GraphQLFieldConfigMap,
} from 'graphql';
import type Model from './Model';

export interface ColumnType {
  /**
   * The GraphQL type
   */
  gqlType: GraphQLScalarType | GraphQLEnumType;
  /**
   * The Sequelize type
   */
  sequelizeType: DataType;
  /**
   * The GraphQL filter type
   */
  filterGqlType: GraphQLInputObjectType;
}

export interface ColumnDefinition {
  /**
   * The sequelize-graphql type
   */
  type: ColumnType;
  /**
   * Adds a non-null constraint in DB and makes the GraphQL type non-nullable!.
   */
  allowNull: boolean;
  /**
   * Expose the column as a field on the GraphQL type.
   */
  exposed: boolean;
  defaultValue?: unknown;
  autoIncrement?: boolean;
  /**
   * Makes the field orderable.
   * @default true
   * @abstract Mainly used within paginations.
   */
  orderable?: boolean;
  /**
   * Makes the field filterable.
   * @default true
   * @abstract Mainly used within paginations.
   */
  filterable?: boolean;
  /**
   * Adds a description on the GraphQL field
   */
  description?: string;
}

export type IDColumnDefinition = Pick<ColumnDefinition, 'type' | 'autoIncrement' | 'defaultValue'>;

export type AssociationType = 'belongsTo' | 'hasOne' | 'hasMany';

export interface AssociationDefinition {
  model: Model<any>;
  type: AssociationType;
  /**
   * Expose the association as a field on the GraphQL type.
   * `hasMany` is exposed as a filterable and orderable pagination.
   */
  exposed: boolean;
  foreignKey?: string;
  deleteCascade?: boolean;
  description?: string;
}

export interface AssociationSpecs {
  sequelizeAssociation: Association;
  associationDef: AssociationDefinition;
}

export interface ModelDefinition<ModelType extends SequelizeModel> {
  name: string;
  id?: IDColumnDefinition;
  columns: Record<string, ColumnDefinition>;
  timestamps: boolean;
  sequelize: Sequelize;
  associations?: () => Record<string, AssociationDefinition>;
  fields?: Thunk<GraphQLFieldConfigMap<ModelType, any>>;
  description?: string;
  tableName?: string;
  indexes?: readonly ModelIndexesOptions[];
  paranoid?: boolean;
}
