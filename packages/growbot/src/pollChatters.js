import fetch from 'cross-fetch'
import fetchGraphql from './fetchGraphql'

function pollChatters(channels, ms = 60000) {
  const interval = setInterval(async () => {
    const channelChattersPromises = channels.map(async channel => {
      return fetch(`https://tmi.twitch.tv/group/user/${channel}/chatters`)
        .then(res => res.json())
        .then(res => res)
        .catch(err => console.log(err))
    })

    const allChannels = await Promise.all([...channelChattersPromises])

    const channelChatters = allChannels.reduce((acc, channel, index) => {
      return {
        ...acc,
        [channels[index]]: channel,
      }
    }, {})

    // temporarily only account for the single channel
    Object.keys(channelChatters).map(key => {
      const {
        chatters: {broadcaster, vips, moderators, staff, admins, global_mods, viewers},
      } = channelChatters[key]
      const allChatters = [...broadcaster, ...vips, ...moderators, ...staff, ...admins, ...global_mods, ...viewers]

      const {data} = fetchGraphql('http://localhost:4000/graphql', {
        query: `
        mutation replenishChattersGrowbots($usernames: [String] $energy: Int) {
          replenishChattersGrowbots(usernames: $usernames energy: $energy) {
            id
            name
            energy
            maxEnergy
            type
          }
        }`,
        variables: {
          usernames: allChatters,
          energy: 10,
        },
      })

      console.log(data)
    })
  }, ms)
  return interval
}

export default pollChatters
