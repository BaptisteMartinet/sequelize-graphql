/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ThunkObj } from '@utils/thunk';

import type {
  Sequelize,
  Model as SequelizeModel,
  DataType,
  ModelIndexesOptions,
  Association,
} from 'sequelize';
import type {
  GraphQLFieldConfig,
  GraphQLEnumType,
  GraphQLScalarType,
  GraphQLInputObjectType,
} from 'graphql';
import type Model from './Model';

export interface ColumnType {
  gqlType: GraphQLScalarType | GraphQLEnumType; // TODO infer typing?
  sequelizeType: DataType;
  filterGqlType: GraphQLInputObjectType;
}

export interface ColumnDefinition {
  type: ColumnType;
  allowNull: boolean;
  exposed: boolean;
  defaultValue?: unknown;
  autoIncrement?: boolean;
  orderable?: boolean;
  filterable?: boolean;
  description?: string;
}

export type IDColumnDefinition = Pick<ColumnDefinition, 'type' | 'autoIncrement' | 'defaultValue'>;

export type AssociationType = 'belongsTo' | 'hasOne' | 'hasMany';

export interface AssociationDefinition {
  model: Model<any>;
  type: AssociationType;
  exposed: boolean;
  foreignKey?: string;
  deleteCascade?: boolean;
  description?: string;
}

export type AssocationSpecs = {
  sequelizeAssociation: Association;
  associationDef: AssociationDefinition;
};

export interface ModelDefinition<ModelType extends SequelizeModel> {
  name: string;
  id?: IDColumnDefinition;
  columns: Record<string, ColumnDefinition>;
  timestamps: boolean;
  sequelize: Sequelize;
  associations?: () => Record<string, AssociationDefinition>;
  fields?: ThunkObj<GraphQLFieldConfig<ModelType, unknown>>;
  description?: string;
  tableName?: string;
  indexes?: readonly ModelIndexesOptions[];
  paranoid?: boolean;
}
