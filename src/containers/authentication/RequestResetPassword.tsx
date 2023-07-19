"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import {Link} from "react-router-dom";
import {ToastContainer} from "react-toastify";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";
import InputGroup from "react-bootstrap/es/InputGroup";

import {requestResetPassword} from "ajaxRequests/authentication";
import {showNotification} from "helpers/PageHelper";
import {IVALIDATION} from "services/interface";
import {LIST, PAGE_NAME} from "configs/constants";
import params from "configs/params";
import Button from "react-bootstrap/es/Button";

interface IRequestResetPasswordState {
    email: string,
    validation: {
        email: IVALIDATION
    },
    disabled: boolean,
}

class RequestResetPassword extends React.Component<any, IRequestResetPasswordState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);

        this.state = {
            email: "",
            validation: {
                email: {
                    value: null,
                    message: "",
                }
            },
            disabled: true,
        };
    }

    componentWillMount(): void {
        document.title = PAGE_NAME["/request-reset-password"];
    }

    handleChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        if (name === "email") {
            const newState: IRequestResetPasswordState = {...this.state};
            const isValidEmail: any = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
            newState.validation[name].value = isValidEmail ? null : "error";
            newState.disabled = !isValidEmail;
            newState.email = value;
            this.setState(newState);
        }
    };

    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const {email}: IRequestResetPasswordState = {...this.state};
        const newState: IRequestResetPasswordState = {...this.state};
        newState.disabled = true;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        requestResetPassword({email}).then(({data}: AxiosResponse) => {
            if (data.err || !data.result.requested) {
                throw new Error(JSON.stringify(data));
            }

            newState.email = "";
            newState.validation.email.value = null;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "Reset link has been sent to your email address.",
                    id: toastId
                });
            }
        }).catch(err => {
            console.log(err);
            newState.validation.email.value = "error";
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Email does not exist",
                    id: toastId
                });
            }
        })
    };
    resetEmailField = (): void => {
        const newState: IRequestResetPasswordState = {...this.state};
        newState.email = "";
        this.setState(newState)
    }
    render(): JSX.Element {
        const {email, validation, disabled}: IRequestResetPasswordState = {...this.state};

        return (
            <div>
                <ToastContainer/>
                <div className="container">
                    <div className="wrapper-lg">
                        <Link to={"/"}>
                            <p className="center-block font-bold text-lg text-center">{params.panel.name}</p>
                        </Link>

                    </div>
                    <div className="w-xxl w-auto-xs center-block">
                        <div className="wrapper-lg bg-white box-shadow form-box-shadow r-2x">
                            <h4 className="m-b-md hidden m-t-none text-dark text-center">Request reset password</h4>
                            <form onSubmit={this.handleSubmit} noValidate={true}>
                                <FormGroup validationState={validation.email.value}>
                                    <ControlLabel htmlFor="email">Email address</ControlLabel>
                                    <FormControl
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={this.handleChange}
                                    />
                                    <div
                                        style={{
                                        position: "absolute",
                                        top: "24px",
                                        right: 0,
                                        height: "34px",
                                        width: "34px",
                                        }}
                                        onClick={this.resetEmailField}
                                    >
                                        <FormControl.Feedback/>
                                    </div>
                                </FormGroup>
                                <button
                                    disabled={disabled}
                                    type="submit"
                                    className="btn btn-info btn-block"
                                >Send
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default RequestResetPassword;
