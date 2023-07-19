"use strict";

import * as React from "react";
import Button from "react-bootstrap/es/Button";
import FormGroup from "react-bootstrap/es/FormGroup";
import ControlLabel from "react-bootstrap/es/ControlLabel";
import FormControl from "react-bootstrap/es/FormControl";
import {IVALIDATION} from "services/interface";
import {showNotification} from "helpers/PageHelper";
import {deleteDIDNumber, getDIDNumber, getUser, updateDIDNumber} from "ajaxRequests/users";
import axios, {AxiosResponse} from "axios";
import PageLoader from "components/Common/PageLoader";
import selector, {IStoreProps} from "services/selector";
import {connect} from "react-redux";

export interface IDIDNumberProps {
    userProfile: any,
    match: any;
    history: any;
}

export interface IDIDNumberState {
    validation: {
        popup: {
            balance: {
                amount: IVALIDATION
                currency: IVALIDATION
            }
        },
        DIDNumber: IVALIDATION
    },
    DIDNumber: any,
    user: any,
    loading: boolean,
    request: {
        DIDNumber: {
            update: {
                disabled: boolean,
                processing: boolean
            },
            remove: {
                disabled: boolean,
                processing: boolean
            }
        }
    },
}

class DIDNumber extends React.Component<IDIDNumberProps, IDIDNumberState> {
    constructor(props: IDIDNumberProps) {
        super(props);
        this.state = {
            validation: {
                popup: {
                    balance: {
                        amount: {
                            value: null,
                            message: "",
                        },
                        currency: {
                            value: null,
                            message: "",
                        },
                    }
                },
                DIDNumber: {
                    value: null,
                    message: "",
                }
            },
            request: {
                DIDNumber: {
                    update: {
                        disabled: true,
                        processing: false
                    },
                    remove: {
                        disabled: true,
                        processing: false
                    }
                }
            },
            DIDNumber: "",
            user: {},
            loading: true
        };
    }

    componentState: boolean = true;

    componentDidMount(): void {
        const {match} = this.props;
        document.title = `User - ${match.params.id !== "" ? match.params.id : ""}`;
        this.initRequests();
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    initRequests: any = async (): Promise<any> => {
        const {match, history} = this.props;
        const newState: IDIDNumberState = {...this.state};

        if (!!match.params.id) {
            const user: any = await getUser(match.params.id);
            if (!user.data.err) {

                const userInfo: any = user.data.result;
                newState.user = userInfo;

                if (user.data.result) {
                    axios.all([
                        getDIDNumber(userInfo.username),
                    ]).then(axios.spread((DIDNumber) => {
                        if (!DIDNumber.data.err) {
                            newState.DIDNumber = DIDNumber.data.result.didNumber.toString().replace("+", "") || "";
                            newState.request.DIDNumber.remove.disabled = newState.DIDNumber === "";
                        } else {
                            showNotification("error", {
                                title: "You got an error!",
                                description: "Can not getting DID number",
                                timer: 3000,
                                hideProgress: true
                            });
                        }

                        newState.loading = false;
                        if (this.componentState) {
                            this.setState(newState);
                        }

                    })).catch(error => console.log(error));
                }

            } else {
                history.push("/users");
            }

        } else {
            history.push("/users")
        }
    };

    handleDIDNumberChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>): void => {

        const newState: IDIDNumberState = {...this.state};
        newState.DIDNumber = value;
        newState.validation.DIDNumber.value = value === "" ? "error" : "success";
        newState.request.DIDNumber.update.disabled = value === "";
        this.setState(newState);
    };

    handleDIDNumberUpdate = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {userProfile} = this.props;
        if (userProfile.readonly) {
            showNotification("error", {
                title: "Read-Only admin",
                description: "Read-Only admin: the access to this functionality is restricted for your user role",
                timer: 3000,
                hideProgress: true
            });
            return
        }
        const {user, DIDNumber} = this.state;
        const newState: IDIDNumberState = {...this.state};
        newState.request.DIDNumber.update.processing = true;
        newState.request.DIDNumber.update.disabled = true;

        this.setState(newState);
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        updateDIDNumber(user.username, DIDNumber).then(({data}: AxiosResponse) => {
            if (data.err || (data.result !== 0 && !data.result)) {
                throw new Error(JSON.stringify(data));
            }
            newState.request.DIDNumber.update.processing = false;
            newState.request.DIDNumber.update.disabled = false;
            newState.validation.DIDNumber = {
                value: null,
                message: ""
            };
            if (this.componentState) {
                showNotification("success", {
                    title: "Success!",
                    description: "DID number successfully updated",
                    id: toastId
                });
                this.setState(newState);
            }

        }).catch(err => {
            console.log(err);
            newState.request.DIDNumber.update.processing = false;
            newState.request.DIDNumber.update.disabled = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "Error",
                    description: "Cannot update DID number",
                    id: toastId
                });
            }

        })
    };

    handleDIDNumberDelete = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {userProfile} = this.props;
        if (userProfile.readonly) {
            showNotification("error", {
                title: "Read-Only admin",
                description: "Read-Only admin: the access to this functionality is restricted for your user role",
                timer: 3000,
                hideProgress: true
            });
            return
        }
        const {user} = this.state;
        const newState: IDIDNumberState = {...this.state};
        newState.request.DIDNumber.remove.processing = true;
        newState.request.DIDNumber.remove.disabled = true;

        this.setState(newState);
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });
        deleteDIDNumber(user.username).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            newState.request.DIDNumber.remove.processing = false;
            newState.request.DIDNumber.remove.disabled = true;
            newState.DIDNumber = "";
            if (this.componentState) {
                showNotification("success", {
                    title: "Success!",
                    description: "DID number successfully deleted",
                    id: toastId
                });
                this.setState(newState);
            }
        }).catch(err => {
            console.log(err);
            newState.request.DIDNumber.remove.processing = false;
            newState.request.DIDNumber.remove.disabled = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "Error",
                    description: "Can not delete DID number",
                    id: toastId
                });
            }
        })
    };

    render(): JSX.Element {
        const {validation, DIDNumber, request, loading} = this.state;

        return (
            <div className="bg-white box-shadow r-3x m-b-md">

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xs-6 col-sm-6 col-md-6 col-lg-6">
                                <span className="text-xsl padder-t-3 block">DID Number</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="padder">
                    <div className="container-fluid">
                        {
                            loading ?
                                <div>
                                    <PageLoader showBtn={false} className="no-padder"/>
                                    <PageLoader showBtn={false} className="no-padder"/>
                                    <br/>
                                    <br/>
                                    <PageLoader showBtn={false} className="no-padder"/>
                                    <PageLoader showBtn={false} className="no-padder"/>
                                </div>
                                :
                                <div className="col-lg-12 col-md-12 col-xs-12 col-sm-12 m-b-lg no-padder">
                                    <FormGroup validationState={validation.DIDNumber.value}>
                                        {/*<ControlLabel id="DIDNumber">DID number</ControlLabel>*/}
                                        <FormControl
                                            id="DIDNumber"
                                            type="number"
                                            min="1"
                                            placeholder="DID number"
                                            value={DIDNumber}
                                            onChange={this.handleDIDNumberChange}
                                        />
                                    </FormGroup>
                                    <div className="flex">
                                        <button
                                            disabled={request.DIDNumber.update.disabled}
                                            className="btn btn-info m-r-xs"
                                            onClick={this.handleDIDNumberUpdate}
                                        >Update
                                        </button>
                                        <Button
                                            disabled={request.DIDNumber.remove.disabled}
                                            onClick={this.handleDIDNumberDelete}
                                        >Delete
                                        </Button>
                                    </div>
                                </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default DIDNumber;
