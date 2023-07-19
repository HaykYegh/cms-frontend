"use strict";

import {ISocketActions} from "modules/socket/SocketActions";
import {fromJS, Map} from "immutable";

interface ISocketReducerActions {
    SET_TIMER: string,
}

export const actions: ISocketReducerActions = {
    SET_TIMER: "SOCKET:SET_TIMER",
};

export interface ISocketData extends Map<string, any> {
    timer: any,
}

export const defaultState: any = fromJS({
    timer: new Date(),
});

export default (state: ISocketData = defaultState, {type, payload}: ISocketActions): ISocketData => {
    switch (type) {
        case actions.SET_TIMER:
            return state.set("timer", payload.timer) as ISocketData;
        default:
            return state;
    }
};
