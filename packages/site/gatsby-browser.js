import React from 'react'
import {ApolloProvider} from '@apollo/react-hooks'
import client from './src/client'

export const wrapRootElement = ({element}) => {
  return <ApolloProvider client={client}>{element}</ApolloProvider>
}
