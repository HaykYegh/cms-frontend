"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import Modal from "react-bootstrap/es/Modal";
import Table from "react-bootstrap/es/Table";
import {ToastContainer} from "react-toastify";
import FormGroup from "react-bootstrap/es/FormGroup";
import HelpBlock from "react-bootstrap/es/HelpBlock";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {getAdminsOfNetwork, getAdminsCountOfNetwork, setNetworkAdministrator} from "ajaxRequests/network";
import {PASSWORD_MIN_LENGTH} from "configs/constants";
import Pagination from "components/Common/Pagination";
import {showNotification} from "helpers/PageHelper";
import {getCurrentOffset} from "helpers/DataHelper";
import Loading from "components/Common/Loading";
import {IVALIDATION} from "services/interface";

interface IAdminsState {
    offset: number,
    limit: number,
    admins: any[],
    adminsCount: number;
    isLoading: boolean,
    request: {
        isPaging: boolean,
        isProcessing: boolean,
        isDisabled: boolean,
    },
    admin: {
        email: string,
        password: string,
        confirmPassword: string,
    },
    isAddAdminPopupShown: boolean,
    validation: {
        email: IVALIDATION,
        password: IVALIDATION,
        confirmPassword: IVALIDATION,
    }
}

interface IAdminsProps {
    networkId: any,
    networkName: string
}

class Admins extends React.Component<IAdminsProps, IAdminsState> {

    componentState: boolean = true;

    constructor(props: IAdminsProps) {
        super(props);
        this.state = {
            isLoading: true,
            offset: 0,
            limit: 20,
            admins: [],
            adminsCount: 0,
            request: {
                isPaging: false,
                isProcessing: false,
                isDisabled: true,
            },
            admin: {
                email: "",
                password: "",
                confirmPassword: "",
            },
            isAddAdminPopupShown: false,
            validation: {
                email: {
                    value: null,
                    message: ""
                },
                password: {
                    value: null,
                    message: ""
                },
                confirmPassword: {
                    value: null,
                    message: ""
                },
            }
        }
    }

    componentDidMount(): void {
        const newState: IAdminsState = {...this.state};
        this.initRequests(newState);
    }

    initRequests = (state: any, offset: number = 0): void => {
        const {networkId} = this.props;
        const {limit} = state;
        getAdminsOfNetwork(networkId, offset, limit).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            state.admins = data.result || [];
            state.isLoading = false;
            state.request.isPaging = false;
            state.offset = offset;
            if (this.componentState) {
                this.setState(state);
            }
        }).catch(e => {
            console.log(e);
            state.isLoading = false;
            state.request.isPaging = false;
            if (this.componentState) {
                this.setState(state);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get network admins",
                    timer: 3000
                });
            }
        });

        getAdminsCountOfNetwork(networkId).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            state.adminsCount = data.result || 0;
            if (this.componentState) {
                this.setState(state);
            }
        }).catch(e => {
            console.log(e);
            if (this.componentState) {
                this.setState(state);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get network admins count",
                    timer: 3000
                });
            }
        });
    };

    handleModalClose = (): any => {
        const newState: IAdminsState = {...this.state};
        newState.isAddAdminPopupShown = false;
        this.setState(newState);
    };

    handleModalOpen = (): any => {
        const newState: IAdminsState = {...this.state};
        newState.isAddAdminPopupShown = true;
        this.setState(newState);
    };

    handleListChange = (e: React.MouseEvent<HTMLButtonElement>): void => {
        const {offset} = this.state;
        const newState: IAdminsState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.isPaging = true;
        this.setState(newState);
        this.initRequests(newState, currentOffset);
    };

    handleToggleDisabled = (state: any): void => {
        state.request.isDisabled = state.isAddAdminPopupShown ? !Object.keys(state.validation).every(item => state.validation[item].value === "success") :
            !Object.keys(state.validation).every(item => item === "email" ? true : state.validation[item].value === "success");
    };

    handleEmailChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IAdminsState = {...this.state};
        const pattern: any = new RegExp(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        newState.admin.email = value;
        newState.validation.email.value = pattern.test(value) ? "success" : "error";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handlePasswordFieldChange = ({currentTarget: {value, name}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: any = {...this.state};
        if (name === "password") {
            newState.admin.password = value;
            newState.validation.password.value = value.length >= PASSWORD_MIN_LENGTH ? "success" : value === "" ? null : "error";
            newState.validation.password.message = (value.length >= PASSWORD_MIN_LENGTH || value === "") ? ""
                : `Password should be at least ${PASSWORD_MIN_LENGTH} symbols`;
            if (value.length >= PASSWORD_MIN_LENGTH && value === newState.admin.confirmPassword) {
                newState.validation.confirmPassword.message = "";
                newState.validation.confirmPassword.value = "success";
            }
        }
        if (name === "confirmPassword") {
            const password: string = newState.admin.password;
            newState.admin.confirmPassword = value;
            newState.validation.confirmPassword.value = (value === password && password.length >= PASSWORD_MIN_LENGTH) ?
                "success" : value === "" ? null : "error";
            newState.validation.confirmPassword.message = ((value === password && password.length >= PASSWORD_MIN_LENGTH) || value === "") ? ""
                : "Your password and confirmation password do not match";
        }
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const {admin, admins, validation} = this.state;
        const {networkId} = this.props;
        const newState: IAdminsState = {...this.state};
        newState.request.isProcessing = true;
        this.setState(newState);
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        setNetworkAdministrator(networkId,
            {
                email: admin.email,
                password: admin.password,
            }).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data))
            }

            newState.admins = [{
                adminId: data.result.createAdmin,
                email: admin.email,
            }, ...admins];
            newState.admin = {
                email: "",
                password: "",
                confirmPassword: "",
            };
            for (const item in validation) {
                if (validation.hasOwnProperty(item)) {
                    newState.validation[item] = {
                        value: null,
                        message: ""
                    };
                }
            }
            for (const item in admin) {
                if (admin.hasOwnProperty(item)) {
                    newState.admin[item] = "";
                }
            }
            newState.request.isProcessing = false;
            newState.request.isDisabled = true;
            newState.isAddAdminPopupShown = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "You have successfully created new admin",
                    id: toastId
                });
            }
        }).catch(e => {
            console.log(e);
            newState.request.isProcessing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot create new admin for unknown reason",
                    id: toastId
                });
            }
        })
    };

    render(): JSX.Element {
        const {isLoading, request, admins, offset, limit, adminsCount, isAddAdminPopupShown, validation, admin} = this.state;
        const {networkName} = this.props;

        return (
            <div>
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-lg m-b-md block">Administrators{networkName === "" ? "" : ` of ${networkName}`}</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <div className="text-right">
                                    <button
                                        onClick={this.handleModalOpen}
                                        className="btn btn-default btn-addon"
                                    ><i className="fa fa-plus"/>Add Administrator
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading ? <Loading/> :
                    <Table
                        hover={true}
                        condensed={true}
                        responsive={true}
                    >
                        <thead>
                        <tr>
                            <th/>
                            <th>Email</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            admins.length === 0 &&
                            <tr>
                                <td colSpan={2}>No result</td>
                            </tr>
                        }
                        {
                            admins.map((admin, index) => {
                                const N: number = offset * limit + index + 1;
                                return (
                                    <tr key={N}>
                                        <td>{N}</td>
                                        <td>{admin.email}</td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>

                    </Table>}

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            {
                                !isLoading && adminsCount > limit &&
                                <div>
                                    <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6">
                                        <span className="text-xs">{`Showing ${admins.length} of ${adminsCount} entries`}</span>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                        <Pagination
                                            offset={offset}
                                            limit={limit}
                                            callback={this.handleListChange}
                                            length={admins.length}
                                            count={adminsCount}
                                            disabled={request.isPaging}
                                        />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>

                <Modal show={isAddAdminPopupShown} onHide={this.handleModalClose}>
                    <Modal.Header closeButton={true}>
                        <span className="text-xlg">Add Administrator</span>
                    </Modal.Header>
                    <Modal.Body>
                        <form className="wrapper-md" action="/" onSubmit={this.handleSubmit}>
                            <FormGroup validationState={validation.email.value}>
                                <ControlLabel htmlFor="email">Email address</ControlLabel>
                                <FormControl
                                    id="email"
                                    name="email"
                                    type="text"
                                    placeholder="Email"
                                    autoFocus={true}
                                    value={admin.email}
                                    onChange={this.handleEmailChange}
                                />
                            </FormGroup>
                            <FormGroup validationState={validation.password.value}>
                                <ControlLabel htmlFor="password">Password</ControlLabel>
                                <FormControl
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    autoComplete={"new-password"}
                                    value={admin.password}
                                    onChange={this.handlePasswordFieldChange}
                                />
                                <HelpBlock>{validation.password.message}</HelpBlock>
                            </FormGroup>
                            <FormGroup validationState={validation.confirmPassword.value}>
                                <ControlLabel htmlFor="confirmPassword">Confirm Password</ControlLabel>
                                <FormControl
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete={"new-password"}
                                    placeholder="Confirm Password"
                                    value={admin.confirmPassword}
                                    onChange={this.handlePasswordFieldChange}
                                />
                                <HelpBlock>{validation.confirmPassword.message}</HelpBlock>
                            </FormGroup>
                            <button
                                type="submit"
                                className="btn btn-info btn-block"
                                disabled={request.isDisabled || request.isProcessing}
                            >Add Administrator &nbsp;{request.isProcessing && <i className="fa fa-spinner fa-spin"/>}
                            </button>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}

export default Admins;
