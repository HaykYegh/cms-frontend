"use strict";

import axios from "axios";
import * as React from "react";
import {isEqual} from "lodash";
import Button from "react-bootstrap/es/Button";
import * as moment from "moment";
import * as DatetimeRangePicker from "library/react-bootstrap-datetimerangepicker/lib/index";

import {DEFAULT_BILLING_METHOD, DEFAULT_CURRENCY, LEFT_PANEL_NAVIGATION, LIMIT, METRIC_TYPES, STATISTICS, VARIABLES} from "configs/constants";
import {getMetrics, getUsersInDate} from "ajaxRequests/stats";
import {dateTimePickerRanges, getStatisticsArray, pickerLabel} from "helpers/DataHelper";
import StackedChart from "components/Common/StackedChart";
import {showNotification} from "helpers/PageHelper";
import {getFinanceSales} from "ajaxRequests/finance";

interface IBusinessStatsState {
    request: {
        loading: boolean,
        refresh: boolean,
    },
    statistics: any,
    startDate: any,
    endDate: any,
    ranges: any,
}

export default class BusinessStats extends React.Component<any, IBusinessStatsState> {

    componentState: boolean = true;

    stackedCharts: any = null;

    constructor(props: any) {
        super(props);
        this.state = {
            request: {
                loading: true,
                refresh: false,
            },
            startDate: moment().subtract(6, "days"),
            endDate: moment(),
            ranges: dateTimePickerRanges(),
            statistics: {
                users: {
                    data: null
                },
                messages: {
                    data: null
                },
                freeCalls: {
                    data: null
                },
                freeCallsDuration: {
                    data: null
                },
                calls: {
                    data: null
                },
                activeUsers: {
                    data: null
                },
                sales: {
                    data: null
                },
                spending: {
                    data: null
                }
            },
        }
    }

    componentWillMount(): void {
        const {statistics, request: {loading}, startDate, endDate} = this.state;
        this.stackedCharts = this.statisticChartsComponent(statistics, startDate, endDate, loading);
    }

    componentDidMount(): void {
        this.initRequests();
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    initRequests: any = (): void => {
        const startDate: string = this.state.startDate.format("YYYY-MM-DD");
        const endDate: string = this.state.endDate.format("YYYY-MM-DD");
        const salesData: any = {
            offset: 0,
            startDate,
            endDate,
            method: DEFAULT_BILLING_METHOD,
            limit: LIMIT,
            currency: DEFAULT_CURRENCY,
            userGroup: null
        };

        axios.all([
            getUsersInDate(startDate, endDate),
            getMetrics(startDate, endDate, METRIC_TYPES.MSG.TYPE),
            getMetrics(startDate, endDate, METRIC_TYPES.DURATION_INTERNAL_CALL.TYPE, METRIC_TYPES.DURATION_INTERNAL_CALL.CONTEXT.END.value),
            getMetrics(startDate, endDate, METRIC_TYPES.INTERNAL_CALL.TYPE, METRIC_TYPES.INTERNAL_CALL.CONTEXT.RINGING.value),
            getMetrics(startDate, endDate, METRIC_TYPES.OUT_CALL.TYPE, METRIC_TYPES.OUT_CALL.CONTEXT.RINGING.value),
            getMetrics(startDate, endDate, METRIC_TYPES.BACK_CALL.TYPE, METRIC_TYPES.BACK_CALL.CONTEXT.RINGING.value),
            getFinanceSales(salesData),
        ]).then(axios.spread((users, messages, freeCallsDuration, freeCalls, outCalls, backTerminationCalls, sales) => {
            const newState: IBusinessStatsState = {...this.state};

            if (!users.data.err) {
                newState.statistics.users.data = [
                    getStatisticsArray(users.data.result.unregisteredCount, "createdAt", "count"),
                    getStatisticsArray(users.data.result.registeredCount, "createdAt", "count")
                ];
            } else {
                this.componentState && showNotification("error", {
                    title: "You got an error!",
                    description: "Can not get users for unknown reason",
                    hideProgress: true,
                    timer: 3000
                });
            }

            if (!messages.data.err) {
                newState.statistics.messages.data = getStatisticsArray(messages.data.result, "createdAt", "count");
            } else {
                this.componentState && showNotification("error", {
                    title: "You got an error!",
                    description: "Can not get messages for unknown reason",
                    hideProgress: true,
                    timer: 3000
                });
            }

            if (!freeCallsDuration.data.err) {
                newState.statistics.freeCallsDuration.data = getStatisticsArray(freeCallsDuration.data.result, "createdAt", "count", true);
            } else {
                this.componentState && showNotification("error", {
                    title: "You got an error!",
                    description: "Can not get free calls durations for unknown reason",
                    hideProgress: true,
                    timer: 3000
                });
            }

            if (!freeCalls.data.err) {
                newState.statistics.freeCalls.data = getStatisticsArray(freeCalls.data.result, "createdAt", "count");
            } else {
                this.componentState && showNotification("error", {
                    title: "You got an error!",
                    description: "Can not get free calls for unknown reason",
                    hideProgress: true,
                    timer: 3000
                });
            }

            newState.statistics.calls.data = [];

            if (!outCalls.data.err) {
                newState.statistics.calls.data.push(getStatisticsArray(outCalls.data.result, "createdAt", "count"));
            } else {
                this.componentState && showNotification("error", {
                    title: "You got an error!",
                    description: "Can not get out calls for unknown reason",
                    hideProgress: true,
                    timer: 3000
                });
            }

            if (!backTerminationCalls.data.err) {
                newState.statistics.calls.data.push(getStatisticsArray(backTerminationCalls.data.result, "createdAt", "count"));
            } else {
                this.componentState && showNotification("error", {
                    title: "You got an error!",
                    description: "Can not get back termination calls for unknown reason",
                    hideProgress: true,
                    timer: 3000
                });
            }

            if (!sales.data.err) {
                newState.statistics.sales.data = getStatisticsArray(sales.data.result, "paymentDate", "amount", true);
            } else {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not get sales for unknown reason",
                    timer: 3000,
                    hideProgress: true
                });
            }

            if (this.componentState) {
                this.stackedCharts = this.statisticChartsComponent(newState.statistics, this.state.startDate, this.state.endDate, false);
                newState.request.loading = false;
                newState.request.refresh = false;
                this.setState(newState);
            }

        })).catch(error => console.log(error));
    };

    statisticChartsComponent = (statistics: any, startDate: any, endDate: any, loading: boolean): any[] => {
        const result: any = [];
        let index: number = 0;
        for (const item in statistics) {
            if (statistics.hasOwnProperty(item)) {
                let seriesName: string | Array<string> = STATISTICS[item];
                const prefix: string = (item === VARIABLES.SALES || item === VARIABLES.SPENDING) ? "$" : "";
                if (item === VARIABLES.USERS) {
                    seriesName = [STATISTICS.notVerifiedUsers, STATISTICS.registeredUsers];
                } else if (item === VARIABLES.CALLS) {
                    seriesName = [STATISTICS.outCalls, STATISTICS.backTerminationCalls];
                }

                result.push(
                    <div
                        key={index}
                        className="col-lg-3 col-xs-12 col-sm-12 col-md-6 no-padder"
                    >
                        <StackedChart
                            name={item}
                            seriesName={seriesName}
                            prefix={prefix}
                            startDate={startDate}
                            endDate={endDate}
                            seriesData={statistics[item].data}
                            link={LEFT_PANEL_NAVIGATION[item]}
                            loading={loading}
                        />
                    </div>
                );
                index++;
            }
        }
        return result;
    };

    handlePickerApply = (e: React.MouseEvent<HTMLInputElement>, picker: any): void => {
        e.preventDefault();
        const newState: IBusinessStatsState = {...this.state};
        newState.startDate = picker.startDate;
        newState.endDate = picker.endDate;
        newState.request.loading = true;
        this.stackedCharts = this.statisticChartsComponent(newState.statistics, picker.startDate, picker.endDate, true);
        this.setState(newState);
        this.initRequests();
    };

    handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
    };

    handleRefreshData = (e: React.MouseEvent<HTMLSpanElement>): void => {
        e.preventDefault();
        const {statistics, startDate, endDate, request: {refresh}} = this.state;
        if (refresh) {
            return;
        }
        const newState: IBusinessStatsState = {...this.state};
        newState.request.refresh = true;
        newState.request.loading = true;
        this.stackedCharts = this.statisticChartsComponent(statistics, startDate, endDate, true);
        this.setState(newState);
        this.initRequests();
    };

    render(): JSX.Element {
        const {request: {loading, refresh}, startDate, endDate, ranges} = this.state;
        return (
            <div className="bg-white box-shadow content-wrapper r-3x m-b-md">
                <div className="container-fluid">
                    <div className="row m-b-md">
                        <div className="col-lg-4">
                            <span className="text-lg m-b-md block">Time range statistics</span>
                        </div>
                        <div className="col-lg-4">
                            <div className="form-group">
                                <DatetimeRangePicker
                                    name="date"
                                    onApply={this.handlePickerApply}
                                    ranges={ranges}
                                    applyClass="btn-info"
                                    autoUpdateInput={true}
                                    startDate={startDate}
                                    endDate={endDate}
                                >
                                    <div className="input-group">
                                        <input
                                            className="form-control"
                                            value={pickerLabel(startDate, endDate)}
                                            onChange={this.handlePickerChange}
                                        />
                                        <span className="input-group-btn">
                                                        <Button className="default date-range-toggle">
                                                          <i className="fa fa-calendar"/>
                                                        </Button>
                                                    </span>
                                    </div>
                                </DatetimeRangePicker>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 padder-v-xs text-right">
                                <span className="text-info cursor-pointer font-semi-bold text-md" onClick={this.handleRefreshData}>
                                    Refresh
                                </span>
                            <i className={`fa ${refresh ? "fa-spin" : ""} fa-repeat m-l-xs text-info`}/>
                        </div>
                    </div>
                    <div className="row">
                        <div className={`${loading ? " inactive " : ""}flex flex-wrap`}>
                            {this.stackedCharts}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
