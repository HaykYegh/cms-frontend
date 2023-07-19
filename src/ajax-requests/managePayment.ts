"use strict";

import {AxiosPromise} from "axios";

import params from "configs/params";
import axios from "helpers/Axios";

export const getGroupTiers: any = (tierGroupId: number): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl}${params.panel.api.v2.payments.tierGroups}/${tierGroupId}/tiers`)
};

export const addTierInGroup: any = (tierGroupId: number, data: any): AxiosPromise => {
    return axios.post(`${params.panel.baseUrl}${params.panel.api.v2.payments.tierGroups}/${tierGroupId}/tiers`, data)
};

export const deleteTierInGroup: any = (tierGroupId: number, tierId: number): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl}${params.panel.api.v2.payments.tierGroups}/${tierGroupId}/tiers/${tierId}`)
};

export const updateTierInGroup: any = (tierGroupId: number, tierId: number, data: any): AxiosPromise => {
    return axios.put(`${params.panel.baseUrl}${params.panel.api.v2.payments.tierGroups}/${tierGroupId}/tiers/${tierId}`, data)
};

export const getTierGroups: any = (offset: number, limit: number): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.payments.tierGroups, {params: {offset, limit}})
};

export const createTierGroup: any = (data: any): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v2.payments.tierGroups, data)
};

export const deleteTierGroup: any = (id: number): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl}${params.panel.api.v2.payments.tierGroups}/${id}`)
};

export const updateTierGroup: any = (id: number, data: any): AxiosPromise => {
    return axios.put(`${params.panel.baseUrl}${params.panel.api.v2.payments.tierGroups}/${id}`, data)
};

export const getTierGroup: any = (id: number): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl}${params.panel.api.v2.payments.tierGroups}/${id}`)
};
