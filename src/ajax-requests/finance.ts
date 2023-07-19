"use strict";

import {AxiosPromise} from "axios";

import config from "configs/params";
import axios from "helpers/Axios";

export const getFinanceSales: any = (data: any): AxiosPromise => {
    return axios.get(config.panel.baseUrl + config.panel.api.v2.billing.transactions, {
        params: {...data}
    });
};

export const getFinanceSalesTotal: any = (data: any): AxiosPromise => {
    return axios.get(config.panel.baseUrl + config.panel.api.v2.billing.transactionsTotal, {
        params: {...data}
    });
};

export const getFinanceMethods: any = (): AxiosPromise => {
    return axios.get(config.panel.baseUrl + config.panel.api.v2.billing.methods);
};

export const getSaleCount: any = (data: any): AxiosPromise => {
    return axios.get(config.panel.baseUrl + config.panel.api.v2.billing.count, {
        params: data
    });
};

export const getSalesBalance: any = (startDate: string, endDate: string, method: string): AxiosPromise => {
    return axios.get(config.panel.baseUrl + config.panel.api.v2.billing.balance, {
        params: {startDate, endDate, method}
    });
};
