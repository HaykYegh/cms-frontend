"use strict";

import * as React from "react";
import Nav from "react-bootstrap/es/Nav";
import NavItem from "react-bootstrap/es/NavItem";

import {BILLING, PAGE_NAME} from "configs/constants";
import Overview from "./overview/Index";
import History from "./history/Index";
import Methods from "./methods/Index";

interface IIndexState {
    pills: any;
    active: any;
}

class Index extends React.Component<any, IIndexState> {

    constructor(props: any) {
        super(props);
        this.state = {
            pills: [
                {
                    eventKey: BILLING.TABS.OVERVIEW,
                    eventClass: <Overview/>,
                    title: "Overview"
                },
                {
                    eventKey: BILLING.TABS.HISTORY,
                    eventClass: <History/>,
                    title: "Payment history"
                },
                {
                    eventKey: BILLING.TABS.METHODS,
                    eventClass: <Methods/>,
                    title: "Payment methods"
                },
            ],
            active: {
                eventKey: BILLING.TABS.METHODS,
                eventClass: <Methods/>
            }
        }

    }

    componentWillMount(): void {
        document.title = PAGE_NAME["/billing"];
    }

    handlePillChange = (pillKey: number): void => {
        const {active} = this.state;
        if (active.eventKey === pillKey) {
            return;
        }
        const newState: IIndexState = {...this.state};
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
            <div className="container-fluid no-padder">
                {/*<div className="row m-b-md">*/}
                    {/*<div className="col-lg-6">*/}
                        {/*<span className="text-xsl text-black">{PAGE_NAME["/payment"]}</span>*/}
                    {/*</div>*/}
                {/*</div>*/}
                <div className="row">
                    <div className="col-lg-12">
                        <div className="bg-white box-shadow content-wrapper r-3x">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div id="settings-nav" className="m-b-lg b-b-md">
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
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="container-fluid no-padder">
                                            {active.eventClass}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Index;
