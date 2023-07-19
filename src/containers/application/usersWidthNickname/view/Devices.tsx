"use strict";

import axios from "axios";
import * as React from "react";
import format from "date-fns/format";
import Table from "react-bootstrap/es/Table";
import Button from "react-bootstrap/es/Button";

import {LIST} from "configs/constants";
import Loader from "components/Common/Loading";
import {showNotification} from "helpers/PageHelper";
import {getDevicesList} from "ajaxRequests/devices";
import {getAttemptsList} from "ajaxRequests/attempts";
import {setPaginationRange} from "helpers/DataHelper";

interface IDevicesState {
    userDevicesControl: {
        isLoading: boolean,
        offset: number,
        limit: number,
    },
    userAttemptsControl: {
        isLoading: boolean,
        offset: number,
        limit: number,
    },
    isLoading: boolean,
    devicesList: any[],
    attemptsList: any[],
}

interface IDevicesProps {
    user: any,
}

class Devices extends React.Component<IDevicesProps, IDevicesState> {

    isComponentMounted: boolean = true;

    constructor(props: IDevicesProps) {
        super(props);
        this.state = {
            userDevicesControl: {
                isLoading: true,
                offset: 0,
                limit: 50
            },
            userAttemptsControl: {
                isLoading: true,
                offset: 0,
                limit: 50
            },
            isLoading: true,
            devicesList: [],
            attemptsList: [],
        }
    }

    componentDidMount(): void {
        this.initRequests();
    }

    initRequests = (): void => {
        const {user} = this.props;
        const newState: IDevicesState = {...this.state};

        axios.all([
            getDevicesList(0, user.user_id),
            getAttemptsList(0, user.username),
        ]).then(axios.spread((devicesList, attemptsList) => {
            if (!devicesList.data.err) {
                newState.devicesList = devicesList.data.result;
            } else {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get device list",
                    timer: 3000,
                    hideProgress: true
                });
            }

            if (!attemptsList.data.err) {
                newState.attemptsList = attemptsList.data.result;
            } else {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get attempts list",
                    timer: 3000,
                    hideProgress: true
                });
            }

            newState.isLoading = false;
            newState.userAttemptsControl.isLoading = false;
            newState.userDevicesControl.isLoading = false;

            if (this.isComponentMounted) {
                this.setState(newState);
            }

        })).catch((e) => {
            console.log(e);
            if (this.isComponentMounted) {
                if (newState.isLoading) {
                    newState.isLoading = false;
                }
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get user information",
                    timer: 3000
                });
            }
        });
    };

    render(): JSX.Element {
        const {isLoading, devicesList, userDevicesControl, userAttemptsControl} = this.state;

        const {start, end} = setPaginationRange(userAttemptsControl, userAttemptsControl.offset, userAttemptsControl.limit);

        return (
            <div className="bg-white box-shadow r-3x m-b-md">
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <span className="text-xsl padder-t-3 block">Devices</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="content-wrapper hidden">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="m-b-lg">
                                {
                                    <div className="col-lg-12">
                                        <div className="m-b-sm text-right ">
                                            <ul className="list-inline">

                                                <li>
                                                    <Button
                                                        disabled={userDevicesControl.offset === 1 || userDevicesControl.isLoading}
                                                        data-action={LIST.ACTION.PREVIOUS}
                                                        bsStyle="default"
                                                    ><i className="glyphicon glyphicon-chevron-left"/>
                                                    </Button>
                                                </li>
                                                <li>
                                                    <span>{start + "-" + end}</span>
                                                </li>

                                                <li>
                                                    <Button
                                                        disabled={devicesList.length < userDevicesControl.limit || userDevicesControl.isLoading}
                                                        data-action={LIST.ACTION.NEXT}
                                                        bsStyle="default"
                                                    ><i className="glyphicon glyphicon-chevron-right"/>
                                                    </Button>
                                                </li>
                                                <li>
                                                    <Button
                                                        disabled={userDevicesControl.isLoading}
                                                        data-action={LIST.ACTION.RESET}
                                                        bsStyle="danger"
                                                    ><i className="glyphicon glyphicon-remove"/>
                                                    </Button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                {
                    isLoading ? <div className="content-wrapper"><Loader/></div> :
                        <Table
                            hover={true}
                            condensed={true}
                            responsive={true}
                        >
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>DeviceID</th>
                                <th>Name</th>
                                <th>Platform</th>
                                <th>Platform Version</th>
                                <th>App Version</th>
                                <th>Language</th>
                                <th>Last Sign In</th>
                            </tr>
                            </thead>
                            <tbody>

                            {(devicesList.length === 0) && <tr>
                                <td colSpan={8}>
                                    <div className="empty">No results found.
                                    </div>
                                </td>
                            </tr>}

                            {devicesList.map((device, index) => {
                                const N: number = userDevicesControl.offset * userDevicesControl.limit + index + 1;
                                return (
                                    <tr key={device.user_device_id}>
                                        <td>{N}</td>
                                        <td>{device.user_device_id}</td>
                                        <td>{device.device_name}</td>
                                        <td>{device.platform}</td>
                                        <td>{device.platform_version}</td>
                                        <td>{device.app_version}</td>
                                        <td>{device.language}</td>
                                        <td>{format(device.last_sign_in, "DD MMM YYYY hh:mm A")}
                                        </td>

                                    </tr>
                                )
                            })}
                            </tbody>
                        </Table>
                }
            </div>
        )
    }
}

export default Devices;
