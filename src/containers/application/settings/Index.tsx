"use strict";

import * as React from "react";
import Nav from "react-bootstrap/es/Nav";
import NavItem from "react-bootstrap/es/NavItem";

import AccessControl from "./AccessControl";
import {SETTINGS} from "configs/constants";
import AppReleases from "./AppReleases";
import Profile from "./Profile";

interface ISettingsState {
    pills: any;
    active: any;
}

class Settings extends React.Component<any, ISettingsState> {

    constructor(props: any) {
        super(props);
        this.state = {
            pills: [
                {
                    eventKey: SETTINGS.TABS.ACCESS_CONTROL,
                    eventClass: <AccessControl/>,
                    title: "Access control"

                },
                {
                    eventKey: SETTINGS.TABS.PROFILE,
                    eventClass: <Profile/>,
                    title: "User Profile"
                },
                // different for Zangi: open for Zangi, closed for Others
                {
                    eventKey: SETTINGS.TABS.APP_RELEASES,
                    eventClass: <AppReleases/>,
                    title: "App Releases"
                },
                // end
            ],
            active: {
                eventKey: SETTINGS.TABS.ACCESS_CONTROL,
                eventClass: <AccessControl/>
            }
        }

    }

    handlePillChange = (pillKey: number): void => {
        const newState: ISettingsState = {...this.state};
        const newPill: any = newState.pills.find(pill => pill.eventKey === pillKey);
        newState.active = {
            eventKey: newPill.eventKey,
            eventClass: newPill.eventClass,
        };
        this.setState(newState);
    };

    render(): JSX.Element {
        const {pills, active}: any = this.state;

        return (
            <div className="container-fluid no-padder settings box-shadow bg-white r-3x">
                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <Nav
                            bsStyle="pills"
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
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        {active.eventClass}
                    </div>
                </div>
            </div>
        );
    }
}

export default Settings;
