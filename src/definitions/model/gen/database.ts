import type { Model as SequelizeModel, ModelAttributes, ModelAttributeColumnOptions } from 'sequelize';
import type { ModelDefinition, ColumnDefinition, IDColumnDefinition } from '@definitions/index';

import { mapRecord } from '@utils/object';
import { camelize } from '@utils/string';
import { DefaultIDFieldDefinition } from '@definitions/model/constants';

export function makeModelAttributes(fields: Record<string, ColumnDefinition>): ModelAttributes {
  const attributes = mapRecord(fields, (field, columnName) => {
    const { type, allowNull, defaultValue, autoIncrement, unique, validate } = field;
    return {
      type: type.sequelizeType,
      allowNull,
      defaultValue,
      autoIncrement,
      unique,
      validate: {
        validation(value: any) {
          if (value === null && allowNull) // Weird case where sequelize run validation with null value.
            return;
          if (validate && validate(value, this))
            return;
          throw new Error(`${columnName} got invalid value: ${value}`);
        },
      },
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
