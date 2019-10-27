import fetch from 'node-fetch'

import * as NertiviaConstants from './constants'
import * as NertiviaResponses from '../nertivia/responses'

export async function rawApiRequest(method: string, uri: string, token: string, data?: any, sid?: string) {
  // console.log(`${method} ${NertiviaConstants.API_URL}${uri} sid=${sid}`)
  return fetch(
    `${NertiviaConstants.API_URL}${uri}`, {
    method: method,
    headers: {
      "Accept": "application/json, text/plain, */*",
      "authorization": token,
      "Content-Type": "application/json;charset=utf-8",
      "Cookie": `connect.sid=${sid}`
    },
    body: JSON.stringify(data)
  })
}

export async function apiRequest(method: string, uri: string, token: string,  data?: any, sid?: string) {
  // return rawApiRequest(method, uri, token, data).then(res => res.json());

  return fetch(
    `${NertiviaConstants.API_URL}${uri}`, {
    method,
    headers: {
      "Accept": "application/json, text/plain, */*",
      "authorization": token,
      "Content-Type": "application/json;charset=utf-8",
      "Cookie": `connect.sid=${sid}`
    },
    body: JSON.stringify(data)
  }).then(res => res.json())

}

export async function changeStatus(token: string, status: number) {
  return rawApiRequest("POST", '/settings/status', token, { status })
}

export async function getMessages(token: string, channelID: string): Promise<NertiviaResponses.GetMessagesResponse> {
  return apiRequest("GET", `/messages/channels/${channelID}`, token)
}

export async function sendMessage(token: string, channelID: string, message: string,  socketID: string): Promise<NertiviaResponses.SendMessageResponse> {
  return apiRequest("POST", `/messages/channels/${channelID}`, token, { message, socketID, tempID: 0 })
}

export async function editMessage(token: string, messageID: string, channelID: string, message: string, sid: string): Promise<NertiviaResponses.EditMessageResponse> {
  // return apiRequest("PATCH", `/messages/${messageID}/channels/${channelID}`, token, { message }, sid)

  return fetch(
    `${NertiviaConstants.API_URL}/messages/${messageID}/channels/${channelID}`, {
    method: "PATCH",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "authorization": token,
      "Content-Type": "application/json;charset=utf-8",
      "Cookie": `connect.sid=${sid}`
    },
    body: JSON.stringify({
      message
    })
  }).then(res => res.json())

}

export async function deleteMessage(token: string, messageID: string, channelID: string, sid: string): Promise<NertiviaResponses.DeleteMessageResponse> {
  // return apiRequest("DELETE", `/messages/${messageID}/channels/${channelID}`, token, null, sid)
  return fetch(
    `${NertiviaConstants.API_URL}/messages/${messageID}/channels/${channelID}`, {
    method: "DELETE",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "authorization": token,
      "Content-Type": "application/json;charset=utf-8",
      "Cookie": `connect.sid=${sid}`
    }
  }).then(res => res.json())

}