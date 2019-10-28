import * as Nertivia from '../src/index'
import * as jsonfile from 'jsonfile'
import * as diff from 'diff'

const client = new Nertivia.Client()
const TOKEN = jsonfile.readFileSync('config.json').token

function block(content: string) {
  return `\`\`\`\n${content}\n\`\`\``
}

client.events.on('message', async (message: Nertivia.Message) => {
  const [cmd, ...arg] = message.content.split(' ')

  if(message.attachments.length !== 0) {
    message.reply(message.attachments.map((att, i) => block(`ATTACHMENT\n${i+1}. ${att.filename}: ${att.height}x${att.width} (${att.url})`)).join('\n'))
  }

  if(cmd === '!logtime') {
    const reply = await message.reply(Date())

    setInterval(() => {
      reply.edit(Date())
    }, 1000)
  }
  else if(cmd === '!whoami') {
    message.reply(`${message.author.id}:${message.author.username}@${message.author.tag}`)
  }
  else if(cmd === '!dmchannel') {

    const dm = message.author.dmChannel || await message.author.createDM()


    if(message.author.dmChannel) {
      message.author.dmChannel.send('hi!')
    } else {
      message.reply("I can't dm you, sorry.")
    }
  }
})

client.events.on('messageDelete', async (message?: Nertivia.Message) => {
  if(message) {
    const dm: Nertivia.DMChannel = client.user!.dmChannel || await client.user!.createDM()

    dm.send(block(
      `DELETED: [${message.id}] by ${message.author.username}@${message.author.tag}\n${message.content}`
    ))
  }
})

client.events.on('messageUpdate', async (message?: Nertivia.Message) => {
  if(message) {
    const dm: Nertivia.DMChannel = client.user!.dmChannel || await client.user!.createDM()

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
  console.log(`logged in as ${client.user!.username}`)

  // let i = 0;
  // setInterval(async () => {
  //   client.user!.setStatus((i++ % 4)+1)
  // }, 230)
})

client.login(TOKEN).catch(console.error)