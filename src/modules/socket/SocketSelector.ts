"use strict";

import {createSelector} from "helpers/DataHelper";

const socketDataSelector: any = state => state.get("socketData");

const timerSelector: any = createSelector(
    socketDataSelector, (applicationData: any) => applicationData.get("timer")
);

export interface ISocketModuleProps {
    timer?: any,
}

export default (state) => {
    return {
        timer: timerSelector(state),
    }
};
