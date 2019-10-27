"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const NertiviaConstants = require("../nertivia/constants");
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
//# sourceMappingURL=functions.js.map