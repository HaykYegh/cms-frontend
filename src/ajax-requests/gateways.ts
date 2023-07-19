"use strict";

import {AxiosPromise} from "axios";

import params from "configs/params";
import axios from "helpers/Axios";

export const getGateways: any = (offset: number, limit: number, network: null, userGroupId: any = null): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v3.gateways.base, {
        params: {offset, limit, network, userGroupId}
    });
};

export const getGateway: any = (id: string, network: any = null, userGroupId: string = null): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v3.gateways.base + "/" + id, {params: {network, userGroupId}});
};

export const createGateway: any = (data: any): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v3.gateways.base, data);
};

export const editGateway: any = (id: number, data: any): AxiosPromise => {
    return axios.put(params.panel.baseUrl + params.panel.api.v3.gateways.base + "/" + id, data);
};

export const deleteGateway: any = (id: number): AxiosPromise => {
    return axios.delete(params.panel.baseUrl + params.panel.api.v3.gateways.base + "/" + id);
};

export const cacheCallPrice: any = (id: number, data: any): AxiosPromise => {
    return axios.put(params.panel.baseUrl + params.panel.api.v1.gateways.base + "/" + id + "/call-prices/cache", data);
};

export const uploadPriceList: any = (id: number, data: File): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v1.gateways.base + "/" + id + "/call-prices", data);
};

export const settingsConnection: any = (data: any): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v3.gateways.health, {params: data});
};
