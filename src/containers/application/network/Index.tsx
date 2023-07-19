"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import {Link} from "react-router-dom";
import Table from "react-bootstrap/es/Table";
import Modal from "react-bootstrap/es/Modal";
import {ToastContainer} from "react-toastify";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";

import {createNetwork, deleteNetwork, getVirtualNetworks} from "ajaxRequests/network";
import {ERROR_TYPES, NETWORK, NEW_USER_CREATE, PAGE_NAME} from "configs/constants";
import {getCurrentOffset, replaceAll} from "helpers/DataHelper";
import {getPastedTextWithoutSpaces} from "helpers/DomHelper";
import MoreActions from "components/Common/MoreActions";
import Pagination from "components/Common/Pagination";
import {showNotification} from "helpers/PageHelper";
import Loading from "components/Common/Loading";
import {IVALIDATION} from "services/interface";
import Popup from "components/Common/Popup";

interface IIndexState {
    loading: boolean,
    networks: {
        count: any,
        list: any[]
    },
    offset: number,
    limit: number,
    request: {
        remove: {
            processing: boolean
        },
        create: {
            processing: boolean,
            disabled: boolean,
        },
        pagination: boolean
    },
    popup: {
        remove: {
            show: boolean
            message: any
        },
        create: {
            show: boolean,
            processing: false,
            disabled: true
        }
    },
    validation: {
        nickname: IVALIDATION,
        description: IVALIDATION,
        label: IVALIDATION
    },
    network: {
        nickname: string,
        description: string,
        callName: string,
        label: string,
        isPublic: boolean
    },
    networkId: number
}

class Index extends React.Component<any, IIndexState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            loading: true,
            networks: {
                count: "",
                list: []
            },
            offset: 0,
            limit: 20,
            request: {
                remove: {
                    processing: false
                },
                create: {
                    processing: false,
                    disabled: true
                },
                pagination: false
            },
            popup: {
                remove: {
                    show: false,
                    message: {},
                },
                create: {
                    show: false,
                    processing: false,
                    disabled: true
                }
            },
            validation: {
                nickname: {
                    value: null,
                    message: ""
                },
                description: {
                    value: null,
                    message: ""
                },
                label: {
                    value: null,
                    message: ""
                }
            },
            network: {
                nickname: "",
                description: "",
                callName: "",
                label: "",
                isPublic: true
            },
            networkId: null,
        }

    }

    componentDidMount(): void {
        document.title = PAGE_NAME["/network"];
        const {offset} = this.state;
        const newState: IIndexState = {...this.state};
        this.initRequests(offset, newState);
    }

    initRequests = (offset: number, state: IIndexState, isPaging: boolean = false): void => {
        const {limit, loading} = state;
        getVirtualNetworks(offset, limit).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            state.networks.list = data.result.records || [];
            state.networks.count = data.result.count || "";
            if (loading) {
                state.loading = false;
            }
            if (isPaging) {
                state.request.pagination = false;
                state.offset = offset;
            }
            this.componentState && this.setState(state);
        }).catch(e => {
            console.log(e);
            if (loading) {
                state.loading = false;
            }
            if (isPaging) {
                state.request.pagination = false;
            }
            if (this.componentState) {
                this.setState(state);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get payments' tier groups",
                    timer: 3000
                });
            }
        })
    };

    handleListChange = (e: React.MouseEvent<HTMLButtonElement>): void => {
        const {offset} = this.state;
        const newState: IIndexState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.pagination = true;
        this.setState(newState);
        this.initRequests(currentOffset, newState, true);
    };

    handleRemoveModalOpen = (e: React.MouseEvent<HTMLButtonElement>, networkId: number): void => {
        e.stopPropagation();
        const newState: IIndexState = {...this.state};
        newState.popup.remove.show = true;
        newState.popup.remove.message = {
            info: "Are you sure you want to delete?",
            apply: "Apply",
            cancel: "Cancel",
        };
        newState.networkId = networkId;
        this.setState(newState);
    };

    handleCreateModalOpen = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const newState: IIndexState = {...this.state};
        newState.popup.create.show = true;
        this.setState(newState);
    };

    handleCreateModalClose = (): void => {
        const {validation} = this.state;
        const newState: IIndexState = {...this.state};
        newState.popup.create.show = false;
        newState.popup.create.disabled = true;
        newState.popup.create.processing = false;

        for (const item in validation) {
            if (validation.hasOwnProperty(item)) {
                newState.validation[item] = {
                    value: null,
                    message: ""
                };
            }
        }

        newState.network = {
            nickname: "",
            description: "",
            callName: "",
            label: "",
            isPublic: true
        };

        this.setState(newState);
    };

    handleRemoveModalClose = (): void => {
        const newState: IIndexState = {...this.state};
        newState.popup.remove.show = false;
        newState.popup.remove.message = {};
        newState.networkId = null;
        this.setState(newState);
    };

    handleEditNetwork = (networkId: number): void => {
        if (networkId) {
            try {
                const {history} = this.props;
                history.push(`/network/${networkId}`)
            } catch (e) {
                console.log(e);
            }
        }
    };

    handleNetworkDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const {networks, networkId} = this.state;
        const newState: IIndexState = {...this.state};
        newState.request.remove.processing = true;
        newState.popup.remove.show = false;
        newState.networkId = null;
        this.setState(newState);
        const toastId: number = showNotification("info", {
            title: "Deleting...",
            description: "",
        });

        deleteNetwork(networkId).then(({data}: AxiosResponse) => {
            if (data.err || !data.result.deleted) {
                throw new Error(JSON.stringify(data));
            }
            newState.networks.list = networks.list.filter(item => item.networkId !== networkId);
            newState.request.remove.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "Network successfully deleted",
                    id: toastId
                });
            }
        }).catch(e => {
            console.log(e);
            newState.request.remove.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot delete network for unknown reason",
                    id: toastId
                });
            }
        })
    };

    handleNetworkNicknameChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        if (value && value.length > NETWORK.UNIQUE_SHORT_NAME_MAX_LENGTH) {
            return;
        }
        const newState: IIndexState = {...this.state};
        newState.network.nickname = value;
        newState.validation.nickname.value = (value === "" || value.length < NETWORK.UNIQUE_SHORT_NAME_MIN_LENGTH) ? "error" : null;
        newState.validation.nickname.message = value === "" ? "Must be not empty" : "";
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
        const newState: IIndexState = {...this.state};
        newState.network.label = value;
        newState.validation.label.value = value === "" ? "error" : null;
        newState.validation.label.message = value === "" ? "Must be not empty" : "";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleUniqueNamePasteEvent = (e: React.ClipboardEvent<HTMLInputElement>): void => {
        const value: string = getPastedTextWithoutSpaces(e);
        const newState: IIndexState = {...this.state};
        newState.network.nickname = value.length > NETWORK.UNIQUE_SHORT_NAME_MAX_LENGTH ? value.substr(0, NETWORK.UNIQUE_SHORT_NAME_MAX_LENGTH) : value;
        newState.validation.nickname.value = (value === "" || value.length < NETWORK.UNIQUE_SHORT_NAME_MIN_LENGTH) ? "error" : null;
        newState.validation.nickname.message = value === "" ? "Must not be empty" : "";
        this.handleToggleDisabled(newState);
        this.setState(newState);
        e.preventDefault();
    };

    handlePasteEvent = (e: React.ClipboardEvent<HTMLInputElement>): void => {
        const value: string = e.clipboardData.getData("text/plain");
        const newState: IIndexState = {...this.state};
        newState.network.label = value.length > NETWORK.FULL_NAME_MAX_LENGTH ? value.substr(0, NETWORK.FULL_NAME_MAX_LENGTH) : value;
        newState.validation.label.value = value === "" ? "error" : null;
        newState.validation.label.message = value === "" ? "Must not be empty" : "";
        this.handleToggleDisabled(newState);
        this.setState(newState);
        e.preventDefault();
    };

    handleOutCallNameChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        if (value && value.length > 12) {
            return;
        }
        const newState: IIndexState = {...this.state};
        newState.network.callName = value;
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleCallNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.which === 32 && e.currentTarget.selectionStart === 0) {
            e.preventDefault();
        }
    };

    handleJoiningMechanismChange = (): void => {
        const newState: IIndexState = {...this.state};
        newState.network.isPublic = !newState.network.isPublic;
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleToggleDisabled = (state: any): void => {
        const {network} = state;
        state.request.create.disabled = (network.nickname === "" || network.nickname.length < NETWORK.UNIQUE_SHORT_NAME_MIN_LENGTH ||
            network.label === ""
        )
    };

    handleNetworkCreate = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {network, validation, networks, offset, limit} = this.state;
        const newState: IIndexState = {...this.state};
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });
        const formData: any = {
            nickname: network.nickname,
            label: network.label,
            description: network.label,
            callName: network.callName !== "" ? network.callName.trim() : "",
            isPublic: network.isPublic
        };

        newState.request.create.processing = true;
        this.setState(newState);

        createNetwork(formData).then(({data}: AxiosResponse) => {
            if (data.err || !data.result.networkId) {
                throw new Error(JSON.stringify(data));
            }

            formData.networkId = data.result.networkId;
            if (offset === 0) {
                const newList: any = [formData, ...networks.list];
                newState.networks.list = newList.length > limit ? newList.slice(0, limit) : newList;
            }

            newState.networks.count++;
            for (const item in validation) {
                if (validation.hasOwnProperty(item)) {
                    newState.validation[item] = {
                        value: null,
                        message: ""
                    };
                }
            }

            for (const item in network) {
                if (network.hasOwnProperty(item)) {
                    newState.network[item] = "";
                }
            }
            newState.popup.create.show = false;
            newState.request.create.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "Network successfully created",
                    id: toastId
                });
            }
        }).catch(err => {
            console.log(err);
            newState.request.create.processing = false;

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
                    title: "You've got an error!",
                    description: `${errorMessage === "" ? `Cannot create network for unknown reason` : errorMessage}`,
                    id: toastId
                });
            }
        })

    };

    render(): JSX.Element {
        const {networks, loading, offset, limit, request: {remove, pagination, create}, popup, validation, network} = this.state;

        return (
            <div className="box-shadow r-3x bg-white">
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl padder-t-3">{PAGE_NAME["/network"]}</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <div className="text-right">
                                    <button className="btn btn-default btn-addon" onClick={this.handleCreateModalOpen}>
                                        <i className="fa fa-plus"/>New
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {loading ? <Loading/> :
                    <Table
                        hover={true}
                        condensed={true}
                        responsive={true}
                    >
                        <thead>
                        <tr>
                            <th/>
                            <th>Unique Name</th>
                            <th>Network Full Name</th>
                            <th/>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            networks.list.length === 0 &&
                            <tr>
                                <td colSpan={4}>No result</td>
                            </tr>
                        }

                        {networks.list.map((network, index) => {
                            const N: number = offset * limit + index + 1;
                            const deleteNetwork: any = (e: React.MouseEvent<HTMLButtonElement>) => this.handleRemoveModalOpen(e, network.networkId);
                            const editNetwork: any = () => this.handleEditNetwork(network.networkId);
                            return (
                                <tr key={N} className="cursor-pointer" onClick={editNetwork}>
                                    <td>{N}</td>
                                    <td>{network.nickname}</td>
                                    <td>{network.label}</td>
                                    <td>
                                        <MoreActions
                                            isDropup={(index === networks.list.length - 1) && networks.list.length !== 1}
                                            isAbsolute={true}
                                        >
                                            <li>
                                                <Link
                                                    to={`/network/${network.networkId}`}
                                                >Edit
                                                </Link>
                                            </li>
                                            <li>
                                                <a href="javascript:void(0);" onClick={deleteNetwork}>
                                                    Delete
                                                </a>
                                            </li>
                                        </MoreActions>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </Table>}

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            {
                                !loading && networks.count > limit &&
                                <div>
                                    <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6">
                                        <span className="text-xs">{`Showing ${limit} of ${networks.count}`}</span>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                        <Pagination
                                            offset={offset}
                                            limit={limit}
                                            callback={this.handleListChange}
                                            length={networks.list.length}
                                            disabled={pagination}
                                        />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <Popup
                    show={popup.remove.show}
                    message={popup.remove.message}
                    hideModal={this.handleRemoveModalClose}
                    confirmAction={this.handleNetworkDelete}
                />

                {
                    <Modal show={popup.create.show} onHide={this.handleCreateModalClose} bsSize="large">
                        <Modal.Header closeButton={true}>
                            <span className="text-xlg">Create Network</span>
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
                                                            value={network.nickname}
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
                                                            value={network.label}
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
                                                            value={network.callName}
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
                                                                checked={!network.isPublic}
                                                                onChange={this.handleJoiningMechanismChange}
                                                            />
                                                            Private
                                                        </label>
                                                        <span className="help-block text-muted">Your new members can join only via invite link sent by you.</span>
                                                        <label className="text-base radio-inline">
                                                            <input
                                                                type="radio"
                                                                checked={network.isPublic}
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
                                                onClick={this.handleCreateModalClose}
                                            >Cancel
                                            </button>
                                            <button
                                                className="btn btn-info"
                                                disabled={create.disabled || create.processing}
                                                onClick={this.handleNetworkCreate}
                                            >Create{create.processing ? <i className="fa fa-spinner fa-spin m-l-xs"/> : ""}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Modal.Footer>
                    </Modal>}

            </div>
        );
    }
}

export default Index;
