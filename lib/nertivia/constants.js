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
exports.SOCKET_URL = 'https://nertivia.supertiger.tk';
exports.API_URL = 'https://supertiger.tk/api';
exports.AVATAR_URL = 'https://supertiger.tk/api/avatars';
exports.MEDIA_URL = 'https://supertiger.tk/api/media';
var MessageType;
(function (MessageType) {
    MessageType[MessageType["DEFAULT"] = 0] = "DEFAULT";
    MessageType[MessageType["JOIN"] = 1] = "JOIN";
    MessageType[MessageType["LEAVE"] = 2] = "LEAVE";
    MessageType[MessageType["KICK"] = 3] = "KICK";
    MessageType[MessageType["BAN"] = 4] = "BAN";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
var StatusType;
(function (StatusType) {
    StatusType[StatusType["OFFLINE"] = 0] = "OFFLINE";
    StatusType[StatusType["ONLINE"] = 1] = "ONLINE";
    StatusType[StatusType["AWAY"] = 2] = "AWAY";
    StatusType[StatusType["BUSY"] = 3] = "BUSY";
    StatusType[StatusType["LOOKING_TO_PLAY"] = 4] = "LOOKING_TO_PLAY";
})(StatusType = exports.StatusType || (exports.StatusType = {}));
//# sourceMappingURL=constants.js.map