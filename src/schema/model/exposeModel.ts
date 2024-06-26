/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GraphQLFieldConfig, GraphQLNamedOutputType } from 'graphql';
import type { Identifier } from 'sequelize';
import type { Model } from '@definitions/index';
import type { Context } from '@schema/index';

import { GraphQLNonNull } from 'graphql';
import { GraphQLNonNullList } from '@graphql-utils/index';
import { genModelOffsetPagination } from '@schema/index';

/** Either the name of the exposed field or false to disable the exposition */
export type ExposedField = string | false;

export interface ExposedFields {
  /** Expose a field to get the provided Model by id. */
  findById: ExposedField;
  /** Expose a field to get the provided Model by ids. */
  findByIds: ExposedField;
  /** Expose a field to get a pagination of the provided Model. */
  pagination: ExposedField;
}

export interface ExposeModelOptions {
  outputType?: GraphQLNamedOutputType;
}

export default function exposeModel(
  model: Model<any>,
  exposedFields: ExposedFields,
  opts: ExposeModelOptions = {},
) {
  const { findById, findByIds, pagination } = exposedFields;
  const outputType = opts.outputType ?? model.type;
  return {
    ...(findById ? { [findById]: genModelFindById(model, { outputType }) } : null),
    ...(findByIds ? { [findByIds]: genModelFindByIds(model, { outputType }) } : null),
    ...(pagination ? { [pagination]: genModelOffsetPagination(model, { outputType }) } : null),
  } as const satisfies Record<string, GraphQLFieldConfig<unknown, Context>>;
}

export function genModelFindById(
  model: Model<any>,
  opts: {
    outputType?: GraphQLNamedOutputType;
  } = {},
): GraphQLFieldConfig<unknown, Context, { id: Identifier }> {
  const outputType = opts.outputType ?? model.type;
  return {
    type: new GraphQLNonNull(outputType),
    args: {
      id: { type: new GraphQLNonNull(model.idType.gqlType) },
    },
    resolve(source, args, ctx) {
      const { id } = args;
      return model.ensureExistence(id, { ctx });
    },
  };
}

export function genModelFindByIds(
  model: Model<any>,
  opts: {
    outputType?: GraphQLNamedOutputType;
  } = {},
): GraphQLFieldConfig<unknown, Context, { ids: Array<Identifier> }> {
  const outputType = opts.outputType ?? model.type;
  return {
    type: new GraphQLNonNull(new GraphQLNonNullList(outputType)),
    args: {
      ids: { type: new GraphQLNonNull(new GraphQLNonNullList(model.idType.gqlType)) },
    },
    resolve(source, args, ctx) {
      const { ids } = args;
      return Promise.all(ids.map((id) => model.ensureExistence(id, { ctx })));
    },
  };
}
