import {gql} from 'apollo-server'
import merge from 'lodash.merge'
import {typeDefs as commandTypeDefs, resolvers as commandResolvers} from './Command'
import {typeDefs as growbotTypeDefs, resolvers as growbotResolvers} from './Growbot'
import {typeDefs as userTypeDefs, resolvers as userResolvers} from './User'
import {typeDefs as variableTypeDefs, resolvers as variableResolvers} from './Variable'

const baseTypes = gql`
  type Query {
    _query: String
  }
  type Mutation {
    _mutation: String
  }
`

export const typeDefs = [baseTypes, commandTypeDefs, growbotTypeDefs, userTypeDefs, variableTypeDefs]
export const resolvers = merge(commandResolvers, growbotResolvers, userResolvers, variableResolvers)
