"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import {Link} from "react-router-dom";
import {ToastContainer} from "react-toastify";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {checkRecoveryToken, resetPassword} from "ajaxRequests/authentication";
import {PAGE_NAME, PASSWORD_MIN_LENGTH} from "configs/constants";
import {showNotification} from "helpers/PageHelper";
import {IVALIDATION} from "services/interface";
import params from "configs/params";

interface IResetPasswordState {
    token: string,
    fields: {
        password: string,
        confirmPassword: string,
    };
    validation: {
        password: IVALIDATION,
        confirmPassword: IVALIDATION,
    };
    disabled: boolean,
}

class ResetPassword extends React.Component<any, IResetPasswordState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);

        this.state = {
            token: "",
            fields: {
                password: "",
                confirmPassword: "",
            },
            validation: {
                password: {
                    value: null,
                    message: "",
                },
                confirmPassword: {
                    value: null,
                    message: "",
                }
            },
            disabled: true
        }
    }

    componentWillMount(): void {
        document.title = PAGE_NAME["/reset-password"];
    }

    componentDidMount(): void {
        const {history, match}: any = this.props;
        if (match.params.id) {
            checkRecoveryToken({token: match.params.id}).then(({data}: AxiosResponse) => {

                if (data.err) {
                    history.push("/login");
                }
                if (this.componentState) {
                    const newState: IResetPasswordState = {...this.state};
                    newState.token = match.params.id;
                    this.setState(newState);
                }
            }).catch(error => console.log(error));
        } else {
            history.push("/login");
        }
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IResetPasswordState = {...this.state};
        if (name === "password") {
            newState.fields.password = value;
            newState.validation.password.value = value.length >= PASSWORD_MIN_LENGTH ? "success" : "error";
            if (newState.fields.confirmPassword) {
                newState.validation.confirmPassword.value = (newState.fields.password === newState.fields.confirmPassword) ? "success" : "error";
            }
        }
        if (name === "confirmPassword") {
            newState.fields.confirmPassword = value;
            newState.validation.confirmPassword.value = (value.length >= PASSWORD_MIN_LENGTH && value === newState.fields.password) ? "success" : "error";
        }
        newState.disabled = !(newState.validation.password.value === "success" && newState.validation.confirmPassword.value === "success");
        this.setState(newState)

    };

    handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const {token, fields}: IResetPasswordState = this.state;
        const newState: IResetPasswordState = {...this.state};
        newState.disabled = true;
        this.setState(newState);

        const data: any = {
            password: fields.password,
            confirmPassword: fields.confirmPassword
        };

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        resetPassword(data, token).then(({data}: AxiosResponse) => {
            const {history} = this.props;
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            showNotification("success", {
                title: "Success!",
                description: "Password has been successfully changed",
                id: toastId
            });
            history.push("/login");
        }).catch(err => {
            console.log(err);
            showNotification("error", {
                title: "You got an error!",
                description: "Server error",
                id: toastId
            });
            newState.validation.password.value = "error";
            newState.validation.confirmPassword.value = "error";
            newState.disabled = false;
            if (this.componentState) {
                this.setState(newState);
            }
        })
    };

    render(): JSX.Element {
        const {validation, disabled}: IResetPasswordState = this.state;

        return (
            <div>
                <ToastContainer/>

                <div className="container">
                    <div className="wrapper-lg">
                        <Link to="/">
                            <p className="center-block font-bold text-lg text-center">{params.panel.name}</p>
                        </Link>
                    </div>
                    <div className="w-xxl w-auto-xs center-block">
                        <div className="wrapper-lg bg-white box-shadow form-box-shadow r-2x">
                            <h4 className="m-b-md hidden m-t-none text-dark text-center">Request reset password</h4>

                            <form onSubmit={this.handleSubmit}>
                                <FormGroup validationState={validation.password.value}>
                                    <ControlLabel htmlFor="password">Password</ControlLabel>
                                    <FormControl
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Password"
                                        onChange={this.handleChange}
                                    />
                                    <FormControl.Feedback/>
                                </FormGroup>
                                <FormGroup validationState={validation.confirmPassword.value}>
                                    <ControlLabel htmlFor="confirmPassword">Confirm Password</ControlLabel>
                                    <FormControl
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Confirm Password"
                                        onChange={this.handleChange}
                                    />
                                    <FormControl.Feedback/>

                                </FormGroup>
                                <button disabled={disabled} type="submit" className="btn btn-info btn-block">Change Password</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ResetPassword;
