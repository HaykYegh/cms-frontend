"use strict";

import {AxiosPromise} from "axios";

import params from "configs/params";
import axios from "helpers/Axios";

// GET REQUESTS
export const getMetrics: any = (startDate: string, endDate: string, metricType: string, metricContextType: string): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.metrics.base, {
        params: {startDate, endDate, metricType, metricContextType}
    });
};

export const getUsersInDate: any = (startDate: string, endDate: string): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.statistics.usersInDate, {
        params: {startDate, endDate}
    });
};

export const getMessagesByCounties: any = ({startDate, endDate}): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.stats.messagesByCounties, {
        params: {startDate, endDate}
    });
};

export const getMessagesByTypes: any = ({startDate, endDate, metricTypeId, regionCode}): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.stats.messagesByTypes, {
        params: {startDate, endDate, metricTypeId, regionCode}
    });
};

export const getMessagesCountByTypes: any = ({startDate, endDate, regionCode}): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.stats.messagesCountByTypes, {
        params: {startDate, endDate, regionCode}
    });
};

export const getMessagesTimeline: any = ({startDate, endDate, regionCode}): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.stats.timeline, {
        params: {startDate, endDate, regionCode}
    });
};

export const getCallsMetricTypes: any = (): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.stats.callsMetricTypes);
};

export const getCallsByCounties: any = ({startDate, endDate, metricTypeId}): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.stats.callsByCounties, {params: {startDate, endDate, metricTypeId}});
};

export const getCallsByTypes: any = ({startDate, endDate, regionCode}): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.stats.callsByTypes, {params: {startDate, endDate, regionCode}});
};

export const getUsersByCountries: any = ({startDate, endDate}): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.stats.usersByCountries, {
        params: {startDate, endDate}
    });
};

export const getUsersOverview: any = ({startDate, endDate, regionCode}): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.stats.usersOverview, {
        params: {startDate, endDate, regionCode}
    });
};

export const getUsersTimeline: any = ({startDate, endDate, regionCode}): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.stats.usersTimeline, {
        params: {startDate, endDate, regionCode}
    });
};

export const getActiveUsers: any = ({startDate, endDate, offset, limit, networkId}): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.stats.presence, {
        params: {startDate, endDate, offset, limit, networkId}
    });
};

export const getActiveUsersCount: any = ({startDate, endDate, networkId}): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.stats.presenceCount, {
        params: {startDate, endDate, networkId}
    });
};

// POST REQUESTS

// PUT REQUESTS

// DELETE REQUESTS
