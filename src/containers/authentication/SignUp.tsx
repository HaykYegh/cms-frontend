"use strict";

import * as React from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import Button from "react-bootstrap/es/Button";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {PASSWORD_MIN_LENGTH} from "configs/constants";
import selector from "services/selector";

interface ISignUpState {
    fields: {
        email: string;
        password: string;
        confirmPassword: string;
        reToken: string;
    };
    status: any;
    disabled: boolean;
    captcha: boolean;
}

class SignUp extends React.Component<any, ISignUpState> {

    constructor(props: any) {
        super(props);

        this.state = {
            fields: {
                email: "",
                password: "",
                confirmPassword: "",
                reToken: ""
            },
            status: {
                email: null,
                password: null,
                confirmPassword: null
            },
            captcha: false,
            disabled: true,

        };
    }

    componentWillMount(): void {
        document.title = "Sign up";
    }

    onChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {

        const newState: any = {...this.state};
        if (name === "email") {
            newState.fields.email = value;
            newState.status.email = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i) ? "success" : "error";

        }
        if (name === "password") {
            newState.fields.password = value;
            newState.status.password = (value.length >= PASSWORD_MIN_LENGTH) ? "success" : "error";
            if (newState.fields.confirmPassword) {
                newState.status.confirmPassword = (newState.fields.password === newState.fields.confirmPassword) ? "success" : "error";
            }
        }
        if (name === "confirmPassword") {
            newState.fields.confirmPassword = value;
            newState.status.confirmPassword = (value.length >= PASSWORD_MIN_LENGTH && value === newState.fields.password) ? "success" : "error";
        }
        newState.disabled = !(newState.status.password === "success" && newState.status.confirmPassword === "success" && newState.status.email === "success" && newState.captcha);
        this.setState(newState)
    };

    onCaptcha = (response: string) => {
        const newState: any = {...this.state};
        newState.fields.reToken = response ? response : "";
        newState.captcha = !!response;
        newState.disabled = !(newState.status.password === "success" && newState.status.confirmPassword === "success" && newState.status.email === "success" && newState.captcha);
        this.setState(newState)
    };

    onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const {attemptSignUp} = this.props;
        const {fields} = this.state;

        attemptSignUp({
            email: fields.email,
            password: fields.password,
            confirmPassword: fields.confirmPassword,
            reToken: fields.reToken
        });

    };

    render(): JSX.Element {

        const {status, disabled}: any = this.state;

        return (
            <div className={"container"}>
                <div className={"wrapper-lg"}>
                    <Link to={"/"}>
                        <img
                            src={"/assets/images/zhorizonal.svg"}
                            className={"w-sm center-block"}
                            alt="Business panel logo"
                        />
                    </Link>
                </div>
                <div className="w-xxl w-auto-xs center-block">
                    <div className="wrapper-lg bg-white box-shadow form-box-shadow ">
                        <h4 className={"m-b-md hidden m-t-none text-dark text-center"}>Sign in your Zangi account</h4>

                        <form onSubmit={this.onSubmit}>
                            <FormGroup validationState={status.email}>
                                <ControlLabel htmlFor="email">Email address</ControlLabel>
                                <FormControl
                                    onChange={this.onChange}
                                    name="email"
                                    type="email"
                                    id="email"
                                    placeholder="Email"
                                />

                            </FormGroup>
                            <FormGroup validationState={status.password}>
                                <ControlLabel htmlFor="password">Password</ControlLabel>
                                <FormControl
                                    onChange={this.onChange}
                                    name="password"
                                    type="password"
                                    id="password"
                                    placeholder="Password"
                                />
                            </FormGroup>
                            <FormGroup validationState={status.confirmPassword}>
                                <ControlLabel htmlFor="confirmPassword">Confirm Password</ControlLabel>
                                <FormControl
                                    onChange={this.onChange}
                                    name="confirmPassword"
                                    type="password"
                                    className="form-control"
                                    id="confirmPassword"
                                    placeholder="Confirm Password"
                                />
                            </FormGroup>
                            <FormGroup>
                                <ReCAPTCHA
                                    ref="recaptcha"
                                    sitekey="6LdW7zgUAAAAAJPtzy_5PqFUsMbI-rjh0SGG1YdP"
                                    onChange={this.onCaptcha}
                                />
                            </FormGroup>
                            <Button disabled={disabled} type="submit" className="btn btn-info btn-block">Sign
                                up</Button>
                        </form>
                        <div className="text-center m-t-md">
                            <Link className={"text-info"} to="/login">Log in</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
