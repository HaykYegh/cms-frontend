"use strict";

import {AxiosPromise} from "axios";

import params from "configs/params";
import axios from "helpers/Axios";

export const getCustomers: any = () => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.customers);
};

export const getCustomer: any = (id: string) => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.customers + id);
};

export const editCustomer: any = (id, data): AxiosPromise => {
    return axios.put(params.panel.baseUrl + params.panel.api.v1.customers + id, data);
};

export const createCustomer: any = (data: any) => {
    return axios.post(params.panel.baseUrl + params.panel.api.v1.customers, data);
};

// GET Requests

export const getCustomerList: any = (offset: number, limit: number): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.customers.base, {params: {offset, limit}})
};

export const getCustomerCount: any = () => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.customers.count);
};

// POST Requests

// PUT Requests

// DELETE Requests
