"use strict";

import {actions} from "modules/socket/SocketReducer";

export interface ISocketActions {
    type: string;
    payload: {
        timer: any
    };
}

export function setTimer({timer}: any): ISocketActions {
    return {
        type: actions.SET_TIMER,
        payload: {timer}
    };
}
