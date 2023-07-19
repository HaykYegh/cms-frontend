"use strict";

import * as io from "socket.io-client";
import {eventChannel} from "redux-saga";
import {fork, take, call, put, cancel} from "redux-saga/effects";

import {setTimer} from "modules/socket/SocketActions";
import {ACCESS_HEADERS} from "configs/constants";
import {getCookie} from "helpers/CookieHelper";
import {decrypt} from "helpers/DataHelper";
import params from "configs/params";
import {actions as UserActions} from "modules/user/UserReducer";

function connect(cookie: string): Promise<any> {
    const accessHeaders: any = JSON.parse(decrypt(cookie));
    const socket: any = io(params.panel.baseUrl, {
        query: {
            token: accessHeaders["X-Access-Token"],
            prefix: accessHeaders["X-Access-Prefix"],
            administratorId: accessHeaders["X-Access-Id"],
        },
        transports: ["websocket"],
        secure: false
    });
    return new Promise(resolve => {
        // const metric: any = io("/metrics");
        // metric.on("/", (data) => {
        //     console.log(data);
        // });
        socket.on("connect", () => {
            resolve(socket);
        });
    });
}

function subscribe(socket: any): any {
    return eventChannel(emit => {
        socket.on("timer", (data) => {
            emit(setTimer({timer: data.payload}));
        });
        socket.on("metrics", (data) => {
            console.log(data);
        });
        return () => {
        };
    });
}

function* read(socket: any): any {
    const channel: any = yield call(subscribe, socket);
    while (true) {
        const action: any = yield take(channel);
        yield put(action);
    }
}

function* handleIO(socket: any): any {
    yield fork(read, socket);
}

function* flow(): any {
    while (true) {
        const cookie: string = getCookie(ACCESS_HEADERS);
        if (!cookie) {
            yield take(UserActions.SIGN_IN_SUCCESS);
        } else {
            const socket: any = yield call(connect, cookie);
            const task: any = yield fork(handleIO, socket);
            yield take(UserActions.ATTEMPT_SIGN_OUT);
            yield cancel(task);
            socket.disconnect()
        }
    }
}

export default function* socketSaga(): any {
    // yield fork(flow);
}
