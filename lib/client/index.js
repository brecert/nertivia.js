"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io-client");
const mitt = require("mitt");
const NertiviaConstants = require("../nertivia/constants");
const NertiviaFunctions = require("./functions");
class Server {
    constructor(raw, client) {
        this.raw = raw;
        this.client = client;
        this.id = this.raw.server_id;
        this.icon = this.raw.avatar;
        this.defaultChannelId = this.raw.default_channel_id;
        this.ownerID = this.raw.creator.uniqueID;
        this.channels = this.raw.channels.map(channel => new Channel(channel, this.client));
        this.defaultChannel = this.channels.find(channel => this.defaultChannelId === channel.id);
    }
}
exports.Server = Server;
class Channel {
    constructor(raw, client) {
        this.raw = raw;
        this.client = client;
        // readonly server = this.raw.server
        this.id = this.raw.channelID;
        this.name = this.raw.name;
        this.permissions = this.raw.permissions;
    }
    async send(content) {
        const response = await NertiviaFunctions.sendMessage(this.client.token, this.id, content, this.client.socket.id);
        const message = new Message(response.messageCreated, this.client);
        this.client.messageCache.push(message);
        return message;
    }
}
exports.Channel = Channel;
class DMChannel {
    constructor(raw, client) {
        this.raw = raw;
        this.client = client;
        this.id = this.raw.channelID;
    }
    get lastMessagedTimestamp() { return this.raw.lastMessaged; }
    get lastMessaged() { return new Date(this.lastMessagedTimestamp); }
    get users() { return this.raw.recipients; }
    async send(content) {
        const response = await NertiviaFunctions.sendMessage(this.client.token, this.id, content, this.client.socket.id);
        const message = new Message(response.messageCreated, this.client);
        this.client.messageCache.push(message);
        return message;
    }
}
exports.DMChannel = DMChannel;
class User {
    constructor(raw, client) {
        this.raw = raw;
        this.client = client;
        this.id = this.raw.uniqueID;
        this.avatar = this.raw.avatar;
        this.username = this.raw.username;
        this.displayType = this.raw.admin;
        this.tag = this.raw.tag;
    }
}
exports.User = User;
class Message {
    constructor(raw, client) {
        this.raw = raw;
        this.client = client;
        this.id = this.raw.messageID;
        this.createdTimestamp = this.raw.created;
        this.createdAt = new Date(this.createdTimestamp);
        this.initialContent = this.raw.message;
        this.type = this.raw.type;
        this.system = this.raw.type !== NertiviaConstants.MessageType.DEFAULT;
        // author
        this.deleted = false;
        this.editedTimestamp = this.createdTimestamp;
        this.channelID = this.raw.channelID;
    }
    _deletedCheck() {
        if (this.deleted) {
            throw `message ${this.id} has been deleted and can not be modified`;
        }
    }
    get editedAt() {
        return new Date(this.editedTimestamp);
    }
    get content() {
        return this.raw.message || "";
    }
    get attatchments() {
        return this.raw.files || [];
    }
    get channel() {
        return this.client.channels.find(channel => this.channelID == channel.id);
    }
    async reply(content) {
        return this.channel.send(content);
    }
    get author() {
        return new User(this.raw.creator, this.client);
    }
    async delete() {
        this._deletedCheck();
        NertiviaFunctions.deleteMessage(this.client.token, this.id, this.channelID, this.client.sid);
        this.deleted = true;
        return this;
    }
    async edit(content) {
        this._deletedCheck();
        const res = await NertiviaFunctions.editMessage(this.client.token, this.id, this.channelID, content, this.client.sid);
        this.editedTimestamp = res.timeEdited;
        this.raw.message = res.message;
        return this;
    }
    toString() {
        return this.content;
    }
}
exports.Message = Message;
class ClientUser extends User {
    constructor(raw, client) {
        super(raw, client);
        this.raw = raw;
        this.client = client;
        this.status = this.raw.status;
    }
}
exports.ClientUser = ClientUser;
class Client {
    constructor() {
        this.messageCache = [];
        this.userCache = [];
        this.socket = io(Client.SOCKET_IP, { autoConnect: false });
        this.events = mitt();
        this.attachEvents();
    }
    findMessage(id) {
        return new Promise((resolve, reject) => {
            let i = 0;
            const interval = setInterval(() => {
                const found = this.messageCache.find(msg => msg.id === id);
                if (found) {
                    resolve(found);
                }
                if (i > 5) {
                    clearInterval(interval);
                    reject(`could not find message after 5 tries`);
                }
                i += 1;
            }, 300);
        });
    }
    get channels() {
        return [...this.servers.flatMap(server => server.channels), ...this.dms];
    }
    attachEvents() {
        this.socket.on('connect', () => {
            this.socket.emit('authentication', { token: this.token });
        });
        this.socket.on('success', (data) => {
            this.user = new ClientUser(data.user, this);
            this.servers = data.user.servers.map(server => new Server(server, this));
            this.dms = data.dms.map(dm => new DMChannel(dm, this));
            this.events.emit('ready');
        });
        this.socket.on('delete_message', (event) => {
            const message = this.messageCache.find(msg => msg.id === event.messageID);
            if (message !== undefined) {
                message.deleted = true;
            }
            this.events.emit('messageDelete', message);
        });
        this.socket.on('update_message', (event) => {
            const message = this.messageCache.find(msg => msg.id === event.messageID);
            if (message) {
                message.raw.message = event.message;
                message.editedTimestamp = event.timeEdited;
            }
            this.events.emit('messageUpdate', message);
        });
        this.socket.on('receiveMessage', (event) => {
            const message = new Message(event.message, this);
            this.messageCache.push(message);
            this.events.emit('message', message);
        });
    }
    async login(token) {
        this.token = token;
        const data = await NertiviaFunctions.changeStatus(token, 1);
        if (!data.ok) {
            throw `Could not get the connect.sid cookie, is your token valid?`;
        }
        this.sid = decodeURIComponent(/connect\.sid=([^;]+)/.exec(data.headers.get('set-cookie'))[1]);
        this.socket.connect();
    }
}
exports.Client = Client;
Client.SOCKET_IP = NertiviaConstants.SOCKET_IP;
Client.API_URL = NertiviaConstants.API_URL;
//# sourceMappingURL=index.js.map