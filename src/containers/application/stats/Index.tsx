"use strict";

import * as React from "react";
import {ToastContainer} from "react-toastify";

import GettingStarted from "containers/application/stats/GettingStarted";
import Messages from "containers/application/stats/messages/Index";
import CallsStats from "containers/application/stats/calls/Index";
import LiveStats from "containers/application/stats/LiveStats";
import ActiveUsers from "components/Common/ActiveUsers";

// different for Zangi
// import UsersStats from "containers/application/stats/UsersStats"; // for other consoles
import UsersStats from "containers/application/stats/users/Index"; // for Zangi console
// end
class Index extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }

    componentDidMount(): void {
        document.title = "Statistics";
    }

    render(): JSX.Element {
        return (
            <div>
                <ToastContainer/>
                {/*<GettingStarted/>*/}
                <LiveStats history={this.props.history}/>
                <UsersStats/>
                <Messages/>
                <CallsStats/>
                <ActiveUsers  isStatsPage={true}/>
            </div>
        );
    }
}

export default Index;
