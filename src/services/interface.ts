"use strict";

import {Map} from "immutable";

export interface IUser extends Map<string, any> {
    user_country_id: number,
    created_at: string,
    first_name: string,
    last_name: string,
    username: string,
    country: string,
    user_id: number,
    verification?: {
        verifyCode: string,
        date: number,
        username?: string,
    }
}

export interface IDevice extends Map<string, any> {
    device_access_token: string,
    platform_version: string,
    user_device_id: number,
    device_token: string,
    last_sign_in: string,
    app_version: string,
    device_name: string,
    platform: string,
    language: string,
    user_id: number,
}

export interface IAttempt extends Map<string, any> {
    last_attempt_at: string,
    user_attempt_id: number,
    username: string,
    country: string,
}

export interface ISelect {
    label: string,
    value: number | string,
}

export interface IProviderAttribute {
    attribute_id: number,
    value: string,
    label: string,
}

export interface IProvider {
    providerId?: number,
    label: string,
    active: boolean,
    orderNumber: number,
    configs: Array<IProviderAttribute>
}

export interface ICallPackage {
    name?: string,
    cost: number | string,
    countryCodes: string[],
    created_at?: string,
    id?: number,
    days: number | string,
    minutes: number | string,
    active?: boolean,
    isTop?: boolean,
}

export interface IVALIDATION {
    value: string | null,
    message: string,
}

export interface IStickerPackage {
    packageId: number | string,
    packageNumber: number | string,
    icons: {
        avatar: File,
        icon: File,
        unavailable_icon: File,
        banner: File,
    },
    stickers: Array<any>,
    preview: File,
    isLoaded?: boolean,
    seatedStickers?: any,
    blocksCount?: number,
}
