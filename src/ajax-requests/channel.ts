"use strict";

import {AxiosPromise} from "axios";

import params from "configs/params";
import axios from "helpers/Axios";

// GET REQUESTS

export const getChannels: any = ({offset, limit, startDate, endDate, channelName, paid}): AxiosPromise => {
  return axios.get(params.panel.baseUrl + params.panel.api.v2.channels.base, {
    params: {offset, limit, startDate, endDate, channelName, paid}
  });
};

export const getSearchChannels: any = (value: string): AxiosPromise => {
  return axios.get(`${params.panel.baseUrl}${params.panel.api.v2.channels.search}/${value}`);
};

export const getChannel: any = (channelRoom: string, offset, limit): AxiosPromise => {
  return axios.get(`${params.panel.baseUrl}${params.panel.api.v2.channels.base}/${channelRoom}`, {
    params: {offset, limit}
  });
};

export const editChannelVerifiedAndSensitive: any = (channelRoom: string, isVerified?: string, isSensitive?: boolean): AxiosPromise => {
  return axios.post(`${params.panel.baseUrl}${params.panel.api.v2.channels.base}/${channelRoom}`, {
    isVerified, isSensitive
  });
};

export const deleteChannel: any = (channelRoom: string): AxiosPromise => {
  return axios.delete(`${params.panel.baseUrl}${params.panel.api.v2.channels.base}/${channelRoom}`)
};

export const setChannelAdministrator: any = (channelRoom: string, data: any): AxiosPromise => {
  return axios.post(`${params.panel.baseUrl}${params.panel.api.v2.channels.base}/${channelRoom}/admins`, data);
};

export const getAdminsOfChannel: any = (channelRoom: string, offset: number, limit: number): AxiosPromise => {
  return axios.get(`${params.panel.baseUrl}${params.panel.api.v2.channels.base}/${channelRoom}/admins`, {
    params: {offset, limit},
  });
};

export const getAdminsCountOfChannel: any = (channelRoom: number): AxiosPromise => {
  return axios.get(`${params.panel.baseUrl}${params.panel.api.v2.channels.base}/${channelRoom}/admins/count`);
};

export const addChannelInvities: any = (channelId: any, data): AxiosPromise => {
  return axios.post(`${params.panel.baseUrl}${params.panel.api.v1.channels.base}/${channelId}/invites`, data);
};

export const getChannelPayments: any = (data: any): AxiosPromise => {
  return axios.get(params.panel.baseUrl + params.panel.api.v2.billing.channelTransactions, {
    params: {...data}
  });
};

export const getChannelPaymentsTotal: any = (data: any): AxiosPromise => {
  return axios.get(params.panel.baseUrl + params.panel.api.v2.billing.channelTransactionsTotal, {
    params: {...data}
  });
};
