# sequelize-graphql

[![NPM Version](https://img.shields.io/npm/v/%40sequelize-graphql%2Fcore?logo=npm)](https://www.npmjs.com/package/@sequelize-graphql/core)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/BaptisteMartinet/sequelize-graphql/npm-publish.yml)](https://github.com/BaptisteMartinet/sequelize-graphql/actions)
[![GitHub Release Date - Published_At](https://img.shields.io/github/release-date/BaptisteMartinet/sequelize-graphql)](https://github.com/BaptisteMartinet/sequelize-graphql/releases)

Opinionated zero dependency library to sync Sequelize and GraphQL.

> [!WARNING]
> The library is in WIP until v2 is released. Issues and PRs are welcomed.

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

## Key features
- [x] Define your model in one place and have the Sequelize model as well as the GraphQL type auto-generated.
- [x] GraphQL oriented (e.g A model must have a primary key named `id` wich is by default a UUID mapped to a GraphQLID).
- [x] Association handling (e.g An `hasMany` association will be exposed as a pagination).
- [x] Pagination utility which is orderable, filterable, and type safe.
- [x] N+1 query handling. Caching and batching is automatically handled.
- [x] Sequelize utilities. 
- [x] GraphQL utilities.

## Example usage
A simple Library API.

`Author.model.ts`
```ts
import { CreationOptional } from 'sequelize';
import { Model, STRING, type InferSequelizeModel } from '@sequelize-graphql/core';

export interface AuthorModel extends InferSequelizeModel<AuthorModel> {
  id: CreationOptional<string>;
  firstname: string;
  lastname: string;
}

const Author: Model<AuthorModel> = new Model({
  name: 'Author',
  columns: {
    firstname: { type: STRING, allowNull: false, exposed: true, description: '...' },
    lastname: { type: STRING, allowNull: false, exposed: true },
  },
  fields: {
    fullname: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(author, args, ctx) {
        const { firstname, lastname } = author;
        return `${firstname} ${lastname}`;
      },
    },
  },
  associations: () => ({
    books: {
      model: Book,
      type: 'hasMany',
      exposed: true,
    },
  }),
});
```
`Book.model.ts`
```ts
import { CreationOptional } from 'sequelize';
import { Model, ENUM, ID, STRING, type InferSequelizeModel } from '@sequelize-graphql/core';
import { Author } from './models';

export enum Genre {
  Thriller = 'Thriller',
  Horror = 'Horror',
}

export const GenreEnum = ENUM({
  name: 'Genre',
  values: Genre,
});

export interface BookModel extends InferSequelizeModel<BookModel> {
  id: CreationOptional<string>;
  authorId: ForeignKey<string>;
  title: string;
  genre: Genre;
}

const Book: Model<BookModel> = new Model({
  name: 'Book',
  columns: {
    authorId: { type: ID, allowNull: false, exposed: true },
    title: { type: STRING, allowNull: false, exposed: true },
    genre: { type: GenreEnum, allowNull: false, exposed: true },
  },
  associations: () => ({
    author: {
      model: Author,
      type: 'belongsTo',
      exposed: true,
    },
  }),
});
```

`query.ts`
```ts
import { exposeModel } from '@sequelize-graphql/core';
import { Author } from './models';

export default new GraphQLObjectType({
  name: 'Query',
  fields: {
    ...exposeModel(Author, {
      findById: 'author',
      findByIds: 'authorsByIds',
      pagination: 'authors',
    }),
  },
});
```

`book.mutation.ts`
```ts
import { Book, Author, GenreEnum } from './models';

export default new GraphQLObjectType({
  name: 'BookMutation',
  fields: {
    create: {
      type: new GraphQLNonNull(Book.type),
      args: {
        input: {
          type: new GraphQLNonNull(new GraphQLInputObjectType({
            name: 'CreateBookInput',
            fields: {
              authorId: { type: new GraphQLNonNull(GraphQLID) },
              title: { type: new GraphQLNonNull(GraphQLString) },
              genre: { type: new GraphQLNonNull(GenreEnum.gqlType) },
            },
          })),
        },
      },
      async resolve(_, args) {
        const { input: { authorId, title, genre } } = args;
        await Author.ensureExistence(authorId);
        return Book.model.create({ authorId, title, genre });
      },
    },
```
