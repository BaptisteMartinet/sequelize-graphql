import type { Model as SequelizeModel, ModelAttributes, ModelAttributeColumnOptions } from 'sequelize';
import type { ModelDefinition, ColumnDefinition, IDColumnDefinition } from '@definitions/index';

import { mapRecord } from '@utils/object';
import { camelize } from '@utils/string';
import { DefaultIDFieldDefinition } from '@definitions/index';

export function makeModelAttributes(fields: Record<string, ColumnDefinition>): ModelAttributes {
  const attributes = mapRecord(fields, (field) => {
    const { type, allowNull, defaultValue, autoIncrement } = field;
    return {
      type: type.sequelizeType,
      allowNull,
      defaultValue,
      autoIncrement,
    };
  })
  return attributes;
}

export function makeModelIdAttribute(idFieldDefinition: IDColumnDefinition = DefaultIDFieldDefinition): ModelAttributeColumnOptions<never> {
  const { type: { sequelizeType: type }, defaultValue, autoIncrement } = idFieldDefinition;
  return { primaryKey: true, allowNull: false, type, defaultValue, autoIncrement };
}

export function genDatabaseModel<M extends SequelizeModel>(definition: ModelDefinition<M>) {
  const {
    sequelize,
    name,
    id: idFieldDefinition,
    columns,
    timestamps,
    tableName,
    indexes,
    paranoid,
  } = definition;
  const attributes: ModelAttributes<M> = {
    id: makeModelIdAttribute(idFieldDefinition),
    ...makeModelAttributes(columns),
  };
  const model = sequelize.define<M>(camelize(name), attributes as never, {
    tableName: tableName ?? name,
    timestamps,
    indexes,
    paranoid,
    freezeTableName: true,
  });
  return model;
}
