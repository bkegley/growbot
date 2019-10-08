require('dotenv').config()
import tmi from 'tmi.js'
import fetch from 'cross-fetch'

const options = {
  identity: {
    username: 'growbot',
    password: process.env.TWITCH_AUTH_TOKEN,
  },
  channels: ['bjkegley'],
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
