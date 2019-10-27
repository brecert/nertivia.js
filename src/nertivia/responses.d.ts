import * as NertiviaTypes from './types'

export interface GetMessagesResponse {
	status: boolean
	channelID: number
	messages: NertiviaTypes.Message[]
}

export interface SendMessageResponse {
	status: boolean
	tempID: number
	messageCreated: NertiviaTypes.Message
}

export interface EditMessageResponse {
	message: string
	timeEdited: number
	messageID: string
	channelID: string
	embed: number
}

export interface DeleteMessageResponse {
	messageID: string
	channelID: string
}

export interface CreateDMResponse {
	status: boolean
	channel: NertiviaTypes.DirectMessage
}