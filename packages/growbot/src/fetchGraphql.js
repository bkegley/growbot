import fetch from 'cross-fetch'
async function fetchGraphql(endpoint = 'http://localhost:4000/graphql', {query, variables}) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })
    .then(res => res.json())
    .catch(err => console.log(err))

  return res
}

export default fetchGraphql
