"use strict";

import moment from "moment";
import * as React from "react";
import Select from "react-select";
import * as numeral from "numeral";
import {AxiosResponse} from "axios";
import {connect} from "react-redux";
import format from "date-fns/format";
import isEmpty from "lodash/isEmpty";
import Table from "react-bootstrap/es/Table";
import {ToastContainer} from "react-toastify";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";
import * as DatetimeRangePicker from "library/react-bootstrap-datetimerangepicker/lib/index";

import {pickerLabel, dateTimePickerRanges, decrypt, getCurrentOffset, promiseSelectOptions} from "helpers/DataHelper";
import {selectMenuStyles, showNotification} from "helpers/PageHelper";
import {CALL_TYPE, PAGE_NAME} from "configs/constants";
import Pagination from "components/Common/Pagination";
import Loading from "components/Common/Loading";
import {getOutCalls, getOutCallsCount} from "ajaxRequests/calls";
import {ISelect} from "services/interface";
import selector from "services/selector";
import {getUserGroups} from "ajaxRequests/users";

interface IOutCallsState {
    initialLoading: boolean,
    offset: number,
    limit: number,
    ranges: any,
    initialFilters: {
        registration: {
            startDate: any,
            endDate: any,
        },
        calleeCountry: any,
        toCountry: any,
        fromCountry: any,
        callType: any,
        username: any,
        defaultCurrency?: string,
        userGroup: any,
        sipAddress: string,
        voipModuleAddress: string
    },
    calls: {
        total: any,
        records: any[],
        callType: string
    },
    callTypes: any[],
    request: {
        reset: {
            disabled: boolean,
            processing: boolean
        },
        search: {
            disabled: boolean,
            processing: boolean
        },
        fetchCount: boolean,
        loading: boolean,
        pagination: boolean,
    },
    userGroups: any[],
}

class Index extends React.Component<any, IOutCallsState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        const callTypes: any[] = Object.keys(CALL_TYPE).map(item => {
            return {
                value: item,
                label: CALL_TYPE[item]
            }
        });
        const user: any = JSON.parse(decrypt(localStorage.getItem("user")));
        this.state = {
            initialLoading: true,
            offset: 0,
            limit: 20,
            ranges: dateTimePickerRanges(),
            calls: {
                total: {},
                records: [],
                callType: CALL_TYPE.ALL
            },
            initialFilters: {
                registration: {
                    startDate: moment().subtract(6, "days"),
                    endDate: moment(),
                },
                calleeCountry: "",
                toCountry: "",
                fromCountry: "",
                callType: null,
                username: "",
                defaultCurrency: user.currency || "USD",
                userGroup: null,
                sipAddress: "",
                voipModuleAddress: ""
            },
            callTypes,
            request: {
                reset: {
                    disabled: true,
                    processing: false
                },
                search: {
                    disabled: true,
                    processing: false
                },
                fetchCount: true,
                loading: false,
                pagination: false,
            },
            userGroups: [],
        };
    }

    componentDidMount(): void {
        document.title = PAGE_NAME["/calls"];
        const newState: IOutCallsState = {...this.state};
        this.initRequests(newState);
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    initRequests: any = (state: IOutCallsState, offset: number = 0, isSearch: boolean = false, isReset: boolean = false, isPaging: boolean = false): void => {
        const {limit, initialFilters: {registration, fromCountry, toCountry, username, defaultCurrency, callType, userGroup, sipAddress, voipModuleAddress}} = state;

        const searchedData: any = {
            offset,
            limit,
            startDate: registration.startDate.format("YYYY-MM-DD"),
            endDate: registration.endDate.format("YYYY-MM-DD"),
            currency: defaultCurrency,
            callType: (callType && callType.value) || "ALL",
            username: username || "",
            fromCountry: fromCountry === "" ? "" : fromCountry.region_code,
            toCountry: toCountry === "" ? "" : toCountry.region_code,
            userGroupId: userGroup && userGroup.value || null,
            sipAddress,
            voipModuleAddress
        };

        if (!isPaging) {
            getUserGroups(0, 1000).then(({data}: AxiosResponse) => {

                if (data.err) {
                    throw new Error(JSON.stringify(data));
                }

                state.userGroups = data.result.map(item => {
                    return {
                        value: item.userGroupId,
                        label: item.name
                    }
                }) || [];

                if (this.componentState) {
                    this.setState(state);
                }

            }).catch(e => {
                console.log(e);
                if (this.componentState) {
                    showNotification("error", {
                        title: "You got an error!",
                        description: "Cannot get user groups for unknown reason"
                    });
                }
            });

            getOutCallsCount(searchedData).then(({data}: AxiosResponse) => {
                if (data.err) {
                    throw new Error(JSON.stringify(data));
                }

                state.calls.total = data.result;
                state.request.fetchCount = false;
                state.calls.callType = (callType && callType.value) || CALL_TYPE.ALL;
                if (this.componentState) {
                    this.setState(state);
                }

            }).catch(err => {
                console.log(err);
                state.request.fetchCount = false;
                if (this.componentState) {
                    this.setState(state);
                    showNotification("error", {
                        title: "You got an error!",
                        description: "Can not get calls count",
                        timer: 3000
                    });
                }

            });
        }

        getOutCalls(searchedData).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            state.calls.records = data.result || [];
            state.calls.callType = (callType && callType.value) || CALL_TYPE.ALL;

            state.initialLoading = false;
            state.request.loading = false;

            if (isSearch) {
                state.request.search.processing = false;
                state.request.reset.disabled = false;
                state.offset = 0;
            }

            if (isReset) {
                state.request.reset.processing = false;
                state.request.reset.disabled = true;
                state.offset = 0;
            }

            if (isPaging) {
                state.offset = offset;
                state.request.pagination = false;
            }

            if (this.componentState) {
                this.setState(state);
            }

        }).catch(err => {
            console.log(err);
            state.initialLoading = false;
            state.request.loading = false;
            // state.request.fetchCount = false;
            if (isSearch) {
                state.request.search.processing = false;
            }

            if (isReset) {
                state.request.reset.processing = false;
            }

            if (isPaging) {
                state.request.pagination = false;
            }
            if (this.componentState) {
                this.setState(state);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Error during getting calls",
                    timer: 3000
                });
            }

        });
    };

    handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
    };

    handlePickerApply = (e: React.MouseEvent<HTMLInputElement>, picker: any): void => {
        e.preventDefault();
        const newState: IOutCallsState = {...this.state};
        newState.initialFilters.registration.startDate = picker.startDate;
        newState.initialFilters.registration.endDate = picker.endDate;
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleFromCountryChange = (value: ISelect): void => {
        const newState: IOutCallsState = {...this.state};
        newState.initialFilters.fromCountry = value;
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleToCountryChange = (value: ISelect): void => {
        const newState: IOutCallsState = {...this.state};
        newState.initialFilters.toCountry = value;
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleCallTypeChange = (value: ISelect): void => {
        const newState: IOutCallsState = {...this.state};
        newState.initialFilters.callType = value;
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IOutCallsState = {...this.state};
        newState.initialFilters[name] = value;
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleUserGroupChange = (value: ISelect): void => {
        const newState: IOutCallsState = {...this.state};
        newState.initialFilters.userGroup = value;
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleToggleDisabled = (state: IOutCallsState): void => {
        state.request.search.disabled = false;
    };

    handleListChange = (e: React.MouseEvent<HTMLInputElement>): void => {
        const {offset} = this.state;
        const newState: IOutCallsState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.pagination = true;
        newState.request.loading = true;
        this.setState(newState);
        this.initRequests(newState, currentOffset, false, false, true);
    };

    handleSearch = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const newState: IOutCallsState = {...this.state};
        newState.request.search.processing = true;
        newState.request.loading = true;
        newState.request.fetchCount = true;
        this.setState(newState);
        this.initRequests(newState, 0, true);
    };

    handleReset = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const newState: IOutCallsState = {...this.state};

        newState.initialFilters = {
            registration: {
                startDate: moment().subtract(6, "days"),
                endDate: moment(),
            },
            calleeCountry: "",
            toCountry: "",
            fromCountry: "",
            callType: null,
            username: "",
            userGroup: null,
            sipAddress: "",
            voipModuleAddress: ""
        };
        newState.request.reset.processing = true;
        newState.request.loading = true;
        newState.request.fetchCount = true;
        this.setState(newState);
        this.initRequests(newState, 0, false, true);
    };

    render(): JSX.Element {
        const {
            ranges, offset, calls, limit, initialLoading,
            initialFilters: {registration: {endDate, startDate}, username, fromCountry, toCountry, defaultCurrency, callType, userGroup, sipAddress, voipModuleAddress}, callTypes,
            request: {search, reset, pagination, fetchCount, loading}, userGroups
        }: IOutCallsState = this.state;
        const {regionCodes, countries} = this.props;
        return (
            <div className="box-shadow r-3x bg-white">
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl padder-t-3">{PAGE_NAME["/calls"]}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <hr/>

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="registration-date">Date &amp; Time</ControlLabel>
                                    <DatetimeRangePicker
                                        name="date"
                                        ranges={ranges}
                                        applyClass="btn-info"
                                        onApply={this.handlePickerApply}
                                        autoUpdateInput={true}
                                        startDate={startDate}
                                        endDate={endDate}
                                    >
                                        <div className="input-group">
                                            <input
                                                className="form-control text-lg"
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
                                </FormGroup>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="fromCountry">Phone Number Country</ControlLabel>
                                    <Select
                                        id="fromCountry"
                                        name="fromCountry"
                                        styles={selectMenuStyles}
                                        isMulti={false}
                                        closeMenuOnSelect={true}
                                        isDisabled={false}
                                        onChange={this.handleFromCountryChange}
                                        value={fromCountry}
                                        options={countries}
                                    />
                                </FormGroup>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="toCountry">Country Called</ControlLabel>
                                    <Select
                                        id="toCountry"
                                        name="toCountry"
                                        styles={selectMenuStyles}
                                        isMulti={false}
                                        closeMenuOnSelect={true}
                                        isDisabled={false}
                                        onChange={this.handleToCountryChange}
                                        value={toCountry}
                                        options={countries}
                                    />
                                </FormGroup>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="callType">Call Type</ControlLabel>
                                    <Select
                                        id="callType"
                                        name="callType"
                                        styles={selectMenuStyles}
                                        closeMenuOnSelect={true}
                                        options={callTypes}
                                        defaultValue={callTypes[0]}
                                        onChange={this.handleCallTypeChange}
                                    />
                                </FormGroup>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="username">Username</ControlLabel>
                                    <FormControl
                                        id="username"
                                        type="number"
                                        min="1"
                                        name="username"
                                        placeholder="Username"
                                        value={username}
                                        onChange={this.handleChange}
                                    />
                                </FormGroup>
                            </div>
                            {/*<div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">*/}
                            {/*    <FormGroup>*/}
                            {/*        <ControlLabel htmlFor="username">SIP Address</ControlLabel>*/}
                            {/*        <FormControl*/}
                            {/*            id="sipAddress"*/}
                            {/*            type="text"*/}
                            {/*            name="sipAddress"*/}
                            {/*            placeholder="SIP Address"*/}
                            {/*            value={sipAddress}*/}
                            {/*            onChange={this.handleChange}*/}
                            {/*        />*/}
                            {/*    </FormGroup>*/}
                            {/*</div>*/}
                            {/*<div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">*/}
                            {/*    <FormGroup>*/}
                            {/*        <ControlLabel htmlFor="username">Voip Module Address</ControlLabel>*/}
                            {/*        <FormControl*/}
                            {/*            id="voipModuleAddress"*/}
                            {/*            type="text"*/}
                            {/*            name="voipModuleAddress"*/}
                            {/*            placeholder="Voip Module Address"*/}
                            {/*            value={voipModuleAddress}*/}
                            {/*            onChange={this.handleChange}*/}
                            {/*        />*/}
                            {/*    </FormGroup>*/}
                            {/*</div>*/}
                            {/*<div className="col-lg-4 col-md-6 col-sm-12 col-xs-12">*/}
                            {/*<FormGroup>*/}
                            {/*<ControlLabel htmlFor="userGroup">User Group</ControlLabel>*/}
                            {/*<Select*/}
                            {/*id="userGroup"*/}
                            {/*name="userGroup"*/}
                            {/*styles={selectMenuStyles}*/}
                            {/*closeMenuOnSelect={true}*/}
                            {/*isClearable={true}*/}
                            {/*options={userGroups}*/}
                            {/*value={userGroup}*/}
                            {/*onChange={this.handleUserGroupChange}*/}
                            {/*/>*/}
                            {/*</FormGroup>*/}
                            {/*</div>*/}
                        </div>
                    </div>
                </div>

                <hr/>

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                <span className="block text-xl text-line-chart padder-t-8">
                                    {(initialLoading || fetchCount) ? <Loading isSmall={true}/> :
                                        <span>{numeral(calls.total.amount).format("0.00")} {defaultCurrency} / {numeral(calls.total.duration).format("0.00")} min</span>}
                                </span>
                                <span className="block text-line-chart">{calls.callType}</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12 text-right">
                                <div className="padder-t-16">
                                    <button
                                        disabled={reset.disabled || reset.processing}
                                        onClick={this.handleReset}
                                        className="btn btn-default m-l-sm"
                                    >Reset{reset.processing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                    </button>
                                    <button
                                        disabled={search.processing || initialLoading}
                                        onClick={this.handleSearch}
                                        className="btn btn-info m-l-sm"
                                    >Search{search.processing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {initialLoading ? <Loading/> :
                    <div className={`${loading ? "inactive" : ""}`}>
                        <Table
                            hover={true}
                            condensed={true}
                            responsive={true}
                        >
                            <thead>
                            <tr>
                                <th/>
                                <th>Date &amp; Time</th>
                                <th>Phone Number</th>
                                <th>Country Called</th>
                                <th>Direction Name</th>
                                <th>Duration (sec)</th>
                                <th>Amount</th>
                                <th>Currency</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                (calls.records && calls.records.length === 0) && <tr>
                                    <td colSpan={9}>
                                        <div className="empty">No results found.</div>
                                    </td>
                                </tr>}

                            {
                                calls.records && calls.records.map((record, index) => {
                                    const N: number = offset * limit + index + 1;
                                    return (
                                        <tr key={record.id}>
                                            <td>{N}</td>
                                            <td>{format((Number(record.eventDate)  - Number(record.quantity * 60000)) , "DD MM YYYY hh:mm A")} - {format(record.eventDate, "DD MM YYYY hh:mm A")} </td>
                                            <td>{record.username.replace(process.env.APP_PREFIX, "")}</td>
                                            <td>{!isEmpty(regionCodes) && regionCodes[record.countryCode] && regionCodes[record.countryCode].label}</td>
                                            <td>{record.description}</td>
                                            <td>
                                                {
                                                    numeral(record.quantity * 60).format("0")
                                                }
                                            </td>
                                            <td>
                                                {
                                                    (record.amount * 100) % 100 === 0 ? record.amount :
                                                        numeral(record.amount).format("0.0000")
                                                }
                                            </td>
                                            <td>
                                                {record.currencyCode || "Not supported"}
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                            </tbody>
                        </Table>
                    </div>}

                <div className="content-wrapper">
                    <div className="container-fluid">
                        {
                            !initialLoading && calls.total.count > limit &&
                            <div className="row">
                                <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6 ">
                                    <span className="text-xs">{`${calls.total.count} entries`}</span>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                    <Pagination
                                        offset={offset}
                                        limit={limit}
                                        length={calls.records.length}
                                        count={calls.total.count}
                                        disabled={pagination}
                                        callback={promiseSelectOptions(this.handleListChange)}
                                    />
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        )

    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Index);
