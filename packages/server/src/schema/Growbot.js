import {gql} from 'apollo-server'

export const typeDefs = gql`
  type Growbot {
    id: ID
    name: String
    type: TypeEnum
    experience: Int
    user: User
  }

  enum TypeEnum {
    SOLAR
    BATTERY
    GAS
    HYDRO
  }

  input CreateGrowbotInput {
    name: String
    username: String
  }

  input UpdateGrowbotInput {
    name: String
    username: String
    type: TypeEnum
  }

  extend type Query {
    getGrowbot(id: ID): Growbot
    listGrowbots: [Growbot]
  }

  extend type Mutation {
    createGrowbot(input: CreateGrowbotInput): Growbot
    updateGrowbot(id: ID, input: UpdateGrowbotInput): Growbot
    deleteGrowbot(id: ID): Growbot
  }
`

export const resolvers = {
  Query: {
    getGrowbot: async (parent, {id}, {models}) => {
      const Growbot = await models.Growbot.findById({id})
      return Growbot
    },
    listGrowbots: async (parent, args, {models}) => {
      const Growbots = await models.Growbot.find()
      return Growbots
    },
  },
  Mutation: {
    createGrowbot: async (parent, {input}, {models}) => {
      const growbot = await new models.Growbot(input).save()
      return growbot
    },
    updateGrowbot: async (parent, {id, input}, {models}) => {
      const growbot = await models.Growbot.findByIdAndUpdate(id, input, {new: true})
      return growbot
    },
    deleteGrowbot: async (parent, {id}, {models}) => {
      const growbot = await models.Growbot.findByIdAndDelete(id)
      return growbot
    },
  },
}
