"use strict";

import * as React from "react";
import * as moment from "moment";
import {AxiosResponse} from "axios";
import {connect} from "react-redux";

import * as DatetimeRangePicker from "library/react-bootstrap-datetimerangepicker/lib/index";
import {dateTimePickerRanges, pickerLabel} from "helpers/DataHelper";
import selector, {IStoreProps} from "services/selector";
import {getUsersByCountries} from "ajaxRequests/stats";
import {showNotification} from "helpers/PageHelper";
import {setMapChartConfig} from "helpers/DomHelper";
import {MAP_CHART_HEIGHT} from "configs/constants";
import {getMapConfig} from "helpers/MapHelper";

interface IMapState {
    startDate: any,
    endDate: any,
    ranges: any,
    request: {
        loading: boolean,
        refresh: boolean,
        fetchData: boolean,
    },
    usersInCountries: Array<any>,
}

interface IMapProps extends IStoreProps {
    startDate?: any,
    endDate?: any
}

class Map extends React.Component<IMapProps, IMapState> {

    componentState: boolean = true;

    constructor(props: IMapProps) {
        super(props);
        this.state = {
            startDate: this.props.startDate || moment().subtract(6, "days"),
            endDate: this.props.endDate || moment(),
            ranges: dateTimePickerRanges(),
            request: {
                loading: true,
                refresh: false,
                fetchData: true,
            },
            usersInCountries: [],
        }
    }

    componentDidMount(): void {
        const newState: IMapState = {...this.state};
        this.initRequests(newState);
    }

    componentDidUpdate(prevProps: IMapProps, prevState: IMapState): void {
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

    componentWillUnmount(): void {
        this.componentState = false;
    }

    initRequests = (state: IMapState): void => {
        const {startDate, endDate} = state;

        const mapContainer: string = "map-chart";
        setMapChartConfig(mapContainer, {}, true);

        getUsersByCountries({
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD")
        }).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            state.usersInCountries = data.result || [];

            state.request.loading = false;
            state.request.refresh = false;
            state.request.fetchData = false;

            const usersInCountriesChart: any = getMapConfig(state.usersInCountries);

            if (this.componentState) {
                setMapChartConfig(mapContainer, {config: usersInCountriesChart.config});
                this.setState(state);
            }

        }).catch(e => {
            console.log(e);
            // state.request.loading = false;
            state.request.refresh = false;
            state.request.fetchData = false;
            if (this.componentState) {
                this.setState(state);
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
        const newState: IMapState = {...this.state};
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
        const newState: IMapState = {...this.state};
        newState.request.refresh = true;
        newState.request.fetchData = true;
        this.setState(newState);
        this.initRequests(newState);
    };

    render(): JSX.Element {
        const {ranges, startDate, endDate, request: {refresh}} = this.state;

        return (

            <div className="box-shadow r-3x bg-white m-t-md" id="users-stats-map">
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">

                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                <span className="text-lg padder-t-5 block">Registrations By Countries</span>
                            </div>
                            <div className={"col-lg-6 col-md-6 col-sm-6 col-xs-12"}>
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
                        <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                            <div id="map-chart" style={{height: `${MAP_CHART_HEIGHT}px`}}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Map);
