"use strict";

import {AxiosPromise} from "axios";

import params from "configs/params";
import axios from "helpers/Axios";

export const editAttribute: any = (data): AxiosPromise => {
    return axios.put(params.panel.baseUrl + params.panel.api.v1.profile.base, data);
};

export const editPassword: any = (data): AxiosPromise => {
    return axios.put(params.panel.baseUrl + params.panel.api.v1.profile.editPassword, data);
};

// -------GET REQUESTS-------//
export const getUserProfile: any = (): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.profile.attributes);
};

// -------POST REQUESTS-------//
export const updateProfile: any = (data: any): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v2.profile.attributes, data);
};

export const changePassword: any = (data): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v2.profile.password, data);
};

// -------DELETE REQUESTS-------//

// -------PUT REQUESTS-------//
