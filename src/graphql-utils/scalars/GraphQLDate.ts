import { GraphQLScalarType, Kind } from 'graphql';

const GraphQLDate = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  // Convert outgoing
  serialize(value) {
    if (value instanceof Date) return value.getTime();
    throw Error('GraphQL Date Scalar serializer expected a `Date` object');
  },
  // Convert incoming
  parseValue(value) {
    if (typeof value === 'number' || typeof value === 'string') return new Date(value);
    throw new Error('GraphQL Date Scalar parser expected a `number`');
  },
  // Convert hard-coded AST
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) return new Date(parseInt(ast.value, 10));
    if (ast.kind === Kind.STRING) return new Date(ast.value);
    return null;
  },
});

export default GraphQLDate;
