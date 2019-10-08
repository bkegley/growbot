import mongoose from 'mongoose'
const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    twitchId: {
      type: String,
    },
    username: {
      type: String,
      unique: true,
    },
    bkBucks: {
      type: Number,
      required: true,
      default: 0,
    },
    transactions: [
      {
        type: TransactionSchema,
      },
    ],
    lastSeen: {
      type: Date,
    },
    totalViewTime: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
)

const TransactionSchema = new Schema(
  {
    command: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {timestamps: true},
)

export default mongoose.model('user', UserSchema)
