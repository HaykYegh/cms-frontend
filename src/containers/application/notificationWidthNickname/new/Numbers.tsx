"use strict";

import * as React from "react";
import Select, {Creatable} from "react-select";
import Modal from "react-bootstrap/es/Modal";
import FormGroup from "react-bootstrap/es/FormGroup";
import HelpBlock from "react-bootstrap/es/HelpBlock";
import FormControl from "react-bootstrap/es/FormControl";
import {AxiosResponse} from "axios";
import Table from "react-bootstrap/es/Table";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {validateNumber, isNumeric, createOption, testableNumbersValidate, promiseSelectOptions} from "helpers/DataHelper";
import {notificationSendUsers} from "ajaxRequests/notification";
import {ISelect, IVALIDATION} from "services/interface";
import {multiSelectMenuStyles, selectMenuStyles, showNotification} from "helpers/PageHelper";
import AsyncSelect from "react-select/lib/Async";
import {getSearchedUsersByEmailOrNickname} from "ajaxRequests/users";
import selector from "services/selector";
import {connect} from "react-redux";

interface INumbersState {
    phone: {
        fromNumbers: any,
    },
    emails: {
        emailsList: any,
    }
    notification: {
        message: string,
        title: string,
    },
    request: {
        inProgress: boolean,
    },
    validation: {
        fromNumbers: IVALIDATION,
        emails: IVALIDATION,
    },
    finallyResult: any[],
    popup: {
        show: boolean
    },
    selectedSender: any,
    initialFilters: any,
    dataUsers: any[]
}

interface INumbersProps {
    senders: any[],
    userProfile: any,
}

class Numbers extends React.Component<INumbersProps, INumbersState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            phone: {
                fromNumbers: {
                    inputValue: "",
                    value: []
                },
            },
            emails: {
                emailsList: {
                    inputValue: "",
                    value: []
                }
            },
            notification: {
                message: "",
                title: "",
            },
            request: {
                inProgress: false,
            },
            validation: {
                fromNumbers: {
                    value: null,
                    message: "",
                },
                emails: {
                    value: null,
                    message: "",
                }
            },
            finallyResult: [],
            popup: {
                show: false
            },

            selectedSender: null,
            initialFilters: {
                username: {
                    selected: [],
                    options: [],
                }
            },
            dataUsers: [],
        }
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleFromNumberInputChange = (inputValue: string): any => {
        const newState: any = {...this.state};
        const {phone: {fromNumbers: {value}}} = this.state;
        let valueForValidate: string = inputValue;
        if (isNumeric(valueForValidate) && valueForValidate.substr(0, 1) !== "+") {
            valueForValidate = "+" + valueForValidate.toString();
        }
        const {isValid} = validateNumber(valueForValidate);
        if (!isValid) {
            if (valueForValidate !== "") {
                newState.validation.fromNumbers.value = "error";
                newState.validation.fromNumbers.message = "Invalid email number";
            }
            // Handle fake number set to success number
            const isTestableNumber: any = testableNumbersValidate(valueForValidate);

            if (isTestableNumber) {
                newState.validation.fromNumbers.value = "success";
                newState.validation.fromNumbers.message = "Valid number";
            }
        } else if (value.some(item => item.value === valueForValidate)) {
            newState.validation.fromNumbers.value = "warning";
            newState.validation.fromNumbers.message = "Phone number is existing";
        } else {
            newState.validation.fromNumbers.value = "success";
            newState.validation.fromNumbers.message = "Valid number";
        }
        newState.phone.fromNumbers.inputValue = valueForValidate;
        this.setState(newState);
    };
    handleEmailInputChange = (inputValue: string): any => {
        const newState: any = {...this.state};
        const {emails: {emailsList: {value}}} = this.state;
        let valueForValidate: string = inputValue;

        if (isNumeric(valueForValidate) && valueForValidate.substr(0, 1) !== "+") {
            valueForValidate = "+" + valueForValidate.toString();
        }

        const pattern: any = new RegExp(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        const isValidEmail: boolean = pattern.test(valueForValidate);

        if (!isValidEmail) {
            if (valueForValidate !== "") {
                newState.validation.emails.value = "error";
                newState.validation.emails.message = "Invalid email number";
            }
        } else if (value.some(item => item.value === valueForValidate)) {
            newState.validation.emails.value = "warning";
            newState.validation.emails.message = "Phone number is existing";
        } else {
                newState.validation.emails.value = "success";
                newState.validation.emails.message = "Valid email";
        }
        newState.emails.emailsList.inputValue = valueForValidate;
        this.setState(newState);
    };

    handleFromNumbersChange = (value: Array<ISelect>) => {
        const newState: any = {...this.state};
        newState.phone.fromNumbers.value = value ? value : [];
        this.setState(newState);
    };
    handleEmailsChange = (value: Array<ISelect>) => {
        const newState: any = {...this.state};
        newState.emails.emailsList.value = value ? value : [];
        this.setState(newState);
    };

    handleFromNumberKeyDown = (event: React.KeyboardEvent<HTMLElement>): any => {
        const {phone: {fromNumbers: {inputValue, value}}, validation} = this.state;
        if (!inputValue) {
            return;
        }
        if (validation.fromNumbers.value === "success") {
            const newState: INumbersState = {...this.state};
            switch (event.key) {
                case "Enter":
                case "Tab":
                    newState.phone.fromNumbers.inputValue = "";
                    newState.phone.fromNumbers.value = [...value, createOption(inputValue)];
                    newState.validation.fromNumbers.value = null;
                    newState.validation.fromNumbers.message = "";
                    this.setState(newState);
                    event.preventDefault();
            }
        }
    };
    handleEmailKeyDown = (event: React.KeyboardEvent<HTMLElement>): any => {
        const {emails: {emailsList: {inputValue, value}}, validation} = this.state;
        if (!inputValue) {
            return;
        }
        if (validation.emails.value === "success") {
            const newState: INumbersState = {...this.state};
            switch (event.key) {
                case "Enter":
                case "Tab":
                    newState.emails.emailsList.inputValue = "";
                    newState.emails.emailsList.value = [...value, createOption(inputValue)];
                    newState.validation.emails.value = null;
                    newState.validation.emails.message = "";
                    this.setState(newState);
                    event.preventDefault();
            }
        }
    };

    handleFromNumberOnBlur = (event: React.FocusEvent<HTMLElement>): any => {
        event.preventDefault();
        const {validation} = this.state;
        const newState: INumbersState = {...this.state};
        if (validation.fromNumbers.value === "success") {
            const {phone: {fromNumbers: {inputValue, value}}} = this.state;
            newState.phone.fromNumbers.inputValue = "";
            newState.phone.fromNumbers.value = [...value, createOption(inputValue)];
        }
        newState.validation.fromNumbers.value = null;
        newState.validation.fromNumbers.message = "";
        this.setState(newState);

    };

    handleMessageChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: INumbersState = {...this.state};
        newState.notification.message = value;
        this.setState(newState);
    };

    handleNotify = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
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
        const newState: INumbersState = this.state;
        const {
            notification: {message},
            phone: {fromNumbers},
            emails: {emailsList},
            validation,
            selectedSender,
            initialFilters: {username: { selected }}
        } = this.state;

        newState.request.inProgress = true;
        this.setState(newState);

        const numbers: string[] = selected.map(item => item.value.replace("+", ""));
        const emails: string[] =  emailsList.value.map(item => item.value);
        const senderId: number = selectedSender && selectedSender.value;

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        notificationSendUsers({message, numbers, emails, senderId}).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            if (data.result.affectedUsers && data.result.affectedUsers.length > 0) {
                const affectedUsers: string[] = data.result.affectedUsers.map(item => item.email !== null ? item.email : item.username.replace(process.env.APP_PREFIX, ""));
                newState.popup.show = true;
                newState.dataUsers = data.result.affectedUsers;
                for (const item of selected) {
                    item.isNotify = affectedUsers.includes(item.value);
                    newState.finallyResult.push(item)
                }
                for (const item of emailsList.value) {
                    item.isNotify = affectedUsers.includes(item.value);
                    newState.finallyResult.push(item)
                }
            }
            newState.phone.fromNumbers = {
                inputValue: "",
                value: []
            };
            newState.emails.emailsList = {
              inputValue: "",
              value: []
            };
            newState.notification = {
                message: "",
                title: "",
            };
            newState.selectedSender = null;
            for (const item in validation) {
                if (validation.hasOwnProperty(item)) {
                    newState.validation[item] = {
                        value: null,
                        message: "",
                    };
                }
            }
            newState.request.inProgress = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Your notification has been sent successfully",
                    description: "Note that if you have specified some users who don’t belong to your network, the notification hasn’t been sent to those users.",
                    id: toastId
                });
            }
        }).catch(err => {
            console.log(err);
            newState.request.inProgress = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "Your notification will not be sent",
                    description: "The specified users don’t belong to your network. You can send notifications only to the users who joined your network.",
                    id: toastId
                });
            }
        });
    };

    handleModalClose = (): void => {
        const newState: INumbersState = this.state;
        newState.finallyResult = [];
        newState.popup.show = false;
        this.setState(newState);
    };

    handleSenderChange = (selectedSender: any): void => {
        this.setState({selectedSender});
    };

    handleFindUsers: any = async (value: string) => {
        const newState: INumbersState = {...this.state};
        const response: any = await getSearchedUsersByEmailOrNickname(value);
        if (response.data.err) {
            return [];
        }

        const result: any[] = response.data.result
          .map(username => {
              return {
                  value: username.number,
                  label: username.nickname
              }
          });

        newState.initialFilters.username.options = result;
        if (this.componentState) {
            this.setState(newState);
        }

        return result;
    };

    handleUsernameChange = (value: any) => {
        const newState: INumbersState = {...this.state};
        newState.initialFilters.username.selected = value;
        this.setState(newState);
    }

    render(): JSX.Element {
        const {
            phone: {fromNumbers}, notification: {message}, selectedSender,
            emails: {emailsList},
            request: {inProgress}, validation, finallyResult, popup, initialFilters, dataUsers
        } = this.state;
        const {senders} = this.props;
        const isReady: boolean = (message !== "" && initialFilters.username.selected.length !== 0  && selectedSender !== null);
        return (
            <div className="container-fluid no-padder">
                <div className="row">

                    {/*Phone Numbers*/}
                    {/*<div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">*/}
                    {/*    <FormGroup validationState={validation.fromNumbers.value}>*/}
                    {/*        <ControlLabel>Phone numbers</ControlLabel>*/}
                    {/*        <Creatable*/}
                    {/*            components={{ DropdownIndicator: null, IndicatorSeparator: null }}*/}
                    {/*            isClearable={true}*/}
                    {/*            isMulti={true}*/}
                    {/*            menuIsOpen={false}*/}
                    {/*            inputValue={fromNumbers.inputValue}*/}
                    {/*            value={fromNumbers.value}*/}
                    {/*            placeholder="Enter phone number"*/}
                    {/*            styles={multiSelectMenuStyles}*/}
                    {/*            onChange={this.handleFromNumbersChange}*/}
                    {/*            onInputChange={this.handleFromNumberInputChange}*/}
                    {/*            onKeyDown={this.handleFromNumberKeyDown}*/}
                    {/*            // onBlur={this.handleFromNumberOnBlur}*/}
                    {/*        />*/}
                    {/*        <HelpBlock>{validation.fromNumbers.message}</HelpBlock>*/}
                    {/*    </FormGroup>*/}
                    {/*</div>*/}
                    {/*<div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">*/}
                    {/*    <FormGroup validationState={validation.emails.value}>*/}
                    {/*        <ControlLabel>Emails</ControlLabel>*/}
                    {/*        <Creatable*/}
                    {/*            components={{ DropdownIndicator: null, IndicatorSeparator: null}}*/}
                    {/*            isClearable={true}*/}
                    {/*            isMulti={true}*/}
                    {/*            menuIsOpen={false}*/}
                    {/*            inputValue={emailsList.inputValue}*/}
                    {/*            value={emailsList.value}*/}
                    {/*            placeholder="Enter Email"*/}
                    {/*            styles={multiSelectMenuStyles}*/}
                    {/*            onChange={this.handleEmailsChange}*/}
                    {/*            onInputChange={this.handleEmailInputChange}*/}
                    {/*            onKeyDown={this.handleEmailKeyDown}*/}
                    {/*            // onBlur={this.handleFromNumberOnBlur}*/}
                    {/*        />*/}
                    {/*        <HelpBlock>{validation.emails.message}</HelpBlock>*/}
                    {/*    </FormGroup>*/}
                    {/*</div>*/}

                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                        <FormGroup>
                            <ControlLabel htmlFor="user">Usernames</ControlLabel>
                            <AsyncSelect
                              inputId="user-name"
                              name="user-name"
                              placeholder="Search by username or email"
                              cacheOptions={true}
                              isClearable={true}
                              autoFocus={true}
                              isMulti={true}
                              value={initialFilters.username.selected}
                              styles={selectMenuStyles}
                              defaultOptions={initialFilters.username.options}
                              loadOptions={promiseSelectOptions(this.handleFindUsers)}
                              onChange={this.handleUsernameChange}
                            />
                        </FormGroup>
                    </div>

                    {/*Senders*/}
                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                        <FormGroup>
                            <ControlLabel htmlFor="sender">Senders</ControlLabel>
                            <Select
                                inputId="sender"
                                name="sender"
                                placeholder={"Select sender"}
                                isClearable={true}
                                styles={multiSelectMenuStyles}
                                closeMenuOnSelect={true}
                                value={selectedSender}
                                options={senders}
                                onChange={this.handleSenderChange}
                            />
                        </FormGroup>
                    </div>

                    {/*Title*/}
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <FormGroup bsClass="hidden">
                            <ControlLabel htmlFor="title">Title</ControlLabel>
                            <FormControl
                                id="title"
                                type="text"
                                name="title"
                                className="hidden"
                                placeholder="Title"
                                onChange={this.handleMessageChange}
                            />
                        </FormGroup>
                    </div>

                    {/*Message*/}
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <FormGroup>
                            <ControlLabel htmlFor="message">Message</ControlLabel>
                            <FormControl
                                rows={5}
                                id="message"
                                componentClass="textarea"
                                placeholder="Message"
                                value={message}
                                onChange={this.handleMessageChange}
                            />
                        </FormGroup>
                    </div>

                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <button
                            disabled={!isReady}
                            className="btn btn-info"
                            onClick={this.handleNotify}
                        >{inProgress ? "Processing..." : "Send"}
                        </button>
                    </div>
                </div>

                <Modal show={popup.show} onHide={this.handleModalClose}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>Notify result</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table
                            hover={true}
                            condensed={true}
                            responsive={true}
                        >
                            <thead>
                            <tr>
                                <th/>
                                <th>Username</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>

                            {finallyResult.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{dataUsers[index].nickname}</td>
                                        <td>
                                            <i className={`fa ${item.isNotify ? "fa-check" : "fa-times"}`} style={{color: item.isNotify ? "green" : "red"}}/>
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </Table>
                    </Modal.Body>
                </Modal>
            </div>

        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Numbers);
