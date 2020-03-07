/// <reference types="socket.io-client" />
import * as mitt from 'mitt';
import * as NertiviaTypes from '../nertivia/types';
import * as NertiviaConstants from '../nertivia/constants';
import * as NertiviaRequests from './requests';
import { Collection } from '../utils/collection';
export declare class Server {
    raw: NertiviaTypes.Server;
    client: Client;
    constructor(raw: NertiviaTypes.Server, client: Client);
    readonly id: string;
    readonly icon: string;
    readonly defaultChannelId: string;
    readonly ownerID: string;
    readonly channels: Channel[];
    readonly defaultChannel: Channel;
    readonly name: string;
    join(): Promise<NertiviaRequests.JoinServerResponse>;
    leave(): Promise<NertiviaRequests.LeaveServerResponse>;
}
export declare class GenericChannel {
    raw: NertiviaTypes.Channel | NertiviaTypes.DirectMessage;
    client: Client;
    constructor(raw: NertiviaTypes.Channel | NertiviaTypes.DirectMessage, client: Client);
    readonly id: string;
    send(content: string): Promise<Message>;
    startTyping(count?: number): void;
}
export declare class Channel extends GenericChannel {
    raw: NertiviaTypes.Channel;
    client: Client;
    type: string;
    constructor(raw: NertiviaTypes.Channel, client: Client);
    readonly name: string;
    readonly permissions: NertiviaTypes.ChannelPermissions | undefined;
    readonly server: Server | undefined;
}
export declare class DMChannel extends GenericChannel {
    raw: NertiviaTypes.DirectMessage;
    client: Client;
    type: string;
    constructor(raw: NertiviaTypes.DirectMessage, client: Client);
    readonly id: string;
    readonly lastMessagedTimestamp: number;
    readonly lastMessaged: Date;
    readonly users: User[];
}
export declare class User {
    raw: NertiviaTypes.Member;
    client: Client;
    constructor(raw: NertiviaTypes.Member, client: Client);
    readonly id: string;
    readonly avatar: string;
    readonly avatarURL: string;
    readonly username: string;
    readonly displayType: number | undefined;
    readonly tag: string;
    readonly dmChannel: DMChannel | undefined;
    openDM(): Promise<DMChannel>;
    fetchProfile(): Promise<UserProfile>;
}
export declare class UserProfile extends User {
    raw: NertiviaRequests.UserDetails;
    client: Client;
    constructor(raw: NertiviaRequests.UserDetails, client: Client);
    private readonly aboutUser;
    readonly createdTimestamp: number;
    readonly createdAt: Date;
    readonly name: string | undefined;
    readonly age: string | undefined;
    readonly continent: string | undefined;
    readonly country: string | undefined;
    readonly gender: string | undefined;
    readonly about: string | undefined;
    readonly badges: NertiviaConstants.BadgeType[];
}
export declare class Attachment {
    raw: NertiviaTypes.File;
    client: Client;
    constructor(raw: NertiviaTypes.File, client: Client);
    readonly filename: string;
    readonly id: string;
    readonly width: number;
    readonly height: number;
    readonly url: string;
}
export declare class Message {
    raw: NertiviaTypes.Message;
    client: Client;
    protected _deletedCheck(): void;
    constructor(raw: NertiviaTypes.Message, client: Client);
    readonly id: string;
    readonly createdTimestamp: number;
    readonly createdAt: Date;
    readonly initialContent: string | undefined;
    readonly type: NertiviaConstants.MessageType | undefined;
    readonly system: boolean;
    readonly author: User;
    deleted: boolean;
    editedTimestamp: number;
    readonly editedAt: Date;
    readonly content: string;
    readonly attachments: Attachment[];
    readonly channelID: string;
    readonly channel: GenericChannel | undefined;
    reply(content: string): Promise<Message>;
    delete(): Promise<this>;
    edit(content: string): Promise<this>;
    toString(): string;
}
export declare class ClientUser extends User {
    raw: NertiviaTypes.ClientUser;
    client: Client;
    constructor(raw: NertiviaTypes.ClientUser, client: Client);
    readonly status: number;
    setStatus(status: NertiviaConstants.StatusType): Promise<this>;
}
export declare class Client {
    static SOCKET_URL: string;
    static API_URL: string;
    socket: SocketIOClient.Socket;
    events: mitt.Emitter;
    messageCache: Message[];
    findMessage(id: string): Promise<Message>;
    user?: ClientUser;
    token?: string;
    servers?: Server[];
    dms?: DMChannel[];
    sid?: string;
    users: Collection<string, User>;
    readonly channels: GenericChannel[];
    readonly tokens: NertiviaRequests.ITokens;
    constructor();
    private attachEvents;
    login(token: string): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map