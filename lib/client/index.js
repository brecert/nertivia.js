"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io-client");
const mitt = require("mitt");
const NertiviaConstants = require("../nertivia/constants");
const NertiviaRequests = require("./requests");
const collection_1 = require("../utils/collection");
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
    get name() {
        return this.raw.name;
    }
    // readonly owner = this.raw.creator.uniqueID
    join() {
        return NertiviaRequests.joinServerById(this.client.tokens, this.id);
    }
    leave() {
        return NertiviaRequests.leaveServer(this.client.tokens, this.id);
    }
}
exports.Server = Server;
class GenericChannel {
    constructor(raw, client) {
        this.raw = raw;
        this.client = client;
        this.id = this.raw.channelID;
    }
    async send(content) {
        const response = await NertiviaRequests.sendMessage(this.client.tokens, this.id, content);
        const message = new Message(response.messageCreated, this.client);
        this.client.messageCache.push(message);
        return message;
    }
    startTyping(count = 1) {
        NertiviaRequests.typingPing(this.client.tokens, this.id);
    }
}
exports.GenericChannel = GenericChannel;
class Channel extends GenericChannel {
    constructor(raw, client) {
        super(raw, client);
        this.raw = raw;
        this.client = client;
        this.type = "text";
        this.name = this.raw.name;
        this.permissions = this.raw.permissions;
    }
    get server() {
        return this.client.servers.find(s => s.channels.some(c => c.id === this.id));
    }
}
exports.Channel = Channel;
class DMChannel extends GenericChannel {
    constructor(raw, client) {
        super(raw, client);
        this.raw = raw;
        this.client = client;
        this.type = "dm";
        this.id = this.raw.channelID;
    }
    get lastMessagedTimestamp() { return this.raw.lastMessaged; }
    get lastMessaged() { return new Date(this.raw.lastMessaged); }
    get users() { return this.raw.recipients.map(r => new User(r, this.client)); }
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
    get avatarURL() { return `${NertiviaConstants.AVATAR_URL}/${this.avatar}`; }
    get dmChannel() {
        return this.client.dms.find(dm => dm.users.length === 1 && dm.users.some(user => user.id === this.id));
    }
    async openDM() {
        const res = await NertiviaRequests.openDM(this.client.tokens, this.id);
        const dm = new DMChannel(res.channel, this.client);
        this.client.dms.push(dm);
        return dm;
    }
    async fetchProfile() {
        return new UserProfile((await NertiviaRequests.userDetails(this.client.tokens, this.id)).user, this.client);
    }
}
exports.User = User;
class UserProfile extends User {
    constructor(raw, client) {
        super(raw, client);
        this.raw = raw;
        this.client = client;
    }
    get aboutUser() {
        return this.raw.about_me || {};
    }
    get createdTimestamp() { return this.raw.created; }
    get createdAt() { return new Date(this.createdTimestamp); }
    get name() { return this.aboutUser.name; }
    get age() { return this.aboutUser.age; }
    get continent() { return this.aboutUser.continent; }
    get country() { return this.aboutUser.country; }
    get gender() { return this.aboutUser.gender; }
    get about() { return this.aboutUser.about_me; }
    get badges() { return this.raw.badges; }
}
exports.UserProfile = UserProfile;
class Attachment {
    constructor(raw, client) {
        this.raw = raw;
        this.client = client;
    }
    get filename() { return this.raw.fileName; }
    get id() { return this.raw.fileID; }
    get width() { return this.raw.dimensions.width; }
    get height() { return this.raw.dimensions.height; }
    get url() { return `${NertiviaConstants.MEDIA_URL}/${this.id}`; }
}
exports.Attachment = Attachment;
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
        this.author = new User(this.raw.creator, this.client);
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
    get attachments() {
        return (this.raw.files || []).map(file => new Attachment(file, this.client));
    }
    get channel() {
        return this.client.channels.find(channel => this.channelID == channel.id);
    }
    async reply(content) {
        return this.channel.send(content);
    }
    async delete() {
        this._deletedCheck();
        NertiviaRequests.deleteMessage(this.client.tokens, this.id, this.channelID);
        this.deleted = true;
        return this;
    }
    async edit(content) {
        this._deletedCheck();
        const res = await NertiviaRequests.editMessage(this.client.tokens, this.id, this.channelID, content);
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
    }
    get status() { return this.raw.status; }
    async setStatus(status) {
        const res = await NertiviaRequests.updateStatus(this.client.tokens, status);
        this.raw.status = res.set;
        return this;
    }
}
exports.ClientUser = ClientUser;
// interface TypingEntry {
//   count: number
//   interval: 
// }
class Client {
    constructor() {
        this.messageCache = [];
        this.users = new collection_1.Collection();
        this.socket = io(Client.SOCKET_URL, { autoConnect: false });
        this.events = mitt();
        this.attachEvents();
    }
    // #typing: Map<string, TypingEntry> = new Map
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
    // todo: reverse this process and have the servers add to the cache here
    get channels() {
        return [...this.servers.flatMap(server => server.channels), ...this.dms];
    }
    get tokens() {
        return {
            token: this.token,
            sid: this.sid
        };
    }
    attachEvents() {
        this.socket.on('connect', () => {
            this.socket.emit('authentication', { token: this.token });
        });
        this.socket.on('success', (data) => {
            this.user = new ClientUser(data.user, this);
            this.servers = data.user.servers.map(server => new Server(server, this));
            this.dms = data.dms.map(dm => new DMChannel(dm, this));
            data.serverMembers.map(m => new User(m.member, this)).forEach(u => this.users.add(u));
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
        this.socket.on("server:joined", (event) => {
            if (this.servers) {
                const server = new Server(event, this);
                this.servers.push(server);
                this.events.emit('serverJoin', server);
            }
            else {
                throw new Error("Received 'server:joined' event before client servers could be created!");
            }
        });
        this.socket.on("server:leave", (event) => {
            if (this.servers) {
                const idx = this.servers.findIndex(s => s.id !== event.server_id);
                const server = this.servers.splice(idx, 1)[0];
                this.events.emit('serverLeft', server);
            }
            else {
                throw new Error("Received 'server:leave' before client servers could be created!");
            }
        });
        this.socket.on("server:add_channel", (event) => {
            if (this.servers) {
                const server = this.servers.find(s => s.id === event.channel.server_id);
                if (server) {
                    const channel = new Channel(event.channel, this);
                    server.channels.push(channel);
                    this.events.emit('channelCreate', channel);
                }
                else {
                    throw new Error("Received 'server:add_channel' event on server that does not exist!");
                }
            }
            else {
                throw new Error("Received 'server:add_channel' before client servers could be created!");
            }
        });
        this.socket.on("server:remove_channel", (event) => {
            if (this.servers) {
                const server = this.servers.find(s => s.id === event.server_id);
                if (server) {
                    const idx = server.channels.findIndex(c => c.id !== event.channelID);
                    const channel = server.channels.splice(idx, 1)[0];
                    this.events.emit('channelDelete', channel);
                }
                else {
                    throw new Error("Received 'server:remove_channel' event on server that does not exist!");
                }
            }
            else {
                throw new Error("Received 'server:remove_channel' before client servers could be created!");
            }
        });
        this.socket.on("server:members", (event) => {
            event.serverMembers.forEach(m => {
                const user = this.users.add(new User(m.member, this));
                // todo: add to server
            });
        });
    }
    async login(token) {
        this.token = token;
        const data = await NertiviaRequests.testRequest(token, 1);
        if (!data.ok) {
            throw `Could not get the connect.sid cookie, is your token valid?`;
        }
        this.sid = decodeURIComponent(/connect\.sid=([^;]+)/.exec(data.headers.get('set-cookie'))[1]);
        this.socket.connect();
    }
}
exports.Client = Client;
Client.SOCKET_URL = NertiviaConstants.SOCKET_URL;
Client.API_URL = NertiviaConstants.API_URL;
//# sourceMappingURL=index.js.map