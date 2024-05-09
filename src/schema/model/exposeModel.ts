/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GraphQLFieldConfig } from 'graphql';
import type { Identifier } from 'sequelize';
import type { Model } from '@definitions/index';
import type { Context } from '@schema/index';

import { GraphQLNonNull } from 'graphql';
import { GraphQLNonNullList } from '@graphql-utils/index';
import { reduceRecord } from '@utils/object';
import { genModelOffsetPagination } from '@schema/index';

/**
 * Either the name of the exposed field or false to disable the exposition
 */
export type ExposeField = string | false;

export interface ExposeOpts {
  /**
   * Expose a field to get the provided Model by id.
   */
  findById: ExposeField;
  /**
   * Expose a field to get the provided Model by ids.
   */
  findByIds: ExposeField;
  /**
   * Expose a field to get a pagination of the provided Model.
   */
  pagination: ExposeField;
}

export default function exposeModel(model: Model<any>, opts: ExposeOpts) {
  return reduceRecord(
    opts,
    (config, exposition, exposeField) => {
      if (exposition === false) return config;
      config[exposition] = genExposition(model, exposeField);
      return config;
    },
    {} as Record<string, GraphQLFieldConfig<unknown, Context>>,
  );
}

function genExposition(model: Model<any>, exposeField: keyof ExposeOpts) {
  switch (exposeField) {
    case 'findById':
      return genModelFindById(model);
    case 'findByIds':
      return genModelFindByIds(model);
    case 'pagination':
      return genModelOffsetPagination(model);
    default:
      break;
  }
  throw new Error(`Unsupported expose field: ${exposeField}`);
}

function genModelFindById(
  model: Model<any>,
): GraphQLFieldConfig<unknown, Context, { id: Identifier }> {
  return {
    type: new GraphQLNonNull(model.type),
    args: {
      id: { type: new GraphQLNonNull(model.idType.gqlType) },
    },
    resolve(source, args, ctx) {
      const { id } = args;
      return model.ensureExistence(id, { ctx });
    },
  };
}

function genModelFindByIds(
  model: Model<any>,
): GraphQLFieldConfig<unknown, Context, { ids: Array<Identifier> }> {
  return {
    type: new GraphQLNonNull(new GraphQLNonNullList(model.type)),
    args: {
      ids: { type: new GraphQLNonNull(new GraphQLNonNullList(model.idType.gqlType)) },
    },
    resolve(source, args, ctx) {
      const { ids } = args;
      return Promise.all(ids.map((id) => model.ensureExistence(id, { ctx })));
    },
  };
}
