import type { Model as SequelizeModel } from 'sequelize';
import type { Model } from '@definitions/index';

export default function validateModelFields<M extends SequelizeModel>(
  model: Model<M>,
  fields: Record<string, any>,
) {
  const { name, definition } = model;
  const { columns } = definition;

  for (const fieldKey in fields) {
    const columnDefinition = columns[fieldKey];
    if (!columnDefinition) continue;
    const { allowNull, validate } = columnDefinition;
    const fieldValue = fields[fieldKey];
    if (fieldValue === null && !allowNull)
      throw new Error(`Model#${name}.${fieldKey} got an invalid null value.`);
    if (fieldValue === null && allowNull) continue;
    if (validate && !validate(fieldValue, fields))
      throw new Error(`Model#${name}.${fieldKey} got invalid value: ${fieldValue}`);
  }
}
