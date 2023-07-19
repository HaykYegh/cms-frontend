"use strict";

import {createSelector} from "helpers/DataHelper";

const applicationDataSelector: any = state => state.get("applicationData");

const countriesSelector: any = createSelector(
    applicationDataSelector, (applicationData: any) => applicationData.countries
);

const currenciesSelector: any = createSelector(
    applicationDataSelector, (applicationData: any) => applicationData.currencies
);

const regionCodesSelector: any = createSelector(
    applicationDataSelector, (applicationData: any) => applicationData.regionCodes
);

const platformsSelector: any = createSelector(
    applicationDataSelector, (applicationData: any) => applicationData.platforms
);

const languagesSelector: any = createSelector(
    applicationDataSelector, (applicationData: any) => applicationData.languages
);

const callsMetricTypesSelector: any = createSelector(
    applicationDataSelector, (applicationData: any) => applicationData.callsMetricTypes
);

export interface IApplicationModuleProps {
    countries?: any,
    currencies?: any,
    regionCodes?: any,
    platforms?: any,
    languages?: any,
    callsMetricTypes?: any,
}

export default (state) => {
    return {
        countries: countriesSelector(state),
        currencies: currenciesSelector(state),
        regionCodes: regionCodesSelector(state),
        platforms: platformsSelector(state),
        languages: languagesSelector(state),
        callsMetricTypes: callsMetricTypesSelector(state),
    }
};
