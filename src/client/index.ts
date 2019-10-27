import * as io from 'socket.io-client'
import * as mitt from 'mitt'

import * as NertiviaEvents from '../nertivia/events'
import * as NertiviaTypes from '../nertivia/types'
import * as NertiviaConstants from '../nertivia/constants'
import * as NertiviaFunctions from './functions'
import * as NertiviaResponses from '../nertivia/responses'

export class Server {
  constructor(public raw: NertiviaTypes.Server, public client: Client) {
  }

  readonly id = this.raw.server_id
  readonly icon = this.raw.avatar
  readonly defaultChannelId = this.raw.default_channel_id
  readonly ownerID = this.raw.creator.uniqueID
  readonly channels = this.raw.channels.map(channel => new Channel(channel, this.client))
  readonly defaultChannel = this.channels.find(channel => this.defaultChannelId === channel.id)!
  
  // readonly owner = this.raw.creator.uniqueID
}

export class Channel {
  constructor(public raw: NertiviaTypes.Channel, public client: Client) {
  }

  // readonly server = this.raw.server

  readonly id = this.raw.channelID
  readonly name = this.raw.name
  readonly permissions = this.raw.permissions

  async send(content: string) {
    const response = await NertiviaFunctions.sendMessage(this.client.token!, this.id, content, this.client.socket.id)
    const message = new Message(response.messageCreated, this.client)

    this.client.messageCache.push(message)

    return message
  }
}

export class DMChannel {
  constructor(public raw: NertiviaTypes.DirectMessage, public client: Client) {
  }

  readonly id = this.raw.channelID
  get lastMessagedTimestamp() { return this.raw.lastMessaged }
  get lastMessaged() { return new Date(this.lastMessagedTimestamp) }
  get users() { return this.raw.recipients.map(r => new User(r, this.client)) }

  async send(content: string) {
    const response = await NertiviaFunctions.sendMessage(this.client.token!, this.id, content, this.client.socket.id)
    const message = new Message(response.messageCreated, this.client)

    this.client.messageCache.push(message)

    return message
  }
}

export type GenericChannel = Channel | DMChannel

export class User {
  constructor(public raw: NertiviaTypes.Member, public client: Client) {
  }

  readonly id = this.raw.uniqueID
  readonly avatar = this.raw.avatar
  readonly username = this.raw.username
  readonly displayType = this.raw.admin
  readonly tag = this.raw.tag

  get dmChannel() {
    return this.client.dms!.find(dm => dm.users.length === 1 && dm.users.some(user => user.id === this.id))
  }

  async createDM() {
    const res = await NertiviaFunctions.createDM(this.client.token!, this.id)
    
    const dm = new DMChannel(res.channel, this.client)
    this.client.dms!.push(dm)
  
    return dm
  }
}

export class Message {

  protected _deletedCheck(){ 
    if(this.deleted) { throw `message ${this.id} has been deleted and can not be modified` }
  }

  constructor(public raw: NertiviaTypes.Message, public client: Client) {
  }

  readonly id = this.raw.messageID
  readonly createdTimestamp = this.raw.created
  readonly createdAt = new Date(this.createdTimestamp)
  readonly initialContent = this.raw.message
  readonly type = this.raw.type
  readonly system = this.raw.type !== NertiviaConstants.MessageType.DEFAULT
  
  // author

  public deleted = false
  public editedTimestamp = this.createdTimestamp

  get editedAt() {
    return new Date(this.editedTimestamp)
  }

  get content() {
    return this.raw.message || ""
  }

  get attatchments() {
    return this.raw.files || []
  }

  get author() {
    return new User(this.raw.creator, this.client)
  }
  
  readonly channelID = this.raw.channelID

  get channel() {
    return this.client.channels.find(channel => this.channelID == channel.id)
  }

  async reply(content: string) {
    return this.channel!.send(content)
  }

  async delete() {
    this._deletedCheck()

    NertiviaFunctions.deleteMessage(this.client.token!, this.id, this.channelID, this.client.sid!)
    this.deleted = true
    return this
  }

  async edit(content: string) {
    this._deletedCheck()
    
    const res = await NertiviaFunctions.editMessage(this.client.token!, this.id, this.channelID, content, this.client.sid!)

    this.editedTimestamp = res.timeEdited
    this.raw.message = res.message

    return this
  }

  toString() {
    return this.content
  }
}

export class ClientUser extends User {
  constructor(public raw: NertiviaTypes.ClientUser, public client: Client) {
    super(raw, client)
  }
  
  get status() { return this.raw.status }

  async setStatus(status: NertiviaConstants.StatusType) {
    const res = await NertiviaFunctions.updateStatus(this.client.token!, status)

    this.raw.status = res.set

    return this
  }
}

export class Client {
  static SOCKET_IP = NertiviaConstants.SOCKET_IP
  static API_URL = NertiviaConstants.API_URL

  socket: SocketIOClient.Socket
  events: mitt.Emitter
  
  messageCache: Message[] = []

  findMessage(id: string): Promise<Message> {
    return new Promise((resolve, reject) => {
      let i = 0;
      const interval = setInterval(() => {
        const found = this.messageCache.find(msg => msg.id === id)

        if(found) {
          resolve(found)
        }

        if(i > 5) {
          clearInterval(interval)
          reject(`could not find message after 5 tries`)
        }

        i += 1
      }, 300)
    })
  }

  user?: ClientUser
  token?: string
  servers?: Server[]
  dms?: DMChannel[]
  sid?: string

  get channels(): GenericChannel[] {
    return [...this.servers!.flatMap(server => server.channels), ...this.dms!]
  }

  constructor() {
    this.socket = io(Client.SOCKET_IP, { autoConnect: false })
    
    this.events = mitt()

    this.attachEvents()
  }

  private attachEvents() {
    this.socket.on('connect', () => {
      this.socket.emit('authentication', { token: this.token })
    })

    this.socket.on('success', (data: NertiviaEvents.Success) => {
      this.user = new ClientUser(data.user, this)
      this.servers = data.user.servers.map(server => new Server(server, this))
      this.dms = data.dms.map(dm => new DMChannel(dm, this))

      this.events.emit('ready')
    })

    this.socket.on('delete_message', (event: NertiviaEvents.DeleteMessage) => {
      const message = this.messageCache.find(msg => msg.id === event.messageID)

      if(message !== undefined) {
        message.deleted = true
      }

      this.events.emit('messageDelete', message)
    })

    this.socket.on('update_message', (event: NertiviaEvents.UpdateMessage) => {
      const message = this.messageCache.find(msg => msg.id === event.messageID)
      
      if(message) {
        message.raw.message = event.message
        message.editedTimestamp = event.timeEdited
      }

      this.events.emit('messageUpdate', message)
    })

    this.socket.on('receiveMessage', (event: NertiviaEvents.RecieveMessage) => {
      const message = new Message(event.message, this)
      this.messageCache.push(message)

      this.events.emit('message', message)        
    })
  }

  async login(token: string) {
    this.token = token

    const data  = await NertiviaFunctions.testRequest(token, 1)

    if(!data.ok) {
      throw `Could not get the connect.sid cookie, is your token valid?`
    }
    
    this.sid = decodeURIComponent(/connect\.sid=([^;]+)/.exec(data.headers.get('set-cookie')!)![1])

    this.socket.connect()
  }
}