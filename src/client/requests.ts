import fetch from 'node-fetch'
import * as FormData from 'form-data'

import * as NertiviaConstants from '../nertivia/constants'
import * as NertiviaResponses from '../nertivia/responses'
import * as NertiviaTypes from '../nertivia/types'

export interface ApiRequestParams {
	token?: string
	data?: any
	sid?: string

	headers?: { [key: string]: string }

	json?: boolean
	type?: string
}

export function apiRequest(method: string, path: string, { token, sid, data, json = true, headers = {}, type = "json" }: ApiRequestParams) {
	const url = `${NertiviaConstants.API_URL}${path}`


	if(!token) {
		throw new Error('TOKEN_MISSING')
	}

	const mergedHeaders: typeof headers = {
		authorization: token,
		...headers
	}

	switch (type) {
		case "json":
			mergedHeaders["Content-Type"] = "application/json;charset=utf-8"
			break;
		case "none":
		case "unknown":
			break;
		default:
			mergedHeaders["Content-Type"] = type
			break;
	}

	if(sid) {
		mergedHeaders["Cookie"] = `connect.sid=${sid}`
	}

	return (
		fetch(url, { method, body: data, headers: mergedHeaders })
			.then(async res => {
				if(res.status !== 200) {
					const text = await res.text()
					const jsonText = JSON.parse(text)

					if(jsonText) {
						if(jsonText.message) {
							throw new Error(jsonText.message)
						}

						if(!jsonText.status) {
							throw new Error(jsonText.errors[0].msg)
						}
					}

					throw new Error(JSON.stringify(jsonText) || text)
				}

				return json ? res.json() : res
			})
			.catch(err => console.error(err))
	)
}

export interface ITokens {
	token: string
	sid: string
}

export async function testRequest(token: string, status: number): Promise<Response> {
	return apiRequest(
		"POST", `/settings/status`,
		{ token, data: JSON.stringify({ status }), json: false }
	)
}

export async function updateStatus({ token, sid }: ITokens, status: number): Promise<NertiviaResponses.UpdateStatus> {
	return apiRequest(
		"POST", `/settings/status`,
		{ token, sid, data: JSON.stringify({ status }) }
	)
}

export function sendMessage({ token, sid }: ITokens, channelID: string, message: string): Promise<NertiviaResponses.SendMessageResponse> {
	return apiRequest(
		"POST", `/messages/channels/${channelID}`,
		{ token, sid, data: JSON.stringify({ message }) }
	)
}

export function editMessage({ token, sid }: ITokens, messageID: string, channelID: string, newMessage: string): Promise<NertiviaResponses.EditMessageResponse> {
	return apiRequest(
		"PATCH", `/messages/${messageID}/channels/${channelID}`,
		{ token, sid, data: JSON.stringify({ message: newMessage }) }
	)
}

export function deleteMessage({ token, sid }: ITokens, messageID: string, channelID: string): Promise<NertiviaResponses.DeleteMessageResponse> {
	return apiRequest(
		"DELETE", `/messages/${messageID}/channels/${channelID}`,
		{ token, sid }
	)
}

export function openDM({ token, sid }: ITokens, userID: string): Promise<NertiviaResponses.CreateDMResponse> {
	return apiRequest(
		"POST", `/channels/${userID}`,
		{ token, sid }
	)
}

export interface IFile {
	name: string
	data: any
}

export interface SendFileMessageParams extends IFile {
	message?: string
}

export function sendFileMessage({ token, sid }: ITokens, channelID: string, { message = "_", name, data }: SendFileMessageParams): Promise<NertiviaResponses.SendMessageResponse> {
	const formdata = new FormData() 

  formdata.append('message', message)
  formdata.append('avatar', data, name)

  return apiRequest(
  	"POST", `/messages/channels/${channelID}`,
  	{ token, sid, data: formdata, type: "unknown" }
	)
}

export interface JoinServerResponse {
	/** the name of the server */
	name: string

	/** the creator of the server */
	creator: {
		uniqueID: string
	}

	default_channel_id: string

	server_id: string

	/** a timestamp when the server was created */
	created: number

	/** the icon id of the server */
	avatar: string

	/** if the server is public or not */
	public: boolean
}
export function joinServerById({ token, sid }: ITokens, serverID: string): Promise<JoinServerResponse> {
	return apiRequest(
  	"POST", `/servers/invite/servers/${serverID}`,
  	{ token, sid }
	)
}

export interface LeaveServerResponse {
	status: "Done!" | string
}
export function leaveServer({ token, sid }: ITokens, serverID: string): Promise<LeaveServerResponse> {
	return apiRequest(
  	"DELETE", `/servers/${serverID}`,
  	{ token, sid }
	)
}