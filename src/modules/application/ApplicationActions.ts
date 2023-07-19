"use strict";

import {actions} from "modules/application/ApplicationReducer";

export interface IApplicationActions {
    type: string;
    payload?: {
        countries?: any[],
        platforms?: any[],
        languages?: any[],
        currencies?: any[],
        regionCodes?: any,
        callsMetricTypes?: any[]
    };
}

export function getStaticData(): IApplicationActions {
    return {type: actions.ATTEMPT_GET_STATIC_DATA};
}

export function setStaticData({countries, currencies, regionCodes, platforms, languages, callsMetricTypes}: any): IApplicationActions {
    return {
        type: actions.SET_STATIC_DATA,
        payload: {countries, currencies, regionCodes, platforms, languages, callsMetricTypes}
    };
}
