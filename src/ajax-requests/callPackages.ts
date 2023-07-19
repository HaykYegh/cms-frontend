"use strict";

import {AxiosPromise} from "axios";

import {ICallPackage} from "services/interface";
import params from "configs/params";
import axios from "helpers/Axios";

export const getCallPackages: any = (offset: number = 0): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.callPackages, {
        params: {offset}
    });
};

export const getCallPackage: any = (id: string): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl + params.panel.api.v2.callPackages}/${id}`, {}
    )
};

export const createCallPackage: any = (data: ICallPackage): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v2.callPackages, data, {});
};

export const updateCallPackage: any = (id: number, data: ICallPackage): AxiosPromise => {
    return axios.put(`${params.panel.baseUrl + params.panel.api.v2.callPackages}/${id}`, data);
};

export const deleteCallPackage: any = (id: number): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl + params.panel.api.v2.callPackages}/${id}`);
};
