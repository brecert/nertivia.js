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


// await fetch("https://supertiger.tk/api/messages/6593936204633214976/channels/6525226137725978603", {
//     "credentials": "include",
//     "headers": {
//         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:70.0) Gecko/20100101 Firefox/70.0",
//         "Accept": "application/json, text/plain, */*",
//         "Accept-Language": "en-US,en;q=0.5",
//         "authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNjMwNjM5NjkyNzkxOTA4MzIiLCJpYXQiOjE1NzIxMTUwNDIwMTd9.HyDY8IMXsyBgPdq0kFWWfTMbYtkhFkTABcNFUQ1SdM0",
//         "Content-Type": "application/json;charset=utf-8",
//         "Pragma": "no-cache",
//         "Cache-Control": "no-cache"
//     },
//     "referrer": "https://nertivia.supertiger.tk/app",
//     "body": "{\"message\":\"Sat Oct 26 2019 15:08:19 GMT-0400 (Eastern Daylight Time)e\"}",
//     "method": "PATCH",
//     "mode": "cors"
// });

// PATCH /api/messages/6593936204633214976/channels/6525226137725978603 HTTP/1.1
// Host: supertiger.tk
// User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:70.0) Gecko/20100101 Firefox/70.0
// Accept: application/json, text/plain, */*
// Accept-Language: en-US,en;q=0.5
// Accept-Encoding: gzip, deflate, br
// authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNjMwNjM5NjkyNzkxOTA4MzIiLCJpYXQiOjE1NzIxMTUwNDIwMTd9.HyDY8IMXsyBgPdq0kFWWfTMbYtkhFkTABcNFUQ1SdM0
// Content-Type: application/json;charset=utf-8
// Content-Length: 72
// Origin: https://nertivia.supertiger.tk
// Connection: keep-alive
// Referer: https://nertivia.supertiger.tk/app
// Cookie: __cfduid=d86c640086c9a1d92b41742d5b75978d31559052960; connect.sid=s%3AZi_mZF4RND3PK9dWnJ3mlrhdBvw7dnL8.a6crmBgOImZDlYsd%2FIYtkV%2BzmqF88I6cr1TalE%2BvOr4
// Pragma: no-cache
// Cache-Control: no-cache