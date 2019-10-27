import * as Nertivia from '../src/index'
import * as jsonfile from 'jsonfile'
import * as diff from 'diff'

const client = new Nertivia.Client()
const TOKEN = jsonfile.readFileSync('config.json').token

client.events.on('message', async (message: Nertivia.Message) => {
	const [cmd, ...arg] = message.content.split(' ')

	if(cmd === '!logtime') {
		const reply = await message.reply(Date())

		setInterval(() => {
			reply.edit(Date())
		}, 1000)
	}
})

client.events.on('messageDelete', (message?: Nertivia.Message) => {
	if(message) {
		message.reply(`[DELETED:${message.id}]\n${message.content}`)
	}
})

client.events.on('messageUpdate', (message?: Nertivia.Message) => {
	if(message) {
		const changed = diff.diffChars(message.initialContent, message.content).map(part => {
			const color = part.added ? '+' : part.removed ? '-' : '>'
			return `${color} ${part.value}`
		})

		message.reply(`${message.id} was edited at ${message.editedAt}\n${'```diff\n' +  `${changed.join('\n')}` + '\n```'}`)
	}
})

client.events.on('ready', () => {
	console.log(`logged in as ${client.user!.username}`)
})

client.login(TOKEN).catch(console.error)