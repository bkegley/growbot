import mongoose from 'mongoose'
const Schema = mongoose.Schema

const VariableSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  replaceWith: [
    {
      type: String,
      required: true,
    },
  ],
})

export default mongoose.model('variable', VariableSchema)
