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
      enum: ['SOLAR', 'BATTERY', 'GAS', 'HYDRO'],
      default: 'GAS',
    },
  },
  {timestamps: true},
)

export default mongoose.model('growbot', GrowbotSchema)
