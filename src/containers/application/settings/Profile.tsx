"use strict";

import * as React from "react";
import {connect} from "react-redux";
import {AxiosResponse} from "axios";
import isEqual from "lodash/isEqual";
import Modal from "react-bootstrap/es/Modal";
import {ToastContainer} from "react-toastify";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";

import {PAGE_NAME, PASSWORD_MIN_LENGTH, USER_ATTRIBUTES} from "configs/constants";
import {updateProfile, changePassword} from "ajaxRequests/profile";
import {updateUserProfile} from "modules/user/UserActions";
import selector, {IStoreProps} from "services/selector";
import {showNotification} from "helpers/PageHelper";
import {resetValidation} from "helpers/DataHelper";
import {IVALIDATION} from "services/interface";

interface IProfileState {
    request: {
        userUpdate: {
            isProcessing: boolean,
            isDisabled: boolean,
        },
        passwordUpdate: {
            isProcessing: boolean,
            isDisabled: boolean,
        }
    },
    popup: {
        isUserFormShown: boolean,
        isPasswordFormShown: boolean,
        userAttributes: any,
        passwordAttributes: {
            password: string,
            confirmPassword: string,
            currentPassword: string,
        }
    },
    validation: {
        password: IVALIDATION,
        confirmPassword: IVALIDATION,
        currentPassword: IVALIDATION,
    },
    userAttributes: any
}

interface IProfileProps extends IStoreProps {
    userProfile?: any,
    updateUserProfile?: (userProfile: any) => void,
}

class Profile extends React.Component<IProfileProps, IProfileState> {

    isComponentMounted: boolean = true;

    constructor(props: any) {
        super(props);

        this.state = {
            request: {
                userUpdate: {
                    isProcessing: false,
                    isDisabled: true,
                },
                passwordUpdate: {
                    isProcessing: false,
                    isDisabled: true,
                }
            },
            popup: {
                isUserFormShown: false,
                isPasswordFormShown: false,
                userAttributes: {},
                passwordAttributes: {
                    password: "",
                    confirmPassword: "",
                    currentPassword: "",
                }
            },
            validation: {
                password: {
                    value: null,
                    message: "",
                },
                confirmPassword: {
                    value: null,
                    message: "",
                },
                currentPassword: {
                    value: null,
                    message: "",
                }
            },
            userAttributes: {}
        }
    }

    componentDidMount(): void {
        document.title = PAGE_NAME["/settings/profile"];
        const {userProfile} = this.props;
        const userAttributes: any = {};
        if (Object.keys(userProfile).length !== 0 &&  userProfile.constructor === Object && Object.entries(userProfile.attributes).length !== 0 && userProfile.attributes.constructor === Array) {
            for (const attribute of userProfile.attributes) {
                userAttributes[attribute.attributeId] = {...attribute};
            }
            this.setState({userAttributes});
        }
    }

    componentDidUpdate(prevProps: IProfileProps, prevState: IProfileState): void {
        const {userProfile} = this.props;
        if (!isEqual(userProfile.attributes, prevProps.userProfile.attributes)) {
            const updatedUserAttributes: any = {};
            for (const attribute of userProfile.attributes) {
                updatedUserAttributes[attribute.attributeId] = {...attribute};
            }
            this.setState({userAttributes: updatedUserAttributes});
        }
    }

    componentWillUnmount(): void {
        this.isComponentMounted = false;
    }

    handlePasswordModalOpen = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
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
        const newState: IProfileState = {...this.state};
        newState.popup.isPasswordFormShown = true;
        this.setState(newState);
    };

    handlePasswordModalClose = (): void => {
        const {popup: {passwordAttributes}, validation} = this.state;
        const newState: IProfileState = {...this.state};
        newState.popup.isPasswordFormShown = false;
        for (const item in passwordAttributes) {
            if (passwordAttributes.hasOwnProperty(item)) {
                newState.popup.passwordAttributes[item] = "";
            }
        }
        resetValidation(validation, newState);
        this.setState(newState);
    };

    handlePasswordFieldChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IProfileState = {...this.state};
        if (name === "password") {
            newState.popup.passwordAttributes.password = value;
            newState.validation.password.value = (value.length >= PASSWORD_MIN_LENGTH) ? "success" : "error";
            if (newState.popup.passwordAttributes.confirmPassword) {
                newState.validation.confirmPassword.value = (newState.popup.passwordAttributes.password === newState.popup.passwordAttributes.confirmPassword) ?
                    "success" : "error";
            }
        }
        if (name === "confirmPassword") {
            newState.popup.passwordAttributes.confirmPassword = value;
            newState.validation.confirmPassword.value = (value.length >= PASSWORD_MIN_LENGTH && value === newState.popup.passwordAttributes.password) ? "success" : "error";
        }
        if (name === "currentPassword") {
            newState.popup.passwordAttributes.currentPassword = value;
            newState.validation.currentPassword.value = value.length >= PASSWORD_MIN_LENGTH ? "success" : "error";
        }
        newState.request.passwordUpdate.isDisabled = !Object.keys(newState.validation).every(item => newState.validation[item].value === "success");
        this.setState(newState);
    };

    handleUserModalOpen = (e: React.MouseEvent<HTMLButtonElement>): void => {
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
        const newState: IProfileState = {...this.state};
        newState.popup.isUserFormShown = true;
        newState.request.userUpdate.isDisabled = true;
        const userAttributes: any = {};
        for (const attribute of userProfile.attributes) {
            userAttributes[attribute.attributeId] = {...attribute};
        }
        newState.popup.userAttributes = {...userAttributes};
        this.setState(newState);
    };

    handleUserModalClose = (): void => {
        const newState: IProfileState = {...this.state};
        newState.popup.isUserFormShown = false;
        newState.popup.userAttributes = [];
        newState.request.userUpdate.isDisabled = true;
        this.setState(newState);
    };

    handleUserAttributeChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IProfileState = {...this.state};
        newState.popup.userAttributes[USER_ATTRIBUTES[name]].value = value;
        // The ORDER of the properties IS IMPORTANT
        newState.request.userUpdate.isDisabled = isEqual(newState.popup.userAttributes, newState.userAttributes);
        this.setState(newState);
    };

    handleUserUpdate = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {popup} = this.state;
        const newState: IProfileState = {...this.state};
        const attributes: any = [];
        for (const item in popup.userAttributes) {
            if (popup.userAttributes.hasOwnProperty(item)) {
                attributes.push(popup.userAttributes[item])
            }
        }
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        newState.request.userUpdate.isProcessing = true;
        this.setState(newState);
        updateProfile({attributes}).then(({data}: AxiosResponse) => {
                if (data.error || !data.result) {
                    throw new Error(JSON.stringify(data));
                }

                if (this.isComponentMounted) {
                    newState.request.userUpdate.isProcessing = false;
                    newState.userAttributes = popup.userAttributes;
                    newState.popup.userAttributes = {};
                    newState.popup.isUserFormShown = false;
                    this.props.updateUserProfile(data.result || {});
                    showNotification("success", {
                        title: "Success!",
                        description: "Successfully updated your user information",
                        id: toastId
                    });
                    this.setState(newState);
                }
            }
        ).catch(e => {
            console.log(e);
            if (this.isComponentMounted) {
                newState.request.userUpdate.isProcessing = false;
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot update user information for unknown reason",
                    id: toastId
                });
            }
        })
    };

    handlePasswordChange = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {popup: {passwordAttributes}, validation}: IProfileState = this.state;
        const newState: IProfileState = {...this.state};
        newState.request.passwordUpdate.isProcessing = true;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        changePassword(passwordAttributes).then(({data}: AxiosResponse) => {
            if (data.error) {
                throw new Error(JSON.stringify(data));
            }
            newState.popup.isPasswordFormShown = false;
            for (const item in passwordAttributes) {
                if (passwordAttributes.hasOwnProperty(item)) {
                    newState.popup.passwordAttributes[item] = "";
                }
            }
            resetValidation(validation, newState);

            newState.request.passwordUpdate.isProcessing = false;
            this.setState(newState);
            if (this.isComponentMounted) {
                showNotification("success", {
                    title: "Success!",
                    description: "Your password has been successfully changed",
                    id: toastId
                });
                this.setState(newState);
            }
        }).catch(e => {
            console.log(e);
            newState.request.passwordUpdate.isProcessing = false;
            newState.validation.currentPassword.value = "error";
            newState.validation.currentPassword.message = "Your current password is incorrect, please try again";
            this.setState(newState);
            if (this.isComponentMounted) {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot change password",
                    id: toastId
                });
            }

        })
    };

    render(): JSX.Element {
        const {popup, userAttributes, validation, request: {userUpdate, passwordUpdate}} = this.state;
        return (
            <div>
                <div className="content-wrapper">
                    <ToastContainer/>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-4">
                                <span className="text-xlg padder-t-3 block">{PAGE_NAME["/settings/profile"]}</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-8">
                                <div className="text-right flex-end">
                                    <button
                                        className="btn btn-default btn-addon m-r-sm"
                                        onClick={this.handleUserModalOpen}
                                    ><i className="fa fa-pencil"/>Edit
                                    </button>
                                    <button
                                        className="btn btn-default btn-addon"
                                        onClick={this.handlePasswordModalOpen}
                                    ><i className="fa fa-pencil"/>Change Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="content-wrapper network-details">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                <div className="container-fluid no-padder">
                                    <div className="row m-b-md">
                                        <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                            <span className="block font-bold text-base text-uppercase">User Information</span>
                                        </div>
                                    </div>
                                    <div className="row m-b-md">
                                        <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                            <span className="block font-semi-bold">First Name</span>
                                        </div>
                                        <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                            <span className="block">{userAttributes[USER_ATTRIBUTES.firstName] && userAttributes[USER_ATTRIBUTES.firstName].value}</span>
                                        </div>
                                    </div>
                                    <div className="row m-b-md">
                                        <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                            <span className="block font-semi-bold">Last Name</span>
                                        </div>
                                        <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                            <span className="block">{userAttributes[USER_ATTRIBUTES.lastName] && userAttributes[USER_ATTRIBUTES.lastName].value}</span>
                                        </div>
                                    </div>
                                    <div className="row m-b-md">
                                        <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                            <span className="block font-semi-bold">Address</span>
                                        </div>
                                        <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                            <span className="block">{userAttributes[USER_ATTRIBUTES.address] && userAttributes[USER_ATTRIBUTES.address].value}</span>
                                        </div>
                                    </div>
                                    <div className="row m-b-md">
                                        <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                            <span className="block font-semi-bold">Company</span>
                                        </div>
                                        <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                            <span className="block">{userAttributes[USER_ATTRIBUTES.company] && userAttributes[USER_ATTRIBUTES.company].value}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Modal show={popup.isUserFormShown} onHide={this.handleUserModalClose} bsSize="large">
                    <Modal.Header closeButton={true}>
                        <span className="text-xlg">Edit User Information</span>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{maxWidth: "650px", margin: "10px auto"}}>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                        <form className="form-horizontal">

                                            <FormGroup>
                                                <label htmlFor="firstName" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">
                                                    First Name
                                                </label>
                                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                                    <FormControl
                                                        id="firstName"
                                                        name="firstName"
                                                        placeholder="First Name"
                                                        value={popup.userAttributes[USER_ATTRIBUTES.firstName] && popup.userAttributes[USER_ATTRIBUTES.firstName].value || ""}
                                                        onChange={this.handleUserAttributeChange}
                                                    />
                                                </div>
                                            </FormGroup>

                                            <FormGroup>
                                                <label htmlFor="lastName" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">
                                                    Last Name
                                                </label>
                                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                                    <FormControl
                                                        id="lastName"
                                                        name="lastName"
                                                        placeholder="Last Name"
                                                        value={popup.userAttributes[USER_ATTRIBUTES.lastName] && popup.userAttributes[USER_ATTRIBUTES.lastName].value || ""}
                                                        onChange={this.handleUserAttributeChange}
                                                    />
                                                </div>
                                            </FormGroup>

                                            <FormGroup>
                                                <label htmlFor="address" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">
                                                    Address
                                                </label>
                                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                                    <FormControl
                                                        id="address"
                                                        name="address"
                                                        placeholder="Address"
                                                        value={popup.userAttributes[USER_ATTRIBUTES.address] && popup.userAttributes[USER_ATTRIBUTES.address].value || ""}
                                                        onChange={this.handleUserAttributeChange}
                                                    />
                                                </div>
                                            </FormGroup>

                                            <FormGroup>
                                                <label htmlFor="company" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">
                                                    Company
                                                </label>
                                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                                    <FormControl
                                                        id="company"
                                                        name="company"
                                                        placeholder="Company"
                                                        value={popup.userAttributes[USER_ATTRIBUTES.company] && popup.userAttributes[USER_ATTRIBUTES.company].value || ""}
                                                        onChange={this.handleUserAttributeChange}
                                                    />
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
                                            onClick={this.handleUserModalClose}
                                        >Cancel
                                        </button>
                                        <button
                                            className="btn btn-info"
                                            disabled={userUpdate.isDisabled || userUpdate.isProcessing}
                                            onClick={this.handleUserUpdate}
                                        >Save{userUpdate.isProcessing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal>

                <Modal show={popup.isPasswordFormShown} onHide={this.handlePasswordModalClose} bsSize="large">
                    <Modal.Header closeButton={true}>
                        <span className="text-xlg">Change Password</span>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{maxWidth: "650px", margin: "10px auto"}}>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                        <form className="form-horizontal">

                                            <FormGroup validationState={validation.currentPassword.value}>
                                                <label htmlFor="currentPassword" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">
                                                    Enter your current password
                                                </label>
                                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                                    <FormControl
                                                        id="currentPassword"
                                                        name="currentPassword"
                                                        type="password"
                                                        placeholder="Current password"
                                                        value={popup.passwordAttributes.currentPassword}
                                                        onChange={this.handlePasswordFieldChange}
                                                    />
                                                    {validation.currentPassword.value === "error" ? <span className="help-block">{validation.currentPassword.message}</span> : ""}
                                                </div>
                                            </FormGroup>

                                            <FormGroup validationState={validation.password.value}>
                                                <label htmlFor="password" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">
                                                    New password
                                                </label>
                                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                                    <FormControl
                                                        id="password"
                                                        name="password"
                                                        type="password"
                                                        placeholder="New password"
                                                        value={popup.passwordAttributes.password}
                                                        onChange={this.handlePasswordFieldChange}
                                                    />
                                                </div>
                                            </FormGroup>

                                            <FormGroup validationState={validation.confirmPassword.value}>
                                                <label htmlFor="confirmPassword" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">
                                                    Confirm new password
                                                </label>
                                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                                    <FormControl
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        type="password"
                                                        placeholder="Confirm new password"
                                                        value={popup.passwordAttributes.confirmPassword}
                                                        onChange={this.handlePasswordFieldChange}
                                                    />
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
                                            onClick={this.handlePasswordModalClose}
                                        >Cancel
                                        </button>
                                        <button
                                            className="btn btn-info"
                                            disabled={passwordUpdate.isDisabled || passwordUpdate.isProcessing}
                                            onClick={this.handlePasswordChange}
                                        >Change Password{passwordUpdate.isProcessing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = dispatch => ({
    updateUserProfile: (userProfile) => dispatch(updateUserProfile(userProfile)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
