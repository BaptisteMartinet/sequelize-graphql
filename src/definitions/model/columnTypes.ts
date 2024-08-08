import type { EnumType } from '@utils/enum';
import type { ColumnType } from './types';

import {
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLBoolean,
  GraphQLEnumType,
} from 'graphql';
import { DataTypes } from 'sequelize';
import { mapRecord } from '@utils/object';
import { getEnumCleanObj } from '@utils/enum';
import { GraphQLDate } from '@graphql-utils/scalars';
import {
  IDFilter,
  IntFilter,
  FloatFilter,
  StringFilter,
  BooleanFilter,
  makeFiltersType,
} from './columnTypesFilters';

/**
 * To be used with a `UUIDV1` or `UUIDV4` default value.
 */
export const ID = {
  gqlType: GraphQLID,
  sequelizeType: DataTypes.UUID,
  filterGqlType: IDFilter,
} as const satisfies ColumnType;

export const INTEGER = {
  gqlType: GraphQLInt,
  sequelizeType: DataTypes.INTEGER,
  filterGqlType: IntFilter,
} as const satisfies ColumnType;

export const FLOAT = {
  gqlType: GraphQLFloat,
  sequelizeType: DataTypes.FLOAT,
  filterGqlType: FloatFilter,
} as const satisfies ColumnType;

export const DECIMAL = {
  gqlType: GraphQLFloat,
  sequelizeType: DataTypes.DECIMAL,
  filterGqlType: FloatFilter,
} as const satisfies ColumnType;

export const DOUBLE = {
  gqlType: GraphQLFloat,
  sequelizeType: DataTypes.DOUBLE,
  filterGqlType: FloatFilter,
} as const satisfies ColumnType;

export const STRING = {
  gqlType: GraphQLString,
  sequelizeType: DataTypes.STRING,
  filterGqlType: StringFilter,
} as const satisfies ColumnType;

export const CHAR = {
  gqlType: GraphQLString,
  sequelizeType: DataTypes.CHAR,
  filterGqlType: StringFilter,
} as const satisfies ColumnType;

export const TEXT = {
  gqlType: GraphQLString,
  sequelizeType: DataTypes.TEXT,
  filterGqlType: StringFilter,
} as const satisfies ColumnType;

export const BOOLEAN = {
  gqlType: GraphQLBoolean,
  sequelizeType: DataTypes.BOOLEAN,
  filterGqlType: BooleanFilter,
} as const satisfies ColumnType;

/**
 * Takes an enum and build its ColumnType
 *
 * @example
 *
 * ```ts
 * enum Role {
 *  Manager = 'Manager',
 *  Admin = 'Admin',
 * }
 * const RoleEnum = ENUM({
 *  name: 'Role',
 *  values: Role,
 * });
 * console.log(RoleEnum.gqlType, RoleEnum.sequelizeType);
 *
 * const User = new Model({
 *  columns: {
 *    role: { type: RoleEnum, allowNull: false, defaultValue: Role.Manager, exposed: true },
 *  },
 * });
 * ```
 */
export function ENUM(args: { name: string; values: EnumType; description?: string }): ColumnType {
  const { name, values, description } = args;
  const entries = getEnumCleanObj(values);
  const gqlType = new GraphQLEnumType({
    name,
    description,
    values: mapRecord(entries, (value) => ({ value })),
  });
  const entriesValues = Object.values(entries).map(String);
  const sequelizeType = DataTypes.ENUM(...entriesValues);
  return {
    gqlType,
    sequelizeType,
    filterGqlType: makeFiltersType(gqlType),
  };
}

// Custom types

export const DATE = {
  gqlType: GraphQLDate,
  sequelizeType: DataTypes.DATE,
  filterGqlType: IntFilter,
} as const satisfies ColumnType;

export const DATEONLY = {
  gqlType: GraphQLDate,
  sequelizeType: DataTypes.DATEONLY,
  filterGqlType: IntFilter,
} as const satisfies ColumnType;
