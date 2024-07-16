import type {
  Model as SequelizeModel,
  Identifier,
  IncludeOptions,
  CountOptions,
  Attributes,
} from 'sequelize';
import type { Context } from '@schema/index.js';
import type { ModelDefinition, AssociationDefinition, AssociationSpecs } from './types.js';

import { GraphQLObjectType } from 'graphql';
import { unthunk } from '@utils/thunk.js';
import { DefaultIDFieldDefinition } from './constants.js';
import { genDatabaseModel, genModelGraphQLType } from './gen';
import { formatModelId } from './log.js';

export default class Model<M extends SequelizeModel> {
  private _definition;
  private _model;
  private _type: GraphQLObjectType | null = null;
  private _associations: Map<string, AssociationSpecs> | null = null;

  constructor(definition: ModelDefinition<M>) {
    this._definition = definition;
    this._model = genDatabaseModel(definition);
  }

  get definition() {
    return this._definition;
  }

  get name() {
    return this.definition.name;
  }

  get idType() {
    return this.definition.id?.type ?? DefaultIDFieldDefinition.type;
  }

  private genAssociation(associationName: string, associationDef: AssociationDefinition) {
    const { model: targetModel, type, foreignKey, deleteCascade } = associationDef;
    const onDelete = deleteCascade === true ? 'CASCADE' : 'SET NULL';
    switch (type) {
      case 'belongsTo':
        return this._model.belongsTo(targetModel.model, {
          as: associationName,
          foreignKey,
          onDelete,
          constraints: false,
        });
      case 'hasOne':
        return this._model.hasOne(targetModel.model, {
          as: associationName,
          foreignKey,
          onDelete,
          constraints: false,
        });
      case 'hasMany':
        return this._model.hasMany(targetModel.model, {
          as: associationName,
          foreignKey,
          onDelete,
          constraints: false,
        });
      default:
        throw new Error(`Invalid association type: ${type}`);
    }
  }

  get associations() {
    if (this._associations !== null) return this._associations;
    this._associations = new Map();
    const associationsDefs = unthunk(this._definition.associations);
    if (associationsDefs === undefined) return this._associations;
    for (const [associationName, associationDef] of Object.entries(associationsDefs)) {
      if (this._associations.has(associationName))
        throw new Error(`Model#${this.name} has duplicated association name ${associationName}`);
      const sequelizeAssociation = this.genAssociation(associationName, associationDef);
      this._associations.set(associationName, { sequelizeAssociation, associationDef });
    }
    return this._associations;
  }

  /**
   * Used when performing eager loading.
   * @example
   * ```ts
   * Author.model.findAll({
   *  include: Author.includeAssociation('books', {
   *   where: { title: 'Harry Potter and the Chamber of Secrets' },
   *  }),
   * });
   * ```
   */
  public includeAssociation(
    associationName: string,
    options?: Omit<IncludeOptions, 'as' | 'model' | 'association'>,
  ): IncludeOptions {
    const association = this.associations.get(associationName);
    if (association === undefined)
      throw new Error(`Tried to access unknown association: ${associationName}`);
    const { sequelizeAssociation } = association;
    return {
      association: sequelizeAssociation,
      ...options,
    };
  }

  /**
   * @returns The GraphQL type
   */
  get type() {
    if (!this._type) this._type = genModelGraphQLType(this);
    return this._type;
  }

  /**
   * @returns The Sequelize model
   */
  get model() {
    return this._model;
  }

  /**
   * Equivalent to `model.findByPk()` but uses loaders for caching and batching when ctx is provided.
   */
  public findByPkAllAttrs(identifier: Identifier, opts: { ctx?: Context } = {}) {
    const { ctx } = opts;
    if (ctx === undefined) return this.model.findByPk(identifier);
    const loader = ctx.modelLoader.getModelLoader(this);
    return loader.load(identifier).catch(() => null);
  }

  /**
   * Equivalent to {@link findByPkAllAttrs} but throws if the instance is not found.
   */
  public async ensureExistence(identifier: Identifier, opts: { ctx?: Context } = {}) {
    const instance = await this.findByPkAllAttrs(identifier, opts);
    if (instance === null)
      throw new Error(`EnsureExistence check failed for model ${formatModelId(this, identifier)}`);
    return instance;
  }

  /**
   * Equivalent to {@link ensureExistence} but returns null if the identifier is null.
   */
  public ensureExistenceOptional(identifier: Identifier | null, opts: { ctx?: Context } = {}) {
    if (identifier === null) return null;
    return this.ensureExistence(identifier, opts);
  }

  public async exists(opts: Omit<CountOptions<Attributes<M>>, 'group'>) {
    const count = await this.model.count(opts);
    return count > 0;
  }
}
