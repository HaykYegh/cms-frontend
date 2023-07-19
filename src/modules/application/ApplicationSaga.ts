"use strict";

import {call, all, takeLatest, put} from "redux-saga/effects";

import {getCountries, getLanguages, getPlatforms} from "ajaxRequests/misc";
import {setStaticData} from "modules/application/ApplicationActions";
import {actions} from "modules/application/ApplicationReducer";
import {getCallsMetricTypes} from "ajaxRequests/stats";
import {METRIC_TYPES} from "configs/constants";

function* attemptGetStaticData(): any {
    try {
        const [countries, platforms, languages, callsMetricTypes] = yield all([
            call(getCountries),
            call(getPlatforms),
            call(getLanguages),
            call(getCallsMetricTypes)
        ]);

        const applicationData: any = {};

        if (!countries.data.err) {
            applicationData.countries = countries.data.result;
            applicationData.currencies = [];

            const uniqueCurrencies: string[] = [];
            const regionCodes: any = {};

            for (const item of applicationData.countries) {
                if (item.currency) {
                    for (const property of item.currency) {
                        if (!uniqueCurrencies.includes(property.code)) {
                            uniqueCurrencies.push(property.code);
                            applicationData.currencies.push({
                                value: property.code,
                                label: property.name + ` (${property.code})`,
                            });
                        }
                    }
                }
                regionCodes[item.region_code] = item;
            }
            applicationData.regionCodes = regionCodes;

        } else {
            console.log("Error while getting countries");
        }

        if (!platforms.data.err) {
            applicationData.platforms = platforms.data.result;
        } else {
            console.log("Error while getting platforms");
        }

        if (!languages.data.err) {
            applicationData.languages = languages.data.result;
        } else {
            console.log("Error while getting languages");
        }

        if (!callsMetricTypes.data.err) {
            const response: any[] = [];
            for (const item of callsMetricTypes.data.result) {
                response.push({
                    value: item.metricTypeId,
                    label: METRIC_TYPES[item.name].LABEL
                })
            }
            applicationData.callsMetricTypes = response;
        } else {
            console.log("Error while getting call metric types");
        }

        yield put(setStaticData(applicationData));

    } catch (err) {
        console.log(err)
    }
}

function* applicationSaga(): any {
    yield takeLatest(actions.ATTEMPT_GET_STATIC_DATA, attemptGetStaticData);
}

export default applicationSaga;
