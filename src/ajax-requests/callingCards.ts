"use strict";

import {AxiosPromise} from "axios";

import axios from "helpers/Axios";
import params from "configs/params";

export const getCallingCards: any = (offset: number, limit: number) => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.chargingCards, {
        params: {offset, limit}
    });
};
export const createCallingCard: any = (data: any): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v2.chargingCards, data);
};
