"use strict";

import {AxiosPromise} from "axios";

import axios from "helpers/Axios";
import params from "configs/params";

// GET REQUESTS
export const getAttemptsList: any = (offset = 0, username?: string): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.attempts, {
        params: {offset, username}
    });
};

export const getPinCode: any = (username: string): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl + params.panel.api.v2.attempts.base}/${username}/pin`, {
        params: {username}
    });
};

// POST REQUESTS

export const sendSms: any = (providerId: number, data: any): AxiosPromise => {
    return axios.post(`${params.panel.baseUrl + params.panel.api.v2.providers.base}/${providerId}/transmit`, data);
};

// PUT REQUESTS

// DELETE REQUESTS
export const resetAttempts: any = (username: string, resetType: string): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl + params.panel.api.v2.attempts.base}/${username}/attempts`, {params: {resetType}});
};
