"use strict";

import * as React from "react";
import * as moment from "moment";
import Select from "react-select";
import {AxiosResponse} from "axios";
import {connect} from "react-redux";
import isEqual from "lodash/isEqual";
import Table from "react-bootstrap/es/Table";
import ReactCountryFlag from "react-country-flag";
import FormGroup from "react-bootstrap/es/FormGroup";
import * as DatetimeRangePicker from "library/react-bootstrap-datetimerangepicker/lib/index";

import {multiSelectMenuStyles, showNotification} from "helpers/PageHelper";
import ByCountries from "containers/application/stats/users/ByCountries";
import {getUsersByCountries, getUsersOverview} from "ajaxRequests/stats";
import {dateTimePickerRanges, pickerLabel} from "helpers/DataHelper";
import ByDates from "containers/application/stats/users/ByDates";
import Map from "containers/application/stats/users/Map";
import {PAGINATION_LIMIT} from "configs/constants";
import Paginate from "components/Common/Paginate";
import Loading from "components/Common/Loading";
import {ISelect} from "services/interface";
import selector from "services/selector";

interface IIndexState {
    request: {
        loading: boolean,
        refresh: boolean,
        fetchData: boolean,
        isUpdate: boolean
    },
    startDate: any,
    endDate: any,
    ranges: any,
    metricInfo: {
        records: any[],
        chartRecords: any[],
        overview: any,
    },
    currentMetricInfo: any[],
    currentPage: number,
    totalPages: number,
    _countries: any[],
    regionCode: any,
    platformInfo: {
        options: any[],
        selected: any[]
    }
}

class Index extends React.Component<any, IIndexState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            request: {
                loading: true,
                refresh: false,
                fetchData: true,
                isUpdate: false
            },
            startDate: moment().subtract(6, "days"),
            endDate: moment(),
            ranges: dateTimePickerRanges(),
            metricInfo: {
                records: [],
                chartRecords: [],
                overview: {}
            },
            currentMetricInfo: [],
            currentPage: null,
            totalPages: null,
            _countries: [],
            regionCode: null,
            platformInfo: {
                options: [{label: "All", value: "all"}, {label: "Ios", value: "ios"}, {label: "Android", value: "android"}],
                selected: []
            }
        }
    }

    componentDidMount(): void {
        const newState: IIndexState = {...this.state};
        if (window.innerWidth >= 1200) {
            const style: any = window.getComputedStyle(document.getElementById("users-stats"), null);
            const currentHeight: number = parseInt(style.getPropertyValue("height"));
            const element: any = document.getElementById("users-stats-by-country");
            if (parseInt(element.style.height) === currentHeight) {
                return;

            }
            element.style.height = currentHeight - 20 + "px";
        }
        this.initRequests(newState);
    }

    componentDidUpdate(prevProps: any, prevState: IIndexState): void {
        if (!isEqual(prevState.regionCode, this.state.regionCode)) {
            if (window.innerWidth >= 1200) {
                const style: any = window.getComputedStyle(document.getElementById("users-stats"), null);
                const currentHeight: number = parseInt(style.getPropertyValue("height"));
                const element: any = document.getElementById("users-stats-by-country");
                if (parseInt(element.style.height) === currentHeight) {
                    return;

                }
                element.style.height = currentHeight - 20 + "px";
            }
        }
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    initRequests = (state: IIndexState): void => {

        const {startDate, endDate} = state;

        getUsersByCountries({
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD")
        }).then(({data}: AxiosResponse) => {
            const newState: IIndexState = {...this.state};
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            newState.metricInfo.records = data.result || [];

            if (newState.metricInfo.records.length === 0) {
                newState.currentMetricInfo = []
            }

            const records: any = newState.metricInfo.records;
            for (const item of records) {
                if (newState._countries.length > 0) {
                    for (const country of newState._countries) {
                        if (item.regionCode === country.region_code) {
                            item.filtered = true;
                        }
                    }
                } else {
                    item.filtered = false;
                }
            }

            newState.request.loading = false;
            newState.request.refresh = false;
            newState.request.isUpdate = true;
            newState.request.fetchData = false;

            if (this.componentState) {
                this.setState(newState);
            }

        }).catch(e => {
            console.log(e);
            // state.request.loading = false;
            state.request.refresh = false;
            state.request.fetchData = false;
            state.currentMetricInfo = [];
            if (this.componentState) {
                this.setState(state);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get users statistics",
                    timer: 3000
                });
            }
        });

        getUsersOverview({
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD")
        }).then(({data}: AxiosResponse) => {
            const newState: IIndexState = {...this.state};
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            newState.metricInfo.overview = data.result || [];
            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(e => {
            console.log(e);
            // state.request.loading = false;
            if (this.componentState) {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get users statistics",
                    timer: 3000
                });
            }
        });

    };

    handlePickerApply = (e: React.MouseEvent<HTMLInputElement>, picker: any): void => {
        e.preventDefault();
        const newState: IIndexState = {...this.state};
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
        const newState: IIndexState = {...this.state};
        newState.request.refresh = true;
        newState.request.fetchData = true;
        this.setState(newState);
        this.initRequests(newState);
    };

    handlePageChanged = (data: any) => {
        const {metricInfo} = this.state;
        const newState: IIndexState = {...this.state};
        const {currentPage, totalPages, pageLimit} = data;
        const offset: number = (currentPage - 1) * pageLimit;
        const currentMetricInfo: any = metricInfo.records.filter((itemEl, el) => {
            if (newState.platformInfo.selected.length === 0 || newState.platformInfo.selected[0].value === "all") {
                return true
            } else {
                return itemEl.platforms[newState.platformInfo.selected[0].value]
            }
        }).slice(offset, offset + pageLimit);
        newState.currentPage = currentPage;
        newState.currentMetricInfo = currentMetricInfo;
        newState.totalPages = totalPages;
        newState.request.isUpdate = false;
        this.setState(newState);
    };

    handleCountryChange = (value: ISelect): void => {
        console.log("handleCountryChange")
        const newState: IIndexState = {...this.state};
        const selection: any = value;
        const selectedCountries: number[] = [];

        for (const item of selection) {
            selectedCountries.push(item.region_code);
        }

        for (const item of newState.metricInfo.records) {
            item.filtered = selectedCountries.includes(item.regionCode);
        }
        newState._countries = selection;
        this.setState(newState);
    };

    handlePlatformsChange = (value: ISelect) => {
        const newState: IIndexState = {...this.state};
        const selection: any = value;
        if (selection === null) {
            newState.platformInfo.selected = []
        } else {
            newState.platformInfo.selected = [selection];
        }
        // metricInfo.records = metricInfo.records.filter((itemEl, el) => {
        //     if (platformInfo.selected.length === 0 || platformInfo.selected[0].value === "all") {
        //         return true
        //     } else {
        //         return itemEl.platforms[platformInfo.selected[0].value]
        //     }
        // })
        // for (const item of newState.metricInfo.records) {
        //     item.filtered = false
        // }
        // for (const item of newState.metricInfo.records) {
        //     item.filtered = (item.platforms[newState.platformInfo.selected[0].value] !== null)
        // }
        this.setState(newState);
        this.handlePageChanged({currentPage: newState.currentPage, totalPages: newState.totalPages, pageLimit: PAGINATION_LIMIT});
        newState.request.isUpdate = true;
        this.setState(newState);
        console.log(newState.metricInfo.records, "selected")
    }

    handleViewUsersByCountry = (regionCode: string): void => {
        this.setState({regionCode});
    };

    handleGoBack = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        this.setState({regionCode: null});
    };

    render(): JSX.Element {
        const {
            startDate, endDate, ranges, _countries, currentPage, metricInfo, regionCode,
            request: {refresh, loading, fetchData, isUpdate}, currentMetricInfo, platformInfo
        } = this.state;
        const {regionCodes, countries} = this.props;

        // currentMetricInfo = currentMetricInfo.filter((itemEl, el) => {
        //     if (platformInfo.selected.length === 0 || platformInfo.selected[0].value === "all") {
        //         return true
        //     } else {
        //         return itemEl.platforms[platformInfo.selected[0].value]
        //     }
        // })
        const currentMetrics: any = _countries.length > 0 ? metricInfo.records.filter(item => {
            return item.filtered;
        }).filter((itemEl, el) => {
            if (platformInfo.selected.length === 0 || platformInfo.selected[0].value === "all") {
                return true
            } else {
                return itemEl.platforms[platformInfo.selected[0].value]
            }
        }) : currentMetricInfo.filter(item => {
            return !item.filtered;
        })

        const registeredUsers: number = metricInfo.overview.total || 0;
        const notVerifiedUsers: number = metricInfo.overview.notVerified && metricInfo.overview.notVerified.email + metricInfo.overview.notVerified.mobile || 0;
        let failPercentage: number = 0;
        if (notVerifiedUsers && notVerifiedUsers !== 0) {
            failPercentage = (
                notVerifiedUsers * 100 /
                (registeredUsers + notVerifiedUsers)
            );

            failPercentage = failPercentage % 2 === 0 ? +failPercentage : +failPercentage.toFixed(1);
        }

        const emailRegisteredUsers: number = metricInfo.overview.registered && metricInfo.overview.registered.email || 0;

        return (
            <div className="container-fluid no-padder">
                <div className="row">
                    <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
                        <div className="container-fluid no-padder">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div className="box-shadow r-3x bg-white pos-rlt m-t-md" id="users-stats-by-country">
                                        <div className="content-wrapper">
                                            <div className="container-fluid">
                                                <div className="row">
                                                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                                        <span className="text-lg padder-t-5 block">User Registrations</span>
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
                                                    <div className="flex-space-around">
                                                        <div style={{backgroundColor: "inherit"}}>
                                                            <span className="block text-xsl">{registeredUsers}</span>
                                                            <span>Registered</span>
                                                        </div>

                                                        <div style={{backgroundColor: "inherit"}}>
                                                            <span className="block text-xsl">{notVerifiedUsers}</span>
                                                            <span>Not Verified</span>
                                                        </div>

                                                        <div style={{backgroundColor: "inherit"}}>
                                                            <span className="block text-xsl">{`${failPercentage}%`}</span>
                                                            <span>Fail Perc.</span>
                                                        </div>

                                                        <div style={{backgroundColor: "inherit"}}>
                                                            <span className="block text-xsl">{emailRegisteredUsers}</span>
                                                            <span>Email reg.</span>
                                                        </div>

                                                        {metricInfo.overview.platforms && metricInfo.overview.platforms.map((item, i) => {
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className={`${!item.count ? "visibility-hide " : ""}`}
                                                                    style={{backgroundColor: "inherit"}}
                                                                >
                                                                    <span className="block text-xsl">{item.count}</span>
                                                                    <span>{item.name}</span>
                                                                </div>
                                                            )
                                                        })
                                                        }

                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {regionCode ?
                                            <div className="row">
                                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                                    <ByCountries
                                                        goBack={this.handleGoBack}
                                                        regionCode={regionCode}
                                                        startDate={startDate.format("YYYY-MM-DD")}
                                                        endDate={endDate.format("YYYY-MM-DD")}
                                                    />
                                                </div>
                                            </div> :
                                            <div>
                                                <div className="content-wrapper">
                                                    <div className="container-fluid">
                                                        <div className={`${fetchData ? "inactive " : ""}row`}>
                                                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                                                <FormGroup>
                                                                    <Select
                                                                        isMulti={true}
                                                                        closeMenuOnSelect={true}
                                                                        isDisabled={false}
                                                                        isClearable={true}
                                                                        styles={multiSelectMenuStyles}
                                                                        name="countries"
                                                                        placeholder="Filter by country..."
                                                                        options={countries}
                                                                        value={_countries}
                                                                        onChange={this.handleCountryChange}
                                                                    />
                                                                </FormGroup>
                                                            </div>
                                                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                                                <FormGroup>
                                                                    <Select
                                                                      multi={true}
                                                                      closeMenuOnSelect={true}
                                                                      isClearable={true}
                                                                      isDisabled={false}
                                                                      placeholder="Filter by platform..."
                                                                      name="platforms"
                                                                      onChange={this.handlePlatformsChange}
                                                                      style={{
                                                                          outline: "none"
                                                                      }}
                                                                      value={platformInfo.selected}
                                                                      options={platformInfo.options}
                                                                    />
                                                                </FormGroup>
                                                            </div>
                                                            {loading ? <Loading/> :
                                                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                                                    <Table
                                                                        hover={true}
                                                                        condensed={true}
                                                                        responsive={true}
                                                                    >
                                                                        <thead>
                                                                        <tr>
                                                                            <th className="col-lg-1 col-md-1 col-sm-1"/>
                                                                            <th className="col-lg-1 col-md-1 col-sm-1"/>
                                                                            <th className="col-lg-2 col-md-2 col-sm-2">Country</th>
                                                                            <th className="col-lg-2 col-md-2 col-sm-2">Registered</th>
                                                                            <th className="col-lg-2 col-md-2 col-sm-2">Not verified</th>
                                                                            <th className="col-lg-2 col-md-2 col-sm-2">Email reg.</th>
                                                                            <th className="col-lg-2 col-md-2 col-sm-2">Fail %</th>
                                                                        </tr>
                                                                        </thead>
                                                                        <tbody>

                                                                        {
                                                                            currentMetrics.length === 0 &&
                                                                            <tr>
                                                                                <td colSpan={4}>No result</td>
                                                                            </tr>
                                                                        }

                                                                        {
                                                                            currentMetrics.length > 0 && currentMetrics.map((item, i) => {
                                                                                const country: string = regionCodes[item.regionCode] ?
                                                                                    regionCodes[item.regionCode].label : item.regionCode;
                                                                                const viewUser: any = () => this.handleViewUsersByCountry(item.regionCode);
                                                                                const N: number = (_countries.length > 0) ? (i + 1) : (currentPage - 1) * PAGINATION_LIMIT + i + 1;
                                                                                const notVerifiedUsersCount: number = item.notVerified.email + item.notVerified.mobile;
                                                                                let percentage: number = 0;
                                                                                if (notVerifiedUsersCount !== 0) {
                                                                                    percentage = (
                                                                                        notVerifiedUsersCount * 100 /
                                                                                        (item.total + notVerifiedUsersCount)
                                                                                    );
                                                                                    percentage = percentage % 2 === 0 ? percentage : parseInt(percentage.toFixed(1));
                                                                                }
                                                                                return (
                                                                                    <tr key={N} className="cursor-pointer" onClick={viewUser}>
                                                                                        <td className="col-lg-1 col-md-1 col-sm-1">{N}</td>
                                                                                        <td className="col-lg-1 col-md-1 col-sm-1">
                                                                                            <span className="flag"><ReactCountryFlag code={item.regionCode} svg={true}/></span>
                                                                                        </td>
                                                                                        <td className="col-lg-2 col-md-2 col-sm-2">{country}</td>
                                                                                        <td className="col-lg-2 col-md-2 col-sm-2">{item.total}</td>
                                                                                        <td className="col-lg-2 col-md-2 col-sm-2">{notVerifiedUsersCount}</td>
                                                                                        <td className="col-lg-2 col-md-2 col-sm-2">{item.registered.email}</td>
                                                                                        <td className="col-lg-2 col-md-2 col-sm-2">{`${percentage}`}</td>
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

                                                <div className="content-wrapper stats-pagination">
                                                    <div className="container-fluid">
                                                        {
                                                            !loading &&
                                                            <div className="row">
                                                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                                                    <span className="text-sm padder-t-7 block">
                                                                        {`Showing ${currentMetrics.length} of ${metricInfo.records.filter((itemEl, el) => {
                                                                            if (platformInfo.selected.length === 0 || platformInfo.selected[0].value === "all") {
                                                                                return true
                                                                            } else {
                                                                                return itemEl.platforms[platformInfo.selected[0].value]
                                                                            }
                                                                        }).length}`}
                                                                        </span>
                                                                </div>
                                                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                                                    {
                                                                        _countries.length === 0 &&
                                                                        <Paginate
                                                                            totalRecords={metricInfo.records.filter((itemEl, el) => {
                                                                                if (platformInfo.selected.length === 0 || platformInfo.selected[0].value === "all") {
                                                                                    return true
                                                                                } else {
                                                                                    return itemEl.platforms[platformInfo.selected[0].value]
                                                                                }
                                                                            }).length}
                                                                            pageLimit={PAGINATION_LIMIT}
                                                                            pageNeighbours={1}
                                                                            onPageChanged={this.handlePageChanged}
                                                                            isUpdate={isUpdate}
                                                                        />
                                                                    }
                                                                </div>
                                                            </div>
                                                        }

                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12" id="users-stats">
                        <div className="container-fluid no-padder">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12"><Map/></div>
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12"><ByDates/></div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Index);
