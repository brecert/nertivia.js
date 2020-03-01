import * as Nertivia from '../src/index'
import * as jsonfile from 'jsonfile'
import * as diff from 'diff'
import * as fs from 'fs'

const client = new Nertivia.Client()
const TOKEN = jsonfile.readFileSync('config.json').token

function block(content: string) {
  return `\`\`\`\n${content}\n\`\`\``
}

function info(...lines: string[]) {
  return block(lines.join('\n'))
}

function formatServer(server: Nertivia.Server) {
  return info(
    `${server.name} [${server.id}]`,
    `owner: [${server.ownerID}]`,
    `defaultChannel: ${server.defaultChannel.name} [${server.defaultChannelId}]`,
    `icon: [${server.icon}]`,
  )  
}

const prefix = '!'

client.events.on('message', async (message: Nertivia.Message) => {
  const [start, ...arg] = message.content.split(' ')

  if(!client.user) { 
    throw new Error("How is this possible?")
  }

  if(!start.startsWith('!')) {
    return
  }

  const cmd = start.replace(/^\!/, '')

  switch (cmd) {
    case "updateStatus":
      console.debug('Updating status to', arg[0])
      client.user.setStatus(parseInt(arg[0]) || 1)
      break;
    case "sendMessage":
      message.reply(arg.join(" ") || "Hello World!")
      break;
    case "editMessage": {
      const reply = await message.reply("0")

      let i = 0
      const max = 10
      const interval = setInterval(async () => {
        i += 1

        if(i >= max) {
          clearInterval(interval)
        }

        reply.edit(`${i}/${max}`)
      }, 300)
    }
      break;
    case "deleteMessage":
      const reply = await message.reply("Deleting in 3 seconds...")

      let i = 3
      const interval = setInterval(async () => {
        i -= 1

        if(i <= 0) {
          clearInterval(interval)
          reply.delete()
          return
        }

        reply.edit(`Deleting in ${i} seconds...`)
      }, 1000)
      break;    
    case "openDM":
      const dm = await message.author.openDM()
      dm.send("Opened DM")
      break;    
    case "sendFileMessage":
      Nertivia.Requests.sendFileMessage(client.tokens, message.channelID, { data: fs.readFileSync('canvas.png'), name: 'test.png' })
      break;    
    case "joinServerById":
      Nertivia.Requests.joinServerById(client.tokens, arg[0])
      break;    
    case "leaveServer":
      if(message.channel instanceof Nertivia.Channel) {
        Nertivia.Requests.leaveServer(client.tokens, message.channel.server!.id)
      } else {
        message.reply("Unable to leave DM")
      }

      break;

    case "userDetails": {
      const profile = await message.author.fetchProfile()
      message.reply(info(
        `PROFILE`,
        `name: ${profile.name}`,
        `age: ${profile.age}`,
        `gender: ${profile.gender}`,
        `continent: ${profile.continent}`,
        `country: ${profile.country}`,
        `badges: ${profile.badges}`,
        `about: ${profile.about}`,
      ))
      break;
    }

    case "typingPing": {
      if(message.channel) {
        message.channel.startTyping()
      }

      break;
    }

    case "logtime": {
      const reply = await message.reply(Date())

      const interval = setInterval(() => {
        reply.edit(Date())
      }, 1000)

      setTimeout(() => {
        clearInterval(interval)
      }, 5000)
    }
      break;

    case "whoami": {
      const author = message.author
      message.reply(info(
        `[${author.displayType}] ${author.username}@${author.tag} [${author.id}]`,
        `avatar: ${author.avatarURL}`
      ))
      break;
    }

    case "serverinfo": {

      const server = client.servers!.find(s => s.channels.some(c => c.id === message.channelID))!

      // todo: add more info
      message.reply(formatServer(server))

      break;
    }

    case "servers": {
      await message.reply(`Server Count: ${client.servers!.length}`)
      client.servers!.forEach(server => message.reply(formatServer(server)))

      break;
    }

    case "channels": {
      await message.reply(`Channel Count: ${client.channels.length}\n\n${info(client.channels.map(c => c.id).join('\n'))}`)
    }

    default:
      break;
  }

  if(message.attachments.length !== 0) {
    message.reply(info(
      "ATTACHMENTS",
      ...message.attachments.map((file, i) => `${i+1}. ${file.filename} ${file.height}x${file.width} (${file.url})`)
    ))
  }
})

client.events.on('messageDelete', async (message?: Nertivia.Message) => {
  if(message) {
    const dm: Nertivia.DMChannel = client.user!.dmChannel || await client.user!.openDM()

    dm.send(block(
      `DELETED: [${message.id}] by ${message.author.username}@${message.author.tag}\n${message.content}`
    ))
  }
})

client.events.on('messageUpdate', async (message?: Nertivia.Message) => {
  if(message) {
    const dm: Nertivia.DMChannel = client.user!.dmChannel || await client.user!.openDM()

    const changed = diff.diffChars(message.initialContent || "", message.content).map(part => {
      const color = part.added ? '+' : part.removed ? '-' : '>'
      return `${color} ${part.value}`
    })

    dm.send(block(
      `EDITED: [${message.id}] from ${message.author.username}@${message.author.tag}\n${changed.join('\n')}`
    ))
  }
})

client.events.on('ready', async () => {
  console.log(`logged in as ${client.user!.username}@${client.user!.tag} [${client.user!.id}]`)

  // let i = 0;
  // setInterval(async () => {
  //   client.user!.setStatus((i++ % 4)+1)
  // }, 230)
})

client.login(TOKEN).catch(console.error)