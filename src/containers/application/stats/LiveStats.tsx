"use strict";

import axios from "axios";
import * as React from "react";

import {getLiveStatistics, getTotalUsers} from "ajaxRequests/users";
import {BOX_BLOCK, LEFT_PANEL_NAVIGATION} from "configs/constants";
import BoxBlock from "components/Common/BoxBlock";

interface ILiveStatsState {
    liveStatistics: any,
}

interface ILiveStatsProps {
    history?: any
}

class LiveStats extends React.Component<ILiveStatsProps, ILiveStatsState> {

    boxBlocks: any = null;

    counter: any = null;

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            liveStatistics: {
                totalUsers: {
                    name: "total_users",
                    key: "total_users",
                    size: "col-lg-3 col-md-6 col-xs-12 col-sm-12",
                    value: "",
                    link: "users"
                },
                onlineUsers: {
                    name: "online_users",
                    key: "online_users",
                    size: "col-lg-3 col-md-6 col-xs-12 col-sm-12",
                    value: "",
                    link: ""
                },
                liveCalls: {
                    name: "live_calls",
                    key: "call",
                    size: "col-lg-3 col-md-6 col-xs-12 col-sm-12",
                    value: "",
                    link: "calls"
                },
                backTermination: {
                    name: "back_termination",
                    key: "back_termination",
                    size: "col-lg-3 col-md-6 col-xs-12 col-sm-12",
                    value: "",
                    link: "calls"
                }
            },
        }
    }

    componentWillMount(): void {
        const {liveStatistics} = this.state;
        this.boxBlocks = this.liveStatisticsComponent(liveStatistics);
    }

    componentDidMount(): void {
        this.handleGetLiveStatistics();
    }

    componentWillUnmount(): void {
        this.componentState = false;
        clearInterval(this.counter);
    }

    handleGetLiveStatistics = (): void => {
        axios.all([
            getTotalUsers(),
            getLiveStatistics()
        ]).then(axios.spread((totalUsers, liveStatistics) => {
            const newState: any = {...this.state};
            if (!totalUsers.data.err) {
                newState.liveStatistics.totalUsers.value = totalUsers.data.result.count;
            }
            if (!liveStatistics.data.err) {
                const result: any = liveStatistics.data.result;
                const liveCalls: string = result.voip_call + "/" + result.back_termination;
                newState.liveStatistics.onlineUsers.value = result.online_users;
                newState.liveStatistics.liveCalls.value = result.call;
                newState.liveStatistics.backTermination.value = liveCalls;
            }
            if (this.componentState) {
                this.boxBlocks = this.liveStatisticsComponent(newState.liveStatistics);
                if (!this.counter) {
                    this.counter = setInterval(() => {
                        this.handleGetLiveStatistics();
                    }, 10000);
                }
                this.setState(newState);
            }
        })).catch(e => {
            console.log(e);
        });
    };

    liveStatisticsComponent = (liveStatistics: any): any[] => {
        const {history} = this.props;
        const result: any = [];
        let index: number = 0;
        for (const item in liveStatistics) {
            if (liveStatistics.hasOwnProperty(item)) {
                result.push(
                    <BoxBlock
                        key={index}
                        size={liveStatistics[item].size}
                        name={liveStatistics[item].name}
                        label={BOX_BLOCK[liveStatistics[item].name.toUpperCase()]}
                        value={liveStatistics[item].value}
                        link={LEFT_PANEL_NAVIGATION[liveStatistics[item].link]}
                        linkToCallBack={history}
                    />
                );
                index++;
            }
        }
        return result;
    };

    render(): JSX.Element {
        return (
            <div className="bg-white box-shadow content-wrapper r-3x">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-12">
                            <span className="text-lg m-b-md block">Real-time statistics</span>
                        </div>
                        {this.boxBlocks}
                    </div>
                </div>
            </div>
        );
    }
}

export default LiveStats
