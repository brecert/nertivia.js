import * as NertiviaConstants from '../nertivia/constants';
import * as NertiviaResponses from '../nertivia/responses';
import * as NertiviaTypes from '../nertivia/types';
export interface ApiRequestParams {
    token?: string;
    data?: any;
    sid?: string;
    headers?: {
        [key: string]: string;
    };
    json?: boolean;
    type?: string;
}
export declare function apiRequest(method: string, path: string, { token, sid, data, json, headers, type }: ApiRequestParams): Promise<any>;
export interface ITokens {
    token: string;
    sid: string;
}
export declare function testRequest(token: string, status: number): Promise<Response>;
export declare function updateStatus({ token, sid }: ITokens, status: number): Promise<NertiviaResponses.UpdateStatus>;
export declare function sendMessage({ token, sid }: ITokens, channelID: string, message: string): Promise<NertiviaResponses.SendMessageResponse>;
export declare function editMessage({ token, sid }: ITokens, messageID: string, channelID: string, newMessage: string): Promise<NertiviaResponses.EditMessageResponse>;
export declare function deleteMessage({ token, sid }: ITokens, messageID: string, channelID: string): Promise<NertiviaResponses.DeleteMessageResponse>;
export declare function openDM({ token, sid }: ITokens, userID: string): Promise<NertiviaResponses.CreateDMResponse>;
export interface IFile {
    name: string;
    data: any;
}
export interface SendFileMessageParams extends IFile {
    message?: string;
}
export declare function sendFileMessage({ token, sid }: ITokens, channelID: string, { message, name, data }: SendFileMessageParams): Promise<NertiviaResponses.SendMessageResponse>;
export interface JoinServerResponse {
    /** the name of the server */
    name: string;
    /** the creator of the server */
    creator: {
        uniqueID: string;
    };
    default_channel_id: string;
    server_id: string;
    /** a timestamp when the server was created */
    created: number;
    /** the icon id of the server */
    avatar: string;
    /** if the server is public or not */
    public: boolean;
}
export declare function joinServerById({ token, sid }: ITokens, serverID: string): Promise<JoinServerResponse>;
export interface LeaveServerResponse {
    status: "Done!" | string;
}
export declare function leaveServer({ token, sid }: ITokens, serverID: string): Promise<LeaveServerResponse>;
export interface AboutMe {
    _id: string;
    name?: string;
    gender?: string;
    age?: string;
    continent?: string;
    country?: string;
    about_me?: string;
}
export interface UserDetails extends NertiviaTypes.Member {
    created: number;
    about_me?: AboutMe;
    badges: NertiviaConstants.BadgeType[];
}
export interface UserDetailsResponse {
    user: UserDetails;
}
export declare function userDetails({ token, sid }: ITokens, userID: string): Promise<UserDetailsResponse>;
export declare function typingPing({ token, sid }: ITokens, channelID: string): void;
//# sourceMappingURL=requests.d.ts.map