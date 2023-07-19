"use strict";

import * as React from "react";
import {isEqual} from "lodash";
import Select from "react-select";
import {connect} from "react-redux";
import {AxiosResponse} from "axios";
import {Link} from "react-router-dom";
import {ToastContainer} from "react-toastify";
import Button from "react-bootstrap/es/Button";
import Overlay from "react-bootstrap/es/Overlay";
import Checkbox from "react-bootstrap/es/Checkbox";
import FormGroup from "react-bootstrap/es/FormGroup";
import Popover from "react-bootstrap/es/Popover";
import HelpBlock from "react-bootstrap/es/HelpBlock";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {getGateway, editGateway, cacheCallPrice, uploadPriceList, settingsConnection} from "ajaxRequests/gateways";
import {ISelect, IVALIDATION} from "services/interface";
import selector, {IStoreProps} from "services/selector";
import {gatewayValidation, isNumeric, validateNumber} from "helpers/DataHelper";
import {selectMenuStyles, showNotification} from "helpers/PageHelper";
import {downloadFile} from "helpers/DomHelper";
import {PAGE_NAME} from "configs/constants";
import Loading from "components/Common/Loading";
import {getUserGroups} from "ajaxRequests/users";
import axios from "helpers/Axios";
import Modal from "react-bootstrap/es/Modal";
import Table from "react-bootstrap/es/Table";

interface IUpdateState {
    disabled: boolean,
    request: {
        update: {
            processing: boolean
        },
        testConnection: {
            processing: boolean,
            success: boolean,
            error: boolean,
            show: boolean
        }
    },
    validation: any,
    // optionalValidation: {
    //     callee: IVALIDATION
    // },
    _countries: any[],
    gatewayCountries: any[],
    initialCountries: any[],
    loading: boolean,
    dialPrefixActive: boolean,
    callerDialPrefixActive: boolean,
    callerCutDigitCountActive: boolean,
    calleeCutDigitCountActive: boolean,
    sipActive: boolean,
    defaultGateway: boolean,
    model: {
        description: string,
        host: string,
        voipModuleAddress: string,
        dialPrefix: string,
        username: string,
        password: string,
        param1: string,
        param2: string,
        active: boolean,
        main: boolean,
        file: string,
        userGroupId: string,
        callerDialPrefix: string,
        callerCutDigitCount: any,
        calleeCutDigitCount: any,
    };
    priceList: {
        file: File,
        url: string,
        loading: boolean,
    },
    gatewayId: string,
    isConnectionSuccess: boolean,
    bNumber: string,
    aNumber: string
    // isValidCallee: boolean,
    userGroups: any[];
    userGroup: any;
    isErrorPopupShown: boolean;
    errorMessage: string;
}

interface IUpdateProps extends IStoreProps {
    history: any,
    location: any,
    match: any,
}

class Update extends React.Component<IUpdateProps, IUpdateState> {

    componentState: boolean = true;

    connectionRef: any = null;

    constructor(props: IUpdateProps) {
        super(props);
        const {match} = this.props;
        const gatewayId: string = match.params.id || null;
        this.state = {
            _countries: [],
            gatewayCountries: [],
            initialCountries: [],
            request: {
                update: {
                    processing: false
                },
                testConnection: {
                    processing: false,
                    success: false,
                    error: false,
                    show: false,
                }
            },
            disabled: true,
            loading: true,
            dialPrefixActive: false,
            callerDialPrefixActive: false,
            callerCutDigitCountActive: false,
            calleeCutDigitCountActive: false,
            sipActive: false,
            defaultGateway: false,
            model: {
                description: "",
                host: "",
                voipModuleAddress: "",
                dialPrefix: "",
                username: "",
                password: "",
                param1: "",
                param2: "",
                active: false,
                main: false,
                file: "",
                userGroupId: "",
                callerDialPrefix: "",
                callerCutDigitCount: "",
                calleeCutDigitCount: "",
            },
            validation: gatewayValidation(),
            // optionalValidation: {
            //     callee: {
            //         value: null,
            //         message: ""
            //     }
            // },
            priceList: {
                file: null,
                url: "",
                loading: true,
            },
            gatewayId,
            isConnectionSuccess: true,
            bNumber: "",
            aNumber: "",
            // isValidCallee: false,
            userGroups: [],
            userGroup: null,
            errorMessage: "",
            isErrorPopupShown: false
        }
    }

    componentDidMount(): void {
        document.title = PAGE_NAME["/gateways/update"];

        const {history, countries} = this.props;
        const {gatewayId} = this.state;
        if (!gatewayId) {
            history.push("/gateways");
        }
        const newState: IUpdateState = {...this.state};
        axios.all([
            getUserGroups(0, 1000),
            getGateway(gatewayId)
        ]).then(axios.spread((userGroups, gateway) => {

            if (userGroups.data.err) {
                throw new Error(JSON.stringify(userGroups.data));
            }

            newState.userGroups = userGroups.data.result.map(item => {
                return {
                    value: item.userGroupId,
                    label: item.name
                }
            }) || [];

            if (gateway.data.err) {
                throw new Error(JSON.stringify(gateway.data));
            }

            const result: any = gateway.data.result;
            const gatewayCountries: string[] = result.countries.split(";");

            newState.gatewayCountries = gatewayCountries;
            newState._countries = countries.filter(item => gatewayCountries.includes(item.region_code));
            newState.model.description = result.description;
            newState.model.host = result.host;
            newState.model.voipModuleAddress = result.voipModuleAddress || "";
            newState.model.username = result.username ? result.username : "";
            newState.model.password = result.password ? result.password : "";
            newState.sipActive = !!result.password && !!result.username;
            newState.model.param1 = result.param1;
            newState.model.param2 = result.param2;
            newState.model.active = result.active;
            newState.model.main = result.main;
            newState.model.file = result.file;
            newState.model.userGroupId = result.reseller || "";

            newState.model.dialPrefix = result.dialPrefix && result.dialPrefix !== "0" ? result.dialPrefix : "";
            newState.dialPrefixActive = !!newState.model.dialPrefix;

            newState.model.calleeCutDigitCount = result.calleeCutDigitCount || "";
            newState.calleeCutDigitCountActive = !!newState.model.calleeCutDigitCount;

            newState.model.callerCutDigitCount = result.callerCutDigitCount || "";
            newState.callerCutDigitCountActive = !!newState.model.callerCutDigitCount;

            newState.model.callerDialPrefix = result.callerDialPrefix && result.callerDialPrefix !== "0" ? result.callerDialPrefix : "";
            newState.callerDialPrefixActive = !!newState.model.callerDialPrefix;

            newState.defaultGateway = (newState._countries.length === countries.length);
            newState.loading = false;

            if (this.componentState) {
                this.setState(newState);
            }

        })).catch(err => {
            console.log(err);
            newState.loading = false;

            if (this.componentState) {
                this.setState(newState);
            }
            showNotification("error", {
                title: "You got an error!",
                description: "Can not get SIP Thrunk info",
                timer: 3000
            });
        });
    }

    componentDidUpdate(prevProps: IUpdateProps, prevState: IUpdateState): void {
        const {countries} = this.props;
        const {gatewayCountries, model, userGroups, userGroup} = this.state;

        if (!isEqual(prevProps.countries, countries)) {
            const newState: IUpdateState = {...this.state};
            newState._countries = countries.filter(item => gatewayCountries.includes(item.region_code));
            newState.defaultGateway = (!!gatewayCountries && gatewayCountries.length === countries.length);
            this.setState(newState);
        }

        if (model.userGroupId !== "" && !isEqual(prevState.userGroup, userGroup)) {
            const newState: IUpdateState = {...this.state};
            newState.userGroup = userGroups.find(item => item.value.toString() === model.userGroupId.toString());
            this.setState(newState);
        }

    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IUpdateState = {...this.state};
        newState.model[name] = value;
        newState.validation[name].value = value === "" ? "error" : "success";
        if (name === "host" && newState.isConnectionSuccess) {
            newState.isConnectionSuccess = false;
        }
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handlePriceMarkupChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IUpdateState = {...this.state};
        const priceMarkup: number = +value;
        newState.model[name] = value;
        newState.validation[name].value = priceMarkup < 0 ? "error" : "success";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleCountryChange = (value: ISelect) => {
        const newState: any = {...this.state};
        newState._countries = value;
        newState.validation._countries.value = newState._countries.length > 0 ? "success" : "error";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleDialPrefixChange = ({currentTarget: {checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IUpdateState = {...this.state};
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
        const newState: IUpdateState = {...this.state};
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
        const newState: IUpdateState = {...this.state};
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
        const newState: IUpdateState = {...this.state};
        newState.calleeCutDigitCountActive = checked;
        newState.validation.calleeCutDigitCount = {
            value: null,
            message: ""
        };
        newState.model.calleeCutDigitCount = "";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleDefaultGatewayChange = ({currentTarget: {name, checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IUpdateState = {...this.state};
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

    handleToggleDisabled = (state: any): void => {
        state.disabled = !((state._countries.length > 0) && state.model.description &&
            state.model.host && (state.sipActive ? (state.model.username !== "" &&
                state.model.password !== "") : true) &&
            state.model.param1 >= 1 && state.model.param2 >= 0);
        // Todo add state.isConnectionSuccess for full valdate gateway
    };

    handleActiveChange = ({currentTarget: {checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const {model: {main}} = this.state;
        const newState: IUpdateState = {...this.state};
        newState.model.active = checked;
        if (main) {
            newState.model.main = checked;
        }
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleMainChange = ({currentTarget: {checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const {model: {active}} = this.state;
        const newState: IUpdateState = {...this.state};
        newState.model.main = checked;
        if (!active && checked) {
            newState.model.active = true;
        }
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleSIPChange = ({currentTarget: {checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IUpdateState = {...this.state};
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
        const newState: IUpdateState = {...this.state};
        newState.model.username = value;
        if (value === "") {
            newState.model.password = "";
            newState.validation.password.value = null;
            newState.validation.password.message = "";
        }

        newState.validation.username.value = value === "" ? "error" : "success";
        newState.validation.username.message = value === "" ? "Must be not empty" : "";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleSIPPasswordChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>): any => {
        const {model} = this.state;
        if (model.username === "") {
            return;
        }
        const newState: IUpdateState = {...this.state};
        newState.model.password = value;
        newState.validation.password.value = value === "" ? "error" : "success";
        newState.validation.password.message = value === "" ? "Must be not empty" : "";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleDownloadPriceList = (event: React.MouseEvent<HTMLAnchorElement>): void => {
        event.preventDefault();

        const name: string = event.currentTarget.getAttribute("data-name");
        const fileUrl: string = event.currentTarget.href;
        if (fileUrl) {
            downloadFile(name ? name : "price_list", fileUrl);
        }
    };

    handleFileChange = ({currentTarget: {name, files}}: React.ChangeEvent<HTMLInputElement>): void => {
        if (files && files.length > 0) {
            const newState: IUpdateState = {...this.state};
            newState.priceList.file = files[0];
            newState.priceList.loading = false;
            this.setState(newState);
        }
    };

    handleCallPriceUpload = async (event: React.MouseEvent<HTMLButtonElement>): Promise<any> => {
        event.preventDefault();
        const {priceList} = this.state;
        const {match} = this.props;
        const id: number = parseInt(match.params.id);
        const newState: IUpdateState = {...this.state};

        if (priceList.file && priceList.file.size > 0) {
            const formData: any = new FormData();

            const uploadToastId: number = showNotification("info", {
                title: "Processing...",
                description: "",
            });

            formData.append("pricelist", priceList.file);
            newState.request.update.processing = true;
            newState.priceList.loading = true;

            this.setState(newState);

            const uploadPriceListResponse: any = await uploadPriceList(id, formData);

            if (!uploadPriceListResponse.data.err) {
                showNotification("success", {
                    title: "Success!",
                    description: "Price list was updated",
                    id: uploadToastId
                });

                const cachingToastId: number = showNotification("info", {
                    title: "Caching...",
                    description: "",
                });

                const cachingResponse: any = await cacheCallPrice(id, {virtualNetworkId: ""});

                if (!cachingResponse.data.err) {
                    showNotification("success", {
                        title: "Success!",
                        description: "Caching completed",
                        id: cachingToastId
                    });
                } else {
                    showNotification("error", {
                        title: "You got an error!",
                        description: "Caching is not completed for unknown reason",
                        id: cachingToastId
                    });
                }

            } else {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Price list is not uploaded for unknown reason",
                    id: uploadToastId
                });
            }
            newState.request.update.processing = false;
            if (priceList.file && priceList.file.size > 0) {
                newState.priceList.loading = false;
            }
            if (this.componentState) {
                this.setState(newState);
            }
        }
    };

    handleTestConnectionOpen = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const newState: IUpdateState = {...this.state};
        newState.request.testConnection.show = !newState.request.testConnection.show;
        this.setState(newState);
    };

    handleTestConnectionClose = (e: any): void => {
        e.preventDefault();
        const {request: {testConnection}} = this.state;
        const newState: IUpdateState = {...this.state};
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

        // newState.optionalValidation.bNumber = {
        //     value: null,
        //     message: ""
        // };
        // newState.isValidCallee = false;
        this.setState(newState);
    };

    handleTestConnectionRef = (ref: any): void => {
        this.connectionRef = ref;
    };

    handleCalleeChange = ({currentTarget: {value, name}}: React.ChangeEvent<HTMLInputElement>): void => {
        const {request: {testConnection: {success, error}}} = this.state;
        const newState: IUpdateState = {...this.state};

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

    handelSIPUpdate = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        const {model, _countries, validation, gatewayId} = this.state;
        const regionCodes: string[] = _countries.map(item => item.region_code);
        const data: any = {
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
            callerCutDigitCount: model.callerCutDigitCount,
            calleeCutDigitCount: model.calleeCutDigitCount,
        };
        const newState: IUpdateState = {...this.state};

        newState.request.update.processing = true;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        this.componentState = true;

        editGateway(gatewayId, data).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            for (const item in validation) {
                if (validation.hasOwnProperty(item)) {
                    newState.validation[item] = {
                        value: null,
                        message: ""
                    }
                }
            }
            newState.request.update.processing = false;
            newState.disabled = true;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "Gateway was updated",
                    id: toastId
                });
            }
        }).catch(err => {
            console.log(err);
            newState.request.update.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Gateway is not updated",
                    id: toastId
                });
            }
        })
    };

    handleCallPriceCache = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        const {match} = this.props;
        const {priceList} = this.state;
        const id: number = parseInt(match.params.id);
        const newState: IUpdateState = {...this.state};
        const toastId: number = showNotification("info", {
            title: "Caching...",
            description: "",
        });

        newState.request.update.processing = true;
        newState.priceList.loading = true;
        this.setState(newState);

        cacheCallPrice(id, {virtualNetworkId: ""}).then(response => {

            if (!response.data.err) {
                showNotification("success", {
                    title: "Success!",
                    description: "Caching completed",
                    id: toastId
                });
            } else {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Caching is not completed for unknown reason",
                    id: toastId
                });
            }
            newState.request.update.processing = false;
            if (priceList.file && priceList.file.size > 0) {
                newState.priceList.loading = false;
            }
            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(err => console.log(err));

    };

    handleTestConnection = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {model, bNumber, aNumber} = this.state;
        const newState: IUpdateState = {...this.state};
        newState.request.testConnection.processing = true;
        this.setState(newState);

        const testingData: any = {
            host: model.host,
            username: model.username || "",
            password: model.password || "",
            dialPrefix: model.dialPrefix,
            callee: bNumber,
            caller: aNumber,
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
                    newState.isConnectionSuccess = false;
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

    handleUserGroupChange = (selected: any) => {
        const newState: IUpdateState = {...this.state};
        newState.userGroup = selected;
        newState.model.userGroupId = selected ? selected.value.toString() : "";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleErrorModalClose = () => {
        this.setState({isErrorPopupShown: false, errorMessage: ""})
    };

    render(): JSX.Element {
        const {
            model, validation, request: {update, testConnection}, disabled, _countries, userGroup, userGroups,
            dialPrefixActive, defaultGateway, loading, priceList, sipActive, bNumber, aNumber,
            callerDialPrefixActive, callerCutDigitCountActive, calleeCutDigitCountActive, isErrorPopupShown, errorMessage
        } = this.state;
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
                                <span className="text-xsl padder-t-3">{PAGE_NAME["/gateways/update"]}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {!loading && <hr/>}

                {loading ? <Loading/>
                    : <div className="content-wrapper">
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
                                            <div className="col-lg-5 col-md-5 col-sm-4 col-xs-12">
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

                                        {/*Callee Cut Digit Count*/}
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
                                                    checked={sipActive}
                                                    onChange={this.handleSIPChange}
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
                                                            disabled={model.username === ""}
                                                            value={model.password}
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
                                                    checked={defaultGateway}
                                                    onChange={this.handleDefaultGatewayChange}
                                                ><span className="font-semi-bold">Gateway for All Countries</span>
                                                </Checkbox>
                                            </div>
                                            {
                                                !defaultGateway &&
                                                <div className="col-lg-9 col-lg-offset-3 col-md-9 col-md-offset-3 col-sm-offset-3 col-sm-9 col-xs-12 m-t-sm">
                                                    <Select
                                                        isMulti={true}
                                                        id="countries"
                                                        closeMenuOnSelect={false}
                                                        isDisabled={false}
                                                        name="countries"
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
                                                    <label htmlFor="param1" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label no-padder">A</label>
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
                                                    <label htmlFor="param2" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label no-padder">B</label>
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

                                        {/*Divider*/}
                                        <div className="b-b m-t m-b">&nbsp;</div>

                                        {/*Pricing*/}
                                        <div className="col-lg-3 col-md-3 col-sm-3 col-xs-12 no-padder">
                                            <p className="text-lg font-bold">Pricing</p>
                                        </div>
                                        <div className="col-lg-9 col-md-9 col-sm-9 col-xs-12 no-padder">
                                            <p>Price list is uploaded (
                                                <a
                                                    className="text-u-l"
                                                    href={model.file}
                                                    data-name="price_list"
                                                    onClick={this.handleDownloadPriceList}
                                                    style={{color: "#3399ff"}}
                                                >Download
                                                </a> the uploaded price list )
                                            </p>
                                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                                <FormGroup validationState={validation.file.value}>
                                                    <label htmlFor="priceList" className="control-label btn btn-default btn-file">
                                                        {(priceList.file && priceList.file.size > 0) ?
                                                            priceList.file.name.length > 15 ? `${priceList.file.name.substr(0, 15)}...` : priceList.file.name
                                                            : "Upload CSV file ..."
                                                        }
                                                    </label>
                                                    <FormControl
                                                        type="file"
                                                        accept=".csv"
                                                        id="priceList"
                                                        name="priceList"
                                                        className="hidden"
                                                        disabled={update.processing}
                                                        onChange={this.handleFileChange}
                                                    />
                                                    {
                                                        priceList.file && priceList.file.size > 0 &&
                                                        <Button
                                                            disabled={priceList.loading}
                                                            onClick={this.handleCallPriceUpload}
                                                            className="btn btn-info m-l-xs"
                                                        >Update Price List
                                                        </Button>
                                                    }

                                                </FormGroup>
                                            </div>
                                            <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 no-padder hidden">
                                                {
                                                    priceList.file && priceList.file.size > 0 &&
                                                    <Button
                                                        disabled={priceList.loading}
                                                        onClick={this.handleCallPriceUpload}
                                                        className="btn btn-info m-b-xs"
                                                    >Update Price List
                                                    </Button>
                                                }
                                            </div>

                                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 no-padder">
                                                <span className="help-block text-muted">
                                                    Please always make sure that the uploaded prices contain all the selected countries.
                                                    The price list file should have CSV format.
                                                    {/*<a*/}
                                                    {/*    className="text-u-l"*/}
                                                    {/*    href={priceList.url}*/}
                                                    {/*    data-name="price_list_template"*/}
                                                    {/*    onClick={this.handleDownloadPriceList}*/}
                                                    {/*>Download the CSV price list template*/}
                                                    {/*</a>*/}
                                                </span>
                                            </div>

                                        </div>

                                    </form>

                                </div>
                            </div>
                        </div>
                    </div>}

                {!loading && <hr/>}

                <div className="content-wrapper">
                    <div className="container-fluid">
                        {
                            !loading &&
                            <div className="row">
                                {/*Buttons block*/}
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 text-right">
                                    <div className="text-right flex-end">
                                        <button
                                            className="btn btn-info m-r-xs"
                                            disabled={disabled || update.processing}
                                            onClick={this.handelSIPUpdate}
                                        >Save
                                        </button>
                                        <Link to="/gateways">
                                            <button
                                                type="submit"
                                                className="btn btn-default m-r-xs"
                                            >Cancel
                                            </button>
                                        </Link>
                                        <Button
                                            disabled={update.processing}
                                            onClick={this.handleCallPriceCache}
                                        >Cache call price
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>

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

export default connect(mapStateToProps, mapDispatchToProps)(Update);
