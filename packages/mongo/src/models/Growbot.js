import mongoose from 'mongoose'
const Schema = mongoose.Schema

const GrowbotSchema = new Schema(
  {
    name: {
      type: String,
    },
    username: {
      type: String,
    },
    experience: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['earth', 'wind', 'water', 'fire'],
    },
  },
  {timestamps: true},
)

export default mongoose.model('growbot', GrowbotSchema)
