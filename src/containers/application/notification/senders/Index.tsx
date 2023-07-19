"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import format from "date-fns/format";
import Modal from "react-bootstrap/es/Modal";
import Table from "react-bootstrap/es/Table";
import {ToastContainer} from "react-toastify";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";

import {getSendersList, getSendersCount, createSender, deleteSender} from "ajaxRequests/notification";
import {getCurrentOffset, isNumeric, validateNumber} from "helpers/DataHelper";
import Update from "containers/application/notification/senders/Update";
import Pagination from "components/Common/Pagination";
import {showNotification} from "helpers/PageHelper";
import Loading from "components/Common/Loading";
import {IVALIDATION} from "services/interface";
import MoreActions from "components/Common/MoreActions";
import {Link} from "react-router-dom";
import selector from "services/selector";
import {connect} from "react-redux";

interface IIndexState {
    offset: number,
    limit: number,
    isCreated: boolean,
    isUpdatePageShown: boolean,
    senders: any[],
    count: number,
    messageSenderId: number,
    isPhoneNumberValid: boolean,
    popup: any,
    validation: {
        label: IVALIDATION,
        phoneNumber: IVALIDATION,
        isVerified: IVALIDATION,
    },
    request: {
        isLoading: boolean,
        isPaging: boolean,
        create: {
            isDisabled: boolean,
            isProcessing: boolean
        }
        delete: {
            isProcessing: boolean
        }
    }

}

class Index extends React.Component<any, IIndexState> {

    isComponentMounted: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            offset: 0,
            limit: 20,
            isCreated: false,
            isUpdatePageShown: false,
            senders: [],
            count: null,
            messageSenderId: null,
            isPhoneNumberValid: false,
            validation: {
                label: {
                    value: null,
                    message: "",
                },
                phoneNumber: {
                    value: null,
                    message: "",
                },
                isVerified: {
                    value: null,
                    message: "",
                },
            },
            popup: {
                show: false,
                senderInfo: {
                    label: "",
                    phoneNumber: "",
                    isVerified: false,
                }
            },
            request: {
                isLoading: true,
                isPaging: false,
                create: {
                    isDisabled: true,
                    isProcessing: false
                },
                delete: {
                    isProcessing: false
                }
            }
        }
    };

    componentDidMount(): void {
        document.title = "Senders";
        const newState: IIndexState = {...this.state};
        this.initRequests(newState);
    }

    componentWillUnmount(): void {
        this.isComponentMounted = false;
    };

    initRequests = (state: IIndexState, offset: number = 0, isPaging: boolean = false): void => {
        const {limit, request: {isLoading}} = state;

        getSendersCount().then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            state.count = data.result.count;
            if (this.isComponentMounted) {
                this.setState(state)
            }
        }).catch(e => {
            console.log(e);
        });

        getSendersList(offset, limit).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            state.senders = data.result || [];
            if (isPaging) {
                state.offset = offset;
                state.request.isPaging = false;
            }
            state.request.isLoading = false;

            if (this.isComponentMounted) {
                this.setState(state);
            }
        }).catch(e => {
            console.log(e);
            if (this.isComponentMounted) {
                if (isLoading) {
                    state.request.isLoading = false;
                }
                if (isPaging) {
                    state.request.isPaging = false;
                }
                this.setState(state);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot show senders",
                    timer: 3000
                });
            }
        });
    };

    handleShowUpdateSender = (senderId?: number, offset?: number): void => {
        const newState: IIndexState = {...this.state};
        if (senderId) {
            newState.messageSenderId = senderId;
            newState.isUpdatePageShown = true;
        } else {
            newState.messageSenderId = null;
            newState.isUpdatePageShown = false;
            newState.request.isLoading = true;
            newState.offset = offset;
            this.initRequests(newState, offset, true);
        }
        this.setState(newState);
    };

    handleDeleteSender = (senderId?: number): void => {
        const newState: IIndexState = {...this.state};
        newState.request.delete.isProcessing = true;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });
        deleteSender(senderId).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            newState.request.delete.isProcessing = false;
            return newState
        }).then((data: IIndexState) => {
            this.setState(newState);
            showNotification("success", {
                title: "Success!",
                description: "You successfully deleted a sender",
                id: toastId
            });
            this.setState(data);
            this.initRequests(data);
        }).catch(e => {
            console.log(e);
            newState.request.delete.isProcessing = false;
            this.setState(newState);
            if (this.isComponentMounted) {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot delete senders",
                    id: toastId
                });
                this.setState(newState);
            }
        });
    }

    handleListChange = (e: React.MouseEvent<HTMLInputElement>): void => {
        const {offset} = this.state;
        const newState: IIndexState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.isPaging = true;
        newState.request.isLoading = true;
        this.setState(newState);
        this.initRequests(newState, currentOffset, true);
    };

    handleModalOpen = (): void => {
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
        const newState: IIndexState = {...this.state};
        newState.popup.show = true;
        this.setState(newState);
    };

    handleModalClose = (): void => {
        const {popup: {senderInfo}} = this.state;
        const newState: IIndexState = {...this.state};
        newState.popup.show = false;
        newState.request.create.isDisabled = true;
        for (const item in senderInfo) {
            if (senderInfo.hasOwnProperty(item)) {
                newState.popup.senderInfo[item] = "";
            }
        }
        newState.popup.senderInfo.isVerified = false;
        this.setState(newState);
    };

    handleInputChange = ({currentTarget: {value, name}}: React.ChangeEvent<HTMLInputElement>) => {
        const newState: IIndexState = {...this.state};
        if (name === "phoneNumber") {
            let valueForValidate: string = value;
            if (isNumeric(valueForValidate) && valueForValidate.substr(0, 1) !== "+") {
                valueForValidate = "+" + valueForValidate.toString();
            }

            const isValid: boolean = isNumeric(valueForValidate);

            newState.isPhoneNumberValid = isValid;
            newState.validation.phoneNumber.value = value === "" ? null : isValid ? null : "error";
            newState.popup.senderInfo.phoneNumber = valueForValidate;
        } else {
            newState.popup.senderInfo[name] = value;
            newState.validation[name].value = value ? "success" : "error";
        }
        newState.request.create.isDisabled = !(newState.popup.senderInfo.label && newState.isPhoneNumberValid);

        this.setState(newState);
    };

    handleSubmit = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {popup, offset, limit} = this.state;
        const newState: IIndexState = {...this.state};

        const senderInfo: any = {
            label: popup.senderInfo.label,
            number: popup.senderInfo.phoneNumber,
            isVerified: popup.senderInfo.isVerified
        };
        newState.request.create.isProcessing = true;
        newState.isCreated = false;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        createSender(senderInfo).then(({data}: AxiosResponse) => {

            if (data.err) {
                throw new Error(JSON.stringify(data.err));

            }

            newState.request.create.isProcessing = false;
            this.handleModalClose();
            newState.isCreated = true;

            if (offset === 0) {
                senderInfo.messageSenderId = data.result.messageSenderId;
                senderInfo.createdAt = data.result.createdAt;
                newState.senders.unshift(senderInfo);

                if (newState.senders.length > limit) {
                    newState.senders = newState.senders.slice(0, limit);
                }
            }
            newState.count++;
            this.setState(newState);

            if (this.isComponentMounted) {
                showNotification("success", {
                    title: "Success!",
                    description: "You successfully created a sender",
                    id: toastId
                });
                this.setState(newState);
            }
        }).catch(e => {
            console.log(e);
            newState.request.create.isProcessing = false;
            if (this.isComponentMounted) {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot create a sender for unknown reason",
                    timer: 3000
                });
                this.setState(newState);
            }

        })
    };

    handleCheckboxChange = ({currentTarget: {checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IIndexState = {...this.state};
        newState.popup.senderInfo.isVerified = checked;
        this.setState(newState);
    };

    render(): JSX.Element {
        const {senders, offset, limit, count, validation, request: {isLoading, isPaging, create}, popup, isUpdatePageShown, messageSenderId} = this.state;
        const {userProfile} = this.props

        if (isUpdatePageShown) {
            return (
                <Update
                    messageSenderId={messageSenderId}
                    handleShowUpdateSender={this.handleShowUpdateSender}
                    offset={offset}
                />);
        }

        return (
            <div>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl padder-t-3">Senders</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <div className="text-right">
                                    <button
                                        onClick={this.handleModalOpen}
                                        className="btn btn-default btn-addon"
                                    ><i className="fa fa-plus"/>Create New Sender
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr/>

                {isLoading ? <Loading/>
                    :
                    <Table
                        hover={true}
                        condensed={true}
                        responsive={true}
                    >
                        <thead>
                        <tr>
                            <th/>
                            <th>Id</th>
                            <th>Label</th>
                            <th>Phone Number</th>
                            <th>Status</th>
                            <th>Created At</th>
                            {!userProfile.readonly && <th/>}
                        </tr>
                        </thead>
                        <tbody>
                        {
                            senders.length === 0 &&
                            <tr>
                                <td colSpan={6}>No results</td>
                            </tr>
                        }

                        {senders.map((sender, index) => {
                            const N: number = offset * limit + index + 1;
                            const updateSender: any = () => this.handleShowUpdateSender(sender.messageSenderId);
                            const deleteSender: any = () => this.handleDeleteSender(sender.messageSenderId);
                            return (
                                <tr
                                    key={N}
                                    // onClick={updateSender}
                                    className="cursor-pointer">
                                    <td>{N}</td>
                                    <td>{sender.messageSenderId}</td>
                                    <td>{sender.label}</td>
                                    <td>{sender.number}</td>
                                    <td>{sender.isVerified ? "Verified" : "Not Verified"}</td>
                                    <td>{format(sender.createdAt, "DD MMM YYYY hh:mm A")}</td>
                                    {!userProfile.readonly && <td>
                                        <MoreActions
                                            isAbsolute={true}
                                        >
                                            <li>
                                                <a href="javascript:void(0);" onClick={updateSender}>
                                                    <span>Edit</span>
                                                </a>
                                            </li>
                                            <li>
                                                <a href="javascript:void(1);" onClick={deleteSender}>
                                                    <span>Delete</span>
                                                </a>
                                            </li>
                                        </MoreActions>
                                    </td>}
                                </tr>
                            )
                        })}
                        </tbody>
                    </Table>}
                <div className="content-wrapper">
                    <div className="container-fluid">
                        {!isLoading && count > limit &&
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6 ">
                                <span className="text-xs">{`Showing ${senders.length} of ${count}`}</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <Pagination
                                    offset={offset}
                                    limit={limit}
                                    length={senders.length}
                                    disabled={isPaging}
                                    count={count}
                                    callback={this.handleListChange}
                                />
                            </div>
                        </div>
                        }
                    </div>
                </div>

                <Modal show={popup.show} onHide={this.handleModalClose}>
                    <Modal.Header closeButton={true}>
                        <span className="text-xlg">Create New Sender</span>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{maxWidth: "650px", margin: "10px auto"}}>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                        <form className="form-horizontal">
                                            <FormGroup validationState={validation.label.value}>
                                                <label htmlFor="label" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">Label</label>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-8">
                                                    <FormControl
                                                        id="label"
                                                        name="label"
                                                        placeholder="Label"
                                                        onChange={this.handleInputChange}
                                                        value={popup.senderInfo && popup.senderInfo.label}
                                                    />
                                                    <span className="help-block text-muted"/>
                                                </div>
                                            </FormGroup>

                                            <FormGroup validationState={validation.phoneNumber.value}>
                                                <label htmlFor="phoneNumber" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">
                                                    Phone Number
                                                </label>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-8">
                                                    <FormControl
                                                        id="phoneNumber"
                                                        type="tel"
                                                        name="phoneNumber"
                                                        placeholder="Phone Number"
                                                        value={popup.senderInfo && popup.senderInfo.phoneNumber}
                                                        onChange={this.handleInputChange}
                                                    />
                                                    <span className="help-block text-muted"/>
                                                </div>
                                            </FormGroup>

                                            <FormGroup>

                                                <label htmlFor="verified" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">
                                                    Verified </label>
                                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                                    <label className="text-base checkbox-inline">
                                                        <input
                                                            type="checkbox"
                                                            name="verified"
                                                            onChange={this.handleCheckboxChange}
                                                            checked={popup.senderInfo && popup.senderInfo.isVerified}
                                                        />&nbsp;
                                                    </label>
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
                                            className="btn btn-info btn-block"
                                            onClick={this.handleSubmit}
                                            disabled={create.isDisabled || create.isProcessing}
                                        >Create Sender{create.isProcessing && <i className="fa fa-spin fa-spinner m-l-xs"/>}
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

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Index);
