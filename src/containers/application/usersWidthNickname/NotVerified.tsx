"use strict";

import * as React from "react";
import * as moment from "moment";
import Select from "react-select";
import {AxiosResponse} from "axios";
import {connect} from "react-redux";
import Table from "react-bootstrap/es/Table";
import Modal from "react-bootstrap/es/Modal";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";
import * as DatetimeRangePicker from "library/react-bootstrap-datetimerangepicker/lib/index";

import {dateTimePickerRanges, getCurrentOffset, pickerLabel, promiseSelectOptions} from "helpers/DataHelper";
import {getNotVerifiedUsers, getNotVerifiedUsersCount} from "ajaxRequests/users";
import {selectMenuStyles, showNotification} from "helpers/PageHelper";
import UserAttempts from "components/Common/UserAttempts";
import Pagination from "components/Common/Pagination";
import Loading from "components/Common/Loading";
import {PAGE_NAME} from "configs/constants";
import {ISelect} from "services/interface";
import selector, {IStoreProps} from "services/selector";

interface INotVerifiedState {
    offset: number,
    limit: number,
    ranges: any,
    initialLoading: boolean,
    popup: {
        show: boolean,
        title: string
    },
    username: any,
    notVerifiedUsers: any,
    filters: any,
    isEmail: boolean,
    request: {
        pagination: boolean,
        loading: boolean,
        reset: {
            disabled: boolean,
            processing: boolean
        },
        search: {
            disabled: boolean,
            processing: boolean
        },
        fetchCount: boolean
    }
}

interface INotVerifiedProps extends IStoreProps {
    userProfile: any
}

class NotVerified extends React.Component<INotVerifiedProps, INotVerifiedState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            offset: 0,
            limit: 20,
            initialLoading: true,
            ranges: dateTimePickerRanges(),
            notVerifiedUsers: {
                records: [],
                count: "0"
            },
            popup: {
                show: false,
                title: ""
            },
            username: "",
            filters: {
                startDate: "",
                endDate: "",
                country: null,
                platform: null,
                mobile: "",
                email: ""
            },
            isEmail: false,
            request: {
                pagination: false,
                loading: true,
                reset: {
                    disabled: true,
                    processing: false
                },
                search: {
                    disabled: true,
                    processing: false
                },
                fetchCount: true
            }
        };
    }

    componentWillMount(): void {
        document.title = PAGE_NAME["/not-verified-users"];
    }

    componentDidMount(): void {
        const newState: INotVerifiedState = {...this.state};
        this.initRequests(newState);
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    initRequests: any = (state: any, offset: number = 0, isSearch: boolean = false, isReset: boolean = false, isPaging: boolean = false): void => {
        const {
            limit, filters: {startDate, endDate, mobile, country, platform, email},
        } = state;
        const searchedData: any = {
            offset,
            limit,
            startDate: startDate === "" ? null : startDate.format("YYYY-MM-DD"),
            endDate: endDate === "" ? null : endDate.format("YYYY-MM-DD"),
            regionCode: country ? country.region_code : null,
            platformId: platform ? platform.platform_id : null,
            mobile: mobile || null,
            email: email || null
        };

        if (!isPaging) {
            getNotVerifiedUsersCount(searchedData).then(({data}: AxiosResponse) => {
                if (data.err) {
                    throw new Error(JSON.stringify(data));
                }
                state.notVerifiedUsers.count = data.result || "0";
                state.request.fetchCount = false;
                if (this.componentState) {
                    this.setState(state);
                }
            }).catch(e => {
                console.log(e);
                state.request.fetchCount = false;
                if (this.componentState) {
                    this.setState(state);
                    showNotification("error", {
                        title: "You've got an error!",
                        description: "Cannot get not verified users' count for unknown reason",
                        timer: 3000
                    });
                }
            })
        }

        getNotVerifiedUsers(searchedData).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            state.notVerifiedUsers.records = data.result.records || [];
            state.request.loading = false;
            state.initialLoading = false;

            if (isSearch) {
                state.request.search.processing = false;
                state.request.reset.disabled = false;
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

        }).catch(e => {
            console.log(e);
            state.request.loading = false;
            state.initialLoading = false;
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
                    title: "You've got an error!",
                    description: "Cannot get not verified users",
                    timer: 3000,
                });
            }
        });
    };

    handlePickerApply = async (e: React.MouseEvent<HTMLInputElement>, picker: any) => {
        e.preventDefault();
        const newState: INotVerifiedState = {...this.state};
        newState.filters.startDate = picker.startDate;
        newState.filters.endDate = picker.endDate;
        newState.request.search.disabled = false;
        this.setState(newState);
    };

    handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
    };

    handleCountryChange = (value: ISelect): void => {
        const newState: INotVerifiedState = {...this.state};
        newState.filters.country = value;
        newState.request.search.disabled = false;
        this.setState(newState);
    };

    handlePlatformChange = (value: ISelect): void => {
        const newState: INotVerifiedState = {...this.state};
        newState.filters.platform = value;
        newState.request.search.disabled = false;
        this.setState(newState);
    };

    handlePhoneChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: INotVerifiedState = {...this.state};
        newState.filters.mobile = value;
        newState.request.search.disabled = false;
        this.setState(newState);
    };

    handleEmailChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: INotVerifiedState = {...this.state};
        newState.filters.email = value;
        newState.request.search.disabled = false;
        this.setState(newState);
    };

    handleModalOpen = (username: any, email: string): void => {
        const newState: INotVerifiedState = {...this.state};
        newState.popup.show = true;
        newState.popup.title = "Not Verified User";
        newState.username = username;
        newState.isEmail = !!email;
        this.setState(newState);
    };

    handleModalClose = (): void => {
        const newState: INotVerifiedState = {...this.state};
        newState.popup.show = false;
        newState.popup.title = "";
        newState.username = null;
        this.setState(newState);
    };

    handleReset = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const newState: INotVerifiedState = {...this.state};
        newState.filters = {
            startDate: "",
            endDate: "",
            country: null,
            platform: null,
            mobile: "",
            email: ""
        };
        newState.request.reset.processing = true;
        newState.request.loading = true;
        newState.request.fetchCount = true;
        this.setState(newState);
        this.initRequests(newState, 0, false, true);
    };

    handleSearch = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const newState: INotVerifiedState = {...this.state};
        newState.request.search.processing = true;
        newState.request.loading = true;
        newState.request.fetchCount = true;
        newState.offset = 0;
        this.setState(newState);
        this.initRequests(newState, newState.offset, true);
    };

    handleListChange = async (e: React.MouseEvent<HTMLInputElement>) => {
        const {offset} = this.state;
        const newState: INotVerifiedState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.pagination = true;
        newState.request.loading = true;
        this.setState(newState);
        this.initRequests(newState, currentOffset, false, false, true)
    };

    render(): JSX.Element {
        const {
            ranges, notVerifiedUsers, offset, limit, initialLoading, filters, isEmail,
            popup, username, request: {loading, reset, search, pagination, fetchCount}
        } = this.state;
        const {countries, platforms, regionCodes, userProfile} = this.props;

        return (

            <div>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-4">
                                <span className="text-xlg padder-t-6 block">{PAGE_NAME["/not-verified-users"]}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <hr/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        {/*Filters section start*/}
                        <div className="row">

                            {/*Registration date*/}
                            <div className="col-lg-3 col-md-6 col-xs-12 col-sm-6">
                                <FormGroup>
                                    <ControlLabel htmlFor="registration">Registration date</ControlLabel>
                                    <DatetimeRangePicker
                                        name="date"
                                        onApply={this.handlePickerApply}
                                        ranges={ranges}
                                        applyClass="btn-info"
                                    >
                                        <div className="input-group">
                                            <input
                                                className="form-control text-lg"
                                                value={pickerLabel(filters.startDate, filters.endDate)}
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

                            {/*Country*/}
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="country">Country</ControlLabel>
                                    <Select
                                        inputId="country"
                                        name="country"
                                        closeMenuOnSelect={true}
                                        isClearable={true}
                                        styles={selectMenuStyles}
                                        value={filters.country}
                                        options={countries}
                                        onChange={this.handleCountryChange}
                                    />
                                </FormGroup>
                            </div>

                            {/*Platforms*/}
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12 hidden">
                                <FormGroup>
                                    <ControlLabel htmlFor="platform">Platform</ControlLabel>
                                    <Select
                                        inputId="platform"
                                        name="platform"
                                        isClearable={true}
                                        styles={selectMenuStyles}
                                        closeMenuOnSelect={true}
                                        value={filters.platform}
                                        options={platforms}
                                        onChange={this.handlePlatformChange}
                                    />
                                </FormGroup>
                            </div>

                            {/*Phone number*/}
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="phone-number">Phone number</ControlLabel>
                                    <FormControl
                                        id="phone-number"
                                        name="phone-number"
                                        placeholder="Phone number"
                                        value={filters.mobile}
                                        onChange={this.handlePhoneChange}
                                    />
                                </FormGroup>
                            </div>

                            {/*Email*/}
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="email">Email</ControlLabel>
                                    <FormControl
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Email"
                                        value={filters.email}
                                        onChange={this.handleEmailChange}
                                    />
                                </FormGroup>
                            </div>
                        </div>
                        <hr/>

                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-4">
                                <span className="block text-xl padder-t-8">
                                    {(initialLoading || fetchCount) ? <Loading isSmall={true}/> : notVerifiedUsers.count}
                                </span>
                                <span className="block">Number of users</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-8 text-right padder-t-16">
                                <button
                                    className="btn btn-default m-l-sm"
                                    disabled={reset.disabled || reset.processing}
                                    onClick={this.handleReset}
                                >Reset{reset.processing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                </button>
                                <button
                                    className="btn btn-info m-l-sm"
                                    disabled={search.processing || initialLoading}
                                    onClick={this.handleSearch}
                                >Search{search.processing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/*Not verified users list*/}
                {initialLoading ? <Loading/>
                    :
                    <div className={`${loading ? "inactive" : ""}`}>
                        <Table
                            hover={true}
                            condensed={true}
                            responsive={true}
                        >
                            <thead>
                            <tr>
                                <th/>
                                <th>Country</th>
                                <th>Phone number / Email</th>
                                <th>Attempted at</th>
                                {!userProfile.readonly && <th/>}
                            </tr>
                            </thead>
                            <tbody>
                            {notVerifiedUsers && notVerifiedUsers.records.length === 0 && <tr>
                                <td colSpan={5}>
                                    <div className="empty">No results found.</div>
                                </td>
                            </tr>
                            }
                            {notVerifiedUsers && notVerifiedUsers.records.map((item, index) => {
                                const N: number = (offset * limit) + index + 1;
                                const modalOpen: any = () => this.handleModalOpen(item.number, item.email);
                                return <tr key={N}>
                                    <td>{N}</td>
                                    <td>{regionCodes[item.regionCode] ? regionCodes[item.regionCode].label : ""}</td>
                                    <td>{item.email ? item.email : item.number}</td>
                                    <td>{moment(item.attemptedAt).format("DD MMM YYYY hh:mm A")}</td>
                                    {!userProfile.readonly && <td>
                                        <a
                                            className="btn btn-default btn-xs"
                                            href="javascript:void(0);"
                                            onClick={modalOpen}
                                        ><i className="fa fa-cog" aria-hidden={true}/>
                                        </a>
                                    </td>}
                                </tr>
                            })}
                            </tbody>
                        </Table>
                    </div>}
                <div className="content-wrapper">
                    <div className="container-fluid">
                        {
                            !initialLoading && notVerifiedUsers.count > limit &&
                            <div className={`row ${loading ? "inactive" : ""}`}>
                                <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6">
                                    <span className="text-xs">{`Showing ${notVerifiedUsers.records.length} of ${notVerifiedUsers.count} entries`}</span>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                    <Pagination
                                        offset={offset}
                                        limit={limit}
                                        callback={promiseSelectOptions(this.handleListChange)}
                                        length={notVerifiedUsers.records.length}
                                        disabled={pagination}
                                        count={notVerifiedUsers.count}
                                    />
                                </div>
                            </div>
                        }

                    </div>
                </div>
                {
                    <Modal
                        show={popup.show}
                        onHide={this.handleModalClose}
                        bsSize="large"
                    >
                        <UserAttempts
                            username={username}
                            hideModal={this.handleModalClose}
                            isVerified={false}
                            isEmail={isEmail}
                        />
                    </Modal>
                }
            </div>
        )
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(NotVerified);
