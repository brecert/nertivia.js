import fetch from 'node-fetch'
import * as FormData from 'form-data'

import * as NertiviaConstants from '../nertivia/constants'
import * as NertiviaResponses from '../nertivia/responses'

export interface ApiRequestParams {
	token?: string
	data?: any
	sid?: string

	headers?: { [key: string]: string }

	json?: boolean
}

export function apiRequest(method: string, path: string, { token, sid, data, json = true, headers = {} }: ApiRequestParams) {
	const url = `${NertiviaConstants.API_URL}${path}`

	if(!token) {
		throw new Error('TOKEN_MISSING')
	}

	const mergedHeaders: typeof headers = {
		authorization: token,
		"Content-Type": "application/json;charset=utf-8",
		...headers
	}

	if(sid) {
		mergedHeaders["Cookie"] = `connect.sid=${sid}`
	}

	return (
		fetch(url, { method, body: data, headers: mergedHeaders })
			.then(res => json ? res.json() : res)
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

export function sendFileMessage({ token, sid }: ITokens, messageID: string, channelID: string, message: string, file: IFile): Promise<NertiviaResponses.SendMessageResponse> {
	const formdata = new FormData() 

  formdata.append('message', message)
  formdata.append('avatar', file.data, file.name)

  return apiRequest(
  	"POST", `/messages/channels/${channelID}`,
  	{ data: formdata }
	)
}