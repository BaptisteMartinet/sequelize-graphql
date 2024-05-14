import type { Identifier } from 'sequelize';
import type Model from './Model';

/** @returns A string formatted like so "[ModelName]#[identifier]" (e.g. "User#1234") */
export function formatModelId(model: Model<any>, identifier: Identifier) {
  return `${model.name}$${identifier}`;
}
