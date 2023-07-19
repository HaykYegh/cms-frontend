"use strict";

import * as React from "react";
import {connect} from "react-redux";
import Nav from "react-bootstrap/es/Nav";
import NavItem from "react-bootstrap/es/NavItem";
import NewNotification from "containers/application/notificationWidthNickname/new/Index";
import Sender from "containers/application/notificationWidthNickname/senders/Index";

import Sent from "containers/application/notificationWidthNickname/Sent";
import Trash from "containers/application/notificationWidthNickname/Trash";
import Drafts from "containers/application/notificationWidthNickname/Drafts";
import InProgress from "containers/application/notificationWidthNickname/InProgress";
import {NOTIFICATION, PAGE_NAME} from "configs/constants";
import selector from "services/selector";
import {ToastContainer} from "react-toastify";

interface INotificationState {
    tabs: any;
    active: any;
}

class Notification extends React.Component<any, INotificationState> {

    constructor(props: any) {
        super(props);
        this.state = {
            tabs: [
                {
                    eventKey: NOTIFICATION.TABS.NEW_NOTIFICATION.DEFAULT,
                    eventClass: <NewNotification tabChange={this.handleTabChange}/>,
                    title: "New Notification",
                    // icon: "",
                    // className: "",
                    // disabled: false,
                },
                {
                    eventKey: NOTIFICATION.TABS.SENDERS,
                    eventClass: <Sender/>,
                    title: "Sender",
                    // icon: "",
                    // className: "",
                    // disabled: false,
                }
                // {
                //     eventKey: NOTIFICATION.TABS.SENT,
                //     eventClass: <Sent/>,
                //     title: "Sent",
                //     icon: "fa-bell-o",
                //     className: "",
                //     disabled: false,
                // },
                // {
                //     eventKey: NOTIFICATION.TABS.DRAFTS,
                //     eventClass: <Drafts/>,
                //     title: "Drafts",
                //     icon: "fa-folder-o",
                //     className: "",
                //     disabled: false,
                // },
                // {
                //     eventKey: NOTIFICATION.TABS.TRASH,
                //     eventClass: <Trash/>,
                //     title: "Trash",
                //     icon: "fa-trash-o",
                //     className: "",
                //     disabled: false,
                // },
                // {
                //     eventKey: NOTIFICATION.TABS.IN_PROGRESS,
                //     eventClass: <InProgress/>,
                //     title: "InProgress",
                //     icon: "fa-paper-plane-o",
                //     className: "",
                //     disabled: false,
                // }
            ],
            active: {
                eventKey: NOTIFICATION.TABS.NEW_NOTIFICATION.DEFAULT,
                eventClass: <NewNotification tabChange={this.handleTabChange}/>,
            }
        }

    }

    handleTabChange = (tabKey: number): void => {
        const newState: INotificationState = {...this.state};
        const newTab: any = newState.tabs.find(tab => tab.eventKey === tabKey);

        newState.active = {
            eventKey: newTab.eventKey,
            eventClass: newTab.eventClass,
        };

        this.setState(newState);
    };

    render(): JSX.Element {
        const {tabs, active} = this.state;

        return (
            <div className="container-fluid no-padder box-shadow bg-white r-3x">
                <ToastContainer/>
                <div className="row">

                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <Nav
                            bsStyle="pills"
                            // className="notify"
                            justified={true}
                            activeKey={active.eventKey}
                            onSelect={this.handleTabChange}
                        >
                            {tabs.map(tab => {
                                    return (
                                        <NavItem
                                            key={tab.eventKey}
                                            eventKey={tab.eventKey}
                                            title={tab.title}
                                        >{tab.title}
                                        </NavItem>
                                    )
                                    // if (!tab.disabled) {
                                    //     return (
                                    //         <NavItem
                                    //             key={tab.eventKey}
                                    //             className={tab.className}
                                    //             eventKey={tab.eventKey}
                                    //             title={tab.title}
                                    //         >{tab.icon !== "" ? <i className={`fa ${tab.icon}`} aria-hidden="true"/> :
                                    //             <span className="m-r-md">&nbsp;</span>}
                                    //             <span className="text-md">{tab.title}</span>
                                    //         </NavItem>
                                    //     )
                                    // }
                                }
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

export default Notification;
