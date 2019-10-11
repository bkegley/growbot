import {gql} from 'apollo-server'
import {pubsub} from '../index'

const GROWBOT_ENERGY_REPLENISHED = 'GROWBOT_ENERGY_REPLENISHED'

export const typeDefs = gql`
  type Growbot {
    id: ID
    name: String
    type: TypeEnum
    experience: Int
    energy: Int
    maxEnergy: Int
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
    replenishChattersGrowbots(usernames: [String], energy: Int): [Growbot]
  }

  extend type Subscription {
    growbotEnergyReplenished: [Growbot]
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
    replenishChattersGrowbots: async (parent, {usernames, energy}, {models}) => {
      const growbotUpdatePromises = usernames.map(username => {
        return models.Growbot.findOneAndUpdate(
          {
            username,
            $where: function() {
              return this.energy < this.maxEnergy
            },
          },
          {$inc: {energy: energy}},
          {new: true},
        )
      })
      const growbots = await Promise.all([...growbotUpdatePromises])
      const allGrowbots = await Promise.all([
        ...growbots.map((growbot, index) => {
          return new Promise(async resolve => {
            if (growbot) {
              resolve(growbot)
            }
            const dbGrowbot = await models.Growbot.findOne({username: usernames[index]})
            resolve(dbGrowbot)
          })
        }),
      ])
      pubsub.publish(GROWBOT_ENERGY_REPLENISHED, {
        growbotEnergyReplenished: {
          growbots: allGrowbots,
        },
      })

      return allGrowbots
    },
  },
  Subscription: {
    growbotEnergyReplenished: {
      subscribe: () => pubsub.asyncIterator([GROWBOT_ENERGY_REPLENISHED]),
    },
  },
  Growbot: {
    user: async (parent, args, {models}) => {
      const user = await models.User.findOne({username: parent.username})
      return user
    },
  },
}
