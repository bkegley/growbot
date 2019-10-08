import mongoose from 'mongoose'
const Schema = mongoose.Schema

const CommandSchema = new Schema(
  {
    command: {
      type: String,
      required: true,
    },
    args: [
      {
        index: {
          type: Number,
          required: true,
        },

        name: {
          type: String,
          required: true,
        },
      },
    ],
    response: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model('command', CommandSchema)
