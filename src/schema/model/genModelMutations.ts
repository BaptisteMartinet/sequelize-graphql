import type { Model as SequelizeModel } from 'sequelize';
import type {
  GraphQLFieldConfigMap,
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLInputFieldConfigMap,
  GraphQLOutputType,
} from 'graphql';
import type { Thunk } from '@utils/thunk';
import type { OptionalPromise } from '@utils/promise';
import type Model from '@definitions/model';

import { GraphQLBoolean, GraphQLInputObjectType, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { unthunk } from '@utils/thunk';
import { optionalPromiseThen } from '@utils/promise';

export interface CreateMutationArgs {
  args: GraphQLInputFieldConfigMap;
  resolve: GraphQLFieldResolver<null, any>;
  description?: string;
}

export function genModelCreateMutation(
  model: Model<any>,
  createArgs: CreateMutationArgs,
  opts: {
    baseName?: string;
    outputType?: GraphQLOutputType;
  } = {},
) {
  const { args, resolve, description } = createArgs;
  const { baseName, outputType } = opts;
  const name = baseName ?? model.name;
  const type = outputType ?? model.type;
  return {
    type: new GraphQLNonNull(type),
    args: {
      input: {
        type: new GraphQLNonNull(
          new GraphQLInputObjectType({
            name: name + 'CreateInput',
            fields: args,
          }),
        ),
      },
    },
    description,
    resolve(_, args, ctx, info) {
      const { input } = args;
      return resolve(null, input, ctx, info);
    },
  } as const satisfies GraphQLFieldConfig<unknown, any>;
}

export interface UpdateMutationArgs<T> {
  args: GraphQLInputFieldConfigMap;
  resolve: GraphQLFieldResolver<T, any>;
  description?: string;
}

export function genModelUpdateMutation<T extends SequelizeModel>(
  model: Model<T>,
  updateArgs: UpdateMutationArgs<T>,
  opts: {
    baseName?: string;
    outputType?: GraphQLOutputType;
  } = {},
) {
  const { args, resolve, description } = updateArgs;
  const { baseName, outputType } = opts;
  const name = baseName ?? model.name;
  const type = outputType ?? model.type;
  return {
    type: new GraphQLNonNull(type),
    args: {
      id: { type: new GraphQLNonNull(model.idType.gqlType) },
      input: {
        type: new GraphQLNonNull(
          new GraphQLInputObjectType({
            name: name + 'UpdateInput',
            fields: args,
          }),
        ),
      },
    },
    description,
    async resolve(_, args, ctx, info) {
      const { id, input } = args;
      const instance = await model.ensureExistence(id, { ctx });
      return resolve(instance, input, ctx, info);
    },
  } as const satisfies GraphQLFieldConfig<unknown, any>;
}

export interface DeleteMutationArgs<T> {
  resolve?: GraphQLFieldResolver<T, any, null, OptionalPromise<void>>;
  description?: string;
}

export function genModelDeleteMutation<T extends SequelizeModel>(
  model: Model<T>,
  deleteArgs: DeleteMutationArgs<T> | true,
) {
  const args = deleteArgs === true ? {} : deleteArgs;
  const { resolve, description } = args;
  return {
    type: new GraphQLNonNull(GraphQLBoolean),
    args: {
      id: { type: new GraphQLNonNull(model.idType.gqlType) },
    },
    description,
    async resolve(_, args, ctx, info) {
      const { id } = args;
      const instance = await model.ensureExistence(id, { ctx });
      if (!resolve) {
        await instance.destroy();
        return true;
      }
      return optionalPromiseThen(resolve(instance, null, ctx, info), () => true);
    },
  } as const satisfies GraphQLFieldConfig<unknown, any>;
}

export interface GenModelMutationsArgs<T> {
  name?: string;
  prefix?: string;
  description?: string;
  outputType?: GraphQLOutputType;
  create?: CreateMutationArgs;
  update?: UpdateMutationArgs<T>;
  delete?: DeleteMutationArgs<T> | true;
  fields?: Thunk<GraphQLFieldConfigMap<any, any>>;
}

export default function genModelMutations<T extends SequelizeModel>(
  model: Model<T>,
  args: GenModelMutationsArgs<T>,
) {
  const {
    name,
    prefix = '',
    description,
    outputType,
    create: createArgs,
    update: updateArgs,
    delete: deleteArgs,
    fields,
  } = args;
  const baseName = prefix + (name ?? model.name);
  const baseArgs = { baseName, outputType };
  return new GraphQLObjectType({
    name: baseName + 'Mutation',
    description,
    fields: () => ({
      ...(createArgs ? { create: genModelCreateMutation(model, createArgs, baseArgs) } : null),
      ...(updateArgs ? { update: genModelUpdateMutation(model, updateArgs, baseArgs) } : null),
      ...(deleteArgs ? { delete: genModelDeleteMutation(model, deleteArgs) } : null),
      ...(fields ? unthunk(fields) : null),
    }),
  });
}
