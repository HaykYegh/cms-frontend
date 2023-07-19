"use strict";

import * as React from "react";
import {Link} from "react-router-dom";

interface IGettingStartedState {
    showGettingStarted: boolean
}

export default class GettingStarted extends React.Component<any, IGettingStartedState> {

    constructor(props: any) {
        super(props);
        const showGettingStarted: string = localStorage.getItem("showGettingStarted");

        this.state = {
            showGettingStarted: showGettingStarted === "show"
        }

    };

    handleGettingStartedHide: any = (): void => {
        localStorage.setItem("showGettingStarted", "hide");
        const newState: IGettingStartedState = {...this.state};
        newState.showGettingStarted = false;
        this.setState(newState);
    };

    render(): JSX.Element {
        const {showGettingStarted} = this.state;

        if (showGettingStarted) {
            return (
                <div className="bg-white box-shadow r-3x m-b-md">
                    <div className="content-wrapper">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                    <span className="text-xsl padder-t-3">Getting Started</span>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                    <div className="text-right">
                                        <button className="btn btn-default btn-addon" onClick={this.handleGettingStartedHide}>
                                            <i className="icon-close"/>Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr/>

                    <div className="content-wrapper getting-started">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12 m-b-md">
                                    <img src={"/assets/images/sip.png"} alt="SIP" className="img-responsive m-b-sm"/>
                                    <p className="text-lg">Connect Your Existing SIP Phone System</p>
                                    <span className="block m-b-sm">Setup is done one time for all network users. Connecting your phone system is simple and straightforward.</span>
                                    <Link to="/gateways/create" className="text-info">Connect Your SIP Trunk <span className="glyphicon glyphicon-menu-right"/></Link>
                                </div>
                                <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12 m-b-md">
                                    <img src={"/assets/images/call-button.png"} alt="Call button name" className="img-responsive m-b-sm"/>
                                    <p className="text-lg">Set the Name for Your Call Button</p>
                                    <span className="block m-b-sm">All of your connected users will have your company network call button inside Zangi apps. Give it a name.</span>
                                    <Link to="/" className="text-info">Set Your Call Button Name <span className="glyphicon glyphicon-menu-right"/></Link>
                                </div>
                                <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12 m-b-md">
                                    <img src={"/assets/images/invite.png"} alt="Invite Links" className="img-responsive m-b-sm"/>
                                    <p className="text-lg">Send Invite Links to Your Staff</p>
                                    <span className="block m-b-sm">
                                Send invite links to users, asking them to join your network.
                                Your users will need only click the link and become a network member.
                                No configuration is needed.</span>
                                    <Link to="/" className="text-info">Invite Your Members <span className="glyphicon glyphicon-menu-right"/></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        return null;
    }
}
