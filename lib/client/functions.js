"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const NertiviaConstants = require("./constants");
async function rawApiRequest(method, uri, token, data, sid) {
    // console.log(`${method} ${NertiviaConstants.API_URL}${uri} sid=${sid}`)
    return node_fetch_1.default(`${NertiviaConstants.API_URL}${uri}`, {
        method: method,
        headers: {
            "Accept": "application/json, text/plain, */*",
            "authorization": token,
            "Content-Type": "application/json;charset=utf-8",
            "Cookie": `connect.sid=${sid}`
        },
        body: JSON.stringify(data)
    });
}
exports.rawApiRequest = rawApiRequest;
async function apiRequest(method, uri, token, data, sid) {
    // return rawApiRequest(method, uri, token, data).then(res => res.json());
    return node_fetch_1.default(`${NertiviaConstants.API_URL}${uri}`, {
        method,
        headers: {
            "Accept": "application/json, text/plain, */*",
            "authorization": token,
            "Content-Type": "application/json;charset=utf-8",
            "Cookie": `connect.sid=${sid}`
        },
        body: JSON.stringify(data)
    }).then(res => res.json());
}
exports.apiRequest = apiRequest;
async function changeStatus(token, status) {
    return rawApiRequest("POST", '/settings/status', token, { status });
}
exports.changeStatus = changeStatus;
async function getMessages(token, channelID) {
    return apiRequest("GET", `/messages/channels/${channelID}`, token);
}
exports.getMessages = getMessages;
async function sendMessage(token, channelID, message, socketID) {
    return apiRequest("POST", `/messages/channels/${channelID}`, token, { message, socketID, tempID: 0 });
}
exports.sendMessage = sendMessage;
async function editMessage(token, messageID, channelID, message, sid) {
    // return apiRequest("PATCH", `/messages/${messageID}/channels/${channelID}`, token, { message }, sid)
    return node_fetch_1.default(`${NertiviaConstants.API_URL}/messages/${messageID}/channels/${channelID}`, {
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
    }).then(res => res.json());
}
exports.editMessage = editMessage;
async function deleteMessage(token, messageID, channelID, sid) {
    // return apiRequest("DELETE", `/messages/${messageID}/channels/${channelID}`, token, null, sid)
    return node_fetch_1.default(`${NertiviaConstants.API_URL}/messages/${messageID}/channels/${channelID}`, {
        method: "DELETE",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "authorization": token,
            "Content-Type": "application/json;charset=utf-8",
            "Cookie": `connect.sid=${sid}`
        }
    }).then(res => res.json());
}
exports.deleteMessage = deleteMessage;
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
//# sourceMappingURL=functions.js.map