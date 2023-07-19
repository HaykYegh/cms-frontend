"use strict";

import * as React from "react";
import Nav from "react-bootstrap/es/Nav";
import {ToastContainer} from "react-toastify";
import NavItem from "react-bootstrap/es/NavItem";

import NotVerified from "containers/application/usersWidthNickname/NotVerified";
import Registered from "containers/application/usersWidthNickname/Registered";
import UserGroups from "containers/application/usersWidthNickname/UserGroups";
import Online from "containers/application/stats/OnlineUsers";
import {USERS} from "configs/constants";

interface IIndexState {
    pills: any,
    active: any
}

class Index extends React.Component<any, IIndexState> {

    constructor(props: any) {
        super(props);
        this.state = {
            pills: [
                {
                    eventKey: USERS.TABS.REGISTERED,
                    component: Registered,
                    title: "Registered Users"
                },
                {
                    eventKey: USERS.TABS.NOT_VERIFIED,
                    component: NotVerified,
                    title: "Not Verified Users"

                },
                // different for zangi
                //  MUST BE CLOSED FOR JALA
                {
                    eventKey: USERS.TABS.USER_GROUPS,
                    component: UserGroups,
                    title: "User Groups"

                },
                // end
            ],
            active: {
                eventKey: USERS.TABS.REGISTERED,
                component: Registered
            }
        }
    };

    handlePillChange = (pillKey: number): void => {
        const newState: IIndexState = {...this.state};
        const newPill: any = newState.pills.find(pill => pill.eventKey === pillKey);
        newState.active = {
            eventKey: newPill.eventKey,
            component: newPill.component,
        };

        this.setState(newState);
    };

    render(): JSX.Element {
        const {pills, active}: any = this.state;

        return (
            <div className="container-fluid no-padder box-shadow bg-white r-3x">
                <ToastContainer/>
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
                        {React.createElement(active.component, {...this.props})}
                    </div>
                </div>
            </div>
        )
    }
}

export default Index;
