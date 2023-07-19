"use strict";

import axios, {AxiosPromise} from "axios";
import params from "configs/params";

export const signIn: any = (email: string, password: string, rememberMe: boolean, reCaptchaToken: string): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v1.authentication.signIn, {
            email,
            password,
            rememberMe,
            reCaptchaToken
        },
        {
            headers: {
                "X-Access-Prefix": process.env.APP_PREFIX
            }
        }
    );
};

export const signUp: any = (data: any): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v1.authentication.signUp, data, {
        headers: {"X-Access-Prefix": process.env.APP_PREFIX}
    });
};

export const resetPassword: any = (data: any, token: string): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v1.authentication.resetPassword + "/" + token, data, {
        headers: {"X-Access-Prefix": process.env.APP_PREFIX}
    });
};

export const checkRecoveryToken: any = (data): AxiosPromise => {
    return axios.get(params.panel.baseUrl + params.panel.api.v1.authentication.resetPassword + "/" + data.token, {
        headers: {"X-Access-Prefix": process.env.APP_PREFIX}
    });
};

export const requestResetPassword: any = (data): AxiosPromise => {
    return axios.post(params.panel.baseUrl + params.panel.api.v1.authentication.requestResetPassword, data, {
        headers: {"X-Access-Prefix": process.env.APP_PREFIX}
    });
};
