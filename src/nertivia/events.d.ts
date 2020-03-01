import * as NertiviaTypes from './types'
import * as NertiviaConstants from './constants'

export interface Success {
	message: string
	user: NertiviaTypes.ClientUser
	serverMembers: NertiviaTypes.ServerMember[]
	dms: NertiviaTypes.DirectMessage[]
	notifications: Notification[]
	currentFriendStatus: NertiviaTypes.UserStatus[]
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

export interface ServerAddChannel {
	channel: NertiviaTypes.CreatedChannel
}

export interface ServerUpdateChannel {
	name: string
	channelID: string
	permissions?: NertiviaTypes.ChannelPermissions
}

export interface ServerRemoveChannel {
	channelID: string
	server_id: string
}

export interface ServerMembers {
	serverMembers: NertiviaTypes.ServerMember[]
	memberPresences: NertiviaTypes.UserStatus[]
}

export interface UserStatusChange {
	uniqueID: string
	status: NertiviaConstants.StatusType
}