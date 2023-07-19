"use strict";

import {AxiosPromise} from "axios";

import params from "configs/params";
import axios from "helpers/Axios";

export const getDevicesList: any = (offset = 0, userId?: string): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.devices, {params: {offset, userId}});
};
