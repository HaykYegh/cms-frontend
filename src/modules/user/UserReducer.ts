"use strict";

import {IUserActions} from "./UserActions";
import {fromJS, Map} from "immutable";

interface IUserReducerActions {
    ATTEMPT_LOG_IN: string;
    ATTEMPT_SIGN_OUT: string;
    ATTEMPT_GET_USER_PROFILE: string;
    UPDATE_USER_PROFILE: string;
    SET_USER_PROFILE: string,
    SIGN_IN_SUCCESS: string;
    CLEAR_USER_DATA: string;
    SIGN_IN_ERROR: string;
    SET_SUPER_ADMIN: string;
}

export const actions: IUserReducerActions = {
    ATTEMPT_SIGN_OUT: "USER:ATTEMPT_SIGN_OUT",
    ATTEMPT_LOG_IN: "USER:ATTEMPT_LOG_IN",
    UPDATE_USER_PROFILE: "USER:UPDATE_USER_PROFILE",
    ATTEMPT_GET_USER_PROFILE: "USER:ATTEMPT_GET_USER_PROFILE",
    SET_USER_PROFILE: "USER:SET_USER_PROFILE",
    SIGN_IN_SUCCESS: "USER:SIGN_IN_SUCCESS",
    CLEAR_USER_DATA: "USER:CLEAR_USER_DATA",
    SIGN_IN_ERROR: "USER:SIGN_IN_ERROR",
    SET_SUPER_ADMIN: "USER:SET_SUPER_ADMIN",
};

export interface IUserData {
    errorMessage: string;
    successMessage: string;
    userProfile: any;
}

export const defaultState: IUserData = {
    errorMessage: "",
    successMessage: "",
    userProfile: {},
};

export default (state: IUserData = defaultState, {type, payload}: IUserActions): IUserData => {
    switch (type) {
        case actions.SIGN_IN_SUCCESS:
            return {...state, successMessage: "successfully signed up"};
        case actions.SIGN_IN_ERROR:
            return {...state, errorMessage: payload.errorMessage};
        case actions.CLEAR_USER_DATA:
            return defaultState;
        case actions.SET_USER_PROFILE:
            return {...state, userProfile: payload.userProfile};
        case actions.UPDATE_USER_PROFILE:
            return {...state, userProfile: {...state.userProfile, attributes: payload.userProfile}};
        case actions.SET_SUPER_ADMIN:
            return {...state, userProfile: {...state.userProfile, isSuper: payload.isSuper}};
        default:
            return state;
    }
};
