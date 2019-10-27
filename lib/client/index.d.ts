/// <reference types="socket.io-client" />
import * as mitt from 'mitt';
import * as NertiviaTypes from '../nertivia/types';
import * as NertiviaConstants from '../nertivia/constants';
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
}
export declare class Channel {
    raw: NertiviaTypes.Channel;
    client: Client;
    constructor(raw: NertiviaTypes.Channel, client: Client);
    readonly id: string;
    readonly name: string;
    readonly permissions: {
        _id: string;
        send_message: boolean;
    };
    send(content: string): Promise<Message>;
}
export declare class DMChannel {
    raw: NertiviaTypes.DirectMessage;
    client: Client;
    constructor(raw: NertiviaTypes.DirectMessage, client: Client);
    readonly id: string;
    readonly lastMessagedTimestamp: number;
    readonly lastMessaged: Date;
    readonly users: NertiviaTypes.Member[];
    send(content: string): Promise<Message>;
}
export declare type GenericChannel = Channel | DMChannel;
export declare class User {
    raw: NertiviaTypes.Member;
    client: Client;
    constructor(raw: NertiviaTypes.Member, client: Client);
    readonly id: string;
    readonly avatar: string;
    readonly username: string;
    readonly displayType: number | undefined;
    readonly tag: string;
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
    deleted: boolean;
    editedTimestamp: number;
    readonly editedAt: Date;
    readonly content: string;
    readonly attatchments: NertiviaTypes.File[];
    readonly channelID: string;
    readonly channel: Channel | DMChannel | undefined;
    reply(content: string): Promise<Message>;
    readonly author: User;
    delete(): Promise<this>;
    edit(content: string): Promise<this>;
    toString(): string;
}
export declare class ClientUser extends User {
    raw: NertiviaTypes.ClientUser;
    client: Client;
    constructor(raw: NertiviaTypes.ClientUser, client: Client);
    readonly status: number;
}
export declare class Client {
    static SOCKET_IP: string;
    static API_URL: string;
    socket: SocketIOClient.Socket;
    events: mitt.Emitter;
    messageCache: Message[];
    userCache: User[];
    findMessage(id: string): Promise<Message>;
    user?: ClientUser;
    token?: string;
    servers?: Server[];
    dms?: DMChannel[];
    sid?: string;
    readonly channels: GenericChannel[];
    constructor();
    private attachEvents;
    login(token: string): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map