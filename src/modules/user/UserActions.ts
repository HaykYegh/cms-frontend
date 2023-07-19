"use strict";

import {actions} from "./UserReducer";

export interface IUserActions {
    type: string;
    payload?: {
        email?: string,
        password?: string,
        rememberMe?: boolean,
        confirmPassword?: string,
        errorMessage?: string,
        reCaptchaToken?: string,
        value?: string,
        history?: any,
        userProfile?: any,
        isSuper?: boolean,
    };
}

export function signInSuccess(): IUserActions {
    return {type: actions.SIGN_IN_SUCCESS};
}

export function attemptLogIn({email, password, rememberMe, reCaptchaToken, history}: any): IUserActions {
    return {type: actions.ATTEMPT_LOG_IN, payload: {email, password, rememberMe, reCaptchaToken, history}};
}

export function attemptSignOut({history}: any): IUserActions {
    return {type: actions.ATTEMPT_SIGN_OUT, payload: {history}};
}

export function clearUserData(): IUserActions {
    return {type: actions.CLEAR_USER_DATA};
}

export function signInError(errorMessage: string): IUserActions {
    return {type: actions.SIGN_IN_ERROR, payload: {errorMessage}};
}

export function attemptGetUserProfile(): IUserActions {
    return {type: actions.ATTEMPT_GET_USER_PROFILE};
}

export function updateUserProfile(userProfile: any): IUserActions {
    return {type: actions.UPDATE_USER_PROFILE, payload: {userProfile}};
}

export function setUserProfile(userProfile: any): IUserActions {
    return {type: actions.SET_USER_PROFILE, payload: {userProfile}};
}

export function setSuperAdmin(isSuper: boolean): IUserActions {
    return {type: actions.SET_SUPER_ADMIN, payload: {isSuper}};
}
