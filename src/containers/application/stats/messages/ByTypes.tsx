"use strict";

import numeral from "numeral"
import * as React from "react";
import * as moment from "moment";
import {connect} from "react-redux";
import ReactCountryFlag from "react-country-flag";
import * as DatetimeRangePicker from "library/react-bootstrap-datetimerangepicker/lib/index";

import {CHART_TYPES, METRIC_TYPES, PIE_CHART_HEIGHT, CHART_COLORS} from "configs/constants";
import {getMessagesByTypes, getMessagesCountByTypes} from "ajaxRequests/stats";
import {dateTimePickerRanges, pickerLabel} from "helpers/DataHelper";
import ByDates from "containers/application/stats/messages/ByDates";
import selector, {IStoreProps} from "services/selector";
import {getPieChartConfig} from "helpers/ChartHelper";
import {setNewChartConfig} from "helpers/DomHelper";
import axios from "helpers/Axios";

interface IByTypesState {
    startDate: any,
    endDate: any,
    ranges: any,
    request: {
        loading: boolean,
        refresh: boolean,
        fetchData: boolean
    },
    currentChartType: string,
    messages: any,
    currentChart: string,
    pieChartConfig: any
}

interface IByTypesProps extends IStoreProps {
    regionCode?: string,
    goBack?: (e: React.MouseEvent<HTMLElement>) => void,
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
            currentChart: CHART_TYPES.TOTAL,
            currentChartType: "total",
            messages: {
                total: {
                    value: 0,
                    context: [],
                },
                singleChats: {
                    value: 0,
                    metricType: null,
                    context: []
                },
                groupChats: {
                    value: 0,
                    context: []
                }
            },
            pieChartConfig: {
                config: {}
            }
        }
    }

    componentDidMount(): void {
        const newState: IByTypesState = {...this.state};
        this.initRequests(newState);
    }

    componentDidUpdate(prevProps: IByTypesProps, prevState: IByTypesState): void {
        if (window.innerWidth >= 1200) {
            const style: any = window.getComputedStyle(document.getElementById("messages-stats"), null);
            const currentHeight: number = parseInt(style.getPropertyValue("height"));
            const element: any = document.getElementById("messages-stats-by-country");
            if (parseInt(element.style.height) === currentHeight) {
                return;

            }
            element.style.height = currentHeight - 20 + "px";
        }
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    initRequests = (state: IByTypesState): void => {
        const startDate: any = state.startDate.format("YYYY-MM-DD");
        const endDate: any = state.endDate.format("YYYY-MM-DD");
        const {regionCode} = this.props;
        const container: string = `${regionCode ? `${regionCode}-` : ""}messages-types-chart`;
        setNewChartConfig(container, {}, true);

        try {
            (async (): Promise<any> => {
                const {data}: any = await getMessagesCountByTypes({startDate, endDate, regionCode});

                if (data.err) {
                    throw new Error(JSON.stringify(data));
                }

                const singleChats: any = data.result.find(item => item.metricType.name === METRIC_TYPES.MSG.TYPE) || null;
                const groupChats: any = data.result.find(item => item.metricType.name === METRIC_TYPES.GROUP_MSG.TYPE) || null;

                const singleChatsState: any = state.messages.singleChats;
                const groupChatsState: any = state.messages.groupChats;

                if (singleChats) {
                    singleChatsState.value = singleChats.value || 0;
                    singleChatsState.metricType = singleChats.metricType || null;
                } else {
                    singleChatsState.value = 0;
                    singleChatsState.metricType = null;
                }
                if (groupChats) {
                    groupChatsState.value = groupChats.value || 0;
                    groupChatsState.metricType = groupChats.metricType || null;
                } else {
                    groupChatsState.value = 0;
                    groupChatsState.metricType = null;
                }

                state.messages.total.value = singleChatsState.value + groupChatsState.value;
                state.request.loading = false;
                state.request.refresh = false;
                state.request.fetchData = false;

                if (this.componentState) {
                    this.setState(state);

                    const singleChatsMetricTypeId: number = singleChatsState && singleChatsState.metricType && singleChatsState.metricType.metricTypeId;
                    const groupChatsMetricTypeId: number = groupChatsState && groupChatsState.metricType && groupChatsState.metricType.metricTypeId;

                    const requests: any[] = [];
                    if (singleChatsMetricTypeId) {
                        requests.push(getMessagesByTypes({startDate, endDate, metricTypeId: singleChatsMetricTypeId, regionCode}))
                    }
                    if (groupChatsMetricTypeId) {
                        requests.push(getMessagesByTypes({startDate, endDate, metricTypeId: groupChatsMetricTypeId, regionCode}),
                        )

                    }

                    axios.all(requests).then(axios.spread((singleChats, groupChats) => {
                        const total: any = {};
                        if (singleChats) {
                            if (singleChats.data.err) {
                                throw new Error(JSON.stringify(singleChats.data));
                            }

                            singleChatsState.context = singleChats.data.result || [];
                            for (const item of singleChatsState.context) {
                                if (METRIC_TYPES.MSG.CONTEXT.hasOwnProperty(item.metricContextType)) {
                                    item.name = METRIC_TYPES.MSG.CONTEXT[item.metricContextType].label;
                                    total[item.metricContextType] = item.value;
                                }
                            }
                        }

                        if (groupChats) {
                            if (groupChats.data.err) {
                                throw new Error(JSON.stringify(groupChats.data));
                            }

                            groupChatsState.context = groupChats.data.result || [];
                            for (const item of groupChatsState.context) {
                                if (METRIC_TYPES.GROUP_MSG.CONTEXT.hasOwnProperty(item.metricContextType)) {
                                    item.name = METRIC_TYPES.GROUP_MSG.CONTEXT[item.metricContextType].label;
                                    if (total.hasOwnProperty(item.metricContextType)) {
                                        total[item.metricContextType] += item.value;
                                    } else {
                                        total[item.metricContextType] = item.value;
                                    }
                                }
                            }
                        }
                        const totalMessages: any = Object.keys(total).map(item => {
                            return {
                                name: METRIC_TYPES.MSG.CONTEXT[item].label,
                                value: total[item]
                            }
                        });
                        state.messages.total.context = totalMessages || [];
                        const pieChart: any = getPieChartConfig(state.messages.total.context, {
                            enabled: false,
                            innerSize: "55%"
                        });

                        if (this.componentState) {
                            setNewChartConfig(container, {config: pieChart.config});
                            this.setState(state);
                        }
                    })).catch(err => {
                        console.log(err);
                        state.request.loading = false;
                        state.request.refresh = false;
                        state.request.fetchData = false;
                        if (this.componentState) {
                            this.setState(state);
                            const pieChart: any = getPieChartConfig([], {});
                            setNewChartConfig(container, {config: pieChart.config});
                            // showNotification("error", {
                            //     title: "You've got an error!",
                            //     description: "Cannot get messages count by types",
                            //     timer: 3000
                            // });
                        }
                    });
                }
            })()
        } catch (e) {
            console.log(e);
            state.request.loading = false;
            state.request.refresh = false;
            state.request.fetchData = false;
            if (this.componentState) {
                this.setState(state);
                const pieChart: any = getPieChartConfig([], {});
                setNewChartConfig(container, {config: pieChart.config});
                // showNotification("error", {
                //     title: "You've got an error!",
                //     description: "Cannot get messages count by types",
                //     timer: 3000
                // });
            }
        }
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

    handleMessagesByTypesChange = (e: React.MouseEvent<HTMLElement>): void => {
        e.preventDefault();
        const {regionCode} = this.props;
        const container: string = `${regionCode ? `${regionCode}-` : ""}messages-types-chart`;
        const chartType: string = e.currentTarget.getAttribute("data-chart-type");
        const {messages, currentChart}: IByTypesState = this.state;
        const newState: IByTypesState = {...this.state};
        if (chartType === CHART_TYPES.SINGLE && currentChart !== CHART_TYPES.SINGLE && messages.singleChats.value > 0) {
            newState.currentChart = CHART_TYPES.SINGLE;
            newState.currentChartType = "singleChats";
            const pieChart: any = getPieChartConfig(messages.singleChats.context, {
                enabled: false,
                innerSize: "55%"
            });
            setNewChartConfig(container, {config: pieChart.config})
        }
        if (chartType === CHART_TYPES.GROUP && currentChart !== CHART_TYPES.GROUP && messages.groupChats.value > 0) {
            newState.currentChart = CHART_TYPES.GROUP;
            newState.currentChartType = "groupChats";
            const pieChart: any = getPieChartConfig(messages.groupChats.context, {
                enabled: false,
                innerSize: "55%"
            });
            setNewChartConfig(container, {config: pieChart.config})
        }

        if (chartType === CHART_TYPES.TOTAL && currentChart !== CHART_TYPES.TOTAL && messages.total.value > 0) {
            newState.currentChart = CHART_TYPES.TOTAL;
            newState.currentChartType = "total";
            const pieChart: any = getPieChartConfig(messages.total.context, {
                enabled: false,
                innerSize: "55%"
            });
            setNewChartConfig(container, {config: pieChart.config})
        }
        this.setState(newState);
    };

    render(): JSX.Element {
        const {ranges, startDate, endDate, request: {refresh}, messages, currentChart, currentChartType} = this.state;
        const {regionCode, goBack, regionCodes} = this.props;

        return (

            <div className="box-shadow r-3x bg-white m-t-md" id="messages-stats-by-country">
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">

                            {
                                regionCode ? <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                    <div className="flex-start-center">
                                        <button
                                            className="btn btn-default m-r-sm"
                                            onClick={goBack}
                                        ><i className="fa fa-arrow-left m-r-xs"/>Messages
                                        </button>
                                        <div className="flex-start-center">
                                            <span className="flag"><ReactCountryFlag
                                                code={regionCode}
                                                svg={true}
                                            /></span>
                                            <span className="m-l-sm font-semi-bold text-lg">{regionCodes && regionCodes[regionCode] && regionCodes[regionCode].label}</span>
                                        </div>
                                    </div>
                                </div> : <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                    <span className="text-lg padder-t-5 block">Messages by Types</span>
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
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <div className="flex">
                                    <div
                                        className="m-r-lg wrapper-sm cursor-pointer r-2x"
                                        data-chart-type={CHART_TYPES.TOTAL}
                                        style={{backgroundColor: currentChart === CHART_TYPES.TOTAL ? "#f4f5f5" : "inherit"}}
                                        onClick={this.handleMessagesByTypesChange}
                                    >
                                        <span className="block text-xsl">{numeral(messages.total.value).format("0,0")}</span>
                                        <span>Total</span>
                                    </div>
                                    <div
                                        className="m-r-lg wrapper-sm cursor-pointer r-2x"
                                        data-chart-type={CHART_TYPES.SINGLE}
                                        style={{backgroundColor: currentChart === CHART_TYPES.SINGLE ? "#f4f5f5" : "inherit"}}
                                        onClick={this.handleMessagesByTypesChange}
                                    >
                                        <span className="block text-xsl">{numeral(messages.singleChats.value).format("0,0") || 0}</span>
                                        <span>In single chats</span>
                                    </div>
                                    <div
                                        className="wrapper-sm cursor-pointer r-2x"
                                        data-chart-type={CHART_TYPES.GROUP}
                                        style={{backgroundColor: currentChart === CHART_TYPES.GROUP ? "#f4f5f5" : "inherit"}}
                                        onClick={this.handleMessagesByTypesChange}
                                    >
                                        <span className="block text-xsl">{numeral(messages.groupChats.value).format("0,0") || 0}</span>
                                        <span>In group chats</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                <div
                                    id={`${regionCode ? `${regionCode}-` : ""}messages-types-chart`}
                                    style={{height: `${PIE_CHART_HEIGHT}px`}}
                                />
                            </div>
                            <div className="col-lg-8 col-md-8 col-sm-12 col-xs-12">
                                <div style={{minHeight: `${PIE_CHART_HEIGHT}px`, paddingTop: "30px"}}>
                                    <div className="container-fluid">
                                        <div className="row">
                                            {
                                                messages[currentChartType].context.map((item, index) => {
                                                    return (
                                                        <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12" key={index}>
                                                            <div className="chart-label">
                                                                <span className="flex">
                                                                    <span style={{color: CHART_COLORS[index]}} className="dot">&#9679;</span>
                                                                    <span>{item.value} ({(item.value * 100 / messages[currentChartType].value).toFixed(2)}%)</span>
                                                                </span>
                                                                <span className="chart-label-type">{item.name}</span>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>

                                    </div>

                                </div>
                            </div>
                        </div>

                        {regionCode &&
                        <ByDates
                            regionCode={regionCode}
                            startDate={startDate.format("YYYY-MM-DD")}
                            endDate={endDate.format("YYYY-MM-DD")}
                            isRefresh={refresh}
                        />}

                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ByTypes);
