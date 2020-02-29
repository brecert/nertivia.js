import * as NertiviaConstants from './constants'

export interface Channel {
	name: string
	channelID: string
	server: string
	permissions: {
		_id: string
		send_message: boolean
	}
}

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
		_id: string
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

export type FriendStatus = [string?, string?]

export interface Settings {
	_id: string,
	apperance: Apperance,
	GDriveLinked: boolean,
	customEmojis: unknown[]
}