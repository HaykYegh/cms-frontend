"use strict";

import {AxiosPromise} from "axios";

import axios from "helpers/Axios";
import config from "configs/params";

export const getCountriesActivities: any = ({startDate, endDate, metricType, metricContextType, hasChart}): AxiosPromise => {
    return axios.get(config.panel.baseUrl + config.panel.api.v2.metrics.countries, {
        params: {startDate, endDate, metricType, metricContextType, hasChart}
    });
};

export const getCountryActivity: any = ({startDate, endDate, metricType, metricContextType, regionId}): AxiosPromise => {
    return axios.get(`${config.panel.baseUrl + config.panel.api.v2.metrics.countries}/${regionId}`, {
        params: {startDate, endDate, metricType}
    });
};
