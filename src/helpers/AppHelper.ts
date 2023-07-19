"use strict";

import {Store} from "redux";

import {appReducer, appSaga} from "services/index";
import {ACCESS_HEADERS} from "configs/constants";
import storeCreator from "helpers/StoreHelper";
import {getCookie} from "helpers/CookieHelper";
import {decrypt} from "helpers/DataHelper";

export interface IAppConfigurations {
    store: Store<any>;
}

export function getAppConfigurations(): IAppConfigurations {
    let store: Store<any>;
    storeCreator.setParams(appReducer, appSaga);
    store = storeCreator.getStore();

    return {store};
}

export function getAccessHeaders(): any {

    const cookie: string = getCookie(ACCESS_HEADERS);

    if (cookie) {
        const accessHeaders: any = JSON.parse(decrypt(cookie));
        return {...accessHeaders, "Content-Type": "application/json"};

    }
    return null;
}
