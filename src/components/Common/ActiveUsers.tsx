"use strict";

import * as React from "react";
import * as moment from "moment";
import {AxiosResponse} from "axios";
import Table from "react-bootstrap/es/Table";

import {getCurrentOffset, monthlyDateTimePickerRanges, pickerLabel} from "helpers/DataHelper";
import * as DatetimeRangePicker from "library/react-bootstrap-datetimerangepicker/lib/index";
import {getActiveUsersCount, getActiveUsers} from "ajaxRequests/stats";
import Pagination from "components/Common/Pagination";
import {showNotification} from "helpers/PageHelper";
import Loading from "components/Common/Loading";

interface IActiveUsersState {
    isInitialLoading: boolean,
    count: number,
    offset: number,
    limit: number,
    request: {
        isLoading: boolean,
        isRefreshing: boolean,
        isFetchingData: boolean,
        isPaging: boolean
    },
    startDate: any,
    endDate: any,
    ranges: any,
    activeUsers: any[]
}

interface IActiveUsersProps {
    isStatsPage?: boolean;
    networkId?: any,
    networkName?: string
}

class ActiveUsers extends React.Component<IActiveUsersProps, IActiveUsersState> {

    isComponentMounted: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            isInitialLoading: true,
            count: 0,
            offset: 0,
            limit: 10,
            request: {
                isLoading: true,
                isRefreshing: false,
                isFetchingData: true,
                isPaging: false
            },
            startDate: moment().startOf("month"),
            endDate: moment().endOf("month"),
            ranges: monthlyDateTimePickerRanges(),
            activeUsers: [],
        }
    }

    componentDidMount(): void {
        const {offset} = this.state;
        const newState: IActiveUsersState = {...this.state};
        this.initRequests(offset, newState);
    }

    initRequests = (offset: number, state: IActiveUsersState, isPaging: boolean = false): void => {
        const {limit, isInitialLoading, startDate, endDate, request: {isFetchingData}} = state;
        const {networkId} = this.props;

        getActiveUsers({
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD"),
            offset,
            limit,
            networkId
        }).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            state.activeUsers = data.result;
            state.isInitialLoading = false;
            state.request.isFetchingData = false;
            state.request.isRefreshing = false;
            state.request.isPaging = false;
            state.request.isLoading = false;
            state.offset = offset;

            if (this.isComponentMounted) {
                this.setState(state);
            }
        }).catch(e => {
            console.log(e);
            if (isInitialLoading) {
                state.isInitialLoading = false;
            }
            if (isFetchingData) {
                state.request.isFetchingData = false;
            }
            if (isPaging) {
                state.request.isPaging = false;
            }
            if (this.isComponentMounted) {
                this.setState(state);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get active users",
                    timer: 3000,
                });
            }
        });

        getActiveUsersCount({
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD"),
            networkId
        }).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            state.count = data.result && data.result.count || 0;

            if (this.isComponentMounted) {
                this.setState(state);
            }
        }).catch(e => {
            console.log(e);
            if (this.isComponentMounted) {
                this.setState(state);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get active users count",
                    timer: 3000,
                });
            }
        })
    };

    handlePickerApply = (e: React.MouseEvent<HTMLInputElement>, picker: any): void => {
        e.preventDefault();
        const {offset} = this.state;
        const newState: IActiveUsersState = {...this.state};
        newState.startDate = picker.startDate;
        newState.endDate = picker.endDate;
        newState.request.isFetchingData = true;
        this.setState(newState);
        this.initRequests(offset, newState);
    };

    handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
    };

    handleRefreshData = (e: React.MouseEvent<HTMLSpanElement>): void => {
        e.preventDefault();
        const {request: {isRefreshing}} = this.state;
        if (isRefreshing) {
            return;
        }
        const newState: IActiveUsersState = {...this.state};
        newState.request.isRefreshing = true;
        newState.request.isFetchingData = true;
        this.setState(newState);
        this.initRequests(0, newState, true);
    };

    handleListChange = (e: React.MouseEvent<HTMLInputElement>): void => {
        const {offset} = this.state;
        const currentOffset: number = getCurrentOffset(offset, e);
        const newState: IActiveUsersState = {...this.state};
        newState.request.isPaging = true;
        newState.request.isLoading = true;
        newState.request.isFetchingData = true;
        this.setState(newState);
        this.initRequests(currentOffset, newState, true);
    };

    render(): JSX.Element {
        const {
            startDate, endDate, ranges, count, activeUsers, isInitialLoading, offset, limit,
            request: {isRefreshing, isFetchingData, isPaging, isLoading}
        } = this.state;

        const {isStatsPage, networkName} = this.props;

        return (
            <div className={`bg-white box-shadow r-3x${isStatsPage ? " m-t-md" : ""}`}>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                <span className="text-lg padder-t-5 block">{`Monthly Active Users (MAU)${!isStatsPage ? ` of ${networkName}` : ""}`}</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
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
                                    ><i className={`fa ${isRefreshing ? "fa-spin" : ""} fa-repeat m-r-xs`}/>Refresh
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
                                <div style={{backgroundColor: "inherit"}}>
                                    <span className="block text-xsl">{count}</span>
                                    <span>Number of Users</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className={`${isFetchingData ? "inactive " : ""}row`}>
                            {isInitialLoading ? <Loading/> :
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <Table
                                        hover={true}
                                        condensed={true}
                                        responsive={true}
                                    >
                                        <thead>
                                        <tr>
                                            <th/>
                                            <th>Number</th>
                                        </tr>
                                        </thead>
                                        <tbody>

                                        {
                                            activeUsers.length === 0 &&
                                            <tr>
                                                <td colSpan={2}>No result</td>
                                            </tr>
                                        }

                                        {
                                            activeUsers.length > 0 && activeUsers.map((item, i) => {

                                                const N: number = (offset * limit) + i + 1;
                                                return (
                                                    <tr key={N} className="cursor-pointer">
                                                        <td>{N}</td>
                                                        <td>{item.number}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                        </tbody>
                                    </Table>
                                </div>
                            }
                        </div>
                    </div>
                </div>

                <div className="content-wrapper">
                    <div className="container-fluid">
                        {
                            !isInitialLoading && count > 0 &&
                            <div className="row">
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                    <span className="text-sm padder-t-7 block">{`Showing ${activeUsers.length} of ${count}`}</span>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                    {
                                        <Pagination
                                            offset={offset}
                                            limit={limit}
                                            callback={this.handleListChange}
                                            count={count}
                                            length={activeUsers.length}
                                            disabled={isPaging}
                                        />
                                    }
                                </div>
                            </div>
                        }

                    </div>
                </div>
            </div>

        );
    }
}

export default ActiveUsers
