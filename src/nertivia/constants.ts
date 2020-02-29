export const EVENT_LIST = [
	'auth_err',

	'channel:created',

	'customEmoji:remove',
	'customEmoji:rename',

	'delete_message', // finished

	'googleDrive:linked',

	'notification:dismiss',

	'receiveMessage', // finished

	'relationshipAccept',
	'relationshipAdd',
	'relationshipRemove',

	'server:add_channel',
	'server:joined',
	'server:leave',
	'server:member_add',
	'server:member_remove',
	'server:remove_channel',
	'server:update_channel',
	'server:roles',
	'server:members',

	'success', // ???

	'survey:completed',

	'typingStatus',

	'update_member',
	'update_message', // finished

	'userStatusChange',
]

export const SOCKET_URL = 'https://nertivia.supertiger.tk'
export const API_URL = 'https://supertiger.tk/api'
export const AVATAR_URL = 'https://supertiger.tk/api/avatars'
export const MEDIA_URL = 'https://supertiger.tk/api/media'

export enum MessageType {
	DEFAULT,
	JOIN,
	LEAVE,
	KICK,
	BAN
}

export enum StatusType {
	OFFLINE,
	ONLINE,
	AWAY,
	BUSY,
	LOOKING_TO_PLAY
}

export enum BadgeType {
	BUG_CATCHER = 3,
	SUPPORTER = 5
}