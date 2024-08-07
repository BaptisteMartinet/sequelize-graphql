# sequelize-graphql

[![NPM Version](https://img.shields.io/npm/v/%40sequelize-graphql%2Fcore?logo=npm)](https://www.npmjs.com/package/@sequelize-graphql/core)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/BaptisteMartinet/sequelize-graphql/npm-publish.yml)](https://github.com/BaptisteMartinet/sequelize-graphql/actions)
[![GitHub Release Date - Published_At](https://img.shields.io/github/release-date/BaptisteMartinet/sequelize-graphql)](https://github.com/BaptisteMartinet/sequelize-graphql/releases)

Opinionated zero dependency library to sync Sequelize and GraphQL.

> [!WARNING]
> The library is in WIP until v2 is released. Issues and PRs are welcomed.

## Key features
- [x] Define your model in one place and have the Sequelize model as well as the GraphQL type auto-generated.
- [x] GraphQL oriented (e.g A model must have a primary key named `id` wich is by default a UUID mapped to a GraphQLID).
- [x] Association handling (e.g An `hasMany` association will be exposed as a pagination).
- [x] Pagination utility which is orderable, filterable, and type safe.
- [x] N+1 query handling. Caching and batching is automatically handled.
- [x] Enums handling.
- [x] Sequelize utilities. 
- [x] GraphQL utilities.

## Getting Started
Install sequelize-graphql from npm  

With npm:
```sh
npm install --save @sequelize-graphql/core sequelize graphql dataloader
```
or using yarn:
```sh
yarn add @sequelize-graphql/core sequelize graphql dataloader
```

See [Peer dependencies breakdown](https://github.com/BaptisteMartinet/sequelize-graphql/wiki/Peer-dependencies-breakdown) for more information.

Setup the context and you are good to go:
```ts
import { makeContext } from '@sequelize-graphql/core';

// Apollo Server example
const { url } = await startStandaloneServer(server, {
  context: async ({ req, res }) => ({
    ...makeContext(), // An object containing everyting sequelize-graphql needs to work properly.
    authToken: req.headers.authorization, // Stuff you want to place in the context like an auth token.
  }),
});
```

## Usage
One can easily define a model like so:
```ts
import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { GraphQLNonNull, GraphQLString } from 'graphql';
import { Model, STRING, ID, ENUM } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { Author, Rating } from '@models/index';

export enum Genre {
  Action = 'Action',
  Fantasy = 'Fantasy',
  Horror = 'Horror',
}

export const GenreEnum = ENUM({ name: 'Genre', values: Genre });

export interface BookModel extends InferModelAttributesWithDefaults<BookModel> {
  title: string;
  genre: Genre;

  authorId: ForeignKey<IdType>; // Auto-added by the belongsTo association
}

const Book: Model<BookModel> = new Model({
  name: 'Book',
  columns: {
    title: { type: STRING, allowNull: false, exposed: true },
    genre: { type: GenreEnum, defaultValue: Genre.Action, exposed: true },
  },
  fields: {
    fullTitle: {
      type: new GraphQLNonNull(GraphQLString),
      async resolve(book, args, ctx) {
        const { authorId, title } = book;
        const author = await Author.ensureExistence(authorId, { ctx });
        return `${title} by ${author.name}`;
      },
    },
  },
  associations: () => ({
    author: {
      model: Author,
      type: 'belongsTo',
      exposed: true,
    },

    ratings: {
      model: Rating,
      type: 'hasMany',
      exposed: true,
    },
  }),
  timestamps: true,
  sequelize,
});
```
Here is the GraphQL type that will be generated:
```graphql
type Book {
  id: ID!
  createdAt: Date!
  updatedAt: Date!
  title: String!
  genre: Genre
  author: Author
  ratings(offset: Int, limit: Int, order: [RatingOrderBy!], filters: RatingFilters): RatingOffsetConnection!
  fullTitle: String!
}
```

The lib comes with a set of utilities to generate queries and mutations for your models.  
Query:
```ts
export default new GraphQLObjectType({
  name: 'Query',
  fields: {
    ...exposeModel(Book, {
      findById: 'book',
      findByIds: false,
      pagination: 'books',
    }),
  }
});
```
```graphql
type Query {
  book(id: ID!): Book!
  books(offset: Int, limit: Int, order: [BookOrderBy!], filters: BookFilters): BookOffsetConnection!
}
```
Mutation:
```ts
import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';
import { genModelMutations } from '@sequelize-graphql/core';
import { Book, Author, GenreEnum } from '@models/index';

export default genModelMutations(Book, {
  create: {
    args: {
      authorId: { type: new GraphQLNonNull(GraphQLID) },
      title: { type: new GraphQLNonNull(GraphQLString) },
      genre: { type: new GraphQLNonNull(GenreEnum.gqlType) },
    },
    async resolve(_, args, ctx) {
      const { authorId, title, genre } = args;
      await Author.ensureExistence(authorId, { ctx });
      return Book.model.create({ authorId, title, genre });
    },
  },

  update: {
    args: {
      title: { type: GraphQLString },
      genre: { type: GenreEnum.gqlType },
    },
    async resolve(book, args, ctx) {
      const { title, genre } = args;
      return book.update({ title, genre });
    },
  },

  delete: true,
});
```

```graphql
type BookMutation {
  create(input: BookCreateInput!): Book!
  update(id: ID!, input: BookUpdateInput!): Book!
  delete(id: ID!): Boolean!
}
```

## Example
A simple project running sequelize-graphql:  
https://github.com/BaptisteMartinet/sequelize-graphql-example
