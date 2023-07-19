"use strict";

import * as React from "react";
import * as moment from "moment";
import Select from "react-select";
import * as numeral from "numeral";
import format from "date-fns/format";
import axios, {AxiosResponse} from "axios";
import Table from "react-bootstrap/es/Table";
import {ToastContainer} from "react-toastify";
import AsyncSelect from "react-select/lib/Async";
import Button from "react-bootstrap/es/Button";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";
import * as DatetimeRangePicker from "library/react-bootstrap-datetimerangepicker/lib/index";

import {
    DEFAULT_BILLING_METHOD,
    BOX_BLOCK,
    PAGE_NAME
} from "configs/constants";
import {getFinanceMethods, getFinanceSales, getSaleCount} from "ajaxRequests/finance";
import {getSearchChannels, getChannelPayments, getChannelPaymentsTotal} from "ajaxRequests/channel"
import {dateTimePickerRanges, getCurrentOffset, pickerLabel, promiseSelectOptions} from "helpers/DataHelper";
import {selectMenuStyles, showNotification} from "helpers/PageHelper";
import Pagination from "components/Common/Pagination";
import BoxBlock from "components/Common/BoxBlock";
import {getUserGroups} from "ajaxRequests/users";
import Loading from "components/Common/Loading";

interface ISalesState {
    offset: number,
    isLoading: boolean,
    startDate: moment.Moment,
    endDate: moment.Moment,
    ranges: any,
    boxBlock: any,
    limit: number,
    request: {
        isPaging: boolean
    }
    sales: any;
    channelInfo: any;
    userInfo: any;
    userGroups: any[];
    userGroup: any;
    search: {
        value: string,
        isLoading: boolean
    },
    initialFilters: {
        searchKey: string,
        paymentMethod: any,
        channel: any,
    },
    isSearchProcessing: boolean,
    isResetDisabled: boolean,
    isResetProcessing: boolean,
    count: any,
    totalAmount: string,
}

class Index extends React.Component<any, ISalesState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            offset: 0,
            limit: 20,
            isLoading: true,
            sales: [],
            channelInfo: {},
            userInfo: {},
            startDate: moment().startOf("month"),
            userGroups: [],
            userGroup: null,
            endDate: moment(),
            ranges: dateTimePickerRanges(),
            search: {
                value: "",
                isLoading: false
            },
            request: {
                isPaging: false
            },
            boxBlock: {},
            initialFilters: {
                searchKey: "",
                paymentMethod: null,
                channel: {
                    selected: null,
                    options: [],
                },
            },
            isSearchProcessing: false,
            isResetDisabled: true,
            isResetProcessing: false,
            count: 0,
            totalAmount: ""
        }
    }

    componentDidMount(): void {
        document.title = PAGE_NAME["/sales"];
        const newState: ISalesState = {...this.state};
        getUserGroups(0, 1000).then(({data}: AxiosResponse) => {

            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.userGroups = data.result.map(item => {
                return {
                    value: item.userGroupId,
                    label: item.name
                }
            }) || [];

            if (this.componentState) {
                this.setState(newState);
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
        this.initRequests(newState);
    }

    initRequests: any = (state: ISalesState, offset: number = 0, isReset: boolean = false): void => {
        const salesData: any = {
            offset,
            startDate: state.startDate.format("YYYY-MM-DD"),
            endDate: state.endDate.format("YYYY-MM-DD"),
            limit: state.limit,
            channel: state.initialFilters.channel.selected ? state.initialFilters.channel.selected.value : null
        };
        const totalData: any = {
            startDate: state.startDate.format("YYYY-MM-DD"),
            endDate: state.endDate.format("YYYY-MM-DD"),
            channel: state.initialFilters.channel.selected ? state.initialFilters.channel.selected.value : null,
        }
        axios.all([
            getChannelPayments(salesData),
            getChannelPaymentsTotal(totalData)
            // getFinanceMethods(),
        ]).then(axios.spread((sales, total) => {
            if (!sales.data.err) {
                if (sales.data.result.result || sales.data.result.result === null) {
                    state.sales = sales.data.result.result || []
                } else {
                    state.sales = sales.data.result || []
                }
                state.channelInfo = sales.data.channelInfo;
                state.userInfo = sales.data.userInfo;
                state.count = state.sales.length;
                console.log(state.channelInfo, "channelInfo")
            } else {
                this.componentState && showNotification("error", {
                    title: "You got an error!",
                    description: "Error during getting payments",
                    timer: 3000
                });
            }

            // if (!methods.data.err) {
            //     const response: string[] = methods.data.result || [];
            //     if (response.length > 0) {
            //         for (const item of response) {
            //             const method: string = item.toLowerCase();
            //             state.boxBlock[method] = {
            //                 size: "col-lg-3 col-xs-12 col-sm-12 col-md-6",
            //                 method
            //             };
            //         }
            //     }
            // } else {
            //     this.componentState && showNotification("error", {
            //         title: "You got an error!",
            //         description: "Error during getting sales methods",
            //         timer: 3000
            //     });
            // }

            if (this.componentState) {
                if (state.initialFilters.searchKey !== "" || state.isSearchProcessing) {
                    state.isSearchProcessing = false;
                    state.isResetDisabled = false;
                }

                if (isReset) {
                    state.isResetDisabled = true;
                }

                if (isReset) {
                    state.isResetProcessing = false;
                }
                state.isLoading = false;
                this.setState(state);
            }

            this.setState({
                totalAmount: `${total.data.result.amount} ${total.data.result.currency}`
            })

        })).catch(error => console.log(error));

        // getSaleCount(salesData).then(data => {
        //     // console.log(data, "dataCount")
        //     if (data.data.result && (data.data.result.result || data.data.result.result === 0 || data.data.result.result === null)) {
        //         state.count = data.data.result.result || 0;
        //     } else {
        //         if (data.data.result.length === 0) {
        //             state.count = 0
        //         } else {
        //             state.count = data.data.result
        //         }
        //     }
        //     this.setState(state);
        // })
    };

    handlePickerApply = (e: React.MouseEvent<HTMLInputElement>, picker: any): void => {
        e.preventDefault();
        const {offset, userGroup} = this.state;
        const startDate: moment.Moment = picker.startDate;
        const endDate: moment.Moment = picker.endDate;
        const newState: ISalesState = {...this.state};

        newState.startDate = picker.startDate;
        newState.endDate = picker.endDate;
        // newState.isLoading = true;
        this.setState(newState);

        // const salesData: any = {
        //     offset,
        //     startDate: startDate.format("YYYY-MM-DD"),
        //     endDate: endDate.format("YYYY-MM-DD"),
        //     limit: newState.limit
        // };
        //
        // getChannelPayments(salesData).then(({data}: AxiosResponse) => {
        //     if (data.err) {
        //         throw new Error(JSON.stringify(data));
        //     }
        //     if (data.result.result || data.result.result === null) {
        //         newState.sales = data.result.result || []
        //     } else {
        //         newState.sales = data.result || [];
        //     }
        //     newState.isLoading = false;
        //
        //     if (this.componentState) {
        //         this.setState(newState);
        //     }
        //
        // }).catch(err => {
        //     console.log(err);
        //     if (this.componentState) {
        //         newState.isLoading = false;
        //         if (this.componentState) {
        //             this.setState(newState);
        //         }
        //         showNotification("error", {
        //             title: "You got an error!",
        //             description: "Error during getting sales",
        //             timer: 3000
        //         });
        //     }
        //
        // });

        // getSaleCount(salesData).then(data => {
        //     console.log(data.data.result.length, "data1234")
        //     if (data.data.result.result || data.data.result.result === 0 || data.data.result.result === null) {
        //         newState.count = data.data.result.result || 0;
        //     } else {
        //         if (data.data.result.length === 0) {
        //             newState.count = 0
        //         } else {
        //             newState.count = data.data.result
        //         }
        //     }
        //     this.setState(newState);
        // })
    };

    handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
    };

    handleListChange = (e: React.MouseEvent<HTMLInputElement>): void => {
        const {startDate, endDate, offset, userGroup} = this.state;
        const newState: ISalesState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.isPaging = true;
        this.setState(newState);

        const salesData: any = {
            offset: currentOffset,
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD"),
            limit: newState.limit,
        };
        getChannelPayments(salesData).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            if (data.result.result || data.result.result === null) {
                newState.sales = data.result.result || []
            } else {
                newState.sales = data.result || [];
            }
            newState.channelInfo = data.channelInfo;
            newState.userInfo = data.userInfo;
            newState.isLoading = false;
            newState.offset = currentOffset;
            newState.request.isPaging = false;
            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(err => {
            console.log(err);
            if (this.componentState) {
                newState.isLoading = false;
                newState.request.isPaging = false;
                showNotification("error", {
                    title: "You got an error!",
                    description: "Error during getting sales",
                    timer: 3000
                });
            }
        });
    };

    handleUserGroupChange = (selected: any): void => {
        const {offset, startDate, endDate} = this.state;
        const newState: ISalesState = {...this.state};
        newState.userGroup = selected;
        newState.isLoading = true;
        this.setState(newState);
        const salesData: any = {
            offset,
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD"),
            limit: newState.limit
        };

        getChannelPayments(salesData).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            if (data.result.result || data.result.result === null) {
                newState.sales = data.result.result || []
            } else {
                newState.sales = data.result || [];
            }
            newState.isLoading = false;
            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(err => {
            console.log(err);
            if (this.componentState) {
                newState.isLoading = false;
                showNotification("error", {
                    title: "You got an error!",
                    description: "Error during getting sales",
                    timer: 3000
                });
            }
        });
    };

    handleSearch = (event: React.MouseEvent<HTMLButtonElement>) => {
        const newState: ISalesState = {...this.state};
        newState.isSearchProcessing = true;
        newState.offset = 0;
        this.initRequests(newState, newState.offset);
        this.setState(newState)
    };

    handlePhoneOrEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue: string = event.currentTarget.value;
        const newState: ISalesState = {...this.state};

        newState.initialFilters.searchKey = inputValue;
        this.setState(newState);
    };

    handlePaymentMethodChange = (value: any) => {
        const newState: ISalesState = {...this.state};
        newState.initialFilters.paymentMethod = value;
        this.setState(newState);
    };

    handleFindChannels: any = async (value: string) => {
        const newState: ISalesState = {...this.state};
        const response: any = await getSearchChannels(value);
        if (response.data.err) {
            return [];
        }

        const result: any[] = response.data.result
          .map(channel => {
              return {
                  value: channel.roomName,
                  label: channel.subject
              }
          });

        newState.initialFilters.channel.options = result;
        if (this.componentState) {
            this.setState(newState);
        }

        return result;
    };

    handleChannelChange = (value: any) => {
        const newState: ISalesState = {...this.state};
        newState.initialFilters.channel.selected = value;
        this.setState(newState);
    }

    handleReset = () => {
        const newState: ISalesState = {
            offset: 0,
            limit: 20,
            isLoading: true,
            sales: [],
            channelInfo: {},
            userInfo: {},
            startDate: moment().startOf("month"),
            userGroups: [],
            userGroup: null,
            endDate: moment(),
            ranges: dateTimePickerRanges(),
            search: {
                value: "",
                isLoading: false
            },
            request: {
                isPaging: false
            },
            boxBlock: {},
            initialFilters: {
                searchKey: "",
                paymentMethod: null,
                channel: {
                    selected: null,
                    options: [],
                },
            },
            isSearchProcessing: false,
            isResetDisabled: true,
            isResetProcessing: true,
            count: this.state.count,
            totalAmount: this.state.totalAmount
        };

        this.initRequests(newState, 0, true);
        this.setState(newState)
    };

    render(): JSX.Element {
        const {
            startDate, endDate, offset, isResetDisabled, isResetProcessing, isSearchProcessing, limit,
            sales, channelInfo, userInfo, ranges, boxBlock, isLoading, request: {isPaging}, initialFilters, userGroup, userGroups, count, totalAmount
        } = this.state;
        const paymentMethods: any[] = [];

        const channels: any[] = [];

        return (
            <div className="box-shadow r-3x bg-white">
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl padder-t-3">{PAGE_NAME["/payments"]}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <hr/>

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row m-b-md">
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="registration">Payment date</ControlLabel>
                                    <DatetimeRangePicker
                                        name="date"
                                        onApply={this.handlePickerApply}
                                        ranges={ranges}
                                        applyClass="btn-info"
                                        autoUpdateInput={true}
                                    >
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control text-lg"
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
                                </FormGroup>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="channel">Channel Name</ControlLabel>
                                    <AsyncSelect
                                      inputId="channel-name"
                                      name="channel-name"
                                      placeholder="Channel name"
                                      cacheOptions={true}
                                      isClearable={true}
                                      autoFocus={true}
                                      value={initialFilters.channel.selected}
                                      styles={selectMenuStyles}
                                      defaultOptions={initialFilters.channel.options}
                                      loadOptions={promiseSelectOptions(this.handleFindChannels)}
                                      onChange={this.handleChannelChange}
                                    />
                                </FormGroup>
                            </div>
                        </div>
                        <div className="row">
                            {/*<div className="col-lg-6 col-md-6 col-sm-6 col-xs-8 text-right padder-t-16"/>*/}
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-4">
                                <span className="block text-xl padder-t-8">
                                    {totalAmount}
                                </span>
                                <span className="block">Total of amounts</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-8 text-right padder-t-16 float-right">
                                <button
                                    className="btn btn-default m-l-sm"
                                    disabled={isResetDisabled || isResetProcessing}
                                    onClick={this.handleReset}
                                >Reset{isResetProcessing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                </button>
                                <button
                                    className="btn btn-info m-l-sm"
                                    disabled={isSearchProcessing}
                                    onClick={this.handleSearch}
                                >Search{isSearchProcessing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {
                    isLoading ? <Loading/>
                        : <Table
                            hover={true}
                            condensed={true}
                            responsive={true}
                        >
                            <thead>
                            <tr>
                                <th/>
                                <th>PHONE NUMBER / EMAIL</th>
                                <th>Channel</th>
                                {/*<th>Amount</th>*/}
                                <th>Price</th>
                                <th>Currency</th>
                                {/*<th>Quantity</th>*/}
                                <th>Date</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                sales && sales.length === 0 &&
                                <tr>
                                    <td colSpan={8}>
                                        <div className="empty">No results</div>
                                    </td>
                                </tr>
                            }

                            {sales && sales.map((sale, index) => {
                                const N: number = offset * limit + index + 1;
                                return (
                                    <tr key={N}>
                                        <td>{N}</td>
                                        <td>{userInfo[sale.username] || sale.username.replace(process.env.APP_PREFIX, "")}</td>
                                        <td>{channelInfo[sale.roomName]}</td>
                                        {/*<td>*/}
                                        {/*    {*/}
                                        {/*        (sale.amount * 100) % 100 === 0 ? parseInt(sale.amount) :*/}
                                        {/*          numeral(sale.amount).format("0.00")*/}
                                        {/*    }*/}
                                        {/*</td>*/}
                                        <td>{sale.price}</td>
                                        <td>{sale.currency}</td>
                                        {/*<td>{sale.quantity}</td>*/}
                                        <td>{format(sale.date, "DD MMM YYYY")}</td>
                                    </tr>
                                )
                            })
                            }
                            </tbody>
                        </Table>
                }
                {sales && sales.length > 0 &&
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            {!isLoading && count >= limit && <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <Pagination
                                    offset={offset}
                                    limit={limit}
                                    callback={promiseSelectOptions(this.handleListChange)}
                                    count={50}
                                    length={sales.length}
                                    disabled={isPaging}
                                />
                            </div>
                            }
                        </div>
                    </div>
                </div>
                }
            </div>
        );
    }
}

export default Index;
