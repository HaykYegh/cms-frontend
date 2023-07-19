"use strict";

import * as React from "react";
import numeral from "numeral";
import * as moment from "moment";
import {AxiosResponse} from "axios";
import {connect} from "react-redux";
import ReactCountryFlag from "react-country-flag";
import * as DatetimeRangePicker from "library/react-bootstrap-datetimerangepicker/lib/index";

import {dateTimePickerRanges, getMetricTypeStats, pickerLabel} from "helpers/DataHelper";
import {LINE_CHART_HEIGHT, METRIC_TYPES} from "configs/constants";
import {dualAxesChartConfig} from "helpers/ChartHelper";
import selector, {IStoreProps} from "services/selector";
import {showNotification} from "helpers/PageHelper";
import {setNewChartConfig} from "helpers/DomHelper";
import {getCallsByTypes} from "ajaxRequests/stats";

interface IByTypesState {
    startDate: any,
    endDate: any,
    ranges: any,
    request: {
        loading: boolean,
        refresh: boolean,
        fetchData: boolean
    },
    callsByTypes: {
        internalCalls: {
            calls: {
                records: any[],
                count: number
            },
            duration: {
                records: any[],
                count: number
            }
        },
        outCalls: {
            calls: {
                records: any[],
                count: number
            },
            duration: {
                records: any[],
                count: number
            }
        },
        backCalls: {
            calls: {
                records: any[],
                count: number
            },
            duration: {
                records: any[],
                count: number
            }
        }
    }
}

interface IByTypesProps extends IStoreProps {
    regionCode?: string,
    goBack?: (e: React.MouseEvent<HTMLButtonElement>) => void,
    startDate?: any,
    endDate?: any
}

class ByTypes extends React.Component<IByTypesProps, IByTypesState> {

    componentState: boolean = true;

    constructor(props: IByTypesProps) {
        super(props);
        this.state = {
            startDate: this.props.startDate || moment().subtract(6, "days"),
            endDate: this.props.endDate || moment(),
            ranges: dateTimePickerRanges(),
            request: {
                loading: true,
                refresh: false,
                fetchData: true
            },
            callsByTypes: {
                internalCalls: {
                    calls: {
                        records: [],
                        count: 0
                    },
                    duration: {
                        records: [],
                        count: 0
                    }
                },
                outCalls: {
                    calls: {
                        records: [],
                        count: 0
                    },
                    duration: {
                        records: [],
                        count: 0
                    }
                },
                backCalls: {
                    calls: {
                        records: [],
                        count: 0
                    },
                    duration: {
                        records: [],
                        count: 0
                    }
                }
            }
        }
    }

    componentDidMount(): void {
        const newState: IByTypesState = {...this.state};
        this.initRequests(newState);
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    initRequests = (state: IByTypesState): void => {
        const startDate: any = state.startDate.format("YYYY-MM-DD");
        const endDate: any = state.endDate.format("YYYY-MM-DD");
        const {regionCode} = this.props;

        const internalCallsContainer: string = `${regionCode ? `${regionCode}-` : ""}internal-calls-by-country`;
        const outCallsContainer: string = `${regionCode ? `${regionCode}-` : ""}out-calls-by-country`;
        const inCallsContainer: string = `${regionCode ? `${regionCode}-` : ""}in-calls-by-country`;

        setNewChartConfig(internalCallsContainer, {type: "dual-axes"}, true);
        setNewChartConfig(outCallsContainer, {type: "dual-axes"}, true);
        setNewChartConfig(inCallsContainer, {type: "dual-axes"}, true);

        getCallsByTypes({startDate, endDate, regionCode}).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            const response: any[] = data.result || [];

            const internalCalls: any = getMetricTypeStats(response, METRIC_TYPES.INTERNAL_CALL.TYPE);
            const internalCallsDuration: any = getMetricTypeStats(response, METRIC_TYPES.DURATION_INTERNAL_CALL.TYPE);
            const outCalls: any = getMetricTypeStats(response, METRIC_TYPES.OUT_CALL.TYPE);
            const outCallsDuration: any = getMetricTypeStats(response, METRIC_TYPES.DURATION_OUT_CALL.TYPE);
            const backCalls: any = getMetricTypeStats(response, METRIC_TYPES.BACK_CALL.TYPE);
            const backCallsDuration: any = getMetricTypeStats(response, METRIC_TYPES.BACK_CALL.TYPE);

            state.callsByTypes.internalCalls.calls.records = internalCalls.records;
            state.callsByTypes.internalCalls.calls.count = internalCalls.count;
            state.callsByTypes.internalCalls.duration.count = internalCallsDuration.count;
            state.callsByTypes.internalCalls.duration.records = internalCallsDuration.records;

            state.callsByTypes.outCalls.calls.records = outCalls.records;
            state.callsByTypes.outCalls.calls.count = outCalls.count;
            state.callsByTypes.outCalls.duration.records = outCallsDuration.records;
            state.callsByTypes.outCalls.duration.count = outCallsDuration.count;

            state.callsByTypes.outCalls.calls.records = outCalls.records;
            state.callsByTypes.backCalls.calls.count = backCalls.count;
            state.callsByTypes.backCalls.duration.records = backCallsDuration.records;
            state.callsByTypes.backCalls.duration.count = backCallsDuration.count;

            const internalCallsConfig: any = dualAxesChartConfig({
                "Internal calls count": state.callsByTypes.internalCalls.calls.records,
                "Internal calls duration": state.callsByTypes.internalCalls.duration.records
            }, {
                startDate,
                endDate
            });

            const outCallsConfig: any = dualAxesChartConfig({
                "Out calls count": state.callsByTypes.outCalls.calls.records,
                "Out calls duration": state.callsByTypes.outCalls.duration.records
            }, {
                startDate,
                endDate
            });

            const backCallsConfig: any = dualAxesChartConfig({
                "Back calls count": state.callsByTypes.backCalls.calls.records,
                "Back calls duration": state.callsByTypes.backCalls.duration.records
            }, {
                startDate,
                endDate
            });

            state.request.loading = false;
            state.request.refresh = false;
            state.request.fetchData = false;
            if (this.componentState) {
                setNewChartConfig(internalCallsContainer, {config: internalCallsConfig.config});
                setNewChartConfig(outCallsContainer, {config: outCallsConfig.config});
                setNewChartConfig(inCallsContainer, {config: backCallsConfig.config});
                this.setState(state);
            }
        }).catch(e => {
            console.log(e);
            // state.request.loading = false;
            state.request.refresh = false;
            state.request.fetchData = false;
            if (this.componentState) {
                this.setState(state);
                const internalCallsConfig: any = dualAxesChartConfig({
                    "Internal calls count": [],
                    "Internal calls duration": []
                }, {
                    startDate,
                    endDate
                });

                const outCallsConfig: any = dualAxesChartConfig({
                    "Out calls count": [],
                    "Out calls duration": []
                }, {
                    startDate,
                    endDate
                });

                const backCallsConfig: any = dualAxesChartConfig({
                    "Back calls count": [],
                    "Back calls duration": []
                }, {
                    startDate,
                    endDate
                });
                // setNewChartConfig(internalCallsContainer, {config: internalCallsConfig.config});
                // setNewChartConfig(outCallsContainer, {config: outCallsConfig.config});
                // setNewChartConfig(inCallsContainer, {config: backCallsConfig.config});
                // showNotification("error", {
                //     title: "You've got an error!",
                //     description: "Cannot get calls statistics by types",
                //     timer: 3000
                // });
            }
        })
    };

    handlePickerApply = (e: React.MouseEvent<HTMLInputElement>, picker: any): void => {
        e.preventDefault();
        const newState: IByTypesState = {...this.state};
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
        const newState: IByTypesState = {...this.state};
        newState.request.refresh = true;
        newState.request.fetchData = true;
        this.setState(newState);
        this.initRequests(newState);
    };

    render(): JSX.Element {
        const {ranges, startDate, endDate, request: {refresh}, callsByTypes: {internalCalls, outCalls, backCalls}} = this.state;
        const {regionCode, goBack, regionCodes} = this.props;

        return (

            <div className="box-shadow r-3x bg-white m-t-md calls-by-types" id="calls-stats-by-country">
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            {
                                regionCode ?
                                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                        <div className="flex-start-center">
                                            <button
                                                className="btn btn-default m-r-sm"
                                                onClick={goBack}
                                            ><i className="fa fa-arrow-left m-r-xs"/>Calls
                                            </button>
                                            <div className="flex-start-center">
                                                <ReactCountryFlag code={regionCode} svg={true}/>
                                                <span className="m-l-sm font-semi-bold text-lg">
                                                    {regionCodes && regionCodes[regionCode] && regionCodes[regionCode].label}
                                                </span>
                                            </div>
                                        </div>
                                    </div> :
                                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                        <span className="text-lg padder-t-5 block">Calls by Types</span>
                                    </div>
                            }
                            <div
                                className={regionCode ? "col-lg-6 col-md-6 col-sm-6 col-xs-12" : "col-lg-6 col-md-6 col-sm-6 col-xs-12"}
                            >
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
                        </div>
                    </div>
                </div>

                <hr/>

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row m-b-md">
                            <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                <div className="info b-r">
                                    <div className="m-r-sm">
                                        <span className="block text-xsl">{numeral(internalCalls.calls.count).format("0.0a").toUpperCase()}</span>
                                        <span>Internal Calls</span>
                                    </div>
                                    <div>
                                        <span className="block text-xsl">{numeral(internalCalls.duration.count).format("0.0a").toUpperCase()}</span>
                                        <span>Duration (min)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                <div className="info b-r">
                                    <div className="m-r-sm">
                                        <span className="block text-xsl">{numeral(outCalls.calls.count).format("0.0a").toUpperCase()}</span>
                                        <span>Out Calls</span>
                                    </div>
                                    <div>
                                        <span className="block text-xsl">{numeral(outCalls.duration.count).format("0.0a").toUpperCase()}</span>
                                        <span>Duration (min)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                <div className="info">
                                    <div className="m-r-sm">
                                        <span className="block text-xsl">{numeral(backCalls.calls.count).format("0.0a").toUpperCase()}</span>
                                        <span>In Calls</span>
                                    </div>
                                    <div>
                                        <span className="block text-xsl">{numeral(backCalls.duration.count).format("0.0a").toUpperCase()}</span>
                                        <span>Duration (min)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <span className="block m-b-sm">Internal Calls</span>
                            </div>

                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <div
                                    id={`${regionCode ? `${regionCode}-` : ""}internal-calls-by-country`}
                                    style={{height: LINE_CHART_HEIGHT}}
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <span className="block m-b-sm">Out Calls</span>
                            </div>

                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <div
                                    id={`${regionCode ? `${regionCode}-` : ""}out-calls-by-country`}
                                    style={{height: LINE_CHART_HEIGHT}}
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <span className="block m-b-sm">In Calls</span>
                            </div>

                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <div
                                    id={`${regionCode ? `${regionCode}-` : ""}in-calls-by-country`}
                                    style={{height: LINE_CHART_HEIGHT}}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ByTypes);
