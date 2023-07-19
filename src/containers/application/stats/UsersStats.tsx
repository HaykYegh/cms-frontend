"use strict";

import axios from "axios";
import * as React from "react";
import * as moment from "moment";
import Select from "react-select";
import {connect} from "react-redux";
import Table from "react-bootstrap/es/Table";
import FormGroup from "react-bootstrap/es/FormGroup";
import * as ReactHighmaps from "react-highcharts/ReactHighmaps";
import * as DatetimeRangePicker from "library/react-bootstrap-datetimerangepicker/lib/index";

import {LINE_CHART_HEIGHT, MAP_CHART_HEIGHT, PAGINATION_LIMIT, REGISTRATION_TYPES} from "configs/constants";
import {getRegisteredUsersByCountry, getUsersInCountries, getUsersByCountry} from "ajaxRequests/users";
import {compare, dateTimePickerRanges, pickerLabel} from "helpers/DataHelper";
import {selectMenuStyles, showNotification} from "helpers/PageHelper";
import {getSplineChartConfig} from "helpers/ChartHelper";
import {setNewChartConfig} from "helpers/DomHelper";
import Paginate from "components/Common/Paginate";
import Loading from "components/Common/Loading";
import {getMapConfig} from "helpers/MapHelper";
import {ISelect} from "services/interface";
import selector from "services/selector";

interface IUsersStatsState {
    offset: number,
    request: {
        loading: boolean,
        refresh: boolean,
        fetchData: boolean,
        isUpdate: boolean
    },
    startDate: moment.Moment,
    endDate: moment.Moment,
    ranges: any,
    usersInCountries: Array<any>,
    currentUsersInCountries: Array<any>,
    totalUsers: Array<any>,
    _countries: Array<any>,
    chartReFlow: boolean,
    currentPage: number,
    totalPages: number,
    registrationTypes: Array<any>,
    selectedRegistrationType: any,
}

class UsersStats extends React.Component<any, IUsersStatsState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        const registrationTypes: any[] = Object.keys(REGISTRATION_TYPES).map((item, index) => {
            return {
                value: item,
                label: REGISTRATION_TYPES[item],
                id: index,
            }
        });
        this.state = {
            offset: 0,
            request: {
                loading: true,
                refresh: false,
                fetchData: true,
                isUpdate: false
            },
            startDate: moment().subtract(6, "days"),
            endDate: moment(),
            ranges: dateTimePickerRanges(),
            usersInCountries: [],
            currentUsersInCountries: [],
            totalUsers: [],
            _countries: [],
            chartReFlow: true,
            currentPage: null,
            totalPages: null,
            registrationTypes,
            selectedRegistrationType: null,
        };
    };

    componentDidMount(): void {
        const newState: IUsersStatsState = {...this.state};
        this.initRequests(newState);
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    initRequests = (state: IUsersStatsState, request?: Array<Promise<any>>): void => {
        const {request: {fetchData}, startDate, endDate} = state;
        setNewChartConfig("users-chart", {type: "area-spline"}, true);
        const formattedStartDate: string = startDate.format("YYYY-MM-DD");
        const formattedEndDate: string = endDate.format("YYYY-MM-DD");
        const registrationType: string = state.selectedRegistrationType && state.selectedRegistrationType.value || "ALL";
        const initialRequests: Array<Promise<any>> = [
            getUsersInCountries(formattedStartDate, formattedEndDate, registrationType),
            getRegisteredUsersByCountry(formattedStartDate, formattedEndDate),
        ];
        let allRequests: Array<Promise<any>> = [...initialRequests];
        if (request && request.length > 0) {
            allRequests = [...initialRequests, ...request];
        }

        axios.all(allRequests).then(axios.spread((usersInCountries, totalUsers, ...filteredUsers) => {

                if (!usersInCountries.data.err) {

                    state.usersInCountries = usersInCountries.data.result;
                    state.currentUsersInCountries = state.usersInCountries.slice(0, PAGINATION_LIMIT);

                    if (state.usersInCountries.length > 1) {
                        state.usersInCountries = state.usersInCountries.sort(compare("registered_users_count"));
                    }

                    for (const item in state.usersInCountries) {
                        if (state.usersInCountries.hasOwnProperty(item)) {
                            state.usersInCountries[item].checked = false;
                            if (state._countries.length > 0) {
                                for (const country of state._countries) {
                                    if (state.usersInCountries[item].country_id === country.country_id) {
                                        state.usersInCountries[item].filtered = true;
                                    }
                                }
                            } else {
                                state.usersInCountries[item].filtered = false;
                            }
                        }
                    }
                    if (fetchData) {
                        state.request.isUpdate = true;
                    }
                    // } else {
                    //     showNotification("error", {
                    //         title: "You've got an error!",
                    //         description: "Cannot get users by countries for unknown reason",
                    //         timer: 3000,
                    //         hideProgress: true
                    //     });
                }

                if (!totalUsers.data.err) {
                    state.totalUsers = totalUsers.data.result;
                    // } else {
                    //     showNotification("error", {
                    //         title: "You've got an error!",
                    //         description: "Cannot get total users by country",
                    //         timer: 3000
                    //     });
                }

                if (filteredUsers) {
                    for (const item in filteredUsers) {
                        if (filteredUsers.hasOwnProperty(item)) {
                            if (!filteredUsers[item].data.err) {
                                for (const country of state._countries) {
                                    for (const userInCountry of state.usersInCountries) {
                                        if (userInCountry.country_id === country.country_id) {
                                            userInCountry.filtered = true;
                                        }
                                    }
                                }
                            }
                            // } else {
                            //     showNotification("error", {
                            //         title: "You've got an error!",
                            //         description: "Cannot get user by country",
                            //         timer: 3000
                            //     });
                        }
                    }
                }

                const lineConfig: any = getSplineChartConfig({Total: state.totalUsers}, {
                    startDate: formattedStartDate,
                    endDate: formattedEndDate
                });
                state.request.loading = false;
                state.request.refresh = false;
                state.request.fetchData = false;
                if (this.componentState) {
                    setNewChartConfig("users-chart", {config: lineConfig.config});
                    this.setState(state);
                }

            }
        )).catch(error => {
            console.log(error);
            // state.request.loading = false;
            state.request.refresh = false;
            state.request.fetchData = false;
            const lineConfig: any = getSplineChartConfig({Total: []}, {
                startDate: formattedStartDate,
                endDate: formattedEndDate
            });
            // setNewChartConfig("users-chart", {config: lineConfig.config});
            this.setState(state);
        });
    };

    handlePickerApply = (e: React.MouseEvent<HTMLInputElement>, picker: any): void => {
        e.preventDefault();
        const {usersInCountries} = this.state;
        const newState: IUsersStatsState = {...this.state};
        const startDate: any = picker.startDate;
        const endDate: any = picker.endDate;
        newState.startDate = startDate;
        newState.endDate = endDate;
        newState.request.fetchData = true;
        this.setState(newState);
        const filteredCountriesRequests: Array<any> = usersInCountries.filter(item => item.checked === true).map(item => {
            return getUsersByCountry(startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"), item.country_id);
        });
        this.initRequests(newState, filteredCountriesRequests);
    };

    handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
    };

    handleCountryChange = (value: ISelect): void => {
        const newState: IUsersStatsState = {...this.state};
        const selection: any = value;
        const selectedCountries: Array<number> = [];

        for (const item of selection) {
            selectedCountries.push(item.country_id);
        }

        for (const item of newState.usersInCountries) {
            item.filtered = selectedCountries.includes(item.country_id);
        }
        newState._countries = selection;
        this.setState(newState);
    };

    handleRegistrationTypeChange = (value: ISelect): void => {
        const newState: IUsersStatsState = {...this.state};
        newState.selectedRegistrationType = value;
        newState.request.fetchData = true;
        this.setState(newState);
        this.initRequests(newState);
    };

    handleRefreshData = (e: React.MouseEvent<HTMLSpanElement>): void => {
        e.preventDefault();
        const {usersInCountries, startDate, endDate, request: {refresh}} = this.state;
        if (refresh) {
            return;
        }
        const newState: IUsersStatsState = {...this.state};
        newState.request.refresh = true;
        newState.request.fetchData = true;
        this.setState(newState);
        const filteredCountriesRequests: Array<any> = usersInCountries.filter(item => item.checked === true).map(item => {
            return getUsersByCountry(startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"), item.country_id);
        });
        this.initRequests(newState, filteredCountriesRequests);

    };

    handlePageChanged = (data: any) => {
        const {usersInCountries} = this.state;
        const newState: IUsersStatsState = {...this.state};
        const {currentPage, totalPages, pageLimit} = data;
        const offset: number = (currentPage - 1) * pageLimit;
        const currentUsersInCountries: any = usersInCountries.slice(offset, offset + pageLimit);

        newState.currentPage = currentPage;
        newState.currentUsersInCountries = currentUsersInCountries;
        newState.totalPages = totalPages;
        newState.request.isUpdate = false;
        this.setState(newState);
    };

    render(): JSX.Element {
        const {
            _countries, request: {loading, refresh, fetchData, isUpdate}, usersInCountries,
            startDate, endDate, ranges, currentUsersInCountries, currentPage, selectedRegistrationType, registrationTypes
        } = this.state;
        const {countries} = this.props;
        const totalUsersInCountries: any = {
            country_name: "Total",
            registered_users_count: 0,
            not_verified_users_count: 0,
            percentage: 0
        };
        const map: any = {config: {}, empty: true};

        let currentUsers: any = [];
        if (_countries.length > 0) {
            currentUsers = usersInCountries.filter(item => {
                return item.filtered;
            });
        } else {
            currentUsers = currentUsersInCountries.filter(item => {
                return !item.filtered;
            });
        }

        for (const item of usersInCountries) {
            totalUsersInCountries.registered_users_count += parseInt(item.registered_users_count);
            totalUsersInCountries.not_verified_users_count += parseInt(item.not_verified_users_count);
            item.not_verified_users_count = +item.not_verified_users_count;
            item.registered_users_count = +item.registered_users_count;
        }

        if (totalUsersInCountries.not_verified_users_count !== 0) {
            totalUsersInCountries.percentage = (
                parseInt(totalUsersInCountries.not_verified_users_count) * 100 /
                (parseInt(totalUsersInCountries.registered_users_count) + parseInt(totalUsersInCountries.not_verified_users_count))
            );
        }

        if (usersInCountries && usersInCountries.length > 0) {
            const {config, empty} = getMapConfig(usersInCountries, {
                height: MAP_CHART_HEIGHT
            });
            map.config = config;
            map.empty = empty;
        }

        return (
            <div className="bg-white box-shadow content-wrapper r-3x m-t-md">
                <div className="container-fluid">
                    <div className="row m-b-md">
                        <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                            <span className="text-lg padder-t-3 padder-b-3 block">User registrations</span>
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12">
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
                                        type="text"
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
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12 padder-t-3 text-right">
                            <button
                                className="btn btn-default btn-sm"
                                onClick={this.handleRefreshData}
                            >
                                <i className={`fa ${refresh ? "fa-spin" : ""} fa-repeat m-r-xs`}/>
                                {/*<span className={`icon-reload${refresh ? " fa-spin" : ""}`}/>*/}
                                Refresh
                            </button>
                        </div>
                    </div>
                    <div className={`${fetchData ? "inactive " : ""}row m-b-lg`}>
                        {
                            loading ? <Loading/> :
                                <div>
                                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                                        <div className="row">
                                            <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                                                <FormGroup>
                                                    <Select
                                                        isMulti={true}
                                                        closeMenuOnSelect={true}
                                                        styles={selectMenuStyles}
                                                        isDisabled={false}
                                                        isClearable={true}
                                                        name="countries"
                                                        placeholder="Filter by country..."
                                                        options={countries}
                                                        value={_countries}
                                                        onChange={this.handleCountryChange}
                                                    />
                                                </FormGroup>
                                            </div>
                                            <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                                                <FormGroup>
                                                    <Select
                                                        isMulti={false}
                                                        closeMenuOnSelect={true}
                                                        styles={selectMenuStyles}
                                                        isDisabled={false}
                                                        name="registrationTypes"
                                                        placeholder="Filter by registration type..."
                                                        options={registrationTypes}
                                                        value={selectedRegistrationType}
                                                        // defaultValue={registrationTypes[0]}
                                                        onChange={this.handleRegistrationTypeChange}
                                                    />
                                                </FormGroup>
                                            </div>
                                        </div>
                                        <Table
                                            hover={true}
                                            condensed={true}
                                            responsive={true}
                                        >
                                            <thead>
                                            <tr>
                                                <th/>
                                                <th>Country</th>
                                                <th>Registered</th>
                                                <th>Not verified</th>
                                                <th>Fail %</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td/>
                                                <td>Total</td>
                                                <td>{totalUsersInCountries.registered_users_count}</td>
                                                <td>{totalUsersInCountries.not_verified_users_count}</td>
                                                <td>{totalUsersInCountries.percentage === 0 ? "0" : totalUsersInCountries.percentage.toFixed(1)}</td>
                                            </tr>
                                            {
                                                currentUsers.length === 0 &&
                                                <tr>
                                                    <td colSpan={5}>No results</td>
                                                </tr>
                                            }
                                            {
                                                currentUsers.map((item, i) => {
                                                    const N: number = (_countries.length > 0) ? (i + 1) : (currentPage - 1) * PAGINATION_LIMIT + i + 1;
                                                    let percentage: number = 0;
                                                    if (parseInt(item.not_verified_users_count) !== 0) {
                                                        percentage = (
                                                            parseInt(item.not_verified_users_count) * 100 /
                                                            (parseInt(item.registered_users_count) + parseInt(item.not_verified_users_count))
                                                        );
                                                        percentage = percentage % 2 === 0 ? percentage : parseInt(percentage.toFixed(1));
                                                    }
                                                    return (
                                                        <tr key={item.country_id}>
                                                            <td>{N}</td>
                                                            <td>{item.country_name}</td>
                                                            <td>{item.registered_users_count}</td>
                                                            <td>{item.not_verified_users_count}</td>
                                                            <td>{percentage}</td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </Table>
                                        {
                                            (usersInCountries.length > 0 && _countries.length === 0) &&
                                            <Paginate
                                                totalRecords={usersInCountries.length}
                                                pageLimit={PAGINATION_LIMIT}
                                                pageNeighbours={1}
                                                onPageChanged={this.handlePageChanged}
                                                isUpdate={isUpdate}
                                            />
                                        }
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                                        <div id="map-chart">{!map.empty && <ReactHighmaps config={map.config} ref="container" neverReflow={true}/>}</div>
                                    </div>
                                </div>
                        }
                    </div>
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                            <div id="users-chart" style={{height: LINE_CHART_HEIGHT}}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(UsersStats);
