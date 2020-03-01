import * as NertiviaConstants from './constants'

export interface ChannelPermissions {
	send_message: boolean
}

export interface Channel {
	channelID: string
	lastMessaged: number
	name: string
	server_id: string
	status: number // todo: check
	recipients: unknown
	permissions?: ChannelPermissions
}

export type CreatedChannel = Omit<Channel, 'permissions'>

export interface Server {
	name: string
	creator: {
		uniqueID: string
	}
	default_channel_id: string
	server_id: string
	created: number
	avatar: string
	banner: string
	channel_position: string[]
	channels: Channel[]
}

export interface Friend {
	recipient: Member
	status: number
}

export interface Member {
	avatar: string
	username: string
	uniqueID: string
	tag: string
	admin?: number
}

export interface Apperance {
	own_message_right: boolean
}

export interface Notification {
	channelID: string
	recipient: string
	count: number
	lastMessageID: string
	sender: Member
	type: 'MESSAGE_CREATED' | string
}

export interface ClientUser {
	avatar: string
	status: number
	friends: Friend[]
	username: string
	email: string
	uniqueID: string
	tag: string
	settings: {
		appearance: Apperance
	}
	survey_completed: boolean
	servers: Server[]
}

export interface DirectMessage {
	recipients: Member[]
	channelID: string
	lastMessaged: number
}

export interface File {
	fileName: string
	fileID: string
	dimensions: {
		width: number
		height: number
	}
}

export interface Message {
	files?: File[]
	type?: NertiviaConstants.MessageType

	messageID: string
	channelID: string

	message?: string
	
	creator: Member
	created: number
}

export type UserStatus = [string, string] | [null, null]

export interface Settings {
	apperance: Apperance,
	GDriveLinked: boolean,
	customEmojis: unknown[]
}

export interface ServerMember {
	type: 'MEMBER' | 'OWNER' |  string
	member: Member
	server_id: string
}