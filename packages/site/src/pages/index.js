import React from 'react'
import {useQuery, useMutation} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'

const LIST_GROW_BOTS_QUERY = gql`
  {
    listGrowbots {
      id
      name
      type
    }
  }
`

const UPDATE_GROW_BOT_MUTATION = gql`
  mutation updateGrowbot($id: ID, $input: UpdateGrowbotInput) {
    updateGrowbot(id: $id, input: $input) {
      id
      name
      type
    }
  }
`

const IndexPage = () => {
  const {loading, error, data} = useQuery(LIST_GROW_BOTS_QUERY)
  const [updateGrowbot, {data: updatedGrowbotData}] = useMutation(UPDATE_GROW_BOT_MUTATION)

  console.log({data, updatedGrowbotData})

  if (loading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <p>There was an error fetching your Growbots!</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Growbot!</h1>
      {data.listGrowbots.map(growbot => {
        return <GrowbotUpdateForm key={growbot.id} growbot={growbot} updateGrowbot={updateGrowbot} />
      })}
    </div>
  )
}

const GrowbotUpdateForm = ({growbot, updateGrowbot}) => {
  const [name, setName] = React.useState(growbot.name)
  const [type, setType] = React.useState(growbot.type)

  return (
    <div>
      <h3>{name}</h3>
      <input type="text" value={name} onChange={e => setName(e.currentTarget.value)} />
      <p>{type}</p>
      <button type="button" onClick={() => updateGrowbot({variables: {id: growbot.id, input: {name}}})}>
        Change Name
      </button>
    </div>
  )
}

export default IndexPage
