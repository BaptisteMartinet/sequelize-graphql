import type { Model as SequelizeModel } from 'sequelize';
import type { Model } from '@definitions/index';

import assert from 'assert';
import { GraphQLInputObjectType } from 'graphql';
import { filterRecord, mapRecord } from '@utils/object';
import { cacheGraphQLType } from '@schema/index';

export default function genModelFilters<M extends SequelizeModel>(model: Model<M>) {
  const { name, definition } = model;
  const filterableColumns = filterRecord(definition.columns, (column) => {
    return column.type.filterGqlType !== undefined && (column.filterable ?? column.exposed);
  });
  return cacheGraphQLType(
    new GraphQLInputObjectType({
      name: name + 'Filters',
      description: `The ${name} model filters`,
      fields: {
        ...mapRecord(filterableColumns, (column) => {
          assert(column); // Used for type safety. Should never trigger.
          return { type: column.type.filterGqlType };
        }),
      },
    }),
  );
}
