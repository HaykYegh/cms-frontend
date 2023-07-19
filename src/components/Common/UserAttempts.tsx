"use strict";

import * as React from "react";
import Select from "react-select";
import {connect} from "react-redux";
import format from "date-fns/format";
import axios, {AxiosResponse} from "axios";
import Table from "react-bootstrap/es/Table";
import Button from "react-bootstrap/es/Button";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {getPinCode, resetAttempts, sendSms} from "ajaxRequests/attempts";
import {getAttempts, getAttemptsCount} from "ajaxRequests/users";
import {ATTEMPT_TYPE, PROVIDERS_LIMIT} from "configs/constants";
import {ISelect, IUser, IVALIDATION} from "services/interface";
import {getProvidersList} from "ajaxRequests/providers";
import selector, {IStoreProps} from "services/selector";
import Pagination from "components/Common/Pagination";
import {showNotification} from "helpers/PageHelper";
import {getCurrentOffset} from "helpers/DataHelper";
import Loading from "components/Common/Loading";

interface IUserAttemptsState {
    user: any,
    offset: number,
    limit: number,
    isLoading: boolean,
    providers: any,
    provider: any,
    dailyAttemptsCount: number,
    totalAttemptsCount: number,
    dailyAttemptsCountAfterReset: number,
    totalAttemptsCountAfterReset: number,
    sms: {
        message: string,
        receivers: Array<any>,
        isReceived: boolean,
        isReady: boolean,
    },
    validation: {
        provider: IVALIDATION,
        message: IVALIDATION
    },
    request: {
        isPaging: boolean,
        reset: {
            type: string,
            isProcessing: boolean,
            isDaily: boolean,
            isAll: boolean
        },
    };
}

interface IUserAttemptsProps extends IStoreProps {
    username: string | IUser,
    hideModal?: () => void,
    isVerified: boolean,
    isEmail?: boolean,
    nick_email?: string,
    email?: string
}

class UserAttempts extends React.Component<IUserAttemptsProps, IUserAttemptsState> {

    componentState: boolean = true;

    constructor(props: IUserAttemptsProps) {
        super(props);
        const {username, nick_email, email} = this.props;
        // tslint:disable-next-line:typedef
        let to = username;
        if (nick_email) {
            to = nick_email
        }
        if (email) {
            to = email;
        }

        this.state = {
            user: {
                attempts: {},
                pinCode: ""
            },
            offset: 0,
            limit: 20,
            isLoading: true,
            providers: null,
            provider: "",
            dailyAttemptsCount: 0,
            totalAttemptsCount: 0,
            dailyAttemptsCountAfterReset: 0,
            totalAttemptsCountAfterReset: 0,
            sms: {
                message: "",
                receivers: to ? [to] : [],
                isReceived: false,
                isReady: false,
            },
            validation: {
                provider: {
                    value: null,
                    message: "",
                },
                message: {
                    value: null,
                    message: "",
                }
            },
            request: {
                isPaging: false,
                reset: {
                    type: null,
                    isProcessing: false,
                    isDaily: true,
                    isAll: true
                },
            }
        };
    }

    componentDidMount(): void {
        const {username, isEmail} = this.props;
        const {offset, limit} = this.state;
        const newState: IUserAttemptsState = this.state;
        let errorMessage: string = "Unknown error";
        const providerType: string = isEmail ? "email" : "sms";

        axios.all([
            getAttempts(username, offset, limit),
            getProvidersList(0, PROVIDERS_LIMIT, providerType),
            getPinCode(username),
            getAttemptsCount(username, true),
            getAttemptsCount(username, false),
        ]).then(axios.spread((user, providers, pinCode, dailyAttemptsCount, allAttemptsCount) => {
            if (user.data.err || !user.data.result) {
                errorMessage = "Cannot get user";
                throw new Error(JSON.stringify(user.data));
            }
            const result: any = user.data.result;

            if (result && result.records) {

                for (const item of result.records) {
                    newState.user.attempts[item.attemptId] = item;
                }
                newState.request.reset.isDaily = Object.keys(newState.user.attempts).some(item => !newState.user.attempts[item].reset);
            }

            if (providers.data.err) {
                errorMessage = "Cannot get providers";
                throw new Error(JSON.stringify(providers.data));
            }

            newState.providers = providers.data.result.map(item => {
                return {
                    label: `${item.label} - ${item.name}`,
                    value: item.providerId
                };
            });

            if (newState.providers.length > 0) {
                newState.provider = newState.providers[0];
            }

            if (pinCode.data.err || !pinCode.data.result) {
                errorMessage = "Cannot get pin code";
                throw new Error(JSON.stringify(user.data));
            }

            newState.user.pinCode = pinCode.data.result.code || "";
            newState.sms.message = newState.user.pinCode === "" ? "" : "Your pin code is " + newState.user.pinCode;

            if (dailyAttemptsCount.data.err) {
                errorMessage = "Cannot get daily attempts count";
                throw new Error(JSON.stringify(dailyAttemptsCount.data));
            }

            newState.dailyAttemptsCount = dailyAttemptsCount.data.result && +dailyAttemptsCount.data.result.isNotReseted + +dailyAttemptsCount.data.result.isReseted;
            newState.dailyAttemptsCountAfterReset = dailyAttemptsCount.data.result && +dailyAttemptsCount.data.result.isNotReseted;

            if (allAttemptsCount.data.err) {
                errorMessage = "Cannot get all attempts count";
                throw new Error(JSON.stringify(allAttemptsCount.data));
            }

            newState.totalAttemptsCount = allAttemptsCount.data.result && +allAttemptsCount.data.result.isNotReseted + +allAttemptsCount.data.result.isReseted;
            newState.totalAttemptsCountAfterReset = allAttemptsCount.data.result && +allAttemptsCount.data.result.isNotReseted;

            newState.isLoading = false;
            if (this.componentState) {
                this.setState(newState);
            }

        })).catch(err => {
            console.log(err);
            if (this.componentState) {
                newState.isLoading = false;
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: errorMessage,
                    timer: 3000
                });
            }
        });
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleProviderTypeChange = (provider: React.ChangeEvent<ISelect>): void => {
        const newState: IUserAttemptsState = {...this.state};
        newState.validation.provider.value = provider ? null : "error";
        newState.provider = provider;
        newState.sms.isReady = false;
        this.setState(newState);
    };

    handleMessageChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const newState: IUserAttemptsState = {...this.state};
        newState.validation.message.value = value === "" ? "error" : null;
        newState.sms.message = value;
        newState.sms.isReady = false;
        this.setState(newState);
    };

    handleListChange = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {offset, limit} = this.state;
        const {username} = this.props;
        const newState: IUserAttemptsState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);

        newState.request.isPaging = true;
        this.setState(newState);

        getAttempts(username, currentOffset, limit).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            const result: any = data.result;
            if (result && result.records) {

                for (const item of result.records) {
                    newState.user.attempts[item.attemptId] = item;
                }

                newState.request.reset.isDaily = Object.keys(newState.user.attempts).some(item => !newState.user.attempts[item].reset);
            }
            newState.offset = currentOffset;
            newState.request.isPaging = false;
            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(err => {
            console.log(err);
            if (this.componentState) {
                newState.request.isPaging = false;
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get not verified users",
                    timer: 3000
                });
            }
        });
    };

    handleResetAttempts = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();

        const resetType: string = e.currentTarget.getAttribute("data-reset-type");
        if (resetType === ATTEMPT_TYPE.DAILY || resetType === ATTEMPT_TYPE.TOTAL) {
            const newState: IUserAttemptsState = {...this.state};

            newState.request.reset.type = resetType;
            newState.request.reset.isProcessing = true;
            this.setState(newState);

            const toastId: number = showNotification("info", {
                title: "Resetting...",
                description: "",
            });

            const {username} = this.props;

            resetAttempts(username, resetType).then(({data}: AxiosResponse) => {

                if (data.err) {
                    throw new Error(JSON.stringify(data));
                }

                if (resetType === ATTEMPT_TYPE.DAILY) {
                    for (const property of data.result) {
                        for (const item in newState.user.attempts) {
                            if (item.toString() === property.userAttemptId.toString()) {
                                newState.user.attempts[item].reset = true;
                                newState.totalAttemptsCountAfterReset -= newState.dailyAttemptsCountAfterReset;
                                newState.dailyAttemptsCountAfterReset = 0;
                            }
                        }
                    }
                }

                if (resetType === ATTEMPT_TYPE.TOTAL) {
                    for (const item in newState.user.attempts) {
                        if (newState.user.attempts.hasOwnProperty(item)) {
                            newState.user.attempts[item].reset = true;
                        }
                    }
                    newState.totalAttemptsCountAfterReset = 0;
                    newState.dailyAttemptsCountAfterReset = 0;
                    newState.request.reset.isAll = false;
                }

                newState.request.reset.isDaily = false;
                newState.request.reset.isProcessing = false;

                if (this.componentState) {
                    this.setState(newState);
                    showNotification("success", {
                        title: "Success!",
                        description: `You have successfully reset ${resetType.toLowerCase()} attempts`,
                        id: toastId
                    });
                }

            }).catch(err => {
                console.log(err);
                newState.request.reset.isProcessing = false;
                if (this.componentState) {
                    this.setState(newState);
                    showNotification("error", {
                        title: "You've got an error!",
                        description: "Cannot reset attempts",
                        id: toastId
                    });
                }
            });
        }
    };

    handleSmsSend = (e: React.MouseEvent<HTMLButtonElement>): any => {
        e.preventDefault();
        const {sms, provider} = this.state;
        const {hideModal} = this.props;
        const newState: any = {...this.state};
        const smsToSend: any = {
            message: sms.message,
            receivers: sms.receivers,
            subject: "Please verify your account",
        };
        let errorMessage: string = "Message successfully sent";

        const toastId: number = showNotification("info", {
            title: "Sending...",
            description: "",
        });

        newState.sms.isReady = true;
        this.setState(newState);
        sendSms(provider.value, smsToSend).then(({data}: AxiosResponse) => {
            if (data.err) {
                errorMessage = data.err_msg === "CONSUMER_NOT_IMPLEMENTED" ? "Provider is not implemented, please contact support team, to fix this problem"
                    : data.err_msg === "CONSUMER_INVALID_CONFIGURATION" ? "Invalid provider configuration" : "Message has not sent for unknown reason";
                throw new Error(JSON.stringify(data));
            }

            if (data.result.isTransmitted) {
                newState.sms.isReceived = true;
            }

            newState.sms.isReady = false;

            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: errorMessage,
                    id: toastId
                });
            }

            if (hideModal) {
                hideModal();
            }

        }).catch(e => {
            console.log(e);
            if (this.componentState) {
                newState.sms.isReady = false;
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: errorMessage,
                    timer: 3000,
                    id: toastId
                });
            }
        });
    };

    render(): JSX.Element {
        const {
            user, offset, limit, isLoading, sms, providers, provider, validation, request: {reset, isPaging},
            dailyAttemptsCount, totalAttemptsCount, dailyAttemptsCountAfterReset, totalAttemptsCountAfterReset
        } = this.state;
        const {hideModal, regionCodes, isVerified} = this.props;

        return (
            <div className="bg-white box-shadow r-3x">
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <span className="text-xsl padder-t-3">{isVerified ? "User Attempts" : "Not Verified User Attempts"}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <hr/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-xs-12 col-sm-12">
                                {
                                    user.pinCode === "" ? <p>Pin code has expired</p> :
                                        <p>Pin code - <span className="font-bold">{user.pinCode}</span></p>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                {
                    isLoading ? <Loading/> :
                        <Table
                            hover={true}
                            condensed={true}
                            responsive={true}
                        >
                            <thead>
                            <tr>
                                <th/>
                                <th>Country</th>
                                <th>Phone number / Email</th>
                                <th>Last attempt</th>
                                <th>Reset</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                Object.keys(user.attempts).length === 0 &&
                                <tr>
                                    <td colSpan={6}>No result</td>
                                </tr>
                            }
                            {
                                Object.keys(user.attempts).length > 0 && Object.keys(user.attempts).map((item, index) => {
                                    const data: any = user.attempts[item];
                                    const N: number = (offset * limit) + index + 1;
                                    return (
                                        <tr key={data.attemptId}>
                                            <td>{N}</td>
                                            <td>{regionCodes[data.regionCode] ? regionCodes[data.regionCode].label : ""}</td>
                                            <td>{data.email ? data.email : data.number}</td>
                                            <td>{format(new Date(data.createdAt), "DD MMM YYYY hh:mm A")}</td>
                                            <td>{data.reset.toString()}</td>
                                        </tr>
                                    )

                                })
                            }
                            </tbody>
                        </Table>
                }
                <div className="content-wrapper">
                    <div className="container-fluid">
                        {
                            user && user.attempts &&
                            <div className="col-lg-12 col-md-12 col-xs-12 col-sm-12">
                                <Pagination
                                    offset={offset}
                                    limit={limit}
                                    callback={this.handleListChange}
                                    data={user.attempts}
                                    disabled={isPaging}
                                />
                            </div>
                        }
                    </div>
                </div>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        {
                            isLoading ? <Loading/> :
                                <div className="col-lg-12 col-md-12 col-xs-12 col-sm-12">
                                    {providers &&
                                    <FormGroup validationState={validation.provider.value}>
                                        <ControlLabel>Select provider type</ControlLabel>
                                        <Select
                                            closeMenuOnSelect={true}
                                            isDisabled={false}
                                            name="provider"
                                            options={providers}
                                            value={provider}
                                            onChange={this.handleProviderTypeChange}
                                        />
                                    </FormGroup>}
                                </div>
                        }

                        {
                            provider &&
                            <div className="col-lg-12 col-md-12 col-xs-12 col-sm-12">
                                <FormGroup validationState={validation.message.value}>
                                    <ControlLabel htmlFor="message">Message</ControlLabel>
                                    <FormControl
                                        rows={5}
                                        id="message"
                                        name="message"
                                        componentClass="textarea"
                                        value={sms.message}
                                        placeholder="Message"
                                        onChange={this.handleMessageChange}
                                    />
                                </FormGroup>
                            </div>
                        }
                        <div className="col-lg-12 col-md-12 col-xs-12 col-sm-12">
                            <div className="row">
                                <div className={`${hideModal ? "col-lg-4 col-md-4" : "col-lg-3 col-md-3"} col-sm-12 col-xs-12`}>
                                    <span className="block">{`Daily Attempts After Reset: ${dailyAttemptsCountAfterReset || 0}`}</span>
                                </div>
                                <div className={`${hideModal ? "col-lg-4 col-md-4" : "col-lg-3 col-md-3"} col-sm-12 col-xs-12`}>
                                    <span className="block">{`Total Attempts After Reset: ${totalAttemptsCountAfterReset || 0}`}</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-12 col-md-12 col-xs-12 col-sm-12 m-b-md">
                            <div className="row">
                                <div className={`${hideModal ? "col-lg-4 col-md-4" : "col-lg-3 col-md-3"} col-sm-12 col-xs-12`}>
                                    <span>{`Daily Attempts: ${dailyAttemptsCount || 0}`}</span>
                                </div>
                                <div className={`${hideModal ? "col-lg-4 col-md-4" : "col-lg-3 col-md-3"} col-sm-12 col-xs-12`}>
                                    <span>{`Total Attempts: ${totalAttemptsCount || 0}`}</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-12 col-md-12 col-xs-12 col-sm-12">
                            <div className="f-r">
                                {
                                    (provider && sms.message !== "") &&
                                    <button
                                        disabled={sms.isReady}
                                        onClick={this.handleSmsSend}
                                        className="btn btn-info m-r-xs"
                                    >Send{sms.isReady ? (sms.isReceived ? <i className="fa fa-check m-l-xs"/>
                                        : <i className="fa fa-refresh fa-spin m-l-xs"/>) : null}
                                    </button>
                                }
                                {
                                    user && user.attempts && Object.keys(user.attempts).length > 0 &&
                                    <Button
                                        data-reset-type={ATTEMPT_TYPE.DAILY}
                                        disabled={!reset.isDaily || reset.isProcessing || !dailyAttemptsCountAfterReset}
                                        onClick={this.handleResetAttempts}
                                    >Reset daily attempts
                                        {(reset.type === ATTEMPT_TYPE.DAILY && reset.isProcessing) ? <i className="fa fa-spinner fa-spin m-l-xs"/> : ""}
                                    </Button>
                                }
                                {
                                    user && user.attempts && Object.keys(user.attempts).length > 0 &&
                                    <button
                                        className="btn btn-default m-l-xs"
                                        data-reset-type={ATTEMPT_TYPE.TOTAL}
                                        disabled={!reset.isAll || reset.isProcessing || !totalAttemptsCountAfterReset}
                                        onClick={this.handleResetAttempts}
                                    >Reset all attempts
                                        {(reset.type === ATTEMPT_TYPE.TOTAL && reset.isProcessing) ? <i className="fa fa-spinner fa-spin m-l-xs"/> : ""}
                                    </button>
                                }
                                {
                                    hideModal &&
                                    <Button
                                        onClick={hideModal}
                                        className="m-l-xs"
                                    >Close
                                    </Button>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(UserAttempts);
