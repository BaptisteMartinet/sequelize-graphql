import type { GraphQLType } from 'graphql';

import { GraphQLList, GraphQLNonNull } from 'graphql';

class GraphQLNonNullList<T extends GraphQLType> extends GraphQLList<GraphQLNonNull<T>> {
  constructor(type: T) {
    super(new GraphQLNonNull(type));
  }
}

export default GraphQLNonNullList;
