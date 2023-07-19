"use strict";

import {combineReducers} from "redux-immutable";

import applicationData from "modules/application/ApplicationReducer";
import socketData from "modules/socket/SocketReducer";
import userData from "modules/user/UserReducer";

export default combineReducers({
    userData,
    applicationData,
    socketData,
});
