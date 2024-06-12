import type { DataType } from 'sequelize';

export function getDataTypeKey(dataType: DataType) {
  return typeof dataType === 'string' ? dataType : dataType.key;
}
