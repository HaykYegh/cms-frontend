"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import {Link} from "react-router-dom";
import Nav from "react-bootstrap/es/Nav";
import Modal from "react-bootstrap/es/Modal";
import {ToastContainer} from "react-toastify";
import NavItem from "react-bootstrap/es/NavItem";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";

import Invitees from "containers/application/network/update/Invitees";
import Users from "containers/application/network/update/Users";
import Admins from "containers/application/network/update/Admins";
import {getNetwork, updateNetwork} from "ajaxRequests/network";
import {getPastedTextWithoutSpaces} from "helpers/DomHelper";
import ActiveUsers from "components/Common/ActiveUsers";
import {ERROR_TYPES, NETWORK} from "configs/constants";
import {showNotification} from "helpers/PageHelper";
import {IVALIDATION} from "services/interface";
import {replaceAll} from "helpers/DataHelper";

interface IUpdateState {
    networkId: number,
    loading: boolean,
    network: any,
    validation: {
        nickname: IVALIDATION,
        label: IVALIDATION,
    },
    request: {
        update: {
            processing: boolean,
            complete: boolean,
            disabled: boolean,
        }
    },
    pills: any,
    active: any,
    popup: {
        show: boolean,
        network: {
            nickname: string,
            label: string,
            callName: string,
            isPublic: boolean
        }
    }
}

class Index extends React.Component<any, IUpdateState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        const networkId: number = this.props.match.params.id || null;
        this.state = {
            networkId,
            loading: true,
            network: {},
            validation: {
                nickname: {
                    value: null,
                    message: ""
                },
                label: {
                    value: null,
                    message: ""
                }
            },
            request: {
                update: {
                    processing: false,
                    complete: false,
                    disabled: true,
                }
            },
            pills: [
                {
                    eventKey: NETWORK.TABS.UPDATE.USERS,
                    component: Users,
                    title: "Users"
                },
                {
                    eventKey: NETWORK.TABS.UPDATE.ADMINS,
                    component: Admins,
                    title: "Administrators"

                },
                {
                    eventKey: NETWORK.TABS.UPDATE.INVITEES,
                    component: Invitees,
                    title: "Invitees"

                },
                {
                    eventKey: NETWORK.TABS.UPDATE.ACTIVE_USERS,
                    component: ActiveUsers,
                    title: "Monthly Active Users"

                }
            ],
            active: {
                eventKey: NETWORK.TABS.UPDATE.USERS,
                component: Users
            },
            popup: {
                show: false,
                network: {
                    nickname: "",
                    label: "",
                    callName: "",
                    isPublic: true
                }
            }
        }
    }

    componentWillMount(): void {
        const {networkId} = this.state;
        const {history} = this.props;
        if (!networkId) {
            history.push("/network");
        }
        document.title = `Network - ${networkId || ""}`;
    }

    componentDidMount(): void {
        const {networkId} = this.state;
        const newState: IUpdateState = {...this.state};
        getNetwork(networkId).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.network = data.result || [];

            newState.loading = false;
            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(e => {
            console.log(e);
            newState.loading = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get networks list",
                    timer: 3000
                });
            }
        });
    }

    componentWillUnmount(): void {
        this.componentState = false
    }

    handlePillChange = (pillKey: number): void => {
        const newState: IUpdateState = {...this.state};
        const newPill: any = newState.pills.find(pill => pill.eventKey === pillKey);
        newState.active = {
            eventKey: newPill.eventKey,
            component: newPill.component,
        };

        this.setState(newState);
    };

    handleNetworkNicknameChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        if (value && value.length > NETWORK.UNIQUE_SHORT_NAME_MAX_LENGTH) {
            return;
        }
        const newState: IUpdateState = {...this.state};
        newState.popup.network.nickname = value;
        newState.validation.nickname.value = (value === "" || value.length < NETWORK.UNIQUE_SHORT_NAME_MIN_LENGTH) ? "error" : null;
        newState.validation.nickname.message = value === "" ? "Must be not empty" : "";
        newState.request.update.complete = false;
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        // Check if press space and prevent default
        if (e.which === 32) {
            e.preventDefault();
        }
    };

    handleNetworkLabelChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        if (value && value.length > NETWORK.FULL_NAME_MAX_LENGTH) {
            return;
        }
        const newState: IUpdateState = {...this.state};
        newState.popup.network.label = value;
        newState.validation.label.value = value === "" ? "error" : null;
        newState.validation.label.message = value === "" ? "Must be not empty" : "";
        newState.request.update.complete = false;
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handlePasteEvent = (e: React.ClipboardEvent<HTMLInputElement>): void => {
        const value: string = e.clipboardData.getData("text/plain");
        const newState: IUpdateState = {...this.state};
        newState.popup.network.label = value.length > NETWORK.FULL_NAME_MAX_LENGTH ? value.substr(0, NETWORK.FULL_NAME_MAX_LENGTH) : value;
        newState.validation.label.value = value === "" ? "error" : null;
        newState.validation.label.message = value === "" ? "Must be not empty" : "";
        newState.request.update.complete = false;
        this.handleToggleDisabled(newState);
        this.setState(newState);
        e.preventDefault();
    };

    handleUniqueNamePasteEvent = (e: React.ClipboardEvent<HTMLInputElement>): void => {
        const value: string = getPastedTextWithoutSpaces(e);
        const newState: IUpdateState = {...this.state};
        newState.network.nickname = value.length > NETWORK.UNIQUE_SHORT_NAME_MAX_LENGTH ? value.substr(0, NETWORK.UNIQUE_SHORT_NAME_MAX_LENGTH) : value;
        newState.validation.nickname.value = (value === "" || value.length < NETWORK.UNIQUE_SHORT_NAME_MIN_LENGTH) ? "error" : null;
        newState.validation.nickname.message = value === "" ? "Must be not empty" : "";
        this.handleToggleDisabled(newState);
        this.setState(newState);
        e.preventDefault();
    };

    handleOutCallNameChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        if (value && value.length > 12) {
            return;
        }
        const newState: IUpdateState = {...this.state};
        newState.popup.network.callName = value;
        newState.request.update.complete = false;
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleCallNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.which === 32 && e.currentTarget.selectionStart === 0) {
            e.preventDefault();
        }
    };

    handleToggleDisabled = (state: any): void => {
        state.request.update.disabled = Object.keys(state.validation).some(item => state.validation[item].value === "error");
    };

    handleJoiningMechanismChange = (): void => {
        const newState: IUpdateState = {...this.state};
        newState.popup.network.isPublic = !newState.popup.network.isPublic;
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleModalOpen = (): void => {
        const {network} = this.state;
        const newState: IUpdateState = {...this.state};
        newState.popup.show = true;
        newState.popup.network = {...network};
        this.setState(newState);
    };

    handleModalClose = (): void => {
        const {validation} = this.state;
        const newState: IUpdateState = {...this.state};
        newState.popup.show = false;
        newState.popup.network = {
            nickname: "",
            label: "",
            callName: "",
            isPublic: true
        };
        for (const item in validation) {
            if (validation.hasOwnProperty(item)) {
                newState.validation[item] = {
                    value: null,
                    message: ""
                }
            }
        }
        this.setState(newState);
    };

    handleNetworkUpdate = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {networkId, validation, popup: {network}} = this.state;
        const newState: IUpdateState = {...this.state};

        newState.request.update.processing = true;
        const toastId: number = showNotification("info", {
            title: "Updating...",
            description: "",
        });

        const label: string = network.label.trim();
        const formData: any = {
            nickname: network.nickname,
            description: label,
            callName: network.callName !== "" ? network.callName.trim() : "",
            isPublic: network.isPublic,
            label
        };

        updateNetwork(networkId, formData).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.request.update.disabled = true;
            newState.network = network;
            if (newState.network.callName !== "") {
                newState.network.callName.trim();
            }
            newState.popup.network = {
                nickname: "",
                label: "",
                callName: "",
                isPublic: true
            };
            newState.popup.show = false;
            newState.request.update.processing = false;

            for (const item in validation) {
                if (validation.hasOwnProperty(item)) {
                    newState.validation[item] = {
                        value: null,
                        message: ""
                    }
                }
            }
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
            const errorType: string = (JSON.parse(err.message)).err_msg;
            const errorMessage: string = errorType === "NETWORK_ALREADY_EXIST" ?
                replaceAll(ERROR_TYPES[errorType], {"{record}": network.nickname}) : "";
            if (errorType === "NETWORK_ALREADY_EXIST") {
                newState.validation.nickname = {
                    value: "error",
                    message: ""
                }
            }
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: `${errorMessage === "" ? `Cannot update network for unknown reason` : errorMessage}`,
                    id: toastId
                });
            }

        })
    };

    render(): JSX.Element {
        const {network, active, pills, validation, request: {update}, popup, networkId} = this.state;
        return (
            <div>
                <div className="box-shadow r-3x bg-white m-b-lg">
                    <ToastContainer/>
                    <div className="content-wrapper">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div className="flexible">
                                        <Link
                                            className="btn btn-default m-r-sm"
                                            to="/network"
                                        ><i className="fa fa-arrow-left m-r-xs"/>Networks
                                        </Link>
                                        <button
                                            className="btn btn-default"
                                            onClick={this.handleModalOpen}
                                        >Edit Settings
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    <hr/>

                    <div className="content-wrapper network-details">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                    <div className="container-fluid no-padder">
                                        <div className="row m-b-md">
                                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                                <span className="block font-bold text-base text-uppercase">Network Information</span>
                                            </div>
                                        </div>
                                        <div className="row m-b-md">
                                            <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                <span className="block font-semi-bold">Unique Short Name</span>
                                            </div>
                                            <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                <span className="block">{network && network.nickname}</span>
                                            </div>
                                        </div>
                                        <div className="row m-b-md">
                                            <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                <span className="block font-semi-bold">Network Full Name</span>
                                            </div>
                                            <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                <span className="block">{network && network.label}</span>
                                            </div>
                                        </div>
                                        <div className="row m-b-md">
                                            <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                <span className="block font-semi-bold">Members Joining Mechanism</span>
                                            </div>
                                            {
                                                network.isPublic ?
                                                    <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                        <span className="block m-b-xs">Public</span>
                                                        <span className="block text-muted m-b">Now your new members can join only via invite link sent by you. If you change it
                                        to public, any user can also join by entering your network unique short name in
                                        their app settings</span>
                                                    </div> :
                                                    <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                        <span className="block m-b-xs">Private</span>
                                                        <span className="block text-muted m-b">Now your new members can join only via invite
                                                            link sent by you. If you change it to public, any user can also join via entering
                                                            your network unique short name in their app settings.</span>
                                                    </div>
                                            }

                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                    <div className="container-fluid no-padder">
                                        <div className="row m-b-md">
                                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                                <span className="block font-bold text-base text-uppercase">Customization</span>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                <span className="block font-semi-bold">Out call button name</span>
                                            </div>
                                            <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                <span className="block m-b-sm">{network && network.callName || "Zangi-Out"}</span>
                                                <span className="block text-muted m-b-sm">You can customize the name of Zangi-Out calling button inside Zangi apps.</span>
                                                <img
                                                    src={"/assets/images/out-call-button-name.png"}
                                                    alt="Out call button name"
                                                    className="img-responsive"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="box-shadow r-3x bg-white">
                    <div className="container-fluid no-padder">
                        <div className="row">
                            <div className="col-lg-12">
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
                    </div>
                    {React.createElement(active.component, {
                        networkName: network.nickname,
                        networkId
                    })}
                </div>
                <Modal show={popup.show} onHide={this.handleModalClose} bsSize="large">
                    <Modal.Header closeButton={true}>
                        <span className="text-xlg">Edit Network</span>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{maxWidth: "650px", margin: "10px auto"}}>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">

                                        <form className="form-horizontal">

                                            <FormGroup validationState={validation.nickname.value}>
                                                <label htmlFor="nickname" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">Unique Short Name</label>
                                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                                    <FormControl
                                                        id="nickname"
                                                        name="nickname"
                                                        placeholder="Unique Short Name"
                                                        value={popup.network && popup.network.nickname}
                                                        onKeyDown={this.handleKeyDown}
                                                        onPaste={this.handleUniqueNamePasteEvent}
                                                        onChange={this.handleNetworkNicknameChange}
                                                    />
                                                    <span className="help-block text-muted">The network's ID can contain letters and numbers only, from 6 to
                                            10 symbols in total.The ID is case insensitive.</span>
                                                </div>
                                            </FormGroup>

                                            <FormGroup validationState={validation.label.value}>
                                                <label htmlFor="label" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">
                                                    Network Full Name <span className="required">*</span>
                                                </label>
                                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                                    <FormControl
                                                        id="label"
                                                        name="label"
                                                        placeholder="Network Full Name"
                                                        value={popup.network && popup.network.label}
                                                        onPaste={this.handlePasteEvent}
                                                        onChange={this.handleNetworkLabelChange}
                                                    />
                                                    <span className="help-block text-muted">Your network full name is visible when the new member is joining your
                                            network, and it will be displayed in their app settings.</span>
                                                </div>
                                            </FormGroup>

                                            <FormGroup>
                                                <label htmlFor="callName" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">
                                                    Out call button name
                                                </label>
                                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                                    <FormControl
                                                        id="callName"
                                                        name="callName"
                                                        placeholder="Custom Out call button name"
                                                        value={popup.network && popup.network.callName}
                                                        onKeyDown={this.handleCallNameKeyDown}
                                                        onChange={this.handleOutCallNameChange}
                                                    />
                                                    <span className="help-block text-muted">You can customize the name of Zangi-Out calling button inside Zangi
                                            apps. Please specify up to 12 symbols for the button name.</span>
                                                </div>
                                            </FormGroup>

                                            <FormGroup>
                                                <label htmlFor="" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">
                                                    Members Joining Mechanism
                                                </label>
                                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                                    <label className="text-base radio-inline ">
                                                        <input
                                                            type="radio"
                                                            checked={popup.network && !popup.network.isPublic}
                                                            onChange={this.handleJoiningMechanismChange}
                                                        />
                                                        Private
                                                    </label>
                                                    <span className="help-block text-muted">Your new members can join only via invite link sent by you.</span>
                                                    <label className="text-base radio-inline">
                                                        <input
                                                            type="radio"
                                                            checked={popup.network && !!popup.network.isPublic}
                                                            onChange={this.handleJoiningMechanismChange}
                                                        />Public
                                                    </label>
                                                    <span className="help-block text-muted">Your new members can join via invite link sent by you or via entering
                                    your network unique short name in their app settings.</span>
                                                </div>
                                            </FormGroup>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div className="text-right flex-end">
                                        <button
                                            className="btn btn-default m-r-sm"
                                            onClick={this.handleModalClose}
                                        >Cancel
                                        </button>
                                        <button
                                            className="btn btn-info"
                                            disabled={update.disabled || update.processing}
                                            onClick={this.handleNetworkUpdate}
                                        >Save{update.processing ? <i className="fa fa-spinner fa-spin m-l-xs"/> : ""}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

export default Index;
