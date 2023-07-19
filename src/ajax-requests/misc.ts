"use strict";

import {AxiosPromise} from "axios";

import params from "configs/params";
import axios from "helpers/Axios";

export const getCountries: any = (): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.misc.countries);
};

export const getLanguages: any = (): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.misc.languages);
};

export const getPlatforms: any = (): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.misc.platforms);
};

export const getBillingCountries: any = (): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.misc.billingCountries);
};
