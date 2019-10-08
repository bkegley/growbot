import {ApolloServer} from 'apollo-server'
import {models, createMongoConnection} from '@growbot/mongo'

const typeDefs = `
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

    type Variable {
        id: ID
        text: String
        replaceWith: [String]
    }

    type User {
      id: ID
      username: String
      bkBucks: Int
      transactions: [Transaction]
      lastSeen: String
      totalViewTime: Int
      growbot: Growbot
    }

    type Transaction {
      command: Command
      amount: Int
    }

    type Growbot {
      id: ID
      name: String
      experience: Int
      user: User
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

    input CreateVariableInput {
        text: String
        replaceWith: [String]
    }

    input CreateUserInput {
      username: String
    }

    input CreateGrowbotInput {
      name: String
      username: String
    }

    type Query {
        listCommands: [Command]
        listVariables: [Variable]
        listUsers: [User]
        getUser(id: ID username: String): User
        listGrowbots: [Growbot]
    }

    type Mutation {
        createCommand(input: CreateCommandInput): Command
        createVariable(input: CreateVariableInput): Variable
        createUser(input: CreateUserInput): User
        createGrowbot(input: CreateGrowbotInput): Growbot
    }
`

const resolvers = {
  Query: {
    listCommands: async (parent, args, {models}, info) => {
      const commands = await models.Command.find()
      return commands
    },
    listVariables: async (parent, args, {models}, info) => {
      const variables = await models.Variable.find()
      return variables
    },
    listUsers: async (parent, args, {models}, info) => {
      const users = await models.User.find()
      return users
    },
    getUser: async (parent, args, {models}, info) => {
      const user = await models.User.findOne(args)
      return user
    },
    listGrowbots: async (parent, args, {models}, info) => {
      const growbots = await models.Growbot.find()
      return growbots
    },
  },
  Mutation: {
    createCommand: async (parent, {input}, {models}, info) => {
      const command = await new models.Command(input).save()
      return command
    },
    createVariable: async (parent, {input}, {models}, info) => {
      const variable = await new models.Variable(input).save()
      return variable
    },
    createUser: async (parent, {input}, {models}, info) => {
      const user = await new models.User(input).save()
      return user
    },
    createGrowbot: async (parent, {input}, {models}, info) => {
      const growbot = await new models.Growbot(input).save()
      return growbot
    },
  },
  User: {
    growbot: async (parent, args, {models}, info) => {
      const growbot = await models.Growbot.findOne({username: parent.username})
      return growbot
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({req, res}) => {
    return {
      req,
      res,
      models,
    }
  },
})

async function startServer() {
  await createMongoConnection({databaseName: 'twitch-bot'})
  server.listen().then(({url}) => {
    console.log(`🚀  Server ready at ${url}`)
  })
}

startServer()
