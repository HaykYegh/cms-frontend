"use strict";

import {AxiosPromise} from "axios";

import params from "configs/params";
import axios from "helpers/Axios";

// Get chat bot list by offset and limit
export const getChatBots: any = (offset: number, limit: number): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.chatBots.base, {params: {offset, limit}});
};

// Get chat bot info by update
export const getChatBot: any = (chatBotId: string | number): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.chatBots.base + "/" + chatBotId);
};

// Create chat bot
export const createChatBot: any = (data: any): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v2.chatBots.base, data);
};

export const uploadChatBotAvatar: any = (chatBotId: string | number, data: any): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v2.chatBots.base + "/" + chatBotId + "/avatar", data);
};

// Index chat bot description & name
export const updateChatBot: any = (chatBotId: string | number, data: any): AxiosPromise => {
    return axios.put(params.panel.baseUrl + params.panel.api.v2.chatBots.base + "/" + chatBotId, data);
};

export const deleteChatBot: any = (chatBotId: string | number): AxiosPromise => {
    return axios.delete(params.panel.baseUrl + params.panel.api.v2.chatBots.base + "/" + chatBotId);
};

// Get chat bot credentials
export const getChatBotCredentials: any = (chatBotId: number, offset: number, limit: number): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.chatBots.base + "/" + chatBotId + "/credentials", {
        params: {offset, limit}
    });
};

// Generate chat bot by credential
export const createChatBotCredential: any = (chatBotId: number): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v2.chatBots.base + "/" + chatBotId + "/credentials", {});
};

// Delete chat bot credential
export const deleteChatBotCredential: any = (chatBotId: number, chatBotCredentialId): AxiosPromise => {
    return axios.delete(params.panel.baseUrl + params.panel.api.v2.chatBots.base + "/" + chatBotId + "/credentials/" + chatBotCredentialId);
};
