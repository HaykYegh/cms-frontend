"use strict";

import axios from "axios";
import {getAccessHeaders} from "helpers/AppHelper";

axios.interceptors.request.use((config) => {
    config.headers = {...config.headers, ...getAccessHeaders()};
    config.withCredentials = true;
    return config;
}, (err) => {
    return Promise.reject(err);
});

export default axios;
