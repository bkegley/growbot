import React from 'react'
import ApolloClient from 'apollo-boost'
import {ApolloProvider} from '@apollo/react-hooks'

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
})

export const wrapRootElement = ({element}) => {
  return <ApolloProvider client={client}>{element}</ApolloProvider>
}
