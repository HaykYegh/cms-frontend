"use strict";

import axios from "axios";
import * as React from "react";
import {isEmpty} from "lodash";
import {Nav, NavItem} from "react-bootstrap";
import {ToastContainer} from "react-toastify";

import {getCategories, getCountries, getPlatforms, getStatus} from "ajaxRequests/sticker";
import Languages from "containers/application/stickers/update/configurations/Languages";
import Countries from "containers/application/stickers/update/configurations/Countries";
import Settings from "containers/application/stickers/update/configurations/Settings";
import {ISelect, IStickerPackage} from "services/interface";
import {showNotification} from "helpers/PageHelper";
import {STICKERS} from "configs/constants";

interface IIndexState {
    pills: any,
    active: any,
    configurations: {
        languages: any[],
        countries: any[],
        platforms: any[],
        categories: any[],
        status: ISelect,
    }
}

interface IIndexProps {
    changeStep: (e: React.MouseEvent<HTMLButtonElement>) => void,
    stickerPackage: IStickerPackage,
}

class Index extends React.Component<IIndexProps, IIndexState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            pills: [
                {
                    eventKey: STICKERS.TABS.CONFIGURATIONS.TABS.LANGUAGES,
                    eventClass: Languages,
                    title: "Languages",
                },
                {
                    eventKey: STICKERS.TABS.CONFIGURATIONS.TABS.COUNTRIES,
                    eventClass: Countries,
                    title: "Countries",
                },
                {
                    eventKey: STICKERS.TABS.CONFIGURATIONS.TABS.SETTINGS,
                    eventClass: Settings,
                    title: "Settings",
                },
            ],
            active: {
                eventKey: STICKERS.TABS.CONFIGURATIONS.TABS.LANGUAGES,
                eventClass: Languages,
            },
            configurations: {
                languages: [],
                countries: [],
                platforms: null,
                categories: null,
                status: null
            },
        }
    }

    componentDidMount(): void {
        const {stickerPackage: {packageId}} = this.props;
        axios.all([
            getCountries(packageId),
            getPlatforms(packageId),
            getCategories(packageId),
            getStatus(packageId),
        ]).then(axios.spread((countries, platforms, categories, status) => {
            const newState: any = {...this.state};
            if (!countries.data.err) {
                if (countries.data.result.length > 0) {
                    newState.configurations.countries = countries.data.result.map(item => {
                        return {
                            country_id: item.country_id,
                            label: item.name,
                            region_code: item.region_code,
                            value: item.country_id
                        }
                    });
                }
            } else {
                this.componentState && showNotification("error", {
                    title: "You got an error!",
                    description: "Error when getting countries",
                    timer: 3000,
                    hideProgress: true
                });
            }

            if (!platforms.data.err) {
                if (platforms.data.result.length > 0) {
                    newState.configurations.platforms = platforms.data.result.map(item => {
                        return {
                            label: item.name,
                            value: item.name,
                            platform_id: item.platform_id
                        }
                    });
                }
            } else {
                this.componentState && showNotification("error", {
                    title: "You got an error!",
                    description: "Error when getting platforms",
                    timer: 3000,
                    hideProgress: true
                });
            }

            if (!categories.data.err) {
                if (categories.data.result.length > 0) {
                    newState.configurations.categories = categories.data.result.map(item => {
                        return {
                            label: item.name,
                            value: item.category_id
                        }
                    });
                }
            } else {
                this.componentState && showNotification("error", {
                    title: "You got an error!",
                    description: "Error when getting categories",
                    timer: 3000,
                    hideProgress: true
                });
            }

            if (!status.data.err) {
                if (status.data.result) {
                    newState.configurations.status = {
                        label: status.data.result.name,
                        value: status.data.result.package_status_id
                    };
                }
            } else {
                this.componentState && showNotification("error", {
                    title: "You got an error!",
                    description: "Error when getting status",
                    timer: 3000,
                    hideProgress: true
                });
            }

            if (this.componentState) {
                this.setState(newState);
            }

        })).catch(error => console.log(error));
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handlePillChange = (pillKey: number): void => {
        const newState: any = {...this.state};
        const newPill: any = newState.pills.find(pill => pill.eventKey === pillKey);

        newState.active = {
            eventKey: newPill.eventKey,
            eventClass: newPill.eventClass,
        };

        this.setState(newState);
    };

    handleStickerConfigChange = (name: string, data: any): void => {
        const newState: any = {...this.state};
        newState.configurations[name] = data;
        this.setState(newState);
    };

    render(): JSX.Element {
        const {pills, active, configurations} = this.state;
        const {changeStep, stickerPackage: {packageId}} = this.props;
        const nextStepStatus: boolean = Object.keys(configurations).every(item => !isEmpty(configurations[item]));
        return (
            <div className="container-fluid no-padder">
                <div className="row b-b b-t">
                    {/*Navigation*/}
                    <div className="col-lg-offset-2 col-lg-8">
                        <Nav
                            bsClass="nav nav-pills nav-justified m-t-lg"
                            id="pill-panel"
                            justified={true}
                            activeKey={active.eventKey}
                            onSelect={this.handlePillChange}
                        >
                            {pills.map(pill =>
                                <NavItem
                                    key={pill.eventKey}
                                    eventKey={pill.eventKey}
                                    title={pill.title}
                                >{pill.title}
                                </NavItem>
                            )}
                        </Nav>
                    </div>
                    <div className="col-lg-12">
                        <div className="container-fluid no-padder">
                            {React.createElement(active.eventClass, {
                                configChange: this.handleStickerConfigChange,
                                configurations,
                                packageId
                            }, null)}
                        </div>
                    </div>
                </div>
                <div className="row wrapper">
                    <div className="col-lg-4">
                        <button
                            className="btn btn-default"
                            onClick={changeStep}
                            data-tab-key={STICKERS.TABS.ARRANGE}
                        >Back
                        </button>
                    </div>
                    <div className="col-lg-offset-4 col-lg-4">
                        <button
                            disabled={!nextStepStatus}
                            onClick={changeStep}
                            className="btn btn-info pull-right"
                            data-tab-key={STICKERS.TABS.PUBLISH}
                        >Next
                        </button>
                    </div>
                </div>
                <ToastContainer/>
            </div>
        );
    }
}

export default Index;
