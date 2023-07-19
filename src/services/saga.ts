"use strict";

import {all} from "redux-saga/effects";

import ApplicationSaga from "modules/application/ApplicationSaga";
import UserSaga from "modules/user/UserSaga";
import SocketSaga from "modules/socket/SocketSaga";

export default function*(): any {
    yield all([
        UserSaga(),
        ApplicationSaga(),
        SocketSaga()
    ]);
};
