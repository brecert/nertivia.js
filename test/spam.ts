import * as Nertivia from '../src/index'
import * as jsonfile from 'jsonfile'

const client = new Nertivia.Client()
const TOKEN = jsonfile.readFileSync('config.json').token

client.events.on('message', (message: Nertivia.Message) => {
	if(message.author.id === client.user!.id) {
		const [cmd, ...args] = message.content.split(' ')

		if(cmd === '!spam') {
			const count = parseInt(args[0]) || 100

			for(let i = 0; i < count; i++) {
				message.reply(`${i}. spamming! ${i}/${count}`)
			}
		}

	}
})

client.login(TOKEN)