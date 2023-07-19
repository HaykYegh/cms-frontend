"use strict";

import * as React from "react";
import * as moment from "moment";
import {AxiosResponse} from "axios";
import isEqual from "lodash/isEqual";
import * as DatetimeRangePicker from "library/react-bootstrap-datetimerangepicker/lib/index";

import {dateTimePickerRanges, pickerLabel} from "helpers/DataHelper";
import {getMessagesTimeline} from "ajaxRequests/stats";
import {setNewChartConfig} from "helpers/DomHelper";
import {LINE_CHART_HEIGHT} from "configs/constants";
import {getAreaSplineConfig} from "helpers/ChartHelper";
import {showNotification} from "helpers/PageHelper";

interface IByDatesState {
    startDate: any,
    endDate: any,
    ranges: any,
    request: {
        loading: boolean,
        refresh: boolean,
        fetchData: boolean
    },
    chartRecords: any[]
}

interface IByTypesProps {
    regionCode?: string,
    startDate?: string,
    endDate?: string,
    isRefresh?: boolean
}

class ByDates extends React.Component<IByTypesProps, IByDatesState> {

    componentState: boolean = true;

    constructor(props: IByTypesProps) {
        super(props);
        this.state = {
            startDate: moment().subtract(6, "days"),
            endDate: moment(),
            ranges: dateTimePickerRanges(),
            request: {
                loading: true,
                refresh: false,
                fetchData: true
            },
            chartRecords: []
        }
    }

    componentDidMount(): void {
        const newState: IByDatesState = {...this.state};
        this.initRequests(newState);
    }

    componentDidUpdate(prevProps: IByTypesProps, prevState: IByDatesState): void {
        const {regionCode, startDate, endDate, isRefresh} = this.props;
        if (regionCode && (!isEqual(prevProps.startDate, startDate) || !isEqual(prevProps.endDate, endDate) || isRefresh)) {
            const newState: IByDatesState = {...this.state};
            this.initRequests(newState);
        }
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    initRequests = (state: IByDatesState): void => {
        const {regionCode} = this.props;
        const startDate: any = regionCode ? this.props.startDate : state.startDate.format("YYYY-MM-DD");
        const endDate: any = regionCode ? this.props.endDate : state.endDate.format("YYYY-MM-DD");
        const container: string = `${regionCode ? `${regionCode}-` : ""}messages-dates-chart`;
        setNewChartConfig(container, {type: "area-spline"}, true);

        getMessagesTimeline({startDate, endDate, regionCode}).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            state.chartRecords = data.result || [];
            state.request.loading = false;
            state.request.refresh = false;
            state.request.fetchData = false;

            const lineConfig: any = getAreaSplineConfig({Total: state.chartRecords}, {
                startDate,
                endDate
            });

            if (this.componentState) {
                setNewChartConfig(container, {config: lineConfig.config});
                this.setState(state);
            }

        }).catch(e => {
            console.log(e);
            // state.request.loading = false;
            state.request.refresh = false;
            state.request.fetchData = false;
            if (this.componentState) {
                const lineConfig: any = getAreaSplineConfig({Total: []}, {
                    startDate,
                    endDate
                });
                // setNewChartConfig(container, {config: lineConfig.config});
                this.setState(state);
                // showNotification("error", {
                //     title: "You've got an error!",
                //     description: "Cannot get messages by dates",
                //     timer: 3000
                // });
            }
        })
    };

    handlePickerApply = (e: React.MouseEvent<HTMLInputElement>, picker: any): void => {
        e.preventDefault();
        const newState: IByDatesState = {...this.state};
        newState.startDate = picker.startDate;
        newState.endDate = picker.endDate;
        newState.request.fetchData = true;
        this.setState(newState);
        this.initRequests(newState);
    };

    handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
    };

    handleRefreshData = (e: React.MouseEvent<HTMLSpanElement>): void => {
        e.preventDefault();
        const {request: {refresh}} = this.state;
        if (refresh) {
            return;
        }
        const newState: IByDatesState = {...this.state};
        newState.request.refresh = true;
        newState.request.fetchData = true;
        this.setState(newState);
        this.initRequests(newState);
    };

    render(): JSX.Element {
        const {ranges, startDate, endDate, request: {refresh}} = this.state;
        const {regionCode} = this.props;

        if (regionCode) {
            return (
                <div className="m-t-40">
                    <div className="content-wrapper">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-6 col-md-5 col-sm-6 col-xs-12">
                                    <span className="text-lg padder-t-5 block">Messages by Dates</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr/>

                    <div className="content-wrapper">
                        <div className="container-fluid">
                            <div className="row">
                                <div id={`${regionCode}-messages-dates-chart`} style={{height: LINE_CHART_HEIGHT}}/>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        return (

            <div className="box-shadow r-3x bg-white m-t-md">
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-5 col-sm-6 col-xs-12">
                                <span className="text-lg padder-t-5 block">Messages by Dates</span>
                            </div>
                            {
                                <div className="col-lg-6 col-md-7 col-sm-6 col-xs-12">
                                    <div className="text-right flex-end">
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
                                                <button className="btn btn-default date-range-toggle">
                                                    <i className="fa fa-calendar"/>
                                                </button>
                                            </span>
                                            </div>
                                        </DatetimeRangePicker>
                                        <button
                                            className="btn btn-default btn-sm m-l-xs"
                                            onClick={this.handleRefreshData}
                                        ><i className={`fa ${refresh ? "fa-spin" : ""} fa-repeat m-r-xs`}/>Refresh
                                        </button>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>

                <hr/>

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div id="messages-dates-chart" style={{height: LINE_CHART_HEIGHT}}/>
                        </div>
                    </div>
                </div>

            </div>

        );
    }
}

export default ByDates;
