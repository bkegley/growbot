import {gql} from 'apollo-server'

export const typeDefs = gql`
  type Variable {
    id: ID
    text: String
    replaceWith: [String]
  }

  input CreateVariableInput {
    text: String
    replaceWith: [String]
  }

  input UpdateVariableInput {
    text: String
    replaceWith: [String]
  }

  extend type Query {
    getVariable(id: ID): Variable
    listVariables: [Variable]
  }

  extend type Mutation {
    createVariable(input: CreateVariableInput): Variable
    updateVariable(id: ID, input: UpdateVariableInput): Variable
    deleteVariable(id: ID): Variable
  }
`

export const resolvers = {
  Query: {
    getVariable: async (parent, {id}, {models}) => {
      const Variable = await models.Variable.findById({id})
      return Variable
    },
    listVariables: async (parent, args, {models}) => {
      const Variables = await models.Variable.find()
      return Variables
    },
  },
  Mutation: {
    createVariable: async (parent, {input}, {models}) => {
      const Variable = await new models.Variable(input).save()
      return Variable
    },
  },
}
