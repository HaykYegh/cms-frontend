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

import {multiSelectMenuStyles, selectMenuStyles, showNotification} from "helpers/PageHelper";
import {dateTimePickerRanges, pickerLabel} from "helpers/DataHelper";
import ByTypes from "containers/application/stats/calls/ByTypes";
import {METRIC_TYPES, PAGINATION_LIMIT} from "configs/constants";
import {getCallsByCounties} from "ajaxRequests/stats";
import Paginate from "components/Common/Paginate";
import {ISelect} from "services/interface";
import selector from "services/selector";
import Loading from "components/Common/Loading";

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
    calls: any[],
    _metricType: any,
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
            calls: [],
            _metricType: {
                value: 2,
                label: METRIC_TYPES.INTERNAL_CALL.LABEL
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
        this.initRequests(newState);
        window.addEventListener("resize", this.updateDimensions);
        if (window.innerWidth >= 1200) {
            const style: any = window.getComputedStyle(document.getElementById("calls-stats"), null);
            const currentHeight: number = parseInt(style.getPropertyValue("height")) - 20;
            document.getElementById("calls-stats-by-country").style.height = currentHeight + "px";
        }
    }

    componentDidUpdate(prevProps: any, prevState: IIndexState): void {
        if (!isEqual(prevState.regionCode, this.state.regionCode)) {
            window.addEventListener("resize", this.updateDimensions);
            if (window.innerWidth >= 1200) {
                const style: any = window.getComputedStyle(document.getElementById("calls-stats"), null);
                const currentHeight: number = parseInt(style.getPropertyValue("height")) - 20;
                document.getElementById("calls-stats-by-country").style.height = currentHeight + "px";
            }
        }
    }

    componentWillUnmount(): void {
        this.componentState = false;
        window.removeEventListener("resize", this.updateDimensions);
    }

    updateDimensions = () => {
        const messagesStatsByCountry: any = document.getElementById("calls-stats-by-country");
        if (window.innerWidth >= 1200) {
            const style: any = window.getComputedStyle(document.getElementById("calls-stats"), null);
            const currentHeight: number = parseInt(style.getPropertyValue("height")) - 20;
            messagesStatsByCountry.style.height = currentHeight + "px";
        } else {
            messagesStatsByCountry.style.height = "auto";
        }
    };

    initRequests = (state: IIndexState): void => {
        const {} = state;
        const startDate: any = state.startDate.format("YYYY-MM-DD");
        const endDate: any = state.endDate.format("YYYY-MM-DD");
        getCallsByCounties({startDate, endDate, metricTypeId: state._metricType.value}).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            const records: any = data.result || [];

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
            state.calls = records;

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
                //     description: "Cannot get call statistics",
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
        const {calls} = this.state;
        const newState: IIndexState = {...this.state};
        const {currentPage, totalPages, pageLimit} = data;
        const offset: number = (currentPage - 1) * pageLimit;
        const currentMetricInfo: any = calls.slice(offset, offset + pageLimit);
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

        for (const item of newState.calls) {
            item.filtered = selectedCountries.includes(item.regionCode);
        }
        newState._countries = selection;
        this.setState(newState);
    };

    handleMetricTypeChange = (value: ISelect): void => {
        const newState: IIndexState = {...this.state};
        const selection: any = value;
        newState.request.fetchData = true;
        newState._metricType = selection;
        this.setState(newState);
        this.initRequests(newState);
    };

    handleViewCallsByCountry = (regionCode: string): void => {
        this.setState({regionCode});
    };

    handleGoBack = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        this.setState({regionCode: null});
    };

    render(): JSX.Element {
        const {
            startDate, endDate, ranges, _countries, currentPage, calls, regionCode,
            request: {refresh, loading, fetchData, isUpdate}, currentMetricInfo, _metricType
        } = this.state;
        const {regionCodes, countries, callsMetricTypes} = this.props;
        const currentMetrics: any = _countries.length > 0 ? calls.filter(item => {
            return item.filtered;
        }) : currentMetricInfo.filter(item => {
            return !item.filtered;
        });

        return (
            <div className="container-fluid no-padder">
                <div className="row" id="calls-stats">
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
                                            <div className="box-shadow r-3x bg-white m-t-md pos-rlt" id="calls-stats-by-country">
                                                <div className="content-wrapper">
                                                    <div className="container-fluid">
                                                        <div className="row">

                                                            <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                                                                <div className="flex">
                                                                    <span className="text-lg padder-t-5 block padder-r-xs">Calls</span>
                                                                    <div className="form-group m-b-n w-sm">
                                                                        <Select
                                                                            name="metricType"
                                                                            placeholder="Type"
                                                                            closeMenuOnSelect={true}
                                                                            isDisabled={false}
                                                                            options={callsMetricTypes}
                                                                            value={_metricType}
                                                                            styles={selectMenuStyles}
                                                                            onChange={this.handleMetricTypeChange}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
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
                                                            {loading ?
                                                                <Loading />
                                                                :
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
                                                                            <th className="col-lg-5 col-md-5 col-sm-5">{_metricType.label} - count</th>
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
                                                                                const viewMessages: any = () => this.handleViewCallsByCountry(item.regionCode);
                                                                                const N: number = (_countries.length > 0) ? (i + 1) : (currentPage - 1) * PAGINATION_LIMIT + i + 1;
                                                                                return (
                                                                                    <tr key={N} className="cursor-pointer" onClick={viewMessages}>
                                                                                        <td className="col-lg-1 col-md-1 col-sm-1">{N}</td>
                                                                                        <td className="col-lg-1 col-md-1 col-sm-1">
                                                                                            <ReactCountryFlag code={item.regionCode} svg={true}/>
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
                                                                    {`Showing ${currentMetrics.length} of ${calls.length}`}
                                                                </span>
                                                                </div>
                                                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                                                    {
                                                                        _countries.length === 0 &&
                                                                        <Paginate
                                                                            totalRecords={calls.length}
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
                                        </div>}
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">
                        <div className="container-fluid no-padder">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12"><ByTypes/></div>
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
