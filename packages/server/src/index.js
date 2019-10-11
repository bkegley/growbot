import {ApolloServer, PubSub} from 'apollo-server'
import {models, createMongoConnection} from '@growbot/mongo'
import {typeDefs, resolvers} from './schema'

export const pubsub = new PubSub()

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
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
