"use strict";

import {AxiosPromise} from "axios";

import axios from "helpers/Axios";
import params from "configs/params";

export const setAdministrator: any = (data: any): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v1.administrators, data);
};

export const getAdministrators: any = (): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.administrators);
};

export const changeAdministratorPassword: any = (adminId: number, password: string, confirmPassword: string): AxiosPromise => {
    return axios.post(`${params.panel.baseUrl + params.panel.api.v2.administrators}/${adminId}/password`, {password, confirmPassword});
};

export const deleteAdministrator: any = (adminId: number): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl + params.panel.api.v2.administrators}/${adminId}`);
};
