import * as NertiviaTypes from './types'

export interface Success {
	message: string
	user: NertiviaTypes.ClientUser
	serverMembers: {
		type: 'MEMBER' | 'OWNER' |  string
		member: NertiviaTypes.Member
		server_id: string
	}[]
	dms: NertiviaTypes.DirectMessage[]
	notifications: Notification[]
	currentFriendStatus: NertiviaTypes.FriendStatus[]
}

export interface UpdateMessage {
	message: string
	timeEdited: number
	messageID: string
	channelID: string
	embed: number
}

export interface RecieveMessage {
	message: NertiviaTypes.Message
}

export interface DeleteMessage {
	channelID: string
	messageID: string
}

export type ServerJoined = NertiviaTypes.Server

export interface ServerLeave {
	server_id: string
}