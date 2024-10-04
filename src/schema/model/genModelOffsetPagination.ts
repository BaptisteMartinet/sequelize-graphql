/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Model as SequelizeModel,
  WhereOptions,
  Attributes,
  Includeable,
  Order,
  FindAttributeOptions,
} from 'sequelize';
import type {
  GraphQLFieldConfig,
  GraphQLFieldConfigArgumentMap,
  GraphQLNamedOutputType,
} from 'graphql';
import type { OptionalPromise } from '@utils/promise';
import type { Model } from '@definitions/index';
import type { GenericOrderBy } from '@schema/index';

import { Op } from 'sequelize';
import { GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { GraphQLNonNullList, getResolveInfoSelectedFieldsRoot } from '@graphql-utils/index';
import { promiseAllRecord } from '@utils/promise';
import { resolveFilters } from '@definitions/model/columnTypesFilters';
import {
  genModelOrderBy,
  convertOrderByToSequelizeOrderItem,
  genModelFilters,
  cacheGraphQLType,
} from '@schema/index';

export interface OffsetPaginationGraphQLArgs {
  offset?: number | null;
  limit?: number | null;
  order?: GenericOrderBy[] | null;
  filters?: Record<string, any>;
  [key: string]: unknown; // Custom args
}
export type OffsetPaginationGraphQLFieldConfig = GraphQLFieldConfig<
  any,
  any,
  OffsetPaginationGraphQLArgs
>;

export interface OffsetPaginationOpts<M extends SequelizeModel> {
  outputType?: GraphQLNamedOutputType;
  args?: GraphQLFieldConfigArgumentMap;
  config?: (
    source: any,
    args: any,
    ctx: any,
  ) => OptionalPromise<{
    attributes?: FindAttributeOptions;
    include?: Includeable | Includeable[];
    where?: WhereOptions<Attributes<M>>;
    order?: Order;
  }>;
  description?: string;
}

export default function genModelOffsetPagination<M extends SequelizeModel>(
  model: Model<M>,
  opts: OffsetPaginationOpts<M> = {},
): OffsetPaginationGraphQLFieldConfig {
  const { outputType, args, config: configGetter, description } = opts;
  const nodeType = outputType ?? model.type;

  return {
    type: new GraphQLNonNull(makeOffsetConnection(nodeType, { description })),
    args: {
      ...args,
      offset: { type: GraphQLInt },
      limit: { type: GraphQLInt },
      order: { type: new GraphQLNonNullList(genModelOrderBy(model)) },
      filters: { type: genModelFilters(model) },
    },
    async resolve(source, args, ctx, info) {
      const { offset, limit, order: orderArg, filters, ...customArgs } = args;

      const config = configGetter ? await configGetter(source, customArgs, ctx) : null;

      const whereConditions: Array<WhereOptions> = [];
      if (config?.where) whereConditions.push(config.where);
      if (filters) whereConditions.push(resolveFilters(filters));
      const where = { [Op.and]: whereConditions };

      let order: Order = [];
      if (orderArg) order = order.concat(orderArg.map(convertOrderByToSequelizeOrderItem));
      if (config?.order) order = order.concat(config.order);

      const selectedFields = getResolveInfoSelectedFieldsRoot(info);
      const nodes = selectedFields.has('nodes')
        ? model.model.findAll({
            attributes: config?.attributes,
            include: config?.include,
            offset: offset ?? undefined,
            limit: limit ?? undefined,
            order,
            where,
          })
        : null;
      const count = selectedFields.has('count')
        ? model.model.count({ include: config?.include, where })
        : null;
      return promiseAllRecord({ nodes, count });
    },
  };
}

function makeOffsetConnection(
  nodeType: GraphQLNamedOutputType,
  opts: { description?: string } = {},
) {
  const { description } = opts;
  return cacheGraphQLType(
    new GraphQLObjectType({
      name: nodeType.name + 'OffsetConnection',
      description,
      fields: () => ({
        nodes: { type: new GraphQLNonNullList(nodeType) },
        count: { type: new GraphQLNonNull(GraphQLInt) },
      }),
    }),
  );
}
