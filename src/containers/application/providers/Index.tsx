"use strict";

import * as React from "react";
import Nav from "react-bootstrap/es/Nav";
import {ToastContainer} from "react-toastify";
import NavItem from "react-bootstrap/es/NavItem";

import {PROVIDERS} from "configs/constants";
import Operators from "containers/application/providers/Operators";
import Registrations from "containers/application/providers/Registrations";

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
                    eventKey: PROVIDERS.TABS.OPERATORS,
                    component: Operators,
                    title: "Operators"
                },
                // MUST BE CLOSED FOR JALA
                // {
                //     eventKey: PROVIDERS.TABS.REGISTRATIONS,
                //     component: Registrations,
                //     title: "Registrations"
                //
                // },
            ],
            active: {
                eventKey: PROVIDERS.TABS.OPERATORS,
                component: Operators
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

                    {/*different for Zangi*/}
                    {/* MUST BE CLOSED FOR JALA */}
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
                    {/*end*/}
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        {React.createElement(active.component, {...this.props, ...{handlePillChange: this.handlePillChange}})}
                    </div>
                </div>
            </div>
        )
    }
}

export default Index;
