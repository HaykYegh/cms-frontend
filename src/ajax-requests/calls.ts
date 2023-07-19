"use strict";

import {AxiosPromise} from "axios";

import params from "configs/params";
import axios from "helpers/Axios";

// GET REQUESTS
export const getOutCalls: any = (data: any): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl}${params.panel.api.v3.calls.base}`, {params: data});
};

export const getOutCallsCount: any = (data: any): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl}${params.panel.api.v3.calls.count}`, {params: data});
};
