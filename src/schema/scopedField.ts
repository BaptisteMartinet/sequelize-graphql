import type { GraphQLFieldConfig, GraphQLObjectType } from 'graphql';

import { GraphQLNonNull } from 'graphql';

export default function scopedField(type: GraphQLObjectType): GraphQLFieldConfig<unknown, unknown> {
  return {
    type: new GraphQLNonNull(type),
    resolve(source) {
      if (source === undefined) return {};
      return source;
    },
  };
}
