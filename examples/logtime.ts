import * as Nertivia from 'nertivia.js'

const client = new Nertivia.Client()
const TOKEN = "YOUR_TOKEN_HERE"

client.events.on('message', async (message: Nertivia.Message) => {
	const [cmd, ...arg] = message.content.split(' ')

	if(cmd === '!logtime') {
		const reply = await message.reply(Date())

		setInterval(() => {
			reply.edit(Date())
		}, 1000)
	}
})

client.events.on('ready', () => {
	console.log('ready')
})

client.login(TOKEN)
	.catch(console.error)