import mongoose from 'mongoose'

function createMongoConnection({baseConnection = 'mongodb://localhost:27017/', databaseName = 'test-database'}) {
  mongoose.set('useFindAndModify', false)
  mongoose
    .connect(`${baseConnection}${databaseName}`, {
      useNewUrlParser: true,
    })
    .then(() => console.log(`Connected to mongo at ${baseConnection}${databaseName}`))
    .catch(err => console.log(err))
}

export default createMongoConnection
