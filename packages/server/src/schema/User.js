import {gql} from 'apollo-server'

export const typeDefs = gql`
  type User {
    id: ID
    username: String
    lastSeen: String
    growbot: Growbot
  }

  input CreateUserInput {
    username: String
  }

  input UpdateUserInput {
    username: String
    lastSeen: String
  }

  extend type Query {
    getUser(id: ID, username: String): User
    listUsers: [User]
  }

  extend type Mutation {
    createUser(input: CreateUserInput): User
    updateUser(id: ID, input: UpdateUserInput): User
    deleteUser(id: ID): User
  }
`

export const resolvers = {
  Query: {
    getUser: async (parent, args, {models}) => {
      const User = await models.User.findOne(args)
      return User
    },
    listUsers: async (parent, args, {models}) => {
      const Users = await models.User.find()
      return Users
    },
  },
  Mutation: {
    createUser: async (parent, {input}, {models}) => {
      const User = await new models.User(input).save()
      return User
    },
  },
  User: {
    growbot: async (parent, args, {models}) => {
      const growbot = await models.Growbot.findOne({username: parent.username})
      return growbot
    },
  },
}
