import type { Model as SequelizeModel } from 'sequelize';
import type { Model } from '@definitions/index';

import assert from 'assert';
import { GraphQLInputObjectType } from 'graphql';
import { filterRecord, mapRecord } from '@utils/object';
import { DateFilter } from '@definitions/model/columnTypesFilters';
import { cacheGraphQLType } from '@schema/index';

export default function genModelFilters<M extends SequelizeModel>(model: Model<M>) {
  const { name, definition } = model;
  const { columns, timestamps } = definition;
  const filterableColumns = filterRecord(columns, (column) => {
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
        ...(timestamps === undefined || timestamps === true
          ? {
              createdAt: { type: DateFilter },
              updatedAt: { type: DateFilter },
            }
          : null),
      },
    }),
  );
}
