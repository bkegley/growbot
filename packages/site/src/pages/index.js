import React from 'react'
import {useQuery, useMutation, useSubscription} from '@apollo/react-hooks'
import {gql} from 'graphql-tag'

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

const GROWBOT_ENERGY_REPLENISHED = gql`
  subscription {
    growbotEnergyReplenished {
      id
      name
      energy
      maxEnergy
      user {
        username
      }
    }
  }
`

const IndexPage = () => {
  const {loading, error, data} = useQuery(LIST_GROW_BOTS_QUERY)
  const [updateGrowbot, {data: updatedGrowbotData}] = useMutation(UPDATE_GROW_BOT_MUTATION)
  // const {
  //   error: subError,
  //   loading: subLoading,
  //   data: {growbotEnergyReplenished},
  // } = useSubscription(GROWBOT_ENERGY_REPLENISHED)
  // console.log({subError, subLoading, growbotEnergyReplenished})

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
