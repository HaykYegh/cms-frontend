"use strict";

import {call, put, takeLatest} from "redux-saga/effects";

import {signInSuccess, clearUserData, signInError, setUserProfile, setSuperAdmin} from "./UserActions";
import {ACCESS_HEADERS, LOGGED_ROUTER_REDIRECT} from "configs/constants";
import {eraseCookie, setCookie} from "helpers/CookieHelper";
import {encrypt, removeUserData} from "helpers/DataHelper";
import {getUserProfile} from "ajaxRequests/profile";
import {signIn} from "ajaxRequests/authentication";
import {actions} from "./UserReducer";

function* attemptLogIn({payload: {email, password, rememberMe, reCaptchaToken, history}}: any): any {
    try {
        yield put(signInError(""));

        const result: any = yield call(signIn, email, password, rememberMe, reCaptchaToken);

        if (!result.data.err) {

            const isSuper: boolean = !!result.data.result.isSuper;
            yield put(setSuperAdmin(isSuper));

            const companyName: string = result.data.result.customer.name || "";

            const accessHeaders: string = JSON.stringify({
                "X-Access-Id": result.headers["x-access-id"],
                "X-Access-Token": result.headers["x-access-token"],
                "X-Access-Prefix": result.headers["x-access-prefix"],
            });

            yield call(setCookie, ACCESS_HEADERS, encrypt(accessHeaders), (rememberMe) ? 30 * 24 : 1);

            const currency: string = result.data.result.customer.currency || "USD";
            const user: string = encrypt(JSON.stringify({email: result.data.result.email, companyName, currency}));
            localStorage.setItem("user", user);

            const showGettingStarted: string = localStorage.getItem("showGettingStarted");

            if (!showGettingStarted || showGettingStarted === "show") {
                localStorage.setItem("showGettingStarted", "show");
            }

            yield put(signInSuccess());
            history.push(LOGGED_ROUTER_REDIRECT);

        } else {
            let errorMessage: string = "";
            if (result.data.err_msg === "INVALID_ADMIN") {
                errorMessage = "Sorry, your username and/or password are incorrect - please try again.";
            } else if (result.data.err_msg === "RECAPTCHA_ERROR" || "INVALID_RECAPTCHA_TOKEN") {
                errorMessage = "Recaptcha error";
            } else {
                errorMessage = "Unknown error";
            }
            yield put(signInError(errorMessage));
        }
    } catch (error) {
        let errorMessage: string = "";
        if (error.response.data.err_msg === "INVALID_ADMIN" || "FORBIDDEN") {
            errorMessage = "Sorry, your username and/or password are incorrect - please try again.";
        } else if (error.response.data.err_msg === "RECAPTCHA_ERROR" || "INVALID_RECAPTCHA_TOKEN") {
            errorMessage = "Recaptcha error";
        } else {
            errorMessage = "Network error";
        }
        yield put(signInError(errorMessage));
    }
}

function* attemptSignOut({payload: {history}}: any): any {
    try {
        yield call(eraseCookie, ACCESS_HEADERS);
        yield call(removeUserData, ["user", "userAttributes"]);
        const clearData: any = yield call(clearUserData);
        yield put(clearData)
        history.push("/login");
    } catch (err) {
        console.log(err)
    }
}

function* attemptGetUserProfile(): any {
    try {
        const {data}: any = yield call(getUserProfile);

        if (data.err) {
            throw new Error(JSON.stringify(data));
        }

        yield put(setUserProfile(data.result || {}));

    } catch (err) {
        console.log(err);
    }
}

function* userSaga(): any {
    yield takeLatest(actions.ATTEMPT_SIGN_OUT, attemptSignOut);
    yield takeLatest(actions.ATTEMPT_LOG_IN, attemptLogIn);
    yield takeLatest(actions.ATTEMPT_GET_USER_PROFILE, attemptGetUserProfile);
}

export default userSaga;
