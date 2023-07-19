"use strict";

import {AxiosPromise} from "axios";

import {IProvider} from "services/interface";
import params from "configs/params";
import axios from "helpers/Axios";

// GET Requests

export const getProvidersList: any = (offset: number, limit: number, providerType: string = null): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.providers.base, {params: {offset, limit, providerType}})
};

export const getProvider: any = (providerId: string): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl + params.panel.api.v2.providers.base}/${providerId}`)
};

export const getProviderTypes: any = (offset: number, limit: number): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.providers.types, {params: {offset, limit}})
};

export const getProviderTypeCount: any = (providerType: string = null): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.providers.typeCount, {params: {providerType}})
};

export const getProviderCount: any = (providerType: string = null): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v2.providers.count, {params: {providerType}})
};

export const getAttachedCountries: any = (providerId: number, offset: number, limit: number): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl + params.panel.api.v2.providers.base}/${providerId}/countries`, {params: {offset, limit}})
};

export const getAttachedCountriesCount: any = (providerId: number): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl + params.panel.api.v2.providers.base}/${providerId}/countries/count`)
};

export const getCountryList: any = (): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v3.providers.countries)
};

export const getCountryProviders: any = (countryId: number): AxiosPromise => {
    return axios.get(`${params.panel.baseUrl + params.panel.api.v3.providers.countries}/${countryId}`)
};

// POST Requests

export const createProvider: any = (data: any): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v2.providers.base, data)
};

export const addAttachedCountry: any = (providerId: number, countryId: number): AxiosPromise => {
    return axios.post(`${params.panel.baseUrl + params.panel.api.v2.providers.base}/${providerId}/countries`, {countryId});
};

export const setProviders: any = (countryProviderIds: any[]): AxiosPromise => {
    return axios.post(`${params.panel.baseUrl + params.panel.api.v3.providers.countries}`, {countryProviderIds});
};

// PUT Requests

export const updateProvider: any = (providerId: number, data: IProvider): AxiosPromise => {
    return axios.put(`${params.panel.baseUrl + params.panel.api.v2.providers.base}/${providerId}`, data);
};

// DELETE Requests

export const deleteProvider: any = (providerId: number): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl + params.panel.api.v2.providers.base}/${providerId}`);
};

export const deleteAttachedCountry: any = (providerId: number, countryId: number): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl + params.panel.api.v2.providers.base}/${providerId}/countries/${countryId}`);
};

export const deleteAttachedProvider: any = (countryProviderId: number): AxiosPromise => {
    return axios.delete(`${params.panel.baseUrl + params.panel.api.v3.providers.countries}/${countryProviderId}`);
};
