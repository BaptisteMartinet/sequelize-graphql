import type { Model as SequelizeModel } from 'sequelize';
import type { GraphQLFieldConfigMap } from 'graphql';
import type { Model } from '@definitions/index';
import type { ModelDefinition, ColumnDefinition } from '@definitions/index';

import { GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { GraphQLDate } from '@graphql-utils/index';
import { mapRecord, filterRecord } from '@utils/object';
import { unthunk } from '@utils/thunk';
import { DefaultIDFieldDefinition } from '@definitions/model/constants';
import { genModelAssociationsFields } from './associations';

export function genModelColumnsFields(
  columns: Record<string, ColumnDefinition>,
): GraphQLFieldConfigMap<unknown, unknown> {
  const exposedColumns = filterRecord(columns, (column) => column.exposed) as NonNullable<
    typeof columns
  >;
  return mapRecord(exposedColumns, (field) => {
    const {
      type: { gqlType },
      defaultValue,
      description,
      allowNull,
    } = field;
    const type = allowNull ? gqlType : new GraphQLNonNull(gqlType);
    return {
      type,
      description,
      defaultValue,
    };
  });
}

export function genModelBaseFields(
  definition: Pick<ModelDefinition<never>, 'id' | 'timestamps' | 'paranoid'>,
): GraphQLFieldConfigMap<unknown, unknown> {
  const { id: idFieldDefinition, timestamps = true, paranoid } = definition;
  const idFieldType = idFieldDefinition?.type.gqlType ?? DefaultIDFieldDefinition.type.gqlType;
  return {
    id: { type: new GraphQLNonNull(idFieldType) },
    ...(timestamps
      ? {
          createdAt: { type: new GraphQLNonNull(GraphQLDate) },
          updatedAt: { type: new GraphQLNonNull(GraphQLDate) },
        }
      : null),
    ...(paranoid === true
      ? {
          deletedAt: { type: new GraphQLNonNull(GraphQLDate) },
        }
      : null),
  };
}

export default function genModelGraphQLType<M extends SequelizeModel>(model: Model<M>) {
  const { definition, associations } = model;
  const { name, description, columns, fields } = definition;
  return new GraphQLObjectType({
    name,
    description,
    fields: () => ({
      ...genModelBaseFields(definition),
      ...genModelColumnsFields(columns),
      ...genModelAssociationsFields(associations),
      ...unthunk(fields),
    }),
  });
}
