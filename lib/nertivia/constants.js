"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_LIST = [
    'auth_err',
    'channel:created',
    'customEmoji:remove',
    'customEmoji:rename',
    'delete_message',
    'googleDrive:linked',
    'notification:dismiss',
    'receiveMessage',
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
    'success',
    'survey:completed',
    'typingStatus',
    'update_member',
    'update_message',
    'userStatusChange',
];
exports.SOCKET_IP = 'https://nertivia.supertiger.tk';
exports.API_URL = 'https://supertiger.tk/api';
var MessageType;
(function (MessageType) {
    MessageType[MessageType["DEFAULT"] = 0] = "DEFAULT";
    MessageType[MessageType["JOIN"] = 1] = "JOIN";
    MessageType[MessageType["LEAVE"] = 2] = "LEAVE";
    MessageType[MessageType["KICK"] = 3] = "KICK";
    MessageType[MessageType["BAN"] = 4] = "BAN";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
//# sourceMappingURL=constants.js.map