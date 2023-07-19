"use strict";

import {AxiosPromise} from "axios";

import config from "configs/params";
import axios from "helpers/Axios";
import params from "configs/params";

// -------Get requests-------//
export const getUsersList: any = (data: any): AxiosPromise => {
    return axios.get(config.panel.baseUrl + config.panel.api.v2.users.base, {params: data});
};

export const getUser: any = (userId: number): AxiosPromise => {
    return axios.get(`${config.panel.baseUrl}${config.panel.api.v1.users}/${userId}`);
};

export const getNotVerifiedUsers: any = (data: any): AxiosPromise => {
    return axios.get(config.panel.baseUrl + config.panel.api.v2.users.notVerified, {params: data});
};

export const getOnlineUsers: any = (offset: number, limit: number): AxiosPromise => {
    return axios.get(config.panel.baseUrl + config.panel.api.v2.stats.users, {params: {offset, limit}});
};

export const getNotVerifiedUsersCount: any = (data: any): AxiosPromise => {
    return axios.get(config.panel.baseUrl + config.panel.api.v2.users.notVerifiedCount, {params: data});
};

export const getAttempts: any = (username: string, offset: number, limit: number): AxiosPromise => {
    return axios.get(`${config.panel.baseUrl + config.panel.api.v2.users.base}/${username}/attempts`, {params: {offset, limit}});
};

export const getAttemptsCount: any = (username: string, isDailyRequested: boolean): AxiosPromise => {
    return axios.get(`${config.panel.baseUrl + config.panel.api.v2.users.base}/${username}/attempts/count`, {params: {number: username, isDailyRequested}});
};

export const getUsersInCountries: any = (startDate: string, endDate: string, type: string): AxiosPromise => {
    return axios.get(config.panel.baseUrl + config.panel.api.v1.statistics.countries, {params: {startDate, endDate, type}});
};

export const getUsersByCountry: any = (startDate: string, endDate: string, id: number): AxiosPromise => {
    return axios.get(`${config.panel.baseUrl + config.panel.api.v1.statistics.users}/${id}/registrations`, {params: {startDate, endDate}});
};

export const getTotalUsers: any = (): AxiosPromise => {
    return axios.get(config.panel.baseUrl + config.panel.api.v1.statistics.users);
};

export const getUsersCount: any = (data: any): AxiosPromise => {
    return axios.get(config.panel.baseUrl + config.panel.api.v2.users.count, {params: data});
};

export const getSearchedUsers: any = (pattern: string, offset: number = 0): AxiosPromise => {
    return axios.get(`${config.panel.baseUrl + config.panel.api.v2.users.search}`, {params: {offset, q: pattern}});
};

export const getSearchedUsersByEmailOrNickname: any = (pattern: string): AxiosPromise => {
    return axios.get(`${config.panel.baseUrl + config.panel.api.v2.users.searchByEmailOrNickname}`, {params: {q: pattern}});
};

export const getSearchedUsersForInvite: any = (pattern: object, offset: number = 0): AxiosPromise => {
    // @ts-ignore
    return axios.get(`${config.panel.baseUrl + config.panel.api.v1.channelUsersSearch}`, {params: {offset, q: pattern.value, all: pattern.all}});
};

export const getRegisteredUsersByCountry: any = (startDate: string, endDate: string): AxiosPromise => {
    return axios.get(config.panel.baseUrl + config.panel.api.v1.statistics.total, {params: {startDate, endDate}});
};

export const getLiveStatistics: any = (): AxiosPromise => {
    return axios.get(config.panel.baseUrl + config.panel.api.v1.statistics.live);
};

export const getBalance: any = (id: string | number): AxiosPromise => {
    return axios.get(config.panel.baseUrl + config.panel.api.v2.billing.balance, {params: {number: id}});
};

export const isBlocked: any = (username: string | number): AxiosPromise => {
    return axios.get(`${config.panel.baseUrl + config.panel.api.v1.users}/${username}/lock`);
};

export const getDIDNumber: any = (username: string | number): AxiosPromise => {
    return axios.get(`${config.panel.baseUrl + config.panel.api.v1.users}/${username}/did-numbers`);
};

export const getUserGroups: any = (offset: number, limit: number): AxiosPromise => {
    return axios.get(`${config.panel.baseUrl + config.panel.api.v3.userGroups.base}`, {params: {offset, limit}});
};

export const getUserGroup: any = (userId: number, offset: number, limit: number): AxiosPromise => {
    return axios.get(`${config.panel.baseUrl + config.panel.api.v2.users.base}/${userId}/userGroups`, {params: {offset, limit}});
};

export const getUserGroupsCount: any = (): AxiosPromise => {
    return axios.get(`${config.panel.baseUrl + config.panel.api.v3.userGroups.count}`);
};

export const getUserGroupMembers: any = (userGroupId: any, offset: number, limit: number): AxiosPromise => {
    return axios.get(`${config.panel.baseUrl + config.panel.api.v3.userGroups.base}/${userGroupId}/members`, {params: {offset, limit}});
};

export const getUserGroupMembersCount: any = (userGroupId: any): AxiosPromise => {
    return axios.get(`${config.panel.baseUrl + config.panel.api.v3.userGroups.base}/${userGroupId}/members/count`);
};

// -------Post requests-------//

export const blockUser: any = (username: string | number): AxiosPromise => {
    return axios.post(`${config.panel.baseUrl + config.panel.api.v1.users}/${username}/lock`, {});
};

export const createNewUser: any = (data: any): AxiosPromise => {
    return axios.post(`${config.panel.baseUrl + config.panel.api.v2.users.base}`, data);
};

export const updateDIDNumber: any = (username: string | number, DIDNumber: number): AxiosPromise => {
    return axios.post(`${config.panel.baseUrl + config.panel.api.v1.users}/${username}/did-numbers`, {didNumber: DIDNumber});
};

export const createUserGroup: any = (data: any): AxiosPromise => {
    return axios.post(`${config.panel.baseUrl + config.panel.api.v3.userGroups.base}`, data);
};

export const addUserGroupMembers: any = (userGroupId: any, members: string[]): AxiosPromise => {
    return axios.post(`${config.panel.baseUrl + config.panel.api.v3.userGroups.base}/${userGroupId}/members`, {numbers: members});
};

// -------Delete requests-------//
export const unblockUser: any = (username: string | number): AxiosPromise => {
    return axios.delete(`${config.panel.baseUrl + config.panel.api.v1.users}/${username}/lock`);
};

export const deleteUser: any = (id: string | number): AxiosPromise => {
    return axios.delete(`${config.panel.baseUrl + config.panel.api.v1.users}/${id}`);
};

export const deleteDIDNumber: any = (username: string | number): AxiosPromise => {
    return axios.delete(`${config.panel.baseUrl + config.panel.api.v1.users}/${username}/did-numbers`);
};

export const deleteUserGroup: any = (userGroupId: number): AxiosPromise => {
    return axios.delete(`${config.panel.baseUrl + config.panel.api.v3.userGroups.base}/${userGroupId}`);
};

export const deleteUserGroupMember: any = (userGroupId: any, memberId: any): AxiosPromise => {
    return axios.delete(`${config.panel.baseUrl + config.panel.api.v3.userGroups.base}/${userGroupId}/members/${memberId}`);
};

// -------Put requests-------//

export const addBalance: any = (id: string | number, data: any): AxiosPromise => {
    return axios.put(`${config.panel.baseUrl + config.panel.api.v2.billing.balance}/${id}`, data);
};

export const editUserPassword: any = (id: string | number, data: any): AxiosPromise => {
    return axios.put(`${config.panel.baseUrl + config.panel.api.v2.users.base}/${id}`, data);
};

export const updateUserGroup: any = (userGroupId: number, name: string): AxiosPromise => {
    return axios.put(`${config.panel.baseUrl + config.panel.api.v3.userGroups.base}/${userGroupId}`, {name});
};
