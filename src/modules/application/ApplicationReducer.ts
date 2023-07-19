"use strict";

import {IApplicationActions} from "modules/application/ApplicationActions";

interface IApplicationReducerActions {
    ATTEMPT_GET_STATIC_DATA: string,
    SET_STATIC_DATA: string;
}

export const actions: IApplicationReducerActions = {
    ATTEMPT_GET_STATIC_DATA: "APPLICATION:ATTEMPT_GET_STATIC_DATA",
    SET_STATIC_DATA: "APPLICATION:SET_STATIC_DATA",
};

export interface IApplicationData {
    countries?: any[],
    currencies?: any[],
    regionCodes?: any[],
    platforms?: any[],
    languages?: any[],
    callsMetricTypes?: any[]
}

export const defaultState: IApplicationData = ({
    countries: [],
    currencies: [],
    regionCodes: [],
    platforms: [],
    languages: [],
    callsMetricTypes: [],
});

export default (state: IApplicationData = defaultState, {type, payload}: IApplicationActions): IApplicationData => {
    switch (type) {
        case actions.SET_STATIC_DATA:
            return {...payload};
        default:
            return state;
    }
};
