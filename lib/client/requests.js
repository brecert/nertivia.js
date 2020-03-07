"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const FormData = require("form-data");
const NertiviaConstants = require("../nertivia/constants");
function apiRequest(method, path, { token, sid, data, json = true, headers = {}, type = "json" }) {
    const url = `${NertiviaConstants.API_URL}${path}`;
    if (!token) {
        throw new Error('TOKEN_MISSING');
    }
    const mergedHeaders = {
        authorization: token,
        ...headers
    };
    switch (type) {
        case "json":
            mergedHeaders["Content-Type"] = "application/json;charset=utf-8";
            break;
        case "none":
        case "unknown":
            break;
        default:
            mergedHeaders["Content-Type"] = type;
            break;
    }
    if (sid) {
        mergedHeaders["Cookie"] = `connect.sid=${sid}`;
    }
    return (node_fetch_1.default(url, { method, body: data, headers: mergedHeaders })
        .then(async (res) => {
        if (res.status !== 200) {
            const text = await res.text();
            let jsonText;
            try {
                jsonText = JSON.parse(text);
            }
            catch (err) { }
            if (jsonText) {
                if (jsonText.message) {
                    throw new Error(jsonText.message);
                }
                if (!jsonText.status) {
                    throw new Error(jsonText.errors[0].msg);
                }
            }
            throw new Error(JSON.stringify(jsonText) || text);
        }
        return json ? res.json() : res;
    })
        .catch(err => console.error(err)));
}
exports.apiRequest = apiRequest;
async function testRequest(token, status) {
    return apiRequest("POST", `/settings/status`, { token, data: JSON.stringify({ status }), json: false });
}
exports.testRequest = testRequest;
async function updateStatus({ token, sid }, status) {
    return apiRequest("POST", `/settings/status`, { token, sid, data: JSON.stringify({ status }) });
}
exports.updateStatus = updateStatus;
function sendMessage({ token, sid }, channelID, message) {
    return apiRequest("POST", `/messages/channels/${channelID}`, { token, sid, data: JSON.stringify({ message }) });
}
exports.sendMessage = sendMessage;
function editMessage({ token, sid }, messageID, channelID, newMessage) {
    return apiRequest("PATCH", `/messages/${messageID}/channels/${channelID}`, { token, sid, data: JSON.stringify({ message: newMessage }) });
}
exports.editMessage = editMessage;
function deleteMessage({ token, sid }, messageID, channelID) {
    return apiRequest("DELETE", `/messages/${messageID}/channels/${channelID}`, { token, sid });
}
exports.deleteMessage = deleteMessage;
function openDM({ token, sid }, userID) {
    return apiRequest("POST", `/channels/${userID}`, { token, sid });
}
exports.openDM = openDM;
function sendFileMessage({ token, sid }, channelID, { message = "_", name, data }) {
    const formdata = new FormData();
    formdata.append('message', message);
    formdata.append('avatar', data, name);
    return apiRequest("POST", `/messages/channels/${channelID}`, { token, sid, data: formdata, type: "unknown" });
}
exports.sendFileMessage = sendFileMessage;
function joinServerById({ token, sid }, serverID) {
    return apiRequest("POST", `/servers/invite/servers/${serverID}`, { token, sid });
}
exports.joinServerById = joinServerById;
function leaveServer({ token, sid }, serverID) {
    return apiRequest("DELETE", `/servers/${serverID}`, { token, sid });
}
exports.leaveServer = leaveServer;
function userDetails({ token, sid }, userID) {
    return apiRequest("GET", `/user/${userID}`, { token, sid });
}
exports.userDetails = userDetails;
function typingPing({ token, sid }, channelID) {
    apiRequest("POST", `/messages/${channelID}/typing`, { token, sid, json: false });
}
exports.typingPing = typingPing;
//# sourceMappingURL=requests.js.map