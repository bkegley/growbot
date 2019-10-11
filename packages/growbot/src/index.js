require('dotenv').config()
import tmi from 'tmi.js'
import fetch from 'cross-fetch'
import fetchGraphql from './fetchGraphql'
import pollChatters from './pollChatters'

const channels = ['bjkegley']

// const interval = pollChatters(channels, 1000)
// // clearInterval(interval)
// process.on('exit', () => {
//   clearInterval(interval)
//   console.log('received signal - exit')
//   process.exit()
// })
// process.on('SIGINT', () => {
//   clearInterval(interval)
//   console.log('received signal - SIGINT')
//   process.exit()
// })

const options = {
  identity: {
    username: 'growbot',
    password: process.env.TWITCH_AUTH_TOKEN,
  },
  channels: [...channels],
}

const client = new tmi.client(options)

client.on('message', onMessageHandler)
client.on('connected', onConnectedHandler)

client.connect()

function onMessageHandler(target, context, message, self) {
  // Ignore messages from the bot
  if (self) {
    return
  }

  if (isCommand(message)) {
    onCommandHandler(target, context, message, self)
  }
}

function isCommand(message) {
  return message.indexOf('!') === 0
}

/**
 * TODO:
 * fix
 * upsert for creation
 *
 * respond on client if error (already exists)
 *
 * should we store command created by
 * only allow updating commands by that user
 *
 *
 * add !giveaway
 *
 *
 * add long-polling for users currently in chat and reward with points
 * https://thomassen.sh/twitch-api-endpoints/#tmi.twitch.tv/group/user/{USERNAME}/chatters
 *
 */
async function onCommandHandler(target, context, message, self) {
  const [commandStringSensitive, ...args] = message.split(' ')
  const commandString = commandStringSensitive.toLowerCase()

  switch (commandString) {
    case '!setcmd': {
      // !setcmd name response arg1 arg2...
      const [name, ...response] = args
      if (!name) {
        client.say(target, 'Please supply a command name')
        return
      }

      const {data} = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
                mutation createCommand($input: CreateCommandInput) {
                  createCommand(input: $input) {
                    id
                    command
                    args {
                      index
                      name
                    }
                    response
                  }
                }
              `,
          variables: {
            input: {
              command: `!${name
                .toString()
                .replace(/^!*/, '')
                .toLowerCase()}`,
              response: response.join(' '),
            },
          },
        }),
      })
        .then(res => res.json())
        .catch(err => console.log(err))

      if (data) {
        client.say(target, `${name} created! - Use: ${name} - Response: ${response}`)
      }
      break
    }

    case '!growbot': {
      const [command, ...remaining] = args

      // get growbot if exists
      const {username} = context
      const {data} = await fetchGraphql('http://localhost:4000/graphql', {
        query: `
            query getUser($username: String) {
              getUser(username: $username) {
                growbot {
                  id
                  name
                  type
                }
              }
            }
          `,
        variables: {
          username: username,
        },
      })

      // provide error handling if user doesn't exist
      const {getUser: user} = data
      const {growbot} = user

      if (!command) {
        if (growbot) {
          client.say(target, `Your growbot is ${growbot.name} :) It is type ${growbot.type}`)
        } else {
          client.say(target, `You don't have a growbot yet! Create one with '!growbot create Bitty the Botty'`)
        }
        return
      }

      switch (command) {
        case 'create': {
          const name = remaining.join(' ')
          const {data} = await fetchGraphql('http://localhost:4000/graphql', {
            query: `
            mutation createGrowbot($input: CreateGrowbotInput) {
              createGrowbot(input: $input) {
                id
                name
                user {
                  id
                }
              }
            }
            `,
            variables: {
              input: {
                name,
                username,
              },
            },
          })

          const {createGrowbot: growbot} = data
          client.say(target, `Say hello to your new Growbot! Hello, ${growbot.name}`)
          break
        }
        case 'set': {
          const [variable, ...setRemaining] = remaining
          const value = setRemaining.join(' ')

          switch (variable) {
            case 'name': {
              const {data} = await fetchGraphql('http://localhost:4000', {
                query: `
                mutation updateGrowbot($id: ID $input: UpdateGrowbotInput) {
                  updateGrowbot(id: $id input: $input) {
                    id
                    name
                  }
                }
                `,
                variables: {
                  id: growbot.id,
                  input: {
                    name: value,
                  },
                },
              })

              client.say(target, `Your growbot is now named ${data.updateGrowbot.name}`)
              break
            }
            case 'type': {
              const {data} = await fetchGraphql('http://localhost:4000', {
                query: `
                mutation updateGrowbot($id: ID $input: UpdateGrowbotInput) {
                  updateGrowbot(id: $id input: $input) {
                    id
                    name
                    type
                  }
                }
                `,
                variables: {
                  id: growbot.id,
                  input: {
                    type: value.toUpperCase(),
                  },
                },
              })

              client.say(target, `Your growbot is now the type ${data.updateGrowbot.type}`)
              break
            }
          }
        }
        case 'grease': {
        }
        case 'plugin': {
          // a user can decide to plugin their growbot which triples their energy replenishment rate
        }

        default: {
        }
      }
    }

    // handle errors probs
    default: {
      const {data} = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `{
                listCommands {
                  id
                  command
                  args {
                    index
                    name
                  }
                  response
                }
                listVariables {
                  id
                  text
                  replaceWith
                }
              }`,
        }),
      })
        .then(res => res.json())
        .catch(err => console.log(err))

      const {listCommands, listVariables} = data

      // possibly faster
      // const hashed = commandList.reduce((obj, command) => ({...obj, [command.name]: command}))
      // hashed.hasOwnProperty(commandString)

      const command = listCommands.find(item => item.command === commandString)
      if (command) {
        client.say(target, formatResponse({command, variables: listVariables}))
      }
    }
  }
}

// TODO: allow for dot syntax in parsing by switching this to use a regex and then parse the variable names
// e.g. "User has been following for {sender.followage} days"
function formatResponse({command, variables}) {
  return variables.reduce(
    (string, variable) =>
      string.replace(`${variable.text}`, variable.replaceWith[Math.floor(Math.random() * variable.replaceWith.length)]),
    command.response,
  )
}
// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`)
}
