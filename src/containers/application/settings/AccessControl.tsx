"use strict";

import * as React from "react";
import * as moment from "moment";
import {connect} from "react-redux";
import {AxiosResponse} from "axios";
import Modal from "react-bootstrap/es/Modal";
import Table from "react-bootstrap/es/Table";
import {ToastContainer} from "react-toastify";
import FormGroup from "react-bootstrap/es/FormGroup";
import HelpBlock from "react-bootstrap/es/HelpBlock";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {getAdministrators, setAdministrator, changeAdministratorPassword, deleteAdministrator} from "ajaxRequests/administrators";
import {PAGE_NAME, PASSWORD_MIN_LENGTH} from "configs/constants";
import selector, {IStoreProps} from "services/selector";
import MoreActions from "components/Common/MoreActions";
import {showNotification} from "helpers/PageHelper";
import Loading from "components/Common/Loading";
import {IVALIDATION} from "services/interface";
import Popup from "components/Common/Popup";
import Checkbox from "react-bootstrap/es/Checkbox";

interface IAccessControlState {
    user: {
        email: string,
        password: string,
        confirmPassword: string,
        readonlyAdmin: boolean
    },
    users: any[];
    isLoading: boolean,
    popup: {
        isAddAdminPopupShown: boolean,
        isChangePasswordPopupShown: boolean,
        isDeleteAdminPopupShown: boolean,
        selectedAdminId: number,
        isProcessing: boolean,
        isDisabled: boolean,
    },
    validation: {
        email: IVALIDATION,
        password: IVALIDATION,
        confirmPassword: IVALIDATION,
    }
}

interface IAccessControlProps extends IStoreProps {
    userProfile?: any,
}

class AccessControl extends React.Component<IAccessControlProps, IAccessControlState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: true,
            user: {
                email: "",
                password: "",
                confirmPassword: "",
                readonlyAdmin: false
            },
            users: [],
            popup: {
                isAddAdminPopupShown: false,
                isChangePasswordPopupShown: false,
                isDeleteAdminPopupShown: false,
                selectedAdminId: null,
                isProcessing: false,
                isDisabled: true,
            },
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
        };
    }

    componentWillMount(): void {
        document.title = PAGE_NAME["/settings/access-control"];
    }

    componentDidMount(): void {
        const newState: IAccessControlState = {...this.state};
        this.initRequests(newState);
    }

    initRequests = (state: IAccessControlState): void => {
        this.setState({isLoading: true});
        getAdministrators().then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            state.users = data.result || [];
            state.isLoading = false;
            if (this.componentState) {
                this.setState(state);
            }
        }).catch(e => {
            console.log(e);
            state.isLoading = false;
            if (this.componentState) {
                this.setState(state);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get users for unknown reason",
                    timer: 3000,
                    hideProgress: true
                });
            }
        });
    };

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleAddAdminModalClose = (): any => {
        const {validation, user} = this.state;
        const newState: IAccessControlState = {...this.state};
        newState.popup.isAddAdminPopupShown = false;
        for (const item in validation) {
            if (validation.hasOwnProperty(item)) {
                newState.validation[item] = {
                    value: null,
                    message: ""
                };
            }
        }
        for (const item in user) {
            if (user.hasOwnProperty(item)) {
                newState.user[item] = "";
            }
        }
        newState.popup.isProcessing = false;
        newState.popup.isDisabled = true;
        this.setState(newState);
    };

    handleAddAdminModalOpen = (): any => {
        const {userProfile} = this.props
        if (userProfile.readonly) {
            showNotification("error", {
                title: "Read-Only admin",
                description: "Read-Only admin: the access to this functionality is restricted for your user role",
                timer: 3000,
                hideProgress: true
            });
            return
        }
        const newState: IAccessControlState = {...this.state};
        newState.popup.isAddAdminPopupShown = true;
        this.setState(newState);
    };

    handlePasswordFieldChange = ({currentTarget: {value, name}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: any = {...this.state};
        if (name === "password") {
            newState.user.password = value;
            newState.validation.password.value = value.length >= PASSWORD_MIN_LENGTH ? "success" : value === "" ? null : "error";
            newState.validation.password.message = (value.length >= PASSWORD_MIN_LENGTH || value === "") ? ""
                : `Password should be at least ${PASSWORD_MIN_LENGTH} symbols`;
            if (value.length >= PASSWORD_MIN_LENGTH && value === newState.user.confirmPassword) {
                newState.validation.confirmPassword.message = "";
                newState.validation.confirmPassword.value = "success";
            }
        }
        if (name === "confirmPassword") {
            const password: string = newState.user.password;
            newState.user.confirmPassword = value;
            newState.validation.confirmPassword.value = (value === password && password.length >= PASSWORD_MIN_LENGTH) ?
                "success" : value === "" ? null : "error";
            newState.validation.confirmPassword.message = ((value === password && password.length >= PASSWORD_MIN_LENGTH) || value === "") ? ""
                : "Your password and confirmation password do not match";
        }
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleReadonlyFieldChange = () => {
        const newState: any = {...this.state};
        newState.user.readonlyAdmin = !newState.user.readonlyAdmin;
        this.setState(newState);
    }

    handleToggleDisabled = (state: any): void => {
        state.popup.isDisabled = state.popup.isAddAdminPopupShown ? !Object.keys(state.validation).every(item => state.validation[item].value === "success") :
            !Object.keys(state.validation).every(item => item === "email" ? true : state.validation[item].value === "success");
    };

    handleEmailChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IAccessControlState = {...this.state};
        const pattern: any = new RegExp(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        newState.user.email = value;
        newState.validation.email.value = pattern.test(value) ? "success" : "error";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const {user, users, validation} = this.state;
        const newState: IAccessControlState = {...this.state};
        newState.popup.isProcessing = true;
        this.setState(newState);
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        setAdministrator({
            email: user.email,
            password: user.password,
            confirmPassword: user.confirmPassword,
            readonlyAdmin: user.readonlyAdmin
        }).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data))
            }
            const user: any = data.result;
            newState.users = [{
                administrator_id: user.administrator_id,
                email: user.email,
                created_at: user.created_at,
            }, ...users];
            newState.user = {
                email: "",
                password: "",
                confirmPassword: "",
                readonlyAdmin: false
            };
            for (const item in validation) {
                if (validation.hasOwnProperty(item)) {
                    newState.validation[item] = {
                        value: null,
                        message: ""
                    };
                }
            }
            for (const item in user) {
                if (user.hasOwnProperty(item)) {
                    newState.user[item] = "";
                }
            }
            newState.popup.isProcessing = false;
            newState.popup.isDisabled = true;
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
            newState.popup.isProcessing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Cannot create new admin for unknown reason",
                    id: toastId
                });
            }
        })
    };

    handleDeleteAdminModalOpen = (id: number): void => {
        const newState: IAccessControlState = {...this.state};
        newState.popup.isDeleteAdminPopupShown = true;
        newState.popup.selectedAdminId = id;
        this.setState(newState);
    };

    handleChangePasswordModalOpen = (id: number): void => {
        const newState: IAccessControlState = {...this.state};
        newState.popup.isChangePasswordPopupShown = true;
        newState.popup.selectedAdminId = id;
        this.setState(newState);
    };

    handleChangePasswordModalClose = (): void => {
        const {validation, user} = this.state;
        const newState: IAccessControlState = {...this.state};
        newState.popup.isChangePasswordPopupShown = false;
        newState.popup.selectedAdminId = null;
        newState.user.password = "";
        for (const item in validation) {
            if (validation.hasOwnProperty(item)) {
                newState.validation[item] = {
                    value: null,
                    message: ""
                };
            }
        }
        for (const item in user) {
            if (user.hasOwnProperty(item)) {
                newState.user[item] = "";
            }
        }
        newState.popup.isProcessing = false;
        newState.popup.isDisabled = true;
        this.setState(newState);
    };

    handleDeleteAdminModalClose = (): void => {
        const newState: IAccessControlState = {...this.state};
        newState.popup.isDeleteAdminPopupShown = false;
        newState.popup.selectedAdminId = null;
        this.setState(newState);
    };

    handlePasswordChange = (): void => {
        const {user, popup: {selectedAdminId}, validation} = this.state;
        const newState: IAccessControlState = {...this.state};

        newState.popup.isProcessing = true;
        this.setState(newState);
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        changeAdministratorPassword(selectedAdminId, user.password, user.confirmPassword).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data))
            }

            for (const item in validation) {
                if (validation.hasOwnProperty(item)) {
                    newState.validation[item] = {
                        value: null,
                        message: ""
                    };
                }
            }
            for (const item in user) {
                if (user.hasOwnProperty(item)) {
                    newState.user[item] = "";
                }
            }
            newState.popup.isChangePasswordPopupShown = false;
            newState.user.password = "";
            newState.popup.isProcessing = false;
            newState.popup.isDisabled = true;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "You have been successfully changed password",
                    id: toastId
                });
            }
        }).catch(e => {
            console.log(e);
            newState.popup.isProcessing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot change admin's password",
                    id: toastId
                });
            }
        })
    };

    handleDeleteAdmin = () => {
        const {popup: {selectedAdminId}} = this.state;
        const newState: IAccessControlState = {...this.state};

        newState.popup.isProcessing = true;
        this.setState(newState);
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        deleteAdministrator(selectedAdminId).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data))
            }

            newState.popup.isProcessing = false;
            newState.popup.isDisabled = true;
            newState.popup.isDeleteAdminPopupShown = false;
            newState.users = newState.users.filter(user => user.administrator_id !== selectedAdminId);
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "You have been successfully deleted administrator",
                    id: toastId
                });
            }

        }).catch(e => {
            console.log(e);
            newState.popup.isProcessing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot delete administrator",
                    id: toastId
                });
            }
        })
    };

    render(): JSX.Element {
        const {user, users, popup, isLoading, validation} = this.state;
        const {userProfile: {isSuper}} = this.props;

        let popupMessage: any = {};
        if (popup.isDeleteAdminPopupShown) {
            popupMessage = {
                title: "Delete Admin",
                apply: "Yes",
                cancel: "No",
                info: "Are you sure?"
            }
        }

        return (
            <div>
                <div className="content-wrapper">
                    <ToastContainer/>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl">Administrators</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <div className="text-right">
                                    <button
                                        className="btn btn-default btn-addon"
                                        onClick={this.handleAddAdminModalOpen}
                                    ><i className="fa fa-plus"/> Add Administrator
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
                            <th>#</th>
                            <th>Administrator ID</th>
                            <th>Email</th>
                            <th>Created At</th>
                            <th className={isSuper ? "" : "hidden"}/>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            users && users.length === 0 &&
                            <tr>
                                <td colSpan={5}>No result</td>
                            </tr>
                        }

                        {users && users.map((user, key) => {
                                const N: number = key + 1;
                                const deleteAdmin: any = () => this.handleDeleteAdminModalOpen(user.administrator_id);
                                const changePassword: any = () => this.handleChangePasswordModalOpen(user.administrator_id);

                                return (
                                    <tr key={N}>
                                        <td scope="row">{N}</td>
                                        <td>{user.administrator_id}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            {moment(user.created_at).format("DD MMM YYYY hh:mm A")}
                                        </td>
                                        <td className={isSuper ? "" : "hidden"}>
                                            <MoreActions
                                                isDropup={(key === users.length - 1) && users.length > 2}
                                                isAbsolute={true}
                                            >
                                                <li>
                                                    <a href="javascript:void(0);" onClick={deleteAdmin}>
                                                        Delete Administrator
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="javascript:void(0);" onClick={changePassword}>
                                                        Change Password
                                                    </a>
                                                </li>
                                            </MoreActions>
                                        </td>
                                    </tr>
                                )
                            }
                        )}
                        </tbody>
                    </Table>
                }

                {/*Add Admin*/}
                <Modal show={popup.isAddAdminPopupShown} onHide={this.handleAddAdminModalClose}>
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
                                    autoComplete="off"
                                    autoFocus={true}
                                    value={user.email}
                                    onChange={this.handleEmailChange}
                                />
                            </FormGroup>
                            <FormGroup validationState={validation.password.value}>
                                <ControlLabel htmlFor="password">Password</ControlLabel>
                                <FormControl
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Password"
                                    value={user.password}
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
                                    autoComplete="new-password"
                                    placeholder="Confirm Password"
                                    value={user.confirmPassword}
                                    onChange={this.handlePasswordFieldChange}
                                />
                                <HelpBlock>{validation.confirmPassword.message}</HelpBlock>
                            </FormGroup>
                            <FormGroup validationState={validation.confirmPassword.value}>
                                <Checkbox
                                    checked={user.readonlyAdmin}
                                    inline={true}
                                    name="minutes"
                                    onChange={this.handleReadonlyFieldChange}
                                ><span>Read-Only admin</span>
                                </Checkbox>
                            </FormGroup>
                            <button
                                type="submit"
                                className="btn btn-info btn-block"
                                disabled={popup.isDisabled || popup.isProcessing}
                            >Add Administrator &nbsp;{popup.isProcessing && <i className="fa fa-spinner fa-spin"/>}
                            </button>
                        </form>
                    </Modal.Body>
                </Modal>

                {/*Change Password*/}
                <Modal show={popup.isChangePasswordPopupShown} onHide={this.handleChangePasswordModalClose}>
                    <Modal.Header closeButton={true}>
                        <span className="text-xlg">Change Administrator's Password</span>
                    </Modal.Header>
                    <Modal.Body>
                        <form className="wrapper-md" action="/" onSubmit={this.handleSubmit}>
                            <FormGroup validationState={validation.password.value}>
                                <ControlLabel htmlFor="password">Password</ControlLabel>
                                <FormControl
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    autoComplete="new-password"
                                    autoFocus={true}
                                    value={user.password}
                                    onChange={this.handlePasswordFieldChange}
                                />
                                <HelpBlock>{validation.password.message}</HelpBlock>
                            </FormGroup>
                            <FormGroup validationState={validation.confirmPassword.value}>
                                <ControlLabel htmlFor="confirmPassword">Confirm Password</ControlLabel>
                                <FormControl
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm Password"
                                    autoComplete="new-password"
                                    value={user.confirmPassword}
                                    onChange={this.handlePasswordFieldChange}
                                />
                                <HelpBlock>{validation.confirmPassword.message}</HelpBlock>
                            </FormGroup>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div className="text-right flex-end">
                                        <button
                                            className="btn btn-default m-r-sm"
                                            onClick={this.handleChangePasswordModalClose}
                                        >Cancel
                                        </button>
                                        <button
                                            className="btn btn-info"
                                            disabled={popup.isDisabled || popup.isProcessing}
                                            onClick={this.handlePasswordChange}
                                        >Change Password{popup.isProcessing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/*Delete Admin*/}
                <Popup
                    show={popup.isDeleteAdminPopupShown}
                    message={popupMessage}
                    hideModal={this.handleDeleteAdminModalClose}
                    confirmAction={this.handleDeleteAdmin}
                />
            </div>
        )
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AccessControl);
