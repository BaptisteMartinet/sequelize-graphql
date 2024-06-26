import type { Model as SequelizeModel, OrderItem } from 'sequelize';

import { GraphQLEnumType, GraphQLInputObjectType, GraphQLNonNull } from 'graphql';
import { filterRecord, mapRecord } from '@utils/object';
import { Model } from '@definitions/index';
import { cacheGraphQLType } from '@schema/index';

export enum OrderType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export const OrderTypeEnum = new GraphQLEnumType({
  name: 'OrderType',
  values: {
    ASC: { value: 'ASC' },
    DESC: { value: 'DESC' },
  },
});

export function genModelFieldsEnum<M extends SequelizeModel>(model: Model<M>) {
  const { name, definition } = model;
  const { columns, timestamps = true, paranoid } = definition;
  const orderableColumns = filterRecord(columns, ({ exposed, orderable }) => orderable ?? exposed);
  return cacheGraphQLType(
    new GraphQLEnumType({
      name: name + 'Fields',
      values: {
        ...mapRecord(orderableColumns, (_, key) => ({ value: key })),
        ...(timestamps
          ? {
              createdAt: { value: 'createdAt' },
              updatedAt: { value: 'updatedAt' },
            }
          : null),
        ...(paranoid
          ? {
              deletedAt: { value: 'deletedAt' },
            }
          : null),
      },
    }),
  );
}

export interface GenericOrderBy {
  field: string;
  ordering: OrderType;
}

export default function genModelOrderBy<M extends SequelizeModel>(model: Model<M>) {
  return cacheGraphQLType(
    new GraphQLInputObjectType({
      name: model.name + 'OrderBy',
      fields: {
        field: { type: new GraphQLNonNull(genModelFieldsEnum(model)) },
        ordering: { type: new GraphQLNonNull(OrderTypeEnum) },
      },
    }),
  );
}

export function convertOrderByToSequelizeOrderItem(orderBy: GenericOrderBy): OrderItem {
  const { field, ordering } = orderBy;
  return [field, ordering];
}
