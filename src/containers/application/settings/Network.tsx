"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import FormGroup from "react-bootstrap/es/FormGroup";
import HelpBlock from "react-bootstrap/es/HelpBlock";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {getNetwork, updateNetwork} from "ajaxRequests/network";
import PageLoader from "components/Common/PageLoader";
import {showNotification} from "helpers/PageHelper";
import {IVALIDATION} from "services/interface";
import {PAGE_NAME} from "configs/constants";
import {decrypt} from "helpers/DataHelper";
import {ToastContainer} from "react-toastify";

interface INetworkState {
    validation: {
        description: IVALIDATION,
    },
    optionalValidation: {
        callName: IVALIDATION,
    }
    networkId: number,
    request: {
        update: {
            processing: boolean,
            complete: boolean,
            disabled: boolean,
        }
    },
    network: any,
    loading: boolean,
}

class Network extends React.Component<any, INetworkState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            loading: true,
            network: {},
            networkId: null,
            validation: {
                description: {
                    value: null,
                    message: ""
                }
            },
            optionalValidation: {
                callName: {
                    value: null,
                    message: ""
                },
            },
            request: {
                update: {
                    processing: false,
                    complete: false,
                    disabled: true,
                },
            },
        }

    }

    componentWillMount(): void {
        document.title = PAGE_NAME["/settings/network"];
    }

    componentDidMount(): void {
        const newState: INetworkState = {...this.state};
        try {
            const user: any = JSON.parse(decrypt(localStorage.getItem("user")));
            getNetwork(user.network.networkId).then(({data}: AxiosResponse) => {
                if (data.err) {
                    throw new Error(JSON.stringify(data));
                }

                newState.network = data.result || {};
                newState.networkId = user.network.networkId || null;

                newState.loading = false;
                if (this.componentState) {
                    this.setState(newState);
                }
            })
        } catch (e) {
            console.log(e);
            newState.loading = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not get network info",
                    timer: 3000,
                    hideProgress: true
                });
            }
        }
    }

    componentWillUnmount(): void {
        this.componentState = false
    }

    handleNetworkChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        const newState: INetworkState = {...this.state};
        if (name === "callName") {
            if (value && value.length > 12) {
                return;
            }
            newState.network.callName = value;
            newState.optionalValidation.callName.value = value === "" ? null : "success";
        }
        if (name === "description") {
            newState.network.description = value;
            newState.validation.description.value = value === "" ? "error" : "success";
            newState.validation.description.message = value === "" ? "Must be not empty" : "";
        }

        newState.request.update.complete = false;
        newState.request.update.disabled = newState.network.description === "";
        this.setState(newState);
    };

    handleNetworkUpdate = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {network, networkId, validation} = this.state;
        const newState: INetworkState = {...this.state};

        newState.request.update.processing = true;
        newState.request.update.disabled = true;
        for (const item in validation) {
            if (validation.hasOwnProperty(item)) {
                newState.validation[item] = {
                    value: null,
                    message: ""
                };
            }
        }
        newState.optionalValidation.callName = {
            value: null,
            message: ""
        };
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Updating...",
            description: "",
        });
        const formData: any = {
            name: network.nickName,
            description: network.description,
            callName: network.callName
        };

        updateNetwork(networkId, formData).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            newState.network.updatedAt = data.result.updatedAt;
            newState.request.update.complete = true;
            newState.request.update.processing = false;

            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "Network successfully updated",
                    id: toastId
                });
            }
        }).catch(err => {
            console.log(err);
            newState.request.update.processing = false;
            newState.request.update.disabled = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not updated network for unknown reason",
                    id: toastId
                });
            }
        })
    };

    render(): JSX.Element {
        const {loading, validation, optionalValidation, network, request: {update}} = this.state;
        return (
            <div className="row">
                {
                    loading ? <PageLoader showBtn={false}/> :
                        <div>
                            <div className="col-lg-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="nickName">Unique Short Name</ControlLabel>
                                    <FormControl
                                        id="nickName"
                                        name="nickName"
                                        placeholder="Nick name"
                                        defaultValue={network.nickName}
                                        disabled={true}
                                    />
                                </FormGroup>
                                <FormGroup validationState={validation.description.value}>
                                    <ControlLabel htmlFor="description">Network Name</ControlLabel>
                                    <FormControl
                                        id="description"
                                        name="description"
                                        placeholder="Description"
                                        value={network.description}
                                        onChange={this.handleNetworkChange}
                                    />
                                </FormGroup>
                                <FormGroup validationState={optionalValidation.callName.value}>
                                    <ControlLabel htmlFor="callName">Custom Out call button name</ControlLabel>
                                    <FormControl
                                        id="callName"
                                        name="callName"
                                        placeholder="Custom Out call button name"
                                        value={network.callName}
                                        onChange={this.handleNetworkChange}
                                    />
                                    <HelpBlock>
                                        You can optionally customize the name of Zangi-Out calling button inside Zangi apps.
                                        Please specify up to 12 symbols for the button name.
                                    </HelpBlock>
                                </FormGroup>
                            </div>
                            <div className="col-lg-12">
                                <button
                                    className="btn btn-info f-r"
                                    disabled={update.disabled || update.processing}
                                    onClick={this.handleNetworkUpdate}
                                >Update {update.processing ? <i className="fa fa-spinner fa-spin m-l-xs"/> :
                                    update.complete ? <i className="fa fa-check m-l-xs"/> : ""}
                                </button>
                            </div>
                        </div>}
                        <ToastContainer/>
            </div>
        );
    }
}

export default Network;
