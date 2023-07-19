"use strict";

import * as React from "react";
import Nav from "react-bootstrap/es/Nav";
import NavItem from "react-bootstrap/es/NavItem";

import CountriesAndPlatforms from "containers/application/notification/new/CountriesAndPlatforms";
import Numbers from "containers/application/notification/new/Numbers";
import Groups from "containers/application/notification/new/Groups";
import {NOTIFICATION} from "configs/constants";
import {getSendersList} from "ajaxRequests/notification";
import {AxiosResponse} from "axios";
import {showNotification} from "helpers/PageHelper";

interface IIndexProps {
    tabChange: (tabKey: number) => void
}

interface IIndexState {
    pills: any;
    active: any;
    senders: any[],
}

class Index extends React.Component<IIndexProps, IIndexState> {

    constructor(props: any) {
        super(props);
        this.state = {
            pills: [
                {
                    eventKey: NOTIFICATION.TABS.NEW_NOTIFICATION.COUNTRIES_AND_PLATFORMS,
                    component: CountriesAndPlatforms,
                    title: "Countries & Platforms"
                },
                // different fo zangi
                // CHANGE FOR JALA TO title:"Users"
                {
                    eventKey: NOTIFICATION.TABS.NEW_NOTIFICATION.NUMBERS,
                    component: Numbers,
                    title: "Numbers" ,
                },
                // end
                {
                    eventKey: NOTIFICATION.TABS.NEW_NOTIFICATION.GROUPS,
                    component: Groups,
                    title: "Groups"
                },
            ],
            active: {
                eventKey: NOTIFICATION.TABS.NEW_NOTIFICATION.COUNTRIES_AND_PLATFORMS,
                component: CountriesAndPlatforms,
            },
            senders: []
        }
    }

    componentDidMount(): void {
        document.title = "Notifications";
        const newState: IIndexState = {...this.state};
        getSendersList(0, 1000).then(({data}: AxiosResponse) => {

            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.senders = data.result.map(item => {
                return {
                    value: item.messageSenderId,
                    label: item.label
                }
            }) || [];

            this.setState(newState);

        }).catch(e => {
            console.log(e);
            this.setState(newState);
            showNotification("error", {
                title: "You've got an error!",
                description: "Cannot get senders",
                timer: 3000
            });

        });
    }

    handlePillChange = (pillKey: number): void => {

        const newState: any = {...this.state};

        const newPill: any = newState.pills.filter(pill => {
            return pill.eventKey === pillKey;
        });

        newState.active = {
            eventKey: newPill[0].eventKey,
            component: newPill[0].component,
        };

        this.setState(newState);
    };

    handleGoToDefaultPage = () => {
        const {tabChange}: any = this.props;
        // tabChange(NOTIFICATION.TABS.SENT);
    };

    render(): JSX.Element {
        const {pills, active, senders}: any = this.state;

        return (
            <div className="r-3x bg-white">
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl padder-t-3">New Notification To</span>
                            </div>
                        </div>
                    </div>
                </div>
                <hr/>

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 m-b-md">
                                <Nav
                                    id="nav"
                                    activeKey={active.eventKey}
                                    bsStyle="pills"
                                    justified={true}
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
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                {React.createElement(active.component, {...this.props, senders})}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Index;
