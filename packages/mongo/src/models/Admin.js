import mongoose from 'mongoose'
const Schema = mongoose.Schema

const AdminSchema = new Schema({
  accumulationRate: {
    type: Number,
  },
})

export default mongoose.model('admin', AdminSchema)
