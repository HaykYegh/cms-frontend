"use strict";

import {AxiosPromise} from "axios";

import axios from "helpers/Axios";
import config from "configs/params";

// GET REQUESTS

export const getReleases: any = (offset: number, limit: number): AxiosPromise => {
    return axios.get(config.panel.baseUrl + config.panel.api.v3.appReleases.base, {
        params: {offset, limit}
    });
};

export const getRelease: any = (appReleaseId: number): AxiosPromise => {
    return axios.get(`${config.panel.baseUrl + config.panel.api.v3.appReleases.base}/${appReleaseId}`);
};

export const getReleaseNote: any = (appReleaseId: number, langId: number): AxiosPromise => {
    return axios.get(`${config.panel.baseUrl + config.panel.api.v3.appReleases.base}/${appReleaseId}/languages`, {
        params: {langId}
    });
};

export const getReleasesCount: any = (): AxiosPromise => {
    return axios.get(config.panel.baseUrl + config.panel.api.v3.appReleases.count);
};

// POST REQUESTS

export const createRelease: any = (platformId: number, version: string): AxiosPromise => {
    return axios.post(config.panel.baseUrl + config.panel.api.v3.appReleases.base, {platformId, version});
};

export const createReleaseNote: any = (appReleaseId: number, langId: number, description: string): AxiosPromise => {
    return axios.post(`${config.panel.baseUrl + config.panel.api.v3.appReleases.base}/${appReleaseId}/languages`, {langId, description});
};

export const publishUpdate: any = (appReleaseId: number): AxiosPromise => {
    return axios.post(`${config.panel.baseUrl + config.panel.api.v3.appReleases.base}/${appReleaseId}/broadcast`);
};


// PUT REQUESTS

export const updateReleaseVersion: any = (platformId: string, version: string, appReleaseId: number): AxiosPromise => {
    return axios.put(`${config.panel.baseUrl + config.panel.api.v3.appReleases.base}/${appReleaseId}`, {platformId, version});
};

// DELETE REQUESTS

export const deleteRelease: any = (appReleaseId: number): AxiosPromise => {
    return axios.delete(`${config.panel.baseUrl + config.panel.api.v3.appReleases.base}/${appReleaseId}`);
};
