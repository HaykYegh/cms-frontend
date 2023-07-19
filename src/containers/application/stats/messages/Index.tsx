"use strict";

import * as React from "react";
import * as moment from "moment";
import Select from "react-select";
import * as numeral from "numeral";
import {AxiosResponse} from "axios";
import {connect} from "react-redux";
import isEqual from "lodash/isEqual";
import Table from "react-bootstrap/es/Table";
import ReactCountryFlag from "react-country-flag";
import FormGroup from "react-bootstrap/es/FormGroup";
import * as DatetimeRangePicker from "library/react-bootstrap-datetimerangepicker/lib/index";

import {multiSelectMenuStyles, showNotification} from "helpers/PageHelper";
import {dateTimePickerRanges, pickerLabel} from "helpers/DataHelper";
import ByTypes from "containers/application/stats/messages/ByTypes";
import ByDates from "containers/application/stats/messages/ByDates";
import {getMessagesByCounties} from "ajaxRequests/stats";
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
        chartRecords: any[]
    },
    currentMetricInfo: any[],
    currentPage: number,
    totalPages: number,
    _countries: any[],
    regionCode: any
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
                chartRecords: []
            },
            currentMetricInfo: [],
            currentPage: null,
            totalPages: null,
            _countries: [],
            regionCode: null
        }
    }

    componentDidMount(): void {
        const newState: IIndexState = {...this.state};
        if (window.innerWidth >= 1200) {
            const style: any = window.getComputedStyle(document.getElementById("messages-stats"), null);
            const currentHeight: number = parseInt(style.getPropertyValue("height"));
            const element: any = document.getElementById("messages-stats-by-country");
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
                const style: any = window.getComputedStyle(document.getElementById("messages-stats"), null);
                const currentHeight: number = parseInt(style.getPropertyValue("height"));
                const element: any = document.getElementById("messages-stats-by-country");
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
        getMessagesByCounties({
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD")
        }).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            state.metricInfo.records = data.result || [];

            const records: any = state.metricInfo.records;
            for (const item of records) {
                if (state._countries.length > 0) {
                    for (const country of state._countries) {
                        if (item.regionCode === country.region_code) {
                            item.filtered = true;
                        }
                    }
                } else {
                    item.filtered = false;
                }
            }

            state.request.loading = false;
            state.request.refresh = false;
            state.request.isUpdate = true;
            state.request.fetchData = false;

            if (this.componentState) {
                this.setState(state);
            }

        }).catch(e => {
            console.log(e);
            // state.request.loading = false;
            state.request.refresh = false;
            state.request.fetchData = false;
            if (this.componentState) {
                this.setState(state);
                // showNotification("error", {
                //     title: "You've got an error!",
                //     description: "Cannot get message statistics",
                //     timer: 3000
                // });
            }
        })
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
        const currentMetricInfo: any = metricInfo.records.slice(offset, offset + pageLimit);
        newState.currentPage = currentPage;
        newState.currentMetricInfo = currentMetricInfo;
        newState.totalPages = totalPages;
        newState.request.isUpdate = false;
        this.setState(newState);
    };

    handleCountryChange = (value: ISelect): void => {
        const newState: IIndexState = {...this.state};
        const selection: any = value;
        const selectedCountries: Array<number> = [];

        for (const item of selection) {
            selectedCountries.push(item.region_code);
        }

        for (const item of newState.metricInfo.records) {
            item.filtered = selectedCountries.includes(item.regionCode);
        }
        newState._countries = selection;
        this.setState(newState);
    };

    handleViewMessagesByCountry = (regionCode: string): void => {
        this.setState({regionCode});
    };

    handleGoBack = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        this.setState({regionCode: null});
    };

    render(): JSX.Element {
        const {
            startDate, endDate, ranges, _countries, currentPage, metricInfo, regionCode,
            request: {refresh, loading, fetchData, isUpdate}, currentMetricInfo
        } = this.state;
        const {regionCodes, countries} = this.props;
        const currentMetrics: any = _countries.length > 0 ? metricInfo.records.filter(item => {
            return item.filtered;
        }) : currentMetricInfo.filter(item => {
            return !item.filtered;
        });

        return (
            <div className="container-fluid no-padder">
                <div className="row">
                    <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
                        <div className="container-fluid no-padder">
                            <div className="row">
                                {
                                    regionCode ? <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                            <ByTypes
                                                goBack={this.handleGoBack}
                                                regionCode={regionCode}
                                                startDate={startDate}
                                                endDate={endDate}
                                            />
                                        </div> :
                                        <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                            <div className="box-shadow r-3x bg-white pos-rlt m-t-md" id="messages-stats-by-country">
                                                <div className="content-wrapper">
                                                    <div className="container-fluid">
                                                        <div className="row">
                                                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                                                <span className="text-lg padder-t-5 block">Messages</span>
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
                                                        <div className={`${fetchData ? "inactive " : ""}row`}>
                                                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
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
                                                                            <th className="col-lg-5 col-md-5 col-sm-5">Country</th>
                                                                            <th className="col-lg-5 col-md-5 col-sm-5">Message - count</th>
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
                                                                                const viewMessages: any = () => this.handleViewMessagesByCountry(item.regionCode);
                                                                                const N: number = (_countries.length > 0) ? (i + 1) : (currentPage - 1) * PAGINATION_LIMIT + i + 1;
                                                                                return (
                                                                                    <tr key={N} className="cursor-pointer" onClick={viewMessages}>
                                                                                        <td className="col-lg-1 col-md-1 col-sm-1">{N}</td>
                                                                                        <td className="col-lg-1 col-md-1 col-sm-1">
                                                                                            <span className="flag"><ReactCountryFlag code={item.regionCode} svg={true}/></span>
                                                                                        </td>
                                                                                        <td className="col-lg-5 col-md-5 col-sm-5">{country}</td>
                                                                                        <td className="col-lg-5 col-md-5 col-sm-5">{numeral(item.value).format("0,0")}</td>
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
                                                                        {`Showing ${currentMetrics.length} of ${metricInfo.records.length}`}
                                                                        </span>
                                                                </div>
                                                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                                                    {
                                                                        _countries.length === 0 &&
                                                                        <Paginate
                                                                            totalRecords={metricInfo.records.length}
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
                                        </div>
                                }
                            </div>
                        </div>

                    </div>
                    <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12" id="messages-stats">
                        <div className="container-fluid no-padder">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12"><ByTypes/></div>
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
