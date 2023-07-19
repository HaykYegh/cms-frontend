"use strict";

import * as React from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import Form from "react-bootstrap/es/Form";
import {ToastContainer} from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";
import Checkbox from "react-bootstrap/es/Checkbox";
import FormGroup from "react-bootstrap/es/FormGroup";
import HelpBlock from "react-bootstrap/es/HelpBlock";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {PAGE_NAME, PASSWORD_MIN_LENGTH} from "configs/constants";
import selector, {IStoreProps} from "services/selector";
import {attemptLogIn} from "modules/user/UserActions";
import params from "configs/params";

// import ElloLogo from 'assets/images/ello-logos/ello.png';

interface ILoginState {
    rememberMe: boolean,
    fields: {
        email: string,
        password: string,
        reCaptchaToken: string,
    };
    status: {
        email: string,
        password: string,
    };
    disabled: boolean,
    captcha: boolean,
    alert: any,
}

interface ILoginProps extends IStoreProps {
    history: any,
    attemptLogIn: (data: { email: string, password: string, rememberMe: boolean, reCaptchaToken: string, history: any }) => void;
}

class Login extends React.Component<ILoginProps, ILoginState> {

    constructor(props: any) {
        super(props);
        this.state = {
            rememberMe: false,
            fields: {
                email: "",
                password: "",
                reCaptchaToken: ""
            },
            status: {
                email: null,
                password: null,
            },
            disabled: true,
            captcha: false,
            alert: {
                danger: {
                    message: "Server error",
                    show: false
                },
            },
        };
    }

    componentWillMount(): void {
        document.title = PAGE_NAME["/login"];
    }

    componentWillReceiveProps(nextProps: ILoginProps): void {
        if (nextProps.errorMessage && nextProps.errorMessage.length > 0) {
            (window as any).grecaptcha.reset();
            const newState: ILoginState = {...this.state};
            newState.fields.password = "";
            newState.fields.reCaptchaToken = "";
            newState.status.email = "error";
            newState.status.password = "error";
            newState.disabled = true;
            newState.captcha = false;
            newState.alert.danger.show = true;
            newState.alert.danger.message = nextProps.errorMessage;
            this.setState(newState);
        }
    }

    handleCheckboxChange = ({currentTarget: {checked}}: React.MouseEvent<HTMLInputElement>): void => {
        this.setState({rememberMe: checked});
    };

    handleToggleDisabled = (state: ILoginState): void => {
        state.disabled = !state.captcha || state.status.email === "error" || state.fields.email === "" ||
            state.status.password === "error" || state.fields.password === "";
    };

    handleChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: ILoginState = {...this.state};
        newState.fields[name] = value;

        if (name === "email") {
            newState.status.email = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i) ? "success" : "error";
        }

        if (name === "password") {
            newState.status.password = value.length >= PASSWORD_MIN_LENGTH ? "success" : "error";

            if (newState.status.email === "error") {
                newState.status.email = newState.fields.email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i) ? "success" : "error";
            }
        }

        this.handleToggleDisabled(newState);
        newState.alert.danger.show = false;
        this.setState(newState);
    };

    handleCaptcha = (response: string): void => {
        const newState: ILoginState = {...this.state};
        newState.fields.reCaptchaToken = response;
        newState.captcha = !!response;
        newState.disabled = !(newState.status.email === "success" && newState.status.password === "success" && newState.captcha);
        this.setState(newState);
    };

    handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const {attemptLogIn, history} = this.props;
        const {rememberMe, fields} = this.state;
        this.setState({disabled: true});

        attemptLogIn({
            email: fields.email,
            password: fields.password,
            rememberMe,
            reCaptchaToken: fields.reCaptchaToken,
            history
        });
    };

    toggleIsChecked = (): void => {
        this.setState({rememberMe: !this.state.rememberMe});
    };

    render(): JSX.Element {
        const {rememberMe, disabled, alert, status, fields} = this.state;
        return (
            <div className="container">
                <ToastContainer/>
                <div className="wrapper-lg">
                    <Link to="/login">
                        <p className="center-block font-bold text-lg text-center">
                            {
                                process.env.APP_PREFIX === "el" &&
                                <img src="/assets/images/ello-logos/ello.png" alt="logo" style={{height: 40, width: 40}}/>
                            }
                            {params.panel.name}
                        </p>
                    </Link>
                </div>
                <div className="w-xxl w-auto-xs center-block">
                    <div className="wrapper-lg bg-white box-shadow form-box-shadow r-2x">
                        <Form onSubmit={this.handleSubmit}>
                            <FormGroup validationState={status.email}>
                                <ControlLabel htmlFor="email">Email address</ControlLabel>
                                <FormControl
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Email"
                                    value={fields.email}
                                    onChange={this.handleChange}
                                />
                                <FormControl.Feedback/>
                            </FormGroup>

                            <FormGroup validationState={status.password}>
                                <ControlLabel htmlFor="password">Password</ControlLabel>
                                <FormControl
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Password"
                                    value={fields.password}
                                    onChange={this.handleChange}
                                />
                                <FormControl.Feedback/>
                                {alert.danger.show && <HelpBlock>{alert.danger.message}</HelpBlock>}
                            </FormGroup>

                            <FormGroup>
                                <Checkbox
                                    onClick={this.toggleIsChecked}
                                    onChange={this.handleCheckboxChange}
                                    checked={rememberMe}
                                ><span>
                                    {
                                        process.env.APP_PREFIX === "el"  ?
                                        <>Remember me</> : <>Remember me next time</>
                                    }
                                </span>
                                </Checkbox>
                            </FormGroup>

                            <FormGroup>
                                <ReCAPTCHA
                                    className="g-recaptcha"
                                    ref="recaptcha"
                                    sitekey={params.panel.env.recaptcha}
                                    onChange={this.handleCaptcha}
                                />
                            </FormGroup>

                            <button
                                disabled={disabled}
                                type="submit"
                                className="btn btn-info btn-block"
                            >Sign in
                            </button>
                        </Form>
                        <div className="text-center m-t-md">
                            <Link className="text-info" to="/request-reset-password">Forgot password?</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = dispatch => ({
    attemptLogIn: ({email, password, rememberMe, reCaptchaToken, history}) => dispatch(attemptLogIn({
        email,
        password,
        rememberMe,
        reCaptchaToken,
        history
    }))
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
