"use strict";

import {createSelector} from "helpers/DataHelper";

const userDataSelector: any = state => state.get("userData");

const successMessageSelector: any = createSelector(
    userDataSelector, (userData: any) => userData.successMessage
);

const errorMessageSelector: any = createSelector(
    userDataSelector, (userData: any) => userData.errorMessage
);

const userProfileSelector: any = createSelector(
    userDataSelector, (userData: any) => userData.userProfile
);

const isSuperAdminSelector: any = createSelector(
    userDataSelector, (userData: any) => userData.isSuper
);

export interface IUserModuleProps {
    successMessage?: string;
    errorMessage?: string;
    userProfile?: any;
    isSuper?: boolean
}

export default (state) => ({
    successMessage: successMessageSelector(state),
    errorMessage: errorMessageSelector(state),
    userProfile: userProfileSelector(state),
    isSuper: isSuperAdminSelector(state)
});
