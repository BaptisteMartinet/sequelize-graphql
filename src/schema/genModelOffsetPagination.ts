/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Model as SequelizeModel, WhereOptions, Attributes } from 'sequelize';
import type {
  GraphQLFieldConfig,
  GraphQLFieldConfigArgumentMap,
  GraphQLNamedOutputType,
} from 'graphql';
import type { Model } from '@definitions/index';
import type { GenericOrderBy } from '@schema/index';

import { Op } from 'sequelize';
import { GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { GraphQLNonNullList } from '@graphql-utils/index';
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
  unknown,
  unknown,
  OffsetPaginationGraphQLArgs
>;

export interface OffsetPaginationOpts<M extends SequelizeModel> {
  outputType?: GraphQLNamedOutputType;
  args?: GraphQLFieldConfigArgumentMap;
  where?: (source: any, args: any, ctx: any) => WhereOptions<Attributes<M>>;
  description?: string;
}

export default function genModelOffsetPagination<M extends SequelizeModel>(
  model: Model<M>,
  opts: OffsetPaginationOpts<M> = {},
): OffsetPaginationGraphQLFieldConfig {
  const { outputType, args, where: whereGetter, description } = opts;
  const nodeType = outputType ?? model.type;
  return {
    type: makeOffsetConnection(nodeType, { description }),
    args: {
      ...args,
      offset: { type: GraphQLInt },
      limit: { type: GraphQLInt },
      order: { type: new GraphQLNonNullList(genModelOrderBy(model)) },
      filters: { type: genModelFilters(model) },
    },
    async resolve(source, args, ctx) {
      const { offset, limit, order, filters, ...customArgs } = args;

      const whereConditions: Array<WhereOptions> = [];
      if (whereGetter) whereConditions.push(whereGetter(source, customArgs, ctx));
      if (filters) whereConditions.push(resolveFilters(filters));
      const where = { [Op.and]: whereConditions };

      const { rows: nodes, count } = await model.model.findAndCountAll({
        offset: offset ?? undefined,
        limit: limit ?? undefined,
        order: order?.map(convertOrderByToSequelizeOrderItem),
        where,
      });
      return { nodes, count };
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
