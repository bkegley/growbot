import mongoose from 'mongoose'
const Schema = mongoose.Schema

const GrowbotSchema = new Schema(
  {
    name: {
      type: String,
    },
    user: {
      type: String,
    },
    experience: {
      type: Number,
      default: 0,
    },
  },
  {timestamps: true},
)

export default mongoose.model('growbot', GrowbotSchema)
