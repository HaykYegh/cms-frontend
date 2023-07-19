"use strict";

import {AxiosPromise} from "axios";

import params from "configs/params";
import axios from "helpers/Axios";

export const getTemplates: any = (): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.templates);
};

export const getTemplate: any = (id: string): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.templates + id);
};

export const editTemplates: any = (id: string, data: any): AxiosPromise => {
    return axios.put(params.panel.baseUrl + params.panel.api.v1.templates + id, data);
};

export const setTemplates: any = (data: any): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v1.templates, data);
};
