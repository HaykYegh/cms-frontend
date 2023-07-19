"use strict";

import * as React from "react";
import {isEqual} from "lodash";
import Select from "react-select";
import {connect} from "react-redux";
import {AxiosResponse} from "axios";
import {Link} from "react-router-dom";
import Form from "react-bootstrap/es/Form";
import Modal from "react-bootstrap/es/Modal";
import {ToastContainer} from "react-toastify";
import Button from "react-bootstrap/es/Button";
import Checkbox from "react-bootstrap/es/Checkbox";
import FormGroup from "react-bootstrap/es/FormGroup";
import HelpBlock from "react-bootstrap/es/HelpBlock";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";
import Overlay from "react-bootstrap/es/Overlay";
import Popover from "react-bootstrap/es/Popover";

import {createGateway, uploadPriceList, settingsConnection} from "ajaxRequests/gateways";
import selector, {IStoreProps} from "services/selector";
import {getUserGroups} from "ajaxRequests/users";

import {gatewayValidation, isNumeric, validateNumber} from "helpers/DataHelper";
import {showNotification, multiSelectMenuStyles, selectMenuStyles} from "helpers/PageHelper";
import {IVALIDATION} from "services/interface";
import {PAGE_NAME} from "configs/constants";

interface ICreateState {
    _countries: Array<any>;
    request: {
        create: {
            disabled: boolean,
            processing: boolean,
        },
        testConnection: {
            processing: boolean,
            success: boolean,
            error: boolean,
            show: boolean
        },
        finish: boolean,
    },
    validation: any;
    // optionalValidation: {
    //     callee: IVALIDATION
    // },
    dialPrefixActive: boolean;
    callerDialPrefixActive: boolean,
    callerCutDigitCountActive: boolean,
    calleeCutDigitCountActive: boolean,
    sipActive: boolean
    defaultGateway: boolean;
    model: {
        description: string;
        username: string,
        password: string,
        host: string;
        voipModuleAddress: string;
        dialPrefix: string;
        param1: string;
        param2: string;
        active: boolean;
        main: boolean;
        userGroupId: string;
        callerDialPrefix: string;
        callerCutDigitCount: any;
        calleeCutDigitCount: any;
    };
    popup: {
        show: boolean,
    },
    priceList: {
        id: number,
        file: File,
        isLoaded: boolean,
        processing: boolean
    },
    isConnectionSuccess: boolean,
    bNumber: string,
    aNumber: string,
    // isValidCallee: boolean,
    userGroups: any[];
    userGroup: any;
    isErrorPopupShown: boolean;
    errorMessage: ""
}

interface ICreateProps extends IStoreProps {
    history: any;
}

class Create extends React.Component<ICreateProps, ICreateState> {

    componentState: boolean = true;

    connectionRef: any = null;

    constructor(props: ICreateProps) {
        super(props);
        this.state = {
            _countries: [],
            request: {
                create: {
                    disabled: true,
                    processing: false,
                },
                testConnection: {
                    processing: false,
                    success: false,
                    error: false,
                    show: false,
                },
                finish: false,
            },
            dialPrefixActive: false,
            callerDialPrefixActive: false,
            callerCutDigitCountActive: false,
            calleeCutDigitCountActive: false,
            sipActive: false,
            defaultGateway: true,
            model: {
                description: "",
                host: "",
                voipModuleAddress: "",
                dialPrefix: "",
                username: "",
                password: "",
                param1: "1",
                param2: "0",
                active: true,
                main: false,
                userGroupId: "",
                callerDialPrefix: "",
                callerCutDigitCount: "",
                calleeCutDigitCount: "",
            },
            popup: {
                show: false,
            },
            priceList: {
                id: null,
                file: null,
                isLoaded: false,
                processing: false
            },
            validation: gatewayValidation(),
            // optionalValidation: {
            //     callee: {
            //         value: null,
            //         message: ""
            //     }
            // },
            isConnectionSuccess: false,
            bNumber: "",
            aNumber: "",
            // isValidCallee: false,
            userGroups: [],
            userGroup: null,
            isErrorPopupShown: false,
            errorMessage: "",
        }
    }

    componentDidMount(): void {
        document.title = PAGE_NAME["/gateways/create"];
        const newState: ICreateState = {...this.state};
        newState._countries = this.props.countries;
        this.setState(newState);
        getUserGroups(0, 1000).then(({data}: AxiosResponse) => {

            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.userGroups = data.result.map(item => {
                return {
                    value: item.userGroupId,
                    label: item.name
                }
            }) || [];

            if (this.componentState) {
                this.setState(newState);
            }

        }).catch(e => {
            console.log(e);
            if (this.componentState) {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Cannot get user groups for unknown reason"
                });
            }
        });
    }

    componentDidUpdate(prevProps: ICreateProps, prevState: ICreateState): void {
        const {countries} = this.props;
        if (!isEqual(prevProps.countries, countries)) {
            const newState: ICreateState = {...this.state};
            newState._countries = countries;
            this.setState(newState);
        }
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: ICreateState = {...this.state};
        newState.model[name] = value;
        newState.validation[name].value = value === "" ? "error" : null;
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handlePriceMarkupChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: ICreateState = {...this.state};
        const priceMarkup: number = +value;
        newState.model[name] = value;
        newState.validation[name].value = priceMarkup < 0 ? "error" : null;
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleActiveChange = ({currentTarget: {checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const {model: {main}} = this.state;
        const newState: ICreateState = {...this.state};
        newState.model.active = checked;
        if (main) {
            newState.model.main = checked;
        }
        this.setState(newState);
    };

    handleMainChange = ({currentTarget: {checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const {model: {active}} = this.state;
        const newState: ICreateState = {...this.state};
        newState.model.main = checked;
        if (!active && checked) {
            newState.model.active = true;
        }
        this.setState(newState);
    };

    handleDialPrefixChange = ({currentTarget: {checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: ICreateState = {...this.state};
        newState.dialPrefixActive = checked;
        newState.validation.dialPrefix = {
            value: null,
            message: ""
        };
        newState.model.dialPrefix = "";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleCallerDialPrefixChange = ({currentTarget: {checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: ICreateState = {...this.state};
        newState.callerDialPrefixActive = checked;
        newState.validation.callerDialPrefix = {
            value: null,
            message: ""
        };
        newState.model.callerDialPrefix = "";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleCallerCutDigitCountChange = ({currentTarget: {checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: ICreateState = {...this.state};
        newState.callerCutDigitCountActive = checked;
        newState.validation.callerCutDigitCount = {
            value: null,
            message: ""
        };
        newState.model.callerCutDigitCount = "";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleCalleeCutDigitCountChange = ({currentTarget: {checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: ICreateState = {...this.state};
        newState.calleeCutDigitCountActive = checked;
        newState.validation.calleeCutDigitCount = {
            value: null,
            message: ""
        };
        newState.model.calleeCutDigitCount = "";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleSIPChange = ({currentTarget: {checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: ICreateState = {...this.state};
        newState.sipActive = checked;
        newState.validation.username = {
            value: null,
            message: ""
        };
        newState.validation.password = {
            value: null,
            message: ""
        };
        if (!checked) {
            newState.model.username = "";
            newState.model.password = "";
        }
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleSIPUsernameChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: ICreateState = {...this.state};
        newState.model.username = value;
        if (value === "") {
            newState.model.password = "";
            newState.validation.password.value = null;
            newState.validation.password.message = "";
        }
        newState.validation.username.value = value === "" ? "error" : null;
        newState.validation.username.message = value === "" ? "Must be not empty" : "";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleSIPPasswordChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>): any => {
        const {model} = this.state;
        if (model.username === "") {
            return;
        }
        const newState: ICreateState = {...this.state};
        newState.model.password = value;
        newState.validation.password.value = value === "" ? "error" : null;
        newState.validation.password.message = value === "" ? "Must be not empty" : "";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleDefaultGatewayChange = ({currentTarget: {name, checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: ICreateState = {...this.state};
        const {countries} = this.props;
        newState.defaultGateway = checked;
        newState._countries = checked ? countries : [];
        newState.validation._countries = {
            value: null,
            message: ""
        };
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleToggleDisabled = (state: ICreateState): void => {
        state.request.create.disabled = !((state._countries.length > 0) && state.model.description &&
            state.model.host && (state.sipActive ? (state.model.username !== "" &&
                state.model.password !== "") : true) &&
            +state.model.param1 >= 0 && +state.model.param2 >= 0);
        // Todo add state.isConnectionSuccess for full validate gateway
    };

    handleCountryChange = (value: any): void => {
        const newState: ICreateState = {...this.state};
        newState._countries = value;
        newState.validation._countries.value = newState._countries.length > 0 ? null : "error";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleCalleeChange = ({currentTarget: {value, name}}: React.ChangeEvent<HTMLInputElement>): void => {
        const {request: {testConnection: {success, error}}} = this.state;
        const newState: ICreateState = {...this.state};

        // const valueForValidate: string = isNumeric(value) && value.substr(0, 1) !== "+" ?
        //     "+" + value.toString() : value;
        // const {isValid} = validateNumber(valueForValidate);
        // newState.optionalValidation.callee.value = value === "" ? null : isValid ? null : "error";
        // newState.optionalValidation.callee.message = (value === "" || isValid) ? "" : "Invalid phone number";
        // newState.isValidCallee = isValid;
        if (success) {
            newState.request.testConnection.success = false;
        }

        if (error) {
            newState.request.testConnection.error = false;
        }

        const regexp: any = /[^#+0-9]/gi;
        newState[name] = value.replace(regexp, "");
        this.setState(newState);
    };

    handleTestConnectionClose = (e: any): void => {
        e.preventDefault();
        const {request: {testConnection}} = this.state;
        const newState: ICreateState = {...this.state};
        newState.request.testConnection.show = false;
        newState.bNumber = "";
        newState.aNumber = "";
        if (testConnection.processing) {
            this.componentState = false;
            newState.request.testConnection.processing = false;
        }
        if (testConnection.error) {
            newState.request.testConnection.error = false;
        }
        if (testConnection.success) {
            newState.request.testConnection.success = false;
        }
        // newState.optionalValidation.callee = {
        //     value: null,
        //     message: ""
        // };
        // newState.isValidCallee = false;
        this.setState(newState);
    };

    handleTestConnectionRef = (ref: any): void => {
        this.connectionRef = ref;
    };

    handleTestConnection = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {model, bNumber, aNumber} = this.state;
        const newState: ICreateState = {...this.state};
        newState.request.testConnection.processing = true;
        this.setState(newState);

        const testingData: any = {
            host: model.host,
            username: model.username || "",
            password: model.password || "",
            dialPrefix: model.dialPrefix,
            callee: bNumber,
            caller: aNumber
        };

        this.componentState = true;

        settingsConnection(testingData).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            if (this.componentState) {
                if (data.result.result) {
                    newState.request.testConnection.success = true;
                    newState.isConnectionSuccess = true;
                    this.handleToggleDisabled(newState);
                } else {
                    newState.request.testConnection.error = true;
                    newState.errorMessage = data.result.reason;
                    newState.isErrorPopupShown = true;
                    this.handleTestConnectionClose(e);
                }
                newState.request.testConnection.processing = false;
                this.setState(newState);
            }
        }).catch(err => {
            console.log(err);
            if (this.componentState) {
                showNotification("error", {
                    title: "Calling Failed!",
                    description: `Could not calling ${bNumber}`,
                    timer: 3000
                });
                newState.request.testConnection.processing = false;
                this.setState(newState);
            }
        })
    };

    handleSIPGatewayCreate = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        const {model, _countries} = this.state;
        const newState: ICreateState = {...this.state};
        const regionCodes: string[] = _countries.map(item => item.region_code);
        // const gateway: any = {countries: regionCodes, ...model};

        const gateway: any = {
            countries: regionCodes,
            description: model.description,
            host: model.host,
            voipModuleAddress: model.voipModuleAddress,
            dialPrefix: model.dialPrefix,
            param1: model.param1 || 1,
            param2: model.param2 || 0,
            active: model.active,
            main: model.main,
            username: model.username,
            password: model.password,
            userGroupId: model.userGroupId,
            callerDialPrefix: model.callerDialPrefix,
            callerCutDigitCount: model.callerCutDigitCount || 0,
            calleeCutDigitCount: model.calleeCutDigitCount || 0,
        };

        newState.request.create.processing = true;
        this.setState(newState);

        this.componentState = true;

        createGateway(gateway).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.priceList.id = data.result.gateway_id;
            newState.popup.show = true;
            newState.request.create.processing = false;
            for (const item in newState.validation) {
                if (newState.validation.hasOwnProperty(item)) {
                    newState.validation[item] = {
                        value: null,
                        message: ""
                    }
                }
            }
            if (this.componentState) {
                this.setState(newState);
            }

        }).catch(() => {
            if (this.componentState) {
                newState.request.create.processing = false;
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Gateway is not created for unknown reason",
                    timer: 3000
                });
            }
        })
    };

    handleModalClose = (): void => {
        const {history} = this.props;
        history && history.push("/gateways");
    };

    handlePriceListUpload = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        const {priceList} = this.state;
        const newState: ICreateState = {...this.state};
        const toastId: number = showNotification("info", {
            title: "Uploading ...",
            description: "",
        });

        newState.priceList.isLoaded = false;
        newState.priceList.processing = true;
        this.setState(newState);

        const formData: any = new FormData();
        formData.append("pricelist", priceList.file);

        uploadPriceList(priceList.id, formData).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.priceList.isLoaded = false;
            newState.priceList.processing = false;
            newState.request.finish = true;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "Price list was uploaded",
                    id: toastId
                });
            }
        }).catch(e => {
            console.log(e);
            if (this.componentState) {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Price list is not uploaded for unknown reason",
                    id: toastId
                });
            }

        });
    };

    handleFileChange = ({currentTarget: {name, files}}: React.ChangeEvent<HTMLInputElement>): void => {
        if (files && files.length > 0) {
            const newState: ICreateState = {...this.state};
            newState.priceList.file = files[0];
            newState.priceList.isLoaded = true;
            this.setState(newState);
        }
    };

    handleTestConnectionOpen = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const newState: ICreateState = {...this.state};
        newState.request.testConnection.show = !newState.request.testConnection.show;
        this.setState(newState);
    };

    handleUserGroupChange = (selected: any) => {
        const newState: ICreateState = {...this.state};
        newState.userGroup = selected;
        newState.model.userGroupId = selected ? selected.value.toString() : null;
        this.setState(newState);
    };

    handleErrorModalClose = () => {
        this.setState({isErrorPopupShown: false, errorMessage: ""})
    };

    render(): JSX.Element {
        const {
            validation, _countries, request: {create, finish, testConnection}, dialPrefixActive, userGroup, userGroups,
            defaultGateway, model, priceList, popup, sipActive, bNumber, aNumber, callerDialPrefixActive,
            callerCutDigitCountActive, calleeCutDigitCountActive, isErrorPopupShown, errorMessage
        }: ICreateState = this.state;
        const {countries} = this.props;

        const SIPTestConnection: any = (
            <Popover title="Test SIP Connection" id="sip-test-connection">
                <div className="main-content">
                    <p>
                        To test the connection, first make sure your SIP trunk settings are correct,
                        then specify a valid phone number which is accessible for your SIP and click “Call” button.
                        The system will make a test voice call to the specified phone number (B number = To).
                    </p>
                    <p>
                        A number (From): some providers are not accepting incoming SIP calls received with external From numbers.
                        In such cases you can set From number manually. If you are not sure about From number, please consult with your SIP provider.
                    </p>
                    <FormGroup>
                        <ControlLabel htmlFor="bNumber">B number (To)</ControlLabel>
                        <FormControl
                            id="bNumber"
                            name="bNumber"
                            placeholder="B number (To)"
                            value={bNumber}
                            onChange={this.handleCalleeChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel htmlFor="aNumber">A number (From)</ControlLabel>
                        <FormControl
                            id="aNumber"
                            name="aNumber"
                            placeholder="A number (From)"
                            value={aNumber}
                            onChange={this.handleCalleeChange}
                        />
                        <HelpBlock>
                            {
                                testConnection.processing ?
                                    <span><i className="fa fa-spinner fa-spin m-r-xs" aria-hidden="true"/>Calling...</span> :
                                    testConnection.success ?
                                        <span style={{color: "#5cb85c"}}>
                                        <i className="icon-success m-r-xs" aria-hidden="true"/>
                                        The connection with the specified SIP address was successful.</span> :
                                        testConnection.error ?
                                            <span style={{color: "#d9534f"}}>
                                            <i className="icon-fail m-r-xs" aria-hidden="true"/>
                                            The connection with the specified SIP address was not successful.</span> :
                                            <span>&nbsp;</span>
                            }
                        </HelpBlock>
                    </FormGroup>
                </div>
                <div className="text-right b-t block-content">
                    <button
                        disabled={testConnection.processing}
                        className="btn btn-info m-r-xs"
                        onClick={this.handleTestConnection}
                    >Call
                    </button>
                    <button
                        onClick={this.handleTestConnectionClose}
                        className="btn btn-default"
                    >Cancel
                    </button>
                </div>
            </Popover>
        );

        return (

            <div className="box-shadow r-3x bg-white gateways">
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl padder-t-3">{PAGE_NAME["/gateways/create"]}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <hr/>

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-8 col-lg-offset-2 col-md-8 col-md-offset-2 col-sm-12 col-xs-12">
                                <form className="form-horizontal">

                                    {/*Description*/}
                                    <FormGroup validationState={validation.description.value}>
                                        <label htmlFor="description" className="col-lg-3 col-md-3 col-sm-3 col-xs-12 control-label">Description</label>
                                        <div className="col-lg-9 col-md-9 col-sm-9 col-xs-12">
                                            <FormControl
                                                id="description"
                                                name="description"
                                                placeholder="Description"
                                                value={model.description}
                                                onChange={this.handleChange}
                                            />
                                        </div>
                                    </FormGroup>

                                    {/*SIP Address*/}
                                    <FormGroup validationState={validation.host.value}>
                                        <label htmlFor="host" className="col-lg-3 col-md-3 col-sm-3 col-xs-12 control-label">SIP Address</label>
                                        <div className="col-lg-4 col-md-4 col-sm-5 col-xs-12 m-b-sm">
                                            <FormControl
                                                id="host"
                                                name="host"
                                                placeholder="SIP Address"
                                                value={model.host}
                                                onChange={this.handleChange}
                                            />
                                        </div>
                                        <div className="col-lg-5 col-md-5 col-sm-4 col-xs-12 text-right">
                                            <div className="text-right pos-rlt" ref={this.handleTestConnectionRef}>
                                                <Button
                                                    bsStyle="info"
                                                    disabled={model.host === ""}
                                                    onClick={this.handleTestConnectionOpen}
                                                >Test Connection
                                                </Button>
                                                <Overlay
                                                    trigger="click"
                                                    placement="bottom"
                                                    show={testConnection.show}
                                                    container={this.connectionRef}
                                                    onHide={this.handleTestConnectionClose}
                                                >
                                                    {SIPTestConnection}
                                                </Overlay>
                                            </div>
                                        </div>
                                        <div className="col-lg-offset-3 col-lg-9 col-md-offset-3 col-md-9 col-sm-offset-3 col-sm-9 col-xs-12">
                                            <span className="help-block text-muted">
                                                For example, "sip.example.com" or "192.168.0.1". Click the "Test Connection" button to test your connection with your SIP.
                                            </span>

                                        </div>
                                    </FormGroup>

                                    {/*Voip Module Address*/}
                                    <FormGroup validationState={validation.voipModuleAddress.value}>
                                        <label htmlFor="voipModuleAddress" className="col-lg-3 col-md-3 col-sm-3 col-xs-12 control-label">Voip Module Address</label>
                                        <div className="col-lg-9 col-md-9 col-sm-9 col-xs-12">
                                            <FormControl
                                                id="voipModuleAddress"
                                                name="voipModuleAddress"
                                                placeholder="Voip Module Address"
                                                value={model.voipModuleAddress}
                                                onChange={this.handleChange}
                                            />
                                        </div>
                                    </FormGroup>

                                    {/*User groups*/}
                                    <FormGroup>
                                        <label htmlFor="userGroup" className="col-lg-3 col-md-3 col-sm-3 col-xs-12 control-label">User Group</label>
                                        <div className="col-lg-9 col-md-9 col-sm-9 col-xs-12">
                                            <Select
                                                id="userGroup"
                                                name="userGroup"
                                                styles={selectMenuStyles}
                                                isMulti={false}
                                                closeMenuOnSelect={true}
                                                isDisabled={false}
                                                isClearable={true}
                                                onChange={this.handleUserGroupChange}
                                                value={userGroup}
                                                options={userGroups}
                                                placeholder="User Group"
                                            />
                                        </div>
                                    </FormGroup>

                                    {/*Dial Prefix*/}
                                    <FormGroup>
                                        <div className="col-lg-9 col-lg-offset-3 col-md-9 col-md-offset-3 col-sm-offset-3 col-sm-9 col-xs-12">
                                            <Checkbox
                                                inline={true}
                                                onChange={this.handleDialPrefixChange}
                                                checked={dialPrefixActive}
                                            ><span className="font-semi-bold">Use B number Dial Prefix</span>
                                            </Checkbox>
                                        </div>
                                    </FormGroup>
                                    {
                                        dialPrefixActive &&
                                        <FormGroup validationState={validation.dialPrefix.value}>
                                            <div className="col-lg-9 col-lg-offset-3 col-md-9 col-md-offset-3 col-sm-offset-3 col-sm-9 col-xs-12">
                                                <FormControl
                                                    id="dialPrefix"
                                                    name="dialPrefix"
                                                    placeholder="Dial Prefix"
                                                    value={model.dialPrefix}
                                                    onChange={this.handleChange}
                                                />
                                                <span className="help-block text-muted">Example: 1234</span>
                                            </div>
                                        </FormGroup>
                                    }

                                    {/*/!*Callee Cut Digit Count*!/*/}
                                    <FormGroup>
                                        <div className="col-lg-9 col-lg-offset-3 col-md-9 col-md-offset-3 col-sm-offset-3 col-sm-9 col-xs-12">
                                            <Checkbox
                                                inline={true}
                                                onChange={this.handleCalleeCutDigitCountChange}
                                                checked={calleeCutDigitCountActive}
                                            ><span className="font-semi-bold">Use B number Cut Digit Count</span>
                                            </Checkbox>
                                        </div>
                                    </FormGroup>

                                    {
                                        calleeCutDigitCountActive &&
                                        <FormGroup validationState={validation.calleeCutDigitCount.value}>
                                            <div className="col-lg-9 col-lg-offset-3 col-md-9 col-md-offset-3 col-sm-offset-3 col-sm-9 col-xs-12">
                                                <FormControl
                                                    id="calleeCutDigitCount"
                                                    name="calleeCutDigitCount"
                                                    type="number"
                                                    min={1}
                                                    max={7}
                                                    placeholder="B number Cut Digit Count"
                                                    value={model.calleeCutDigitCount}
                                                    onChange={this.handleChange}
                                                />
                                                <span className="help-block text-muted">Example: 3</span>
                                            </div>
                                        </FormGroup>
                                    }
                                    {/*Caller Dial Prefix*/}
                                    <FormGroup>
                                        <div className="col-lg-9 col-lg-offset-3 col-md-9 col-md-offset-3 col-sm-offset-3 col-sm-9 col-xs-12">
                                            <Checkbox
                                                inline={true}
                                                onChange={this.handleCallerDialPrefixChange}
                                                checked={callerDialPrefixActive}
                                            ><span className="font-semi-bold">Use A number Dial Prefix</span>
                                            </Checkbox>
                                        </div>
                                    </FormGroup>
                                    {
                                        callerDialPrefixActive &&
                                        <FormGroup validationState={validation.callerDialPrefix.value}>
                                            <div className="col-lg-9 col-lg-offset-3 col-md-9 col-md-offset-3 col-sm-offset-3 col-sm-9 col-xs-12">
                                                <FormControl
                                                    id="callerDialPrefix"
                                                    name="callerDialPrefix"
                                                    placeholder="A number Dial Prefix"
                                                    value={model.callerDialPrefix}
                                                    onChange={this.handleChange}
                                                />
                                                <span className="help-block text-muted">Example: 1234</span>
                                            </div>
                                        </FormGroup>
                                    }

                                    {/*Caller Cut Digit Count*/}
                                    <FormGroup>
                                        <div className="col-lg-9 col-lg-offset-3 col-md-9 col-md-offset-3 col-sm-offset-3 col-sm-9 col-xs-12">
                                            <Checkbox
                                                inline={true}
                                                onChange={this.handleCallerCutDigitCountChange}
                                                checked={callerCutDigitCountActive}
                                            ><span className="font-semi-bold">Use A number Cut Digit Count</span>
                                            </Checkbox>
                                        </div>
                                    </FormGroup>
                                    {
                                        callerCutDigitCountActive &&
                                        <FormGroup validationState={validation.callerCutDigitCount.value}>
                                            <div className="col-lg-9 col-lg-offset-3 col-md-9 col-md-offset-3 col-sm-offset-3 col-sm-9 col-xs-12">
                                                <FormControl
                                                    id="callerCutDigitCount"
                                                    name="callerCutDigitCount"
                                                    type="number"
                                                    min={1}
                                                    max={7}
                                                    placeholder="A number Cut Digit Count"
                                                    value={model.callerCutDigitCount}
                                                    onChange={this.handleChange}
                                                />
                                                <span className="help-block text-muted">Example: 5</span>
                                            </div>
                                        </FormGroup>
                                    }

                                    {/*SIP username/password*/}
                                    <FormGroup>
                                        <div className="col-lg-9 col-lg-offset-3 col-md-9 col-md-offset-3 col-sm-offset-3 col-sm-12 col-xs-12">
                                            <Checkbox
                                                inline={true}
                                                onChange={this.handleSIPChange}
                                                checked={sipActive}
                                            ><span className="font-semi-bold">Use SIP Username/Password</span>
                                            </Checkbox>
                                        </div>
                                    </FormGroup>
                                    {
                                        sipActive &&
                                        <div>
                                            <FormGroup validationState={validation.username.value}>
                                                <div className="col-lg-9 col-lg-offset-3 col-md-9 col-md-offset-3 col-sm-offset-3 col-sm-9 col-xs-12">
                                                    <FormControl
                                                        name="sipUsername"
                                                        placeholder="SIP Username"
                                                        value={model.username}
                                                        onChange={this.handleSIPUsernameChange}
                                                    />
                                                </div>
                                            </FormGroup>
                                            <FormGroup validationState={validation.password.value}>
                                                <div className="col-lg-9 col-md-9 col-sm-offset-3 col-sm-9 col-xs-12">
                                                    <FormControl
                                                        name="sipPassword"
                                                        type="password"
                                                        placeholder="SIP Password"
                                                        value={model.password}
                                                        disabled={model.username === ""}
                                                        onChange={this.handleSIPPasswordChange}
                                                    />
                                                </div>
                                            </FormGroup>
                                        </div>
                                    }

                                    {/*Default Gateway for All Countries*/}
                                    <FormGroup validationState={validation._countries.value}>
                                        <div className="col-lg-9 col-lg-offset-3 col-md-9 col-md-offset-3 col-sm-offset-3 col-sm-9 col-xs-12">
                                            <Checkbox
                                                inline={true}
                                                onChange={this.handleDefaultGatewayChange}
                                                checked={defaultGateway}
                                            ><span className="font-semi-bold">Gateway for All Countries</span>
                                            </Checkbox>
                                        </div>
                                        {
                                            !defaultGateway &&
                                            <div className="col-lg-9 col-lg-offset-3 col-md-9 col-md-offset-3 col-sm-offset-3 col-sm-9 col-xs-12 m-t-sm">
                                                <Select
                                                    id="countries"
                                                    name="countries"
                                                    styles={multiSelectMenuStyles}
                                                    isMulti={true}
                                                    closeMenuOnSelect={false}
                                                    isDisabled={false}
                                                    onChange={this.handleCountryChange}
                                                    value={_countries}
                                                    options={countries}
                                                    placeholder="Choose Country"
                                                />
                                            </div>
                                        }
                                        <div className="col-lg-9 col-lg-offset-3 col-md-9 col-md-offset-3 col-sm-offset-3 col-sm-9 col-xs-12">
                                            <span className="help-block text-muted">If the checkbox is selected then the gateway will be
                                                terminating for all countries. After deselecting you need to specify those
                                                countries the gateway will be terminating for.
                                            </span>
                                        </div>
                                    </FormGroup>

                                    {/*Active and Main checkboxes block*/}
                                    <FormGroup>
                                        <div className="col-lg-9 col-lg-offset-3 col-md-9 col-md-offset-3 col-sm-offset-3 col-sm-9 col-xs-12">
                                            <Checkbox
                                                inline={true}
                                                onChange={this.handleMainChange}
                                                checked={model.main}
                                            ><span className="font-semi-bold">Main Gateway</span>
                                            </Checkbox>
                                            <span className="help-block text-muted">The prices of this gateway will be the default ones. The prices of all other
                                            gateways will override the prices of the main gateway. Only 1 gateway can be the main, and it will be obligatorily activated.</span>
                                        </div>
                                    </FormGroup>
                                    <FormGroup>
                                        <div className="col-lg-9 col-lg-offset-3 col-md-9 col-md-offset-3 col-sm-offset-3 col-sm-9 col-xs-12">
                                            <Checkbox
                                                inline={true}
                                                onChange={this.handleActiveChange}
                                                checked={model.active}
                                            ><span className="font-semi-bold">Activate This Gateway</span>
                                            </Checkbox>
                                            <span className="help-block text-muted">
                                                If the checkbox is selected then the gateway will be activated right after saving.
                                            </span>
                                        </div>
                                    </FormGroup>

                                    {/*Divider*/}
                                    <div className="b-b m-t m-b">&nbsp;</div>

                                    {/*Price markup*/}
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 no-padder">
                                        <p className="text-lg font-bold">Price markup</p>
                                    </div>
                                    <div className="col-lg-3 col-md-3 col-sm-3 col-xs-12 no-padder">
                                        <p>Formula</p>
                                    </div>
                                    <div className="col-lg-9 col-md-9 col-sm-9 col-xs-12 no-padder">
                                        <p>(Uploaded Price * A ) + B</p>
                                        <div className="col-lg-2 col-md-3 col-sm-12 col-xs-12 m-r-xs">
                                            <FormGroup validationState={validation.param1.value}>
                                                <label htmlFor="param1" className="control-label no-padder">A</label>
                                                <FormControl
                                                    id="param1"
                                                    name="param1"
                                                    pattern="[0-9.]+"
                                                    value={model.param1}
                                                    onChange={this.handlePriceMarkupChange}
                                                />
                                            </FormGroup>
                                        </div>
                                        <div className="col-lg-2 col-md-3 col-sm-12 col-xs-12">
                                            <FormGroup validationState={validation.param2.value}>
                                                <label htmlFor="param2" className="control-label no-padder">B</label>
                                                <FormControl
                                                    id="param2"
                                                    name="param2"
                                                    pattern="[0-9.]+"
                                                    value={model.param2}
                                                    onChange={this.handlePriceMarkupChange}
                                                />
                                            </FormGroup>
                                        </div>
                                        <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 no-padder">
                                            <span className="help-block text-muted">You can add your price markup to all uploaded prices.
                                                Specify the value "1" for Parameter A and "0" for Parameter B if
                                                you don"t want to add any price markup.
                                            </span>
                                        </div>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <hr/>

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            {/*Buttons block*/}
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 text-right">
                                <div className="text-right flex-end">
                                    <button
                                        disabled={create.disabled || create.processing}
                                        onClick={this.handleSIPGatewayCreate}
                                        className="btn btn-info m-r-xs"
                                    >Create{create.processing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                    </button>
                                    <Link to="/gateways">
                                        <button className="btn btn-default">Cancel</button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Modal show={popup.show} onHide={this.handleModalClose}>
                    <Modal.Header closeButton={true}>
                        <span className="text-xlg">Price List</span>
                    </Modal.Header>
                    <Modal.Body>
                        <Form className="wrapper-md">
                            <p className="text-lg font-bold text-center">Gateway is created, now you have to upload price
                                list</p>
                            <p className="text-base text-center">
                                {(priceList.file && priceList.file.size > 0) ?
                                    "Price list is uploaded" :
                                    "Price list is not uploaded"
                                }</p>
                            <FormGroup validationState={validation.file.value} bsClass="text-center">
                                <ControlLabel
                                    htmlFor="priceList"
                                    bsClass="btn btn-default btn-file"
                                >
                                    {(priceList.file && priceList.file.size > 0) ?
                                        priceList.file.name
                                        : "Upload CSV file ..."
                                    }
                                </ControlLabel>
                                <FormControl
                                    type="file"
                                    name="priceList"
                                    onChange={this.handleFileChange}
                                    className="hidden"
                                    id="priceList"
                                    disabled={priceList.processing}
                                    accept=".csv"
                                />
                                <HelpBlock>Please always make sure that the uploaded prices
                                    contain
                                    all the
                                    selected countries. The price list file should have CSV
                                    format.
                                    <a className="text-u-l" href="#"> Download the CSV price
                                        list
                                        template</a>
                                </HelpBlock>
                            </FormGroup>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div className="text-right flex-end">
                                        {finish ?
                                            <Button
                                                className="btn btn-success"
                                                onClick={this.handleModalClose}
                                            >Finish
                                            </Button> :
                                            <Button
                                                className="btn btn-info"
                                                disabled={!priceList.isLoaded || priceList.processing}
                                                onClick={this.handlePriceListUpload}
                                            >Upload price list
                                            </Button>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal>

                <Modal
                    show={isErrorPopupShown}
                    onHide={this.handleErrorModalClose}
                    bsSize="lg"
                ><Modal.Header closeButton={true}>
                    <span className="text-xlg">The connection with the specified SIP address was not successful.</span>
                </Modal.Header>
                    <Modal.Body>
                        {errorMessage}
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Create);
