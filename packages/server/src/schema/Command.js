import {gql} from 'apollo-server'

export const typeDefs = gql`
  type Command {
    id: ID
    command: String
    args: [Arg]
    response: String
  }

  type Arg {
    index: Int
    name: String
  }

  input CreateCommandInput {
    command: String
    args: [ArgInput]
    response: String
  }

  input ArgInput {
    index: Int
    name: String
  }

  input UpdateCommandInput {
    command: String
    args: [ArgInput]
    response: String
  }

  extend type Query {
    getCommand(id: ID): Command
    listCommands: [Command]
  }

  extend type Mutation {
    createCommand(input: CreateCommandInput): Command
    updateCommand(id: ID, input: UpdateCommandInput): Command
    deleteCommand(id: ID): Command
  }
`

export const resolvers = {
  Query: {
    getCommand: async (parent, {id}, {models}) => {
      const command = await models.Command.findById({id})
      return command
    },
    listCommands: async (parent, args, {models}) => {
      const commands = await models.Command.find()
      return commands
    },
  },
  Mutation: {
    createCommand: async (parent, {input}, {models}) => {
      const command = await new models.Command(input).save()
      return command
    },
    updateCommand: async (parent, {id, input}, {models}) => {
      const command = await models.Command.findByIdAndUpdate(id, input, {new: true})
      return command
    },
    deleteCommand: async (parent, {id}, {models}) => {
      const command = await models.Command.findByIdAndDelete(id)
      return command
    },
  },
}
