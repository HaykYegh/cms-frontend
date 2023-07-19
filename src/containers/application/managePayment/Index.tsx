"use strict";

import * as React from "react";
import Nav from "react-bootstrap/es/Nav";
import NavItem from "react-bootstrap/es/NavItem";

import TierGroups from "containers/application/managePayment/tierGroups/Index";
import TierGroupCustomers from "containers/application/managePayment/tierGroupCustomers";
import Subscription from "containers/application/managePayment/subscription/Index";

import {PAGE_NAME, MANAGE_PAYMENT} from "configs/constants";

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
                    eventKey: MANAGE_PAYMENT.TABS.TIER_GROUPS,
                    eventClass: <TierGroups/>,
                    title: "Tier groups"
                },
                {
                    eventKey: MANAGE_PAYMENT.TABS.TIER_GROUP_CUSTOMERS,
                    eventClass: <TierGroupCustomers/>,
                    title: "Customers"

                },
                {
                    eventKey: MANAGE_PAYMENT.TABS.SUBSCRIPTION,
                    eventClass: <Subscription/>,
                    title: "Subscription"

                }
            ],
            active: {
                eventKey: MANAGE_PAYMENT.TABS.TIER_GROUPS,
                eventClass: <TierGroups/>,
            }
        }

    }

    handlePillChange = (pillKey: number): void => {
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
                        {/*<span className="text-xsl text-black">{PAGE_NAME["/manage-payments"]}</span>*/}
                    {/*</div>*/}
                {/*</div>*/}
                <div className="row">
                    <div className="col-lg-12">
                        <div className="bg-white box-shadow content-wrapper r-3x">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="m-b-lg b-b-md">
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
