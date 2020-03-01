import * as io from 'socket.io-client'
import * as mitt from 'mitt'

import * as NertiviaEvents from '../nertivia/events'
import * as NertiviaTypes from '../nertivia/types'
import * as NertiviaConstants from '../nertivia/constants'
import * as NertiviaResponses from '../nertivia/responses'
import * as NertiviaRequests from './requests'
import { Collection } from '../utils/collection'
  
export class Server {
  constructor(public raw: NertiviaTypes.Server, public client: Client) {
  }

  readonly id = this.raw.server_id
  readonly icon = this.raw.avatar
  readonly defaultChannelId = this.raw.default_channel_id
  readonly ownerID = this.raw.creator.uniqueID
  readonly channels = this.raw.channels.map(channel => new Channel(channel, this.client))
  readonly defaultChannel = this.channels.find(channel => this.defaultChannelId === channel.id)!

  get name() {
    return this.raw.name
  }
  
  // readonly owner = this.raw.creator.uniqueID

  join() {
    return NertiviaRequests.joinServerById(this.client.tokens, this.id)
  }

  leave() {
    return NertiviaRequests.leaveServer(this.client.tokens, this.id)
  }
}

export class GenericChannel {
  constructor(public raw: NertiviaTypes.Channel | NertiviaTypes.DirectMessage, public client: Client) {
  }

  readonly id = this.raw.channelID

  async send(content: string) {
    const response = await NertiviaRequests.sendMessage(this.client.tokens, this.id, content)
    const message = new Message(response.messageCreated, this.client)

    this.client.messageCache.push(message)

    return message
  }

  startTyping(count = 1) {
    NertiviaRequests.typingPing(this.client.tokens, this.id)
  }
}

export class Channel extends GenericChannel {
  type = "text"

  constructor(public raw: NertiviaTypes.Channel, public client: Client) {
    super(raw, client)
  }

  readonly name = this.raw.name
  readonly permissions = this.raw.permissions

  get server() {
    return this.client.servers!.find(s => s.channels.some(c => c.id === this.id))
  }
}

export class DMChannel extends GenericChannel {
  type = "dm"

  constructor(public raw: NertiviaTypes.DirectMessage, public client: Client) {
    super(raw, client)
  }

  readonly id = this.raw.channelID

  get lastMessagedTimestamp() { return this.raw.lastMessaged }
  get lastMessaged() { return new Date(this.raw.lastMessaged) }
  get users() { return this.raw.recipients.map(r => new User(r, this.client)) }
}


export class User {
  constructor(public raw: NertiviaTypes.Member, public client: Client) {
  }

  readonly id = this.raw.uniqueID
  readonly avatar = this.raw.avatar

  get avatarURL() { return `${NertiviaConstants.AVATAR_URL}/${this.avatar}` }

  readonly username = this.raw.username
  readonly displayType = this.raw.admin
  readonly tag = this.raw.tag

  get dmChannel() {
    return this.client.dms!.find(dm => dm.users.length === 1 && dm.users.some(user => user.id === this.id))
  }

  async openDM() {
    const res = await NertiviaRequests.openDM(this.client.tokens, this.id)
    
    const dm = new DMChannel(res.channel, this.client)
    this.client.dms!.push(dm)
  
    return dm
  }

  async fetchProfile() {
    return new UserProfile((await NertiviaRequests.userDetails(this.client.tokens, this.id)).user, this.client)
  }
}

export class UserProfile extends User {
  constructor(public raw: NertiviaRequests.UserDetails, public client: Client) {
    super(raw, client)
  }

  private get aboutUser(): NertiviaRequests.AboutMe {
    return this.raw.about_me || {} as any
  }

  get createdTimestamp() { return this.raw.created }
  get createdAt() { return new Date(this.createdTimestamp) }
  get name() { return this.aboutUser.name }
  get age() { return this.aboutUser.age }
  get continent() { return this.aboutUser.continent }
  get country() { return this.aboutUser.country }
  get gender() { return this.aboutUser.gender }
  get about() { return this.aboutUser.about_me }
  get badges() { return this.raw.badges }
}

export class Attachment {
  constructor(public raw: NertiviaTypes.File, public client: Client) {
  }

  get filename() { return this.raw.fileName }
  get id() { return this.raw.fileID }
  
  get width() { return this.raw.dimensions.width }
  get height() { return this.raw.dimensions.height }

  get url() { return `${NertiviaConstants.MEDIA_URL}/${this.id}` }
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
  readonly author = new User(this.raw.creator, this.client)
  
  // author

  public deleted = false
  public editedTimestamp = this.createdTimestamp

  get editedAt() {
    return new Date(this.editedTimestamp)
  }

  get content() {
    return this.raw.message || ""
  }

  get attachments() {
    return (this.raw.files || []).map(file => new Attachment(file, this.client))
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

    NertiviaRequests.deleteMessage(this.client.tokens, this.id, this.channelID)
    this.deleted = true
    return this
  }

  async edit(content: string) {
    this._deletedCheck()
    
    const res = await NertiviaRequests.editMessage(this.client.tokens, this.id, this.channelID, content)

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
    const res = await NertiviaRequests.updateStatus(this.client.tokens, status)

    this.raw.status = res.set

    return this
  }
}

// interface TypingEntry {
//   count: number
//   interval: 
// }

export class Client {
  static SOCKET_URL = NertiviaConstants.SOCKET_URL
  static API_URL = NertiviaConstants.API_URL

  socket: SocketIOClient.Socket
  events: mitt.Emitter
  
  messageCache: Message[] = []
  // #typing: Map<string, TypingEntry> = new Map

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

  users: Collection<string, User> = new Collection()

  // todo: reverse this process and have the servers add to the cache here
  get channels(): GenericChannel[] {
    return [...this.servers!.flatMap(server => server.channels), ...this.dms!]
  }

  get tokens(): NertiviaRequests.ITokens {
    return {
      token: this.token!,
      sid: this.sid!
    }
  }

  constructor() {
    this.socket = io(Client.SOCKET_URL, { autoConnect: false });

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
      data.serverMembers.map(m => new User(m.member, this)).forEach(u => this.users.add(u))

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

    this.socket.on("server:joined", (event: NertiviaEvents.ServerJoined) => {
      if(this.servers) {
        const server = new Server(event, this)
        this.servers.push(server)
        this.events.emit('serverJoin', server)
      } else {
        throw new Error("Received 'server:joined' event before client servers could be created!")
      }
    })

    this.socket.on("server:leave", (event: NertiviaEvents.ServerLeave) => {
      if(this.servers) {
        const idx = this.servers.findIndex(s => s.id !== event.server_id)
        const server = this.servers.splice(idx, 1)[0]
        this.events.emit('serverLeft', server)
      } else {
        throw new Error("Received 'server:leave' before client servers could be created!")
      }
    })

    this.socket.on("server:add_channel", (event: NertiviaEvents.ServerAddChannel) => {
      if(this.servers) {
        const server = this.servers.find(s => s.id === event.channel.server_id)
        if(server) {
          const channel = new Channel(event.channel, this)
          server.channels.push(channel)
          this.events.emit('channelCreate', channel)
        } else {
          throw new Error("Received 'server:add_channel' event on server that does not exist!")
        }
      } else {
        throw new Error("Received 'server:add_channel' before client servers could be created!")
      }
    })

    this.socket.on("server:remove_channel", (event: NertiviaEvents.ServerRemoveChannel) => {
      if(this.servers) {
        const server = this.servers.find(s => s.id === event.server_id)
        if(server) {
          const idx = server.channels.findIndex(c => c.id !== event.channelID)
          const channel = server.channels.splice(idx, 1)[0]
          this.events.emit('channelDelete', channel)
        } else {
          throw new Error("Received 'server:remove_channel' event on server that does not exist!")
        }
      } else {
        throw new Error("Received 'server:remove_channel' before client servers could be created!")
      }
    })

    this.socket.on("server:members", (event: NertiviaEvents.ServerMembers) => {
      event.serverMembers.forEach(m => {
        const user = this.users.add(new User(m.member, this))
        // todo: add to server
      })
    })
  }

  async login(token: string) {
    this.token = token

    const data  = await NertiviaRequests.testRequest(token, 1)

    if(!data.ok) {
      throw `Could not get the connect.sid cookie, is your token valid?`
    }
    
    this.sid = decodeURIComponent(/connect\.sid=([^;]+)/.exec(data.headers.get('set-cookie')!)![1])

    this.socket.connect()
  }
}