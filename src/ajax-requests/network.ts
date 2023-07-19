"use strict";

import {AxiosPromise} from "axios";

import params from "configs/params";
import axios from "helpers/Axios";

// GET REQUESTS

export const getVirtualNetworks: any = (offset: number, limit: number): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.networks.base, {
        params: {offset, limit}
    });
};

export const getNetwork: any = (networkId: number): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl}${params.panel.api.v2.networks.base}/${networkId}`);
};

export const getNetworkInvitees: any = (networkId: number, offset: number, limit: number): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl}${params.panel.api.v1.networks.base}/${networkId}/invites`, {
        params: {offset, limit}
    });
};

export const getUsersFromNetwork: any = (networkId: number, offset: number, limit: number): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl}${params.panel.api.v2.networks.base}/${networkId}/users`, {
        params: {offset, limit},
    });
};

export const getAdminsOfNetwork: any = (networkId: number, offset: number, limit: number): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl}${params.panel.api.v2.networks.base}/${networkId}/admins`, {
        params: {offset, limit},
    });
};

export const getAdminsCountOfNetwork: any = (networkId: number): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl}${params.panel.api.v2.networks.base}/${networkId}/admins/count`);
};

// POST REQUESTS

export const addNetworkInvitees: any = (networkId: any, data): AxiosPromise => {
    return axios.post(`${params.panel.baseUrl}${params.panel.api.v1.networks.base}/${networkId}/invites`, data);
};

export const createNetwork: any = (data: any): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v2.networks.base, data);
};

export const setNetworkAdministrator: any = (networkId: number, data: any): AxiosPromise => {
    return axios.post(`${params.panel.baseUrl}${params.panel.api.v2.networks.base}/${networkId}/admins`, data);
};

// PUT REQUESTS

export const updateNetwork: any = (networkId: number, data: any): AxiosPromise => {
    return axios.put(`${params.panel.baseUrl}${params.panel.api.v2.networks.base}/${networkId}`, data);
};

// DELETE REQUESTS

export const deleteUserFromNetwork: any = (networkId: number, userId: number): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl + params.panel.api.v2.networks.base}/${networkId}/users/${userId}`);
};

export const deleteNetworkInvitee: any = (networkId: number, networkInviteId: number): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl}${params.panel.api.v1.networks.base}/${networkId}/invites/${networkInviteId}`);
};

export const deleteNetwork: any = (networkId: number): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl}${params.panel.api.v2.networks.base}/${networkId}`)
};
