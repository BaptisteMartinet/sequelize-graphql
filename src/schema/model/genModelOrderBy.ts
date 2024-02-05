import type { Model as SequelizeModel, OrderItem } from 'sequelize';

import { GraphQLEnumType, GraphQLInputObjectType, GraphQLNonNull } from 'graphql';
import { Model } from '@definitions/index';
import { filterRecord, mapRecord } from '@utils/object';
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
  const orderableColumns = filterRecord(
    model.definition.columns,
    ({ exposed, orderable }) => orderable ?? exposed,
  );
  return cacheGraphQLType(
    new GraphQLEnumType({
      name: model.name + 'Fields',
      values: {
        id: { value: 'id' },
        ...mapRecord(orderableColumns, (_, key) => ({ value: key })),
        ...(model.definition.timestamps
          ? {
              createdAt: { value: 'createdAt' },
              updatedAt: { value: 'updatedAt' },
            }
          : null),
        ...(model.definition.paranoid === true
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
