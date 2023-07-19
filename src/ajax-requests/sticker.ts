"use strict";

import {AxiosPromise} from "axios";

import params from "configs/params";
import axios from "helpers/Axios";

export const getStickersCategories: any = (): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.stickers.categories);
};

export const getStickersStatuses: any = (): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.stickers.statuses);
};

export const getStickers: any = (offset: number): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.stickers.base, {params: {offset}})
};

export const createStickerPackage: any = (data: any): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v1.stickers.base, data);
};

export const deleteStickerPackage: any = (id: number): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}`);
};

export const getDescription: any = (id: number): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}`)
};

export const updateDescription: any = (id: number, data: any): AxiosPromise => {
    return axios.put(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}`, data);
};

export const uploadIcons: any = (id: number, data: any): AxiosPromise => {
    return axios.post(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/upload`, data);
};

export const getUploadedIcons: any = (id: number): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/upload`);
};

export const getLanguages: any = (id: number): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/0/languages`);
};

export const addLanguage: any = (id: number, languageId: number, data: any): AxiosPromise => {
    return axios.post(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/${languageId}/languages`, data);
};

export const updateLanguage: any = (id: number, languageId: number, data: any): AxiosPromise => {
    return axios.put(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/${languageId}/languages`, data);
};

export const deleteLanguage: any = (id: number, languageId: number): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/${languageId}/languages`);
};

export const getCountries: any = (id: number): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/countries`);
};

export const addCountry: any = (id: number, data: any): AxiosPromise => {
    return axios.post(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/countries`, data);
};

export const deleteCountry: any = (id: number, countryId: number): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/countries/${countryId}`);
};

export const getCategories: any = (id: number): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/categories`);
};

export const addCategories: any = (id: number, data: number[]): AxiosPromise => {
    return axios.post(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/categories`, data);
};

export const deleteCategory: any = (id: number, categoryId: number): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/categories/${categoryId}`);
};

export const getPlatforms: any = (id: number): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/platforms`);
};

export const addPlatforms: any = (id: number, data: number[]): AxiosPromise => {
    return axios.post(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/platforms`, data);
};

export const deletePlatform: any = (id: number, platformId: number): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/platforms/${platformId}`);
};

export const getStatus: any = (id: number): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/statuses`);
};

export const addStatus: any = (id: number, data: number[]): AxiosPromise => {
    return axios.post(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/statuses`, data);
};

export const buildStickerPackage: any = (id: number): AxiosPromise => {
    return axios.post(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/build`, {});
};

export const publishStickerPackage: any = (id: number): AxiosPromise => {
    return axios.post(`${params.panel.baseUrl + params.panel.api.v1.stickers.base}/${id}/publish`, {});
};
