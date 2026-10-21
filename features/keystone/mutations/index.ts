import { mergeSchemas } from "@graphql-tools/schema";
import type { GraphQLSchema } from 'graphql';
import redirectToInit from "./redirectToInit";
import { createInitialUser, createInitialUserTypeDefs } from "./createInitialUser";
import { sportsbookResolvers, sportsbookTypeDefs } from './sportsbook';
import { sportsbookFullResolvers, sportsbookFullTypeDefs } from './sportsbook-full';

const graphql = String.raw;

export function extendGraphqlSchema(baseSchema: GraphQLSchema) {
  return mergeSchemas({
    schemas: [baseSchema],
    typeDefs: [graphql`
      type Query {
        redirectToInit: Boolean
      }
    `, createInitialUserTypeDefs, sportsbookTypeDefs, sportsbookFullTypeDefs],
    resolvers: [{
      Query: { 
        redirectToInit,
      },
      Mutation: {
        createInitialUser,
      },
    }, sportsbookResolvers, sportsbookFullResolvers],
  });
}