import * as NertiviaResponses from '../nertivia/responses';
export declare function rawApiRequest(method: string, uri: string, token: string, data?: any, sid?: string): Promise<import("node-fetch").Response>;
export declare function apiRequest(method: string, uri: string, token: string, data?: any, sid?: string): Promise<any>;
export declare function changeStatus(token: string, status: number): Promise<import("node-fetch").Response>;
export declare function getMessages(token: string, channelID: string): Promise<NertiviaResponses.GetMessagesResponse>;
export declare function sendMessage(token: string, channelID: string, message: string, socketID: string): Promise<NertiviaResponses.SendMessageResponse>;
export declare function editMessage(token: string, messageID: string, channelID: string, message: string, sid: string): Promise<NertiviaResponses.EditMessageResponse>;
export declare function deleteMessage(token: string, messageID: string, channelID: string, sid: string): Promise<NertiviaResponses.DeleteMessageResponse>;
//# sourceMappingURL=functions.d.ts.map