"use strict";

import {AxiosPromise} from "axios";

import params from "configs/params";
import axios from "helpers/Axios";

// GET REQUESTS

export const attributes: any = (): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.notifications.attributes)
};

export const checkUsersCount: any = (countryIDs: string, platformIDs: string, startsWith: string = ""): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.notifications.users.count, {
        params: {
            countries: countryIDs,
            platforms: platformIDs,
            startsWith
        }
    })
};

export const checkNicknameUsersCount: any = (countryIDs: string, platformIDs: string, startsWith: string = ""): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.notifications.users.count, {
        params: {
            countries: countryIDs,
            platforms: platformIDs,
            startsWithNickname: startsWith
        }
    })
};

export const getSystemMessages: any = (offset: number): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.systemMessages.base, {params: {offset}});
};

export const getSystemMessage: any = (id: number): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl + params.panel.api.v2.systemMessages.base}/${id}`);
};

export const getSendersList: any = (offset: number, limit: number): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.notifications.senders, {
        params: {offset, limit}
    })
};

export const getSendersCount: any = (): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.notifications.count)
};

export const getSpecificSender: any = (senderId: string): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl + params.panel.api.v2.notifications.senders}/${senderId}`)
};

export const getSenderImages: any = (senderId: string): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl + params.panel.api.v2.notifications.senders}/${senderId}/images`)
};

// POST REQUESTS

export const notificationSend: any = (countryIDs: string, platformIDs: string, startsWith: string, senderId: number, notification: any): any => {
    return axios.post(params.panel.baseUrl + params.panel.api.v1.notifications.users.base, {
        message: notification.message,
        senderId
    }, {
        params: {
            countries: countryIDs,
            platforms: platformIDs,
            startsWith
        }
    });
};

export const notificationSendNicknameUsers: any = (countryIDs: string, platformIDs: string, startsWith: string, senderId: number, notification: any): any => {
    return axios.post(params.panel.baseUrl + params.panel.api.v1.notifications.users.base, {
        message: notification.message,
        senderId
    }, {
        params: {
            countries: countryIDs,
            platforms: platformIDs,
            startsWidthNickname: startsWith
        }
    });
};

export const notificationSendUsers: any = ({message, numbers, emails, senderId}): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v1.notifications.users.numbers, {message, numbers, emails, senderId});
};

export const sendNotificationToUserGroups: any = ({message, userGroupId, senderId}): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v2.notifications.userGroups, {message, userGroupId, senderId});
};

export const createSystemMessage: any = (title: string, content: string, statusId: number): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v2.systemMessages.base, {title, content, statusId});
};

export const updateSystemMessage: any = (id: number, title: string, content: string, statusId: number): AxiosPromise => {
    return axios.post(`${params.panel.baseUrl + params.panel.api.v2.systemMessages.base}/${id}`, {
        title, content, statusId
    });
};

export const createSender: any = (data: any): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v2.notifications.senders, {
        label: data.label,
        number: data.number,
        isVerified: data.isVerified
    })
};

export const deleteSender: any = (senderId: string): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl}${params.panel.api.v2.notifications.senders}/${senderId}`)
};

export const uploadSenderImage: any = (senderId: string, data: any): AxiosPromise => {
    return axios.post(`${params.panel.baseUrl + params.panel.api.v2.notifications.senders}/${senderId}/images`, data)
};

// PUT REQUESTS

export const updateSender: any = (data: any): AxiosPromise => {
    return axios.put(`${params.panel.baseUrl + params.panel.api.v2.notifications.senders}/${data.messageSenderId}`, {
        label: data.label,
        number: data.number,
        isVerified: data.isVerified,
    })
};

// DELETE REQUESTS

export const deleteSystemMessage: any = (id: number): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl + params.panel.api.v2.systemMessages.base}/${id}`);
};
