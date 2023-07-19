"use strict";

import * as React from "react";
import {connect} from "react-redux";
import {AxiosResponse} from "axios";
import isEqual from "lodash/isEqual";
import ReactCountryFlag from "react-country-flag";

import ByDates from "containers/application/stats/users/ByDates";
import selector, {IStoreProps} from "services/selector";
import {getPieChartConfig} from "helpers/ChartHelper";
import {getUsersOverview} from "ajaxRequests/stats";
import {setNewChartConfig} from "helpers/DomHelper";
import {showNotification} from "helpers/PageHelper";
import {PIE_CHART_HEIGHT} from "configs/constants";

interface IByCountriesState {
    request: {
        loading: boolean,
        refresh: boolean,
        fetchData: boolean
    },

    overview: any,
}

interface IByCountriesProps extends IStoreProps {
    regionCode: string,
    goBack: (e: React.MouseEvent<HTMLElement>) => void,
    startDate: any,
    endDate: any
}

class ByCountries extends React.Component<IByCountriesProps, IByCountriesState> {

    componentState: boolean = true;

    constructor(props: IByCountriesProps) {
        super(props);
        this.state = {
            request: {
                loading: true,
                refresh: false,
                fetchData: true
            },

            overview: {}
        }
    }

    componentDidMount(): void {
        const newState: IByCountriesState = {...this.state};
        this.initRequests(newState);
    }

    componentDidUpdate(prevProps: IByCountriesProps, prevState: IByCountriesState): void {
        const {regionCode, startDate, endDate} = this.props;
        if (regionCode && (!isEqual(prevProps.startDate, startDate) || !isEqual(prevProps.endDate, endDate))) {
            const newState: IByCountriesState = {...this.state};
            this.initRequests(newState);
        }

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

    initRequests = (state: IByCountriesState): void => {
        const {startDate, endDate, regionCode} = this.props;

        const userRegistrationContainer: string = `${regionCode ? `${regionCode}-` : ""}user-registration-chart`;
        const userPlatformContainer: string = `${regionCode ? `${regionCode}-` : ""}user-platform-chart`;
        const userRegistrationTypeContainer: string = `${regionCode ? `${regionCode}-` : ""}user-registration-type-chart`;

        setNewChartConfig(userRegistrationContainer, {height: PIE_CHART_HEIGHT}, true);
        setNewChartConfig(userPlatformContainer, {}, true);
        setNewChartConfig(userRegistrationTypeContainer, {}, true);

        getUsersOverview({
            startDate,
            endDate,
            regionCode
        }).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            state.overview = data.result || [];

            const userRegistration: any = state.overview.total ? [
                {
                    name: "Registered",
                    value: state.overview.total
                },
                {
                    name: "Not Verified",
                    value: state.overview.notVerified.email + state.overview.notVerified.mobile
                }
            ] : [];

            const userPlatform: any = state.overview.platforms ? [
                {
                    name: "Android",
                    value: state.overview.platforms.find(item => item.name === "Android") ? state.overview.platforms.find(item => item.name === "Android").count : 0
                },
                {
                    name: "iOS",
                    value: state.overview.platforms.find(item => item.name === "iOS") ? state.overview.platforms.find(item => item.name === "iOS").count : 0
                }
            ] : [];

            const userRegistrationType: any = (state.overview.registered.email || state.overview.registered.mobile) ? [
                {
                    name: "Phone",
                    value: state.overview.registered.mobile
                },
                {
                    name: "Email",
                    value: state.overview.registered.email
                }
            ] : [];

            const userRegistrationPieChart: any = getPieChartConfig(userRegistration, {
                enabled: true,
                innerSize: "0%",
                colors: ["#D4F0FD", "#7CB5EC"],
            });
            const userPlatformPieChart: any = getPieChartConfig(userPlatform, {
                enabled: true,
                innerSize: "0%",
                colors: ["#D4F0FD", "#7CB5EC"],
            });
            const userRegistrationTypePieChart: any = getPieChartConfig(userRegistrationType, {
                enabled: true,
                innerSize: "0%",
                colors: ["#D4F0FD", "#7CB5EC"],
            });

            state.request.loading = false;
            state.request.refresh = false;
            state.request.fetchData = false;

            if (this.componentState) {
                setNewChartConfig(userRegistrationContainer, {config: userRegistrationPieChart.config});
                setNewChartConfig(userPlatformContainer, {config: userPlatformPieChart.config});
                setNewChartConfig(userRegistrationTypeContainer, {config: userRegistrationTypePieChart.config});
                this.setState(state);
            }

        }).catch(e => {
            console.log(e);
            // state.request.loading = false;
            state.request.refresh = false;
            state.request.fetchData = false;
            if (this.componentState) {

                const pieChart: any = getPieChartConfig([], {});

                setNewChartConfig(userRegistrationContainer, {config: pieChart.config});
                setNewChartConfig(userPlatformContainer, {config: pieChart.config});
                setNewChartConfig(userRegistrationTypeContainer, {config: pieChart.config});

                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get users statistics",
                    timer: 3000
                });
            }
        });
    };

    render(): JSX.Element {
        const {request: {refresh}, overview} = this.state;
        const {regionCode, goBack, regionCodes, startDate, endDate} = this.props;

        const registeredUsers: number = overview.total || 0;
        const notVerifiedUsers: number = overview.notVerified && overview.notVerified.email + overview.notVerified.mobile || 0;
        let failPercentage: number = 0;
        if (notVerifiedUsers && notVerifiedUsers !== 0) {
            failPercentage = (
                notVerifiedUsers * 100 /
                (registeredUsers + notVerifiedUsers)
            );

            failPercentage = failPercentage % 2 === 0 ? +failPercentage : +failPercentage.toFixed(1);
        }

        const emailRegisteredUsers: number = overview.registered && overview.registered.email || 0;

        return (

            <div>
                <hr/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            {
                                regionCode ? <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                    <div className="flex-start-center">
                                        <button
                                            className="btn btn-default m-r-sm"
                                            onClick={goBack}
                                        ><i className="fa fa-arrow-left m-r-xs"/>Back To Totals
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

                                {overview.platforms && overview.platforms.map((item, i) => {
                                    return (
                                        <div
                                            key={i}
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
                        <div className="row m-b-lg">
                            <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                <div
                                    id={`${regionCode ? `${regionCode}-` : ""}user-registration-chart`}
                                    style={{height: `${PIE_CHART_HEIGHT}px`}}
                                />
                            </div>
                            <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                <div
                                    id={`${regionCode ? `${regionCode}-` : ""}user-platform-chart`}
                                    style={{height: `${PIE_CHART_HEIGHT}px`}}
                                />
                            </div>
                            <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                                <div
                                    id={`${regionCode ? `${regionCode}-` : ""}user-registration-type-chart`}
                                    style={{height: `${PIE_CHART_HEIGHT}px`}}
                                />
                            </div>
                        </div>

                        <hr/>

                        {regionCode &&
                        <ByDates
                            regionCode={regionCode}
                            startDate={startDate}
                            endDate={endDate}
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

export default connect(mapStateToProps, mapDispatchToProps)(ByCountries);
