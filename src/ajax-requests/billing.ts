"use strict";

import {AxiosPromise} from "axios";

import axios from "helpers/Axios";
import params from "configs/params";

export const getCreditCards: any = (offset: number, limit: number): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.payments.cards, {
        params: {offset, limit}
    })
};

export const getPaymentConfig: any = (): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.payments.base)
};

export const addCreditCard: any = (data: any): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v2.payments.cards, data)
};

export const removeCreditCard: any = (cardId: number): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl + params.panel.api.v2.payments.cards}/${cardId}`)
};

export const setDefaultCreditCard: any = (cardId: number): AxiosPromise => {
    return axios.post(`${params.panel.baseUrl + params.panel.api.v2.payments.cards}/${cardId}/default`, {})
};
