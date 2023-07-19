"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import {Creatable} from "react-select";
import {ToastContainer} from "react-toastify";
import HelpBlock from "react-bootstrap/es/HelpBlock";
import FormGroup from "react-bootstrap/es/FormGroup";
import ControlLabel from "react-bootstrap/es/ControlLabel";
import {createOption, isNumeric, validateNumber, testableNumbersValidate, promiseSelectOptions} from "helpers/DataHelper";
import {addChannelInvities} from "ajaxRequests/channel"
import {multiSelectMenuStyles, showNotification} from "helpers/PageHelper";
import {ISelect, IVALIDATION} from "services/interface";
import AsyncSelect from "react-select/lib/Async";
import {getSearchedUsersForInvite} from "ajaxRequests/users";

interface IInviteesState {
    loading: boolean,
    offset: number,
    limit: number,
    channelInvites: any[],
    invite: any,
    validation: {
        fromNumbers: IVALIDATION
    },
    request: {
        add: {
            processing: boolean,
            disabled: boolean
        },
        remove: {
            processing: boolean,
        },
        pagination: boolean
    },
    initialFilters: any,
    options: any
}

interface IInviteesProps {
    channelId: any
}

class Invitees extends React.Component<IInviteesProps, IInviteesState> {

    componentState: boolean = true;

    constructor(props: IInviteesProps) {
        super(props);
        this.state = {
            loading: true,
            offset: 0,
            limit: 20,
            channelInvites: [],
            invite: {
                fromNumbers: {
                    value: "",
                    list: []
                }
            },
            validation: {
                fromNumbers: {
                    value: null,
                    message: ""
                }
            },
            request: {
                add: {
                    processing: false,
                    disabled: true
                },
                remove: {
                    processing: false,
                },
                pagination: false
            },
            initialFilters: {
                phone: {
                    selected: [],
                    options: [],
                }
            },
            options: []
        }
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleFromNumberInputChange = (value: string): any => {
        const newState: IInviteesState = {...this.state};
        const {invite: {fromNumbers: {list}}} = this.state;
        let valueForValidate: string = value;

        if (isNumeric(valueForValidate) && valueForValidate.substr(0, 1) !== "+") {
            valueForValidate = "+" + valueForValidate.toString();
        }
        const {isValid} = validateNumber(valueForValidate);

        if (!isValid) {
            if (valueForValidate !== "") {
                newState.validation.fromNumbers.value = "error";
                newState.validation.fromNumbers.message = "Invalid phone number";
            }
            // Handle fake number set to success number
            const isTestableNumber: any = testableNumbersValidate(valueForValidate);

            if (isTestableNumber) {
                newState.validation.fromNumbers.value = "success";
                newState.validation.fromNumbers.message = "Valid number";
            }
        } else if (list.some(item => item.value === valueForValidate)) {
            newState.validation.fromNumbers.value = "warning";
            newState.validation.fromNumbers.message = "Phone number exists";
        } else {
            newState.validation.fromNumbers.value = "success";
            newState.validation.fromNumbers.message = "Valid number";
        }
        newState.invite.fromNumbers.value = valueForValidate;
        this.setState(newState);
    };

    handleFromNumbersChange = (value: Array<ISelect>) => {
        const newState: IInviteesState = {...this.state};
        newState.invite.fromNumbers.list = value ? value : [];
        this.setState(newState);
    };

    handleFromNumberKeyDown = (event: React.KeyboardEvent<HTMLElement>): any => {
        const {invite: {fromNumbers: {value, list}}, validation} = this.state;
        if (!value) {
            return;
        }
        if (validation.fromNumbers.value === "success") {
            const newState: IInviteesState = {...this.state};
            switch (event.key) {
                case "Enter":
                case "Tab":
                    newState.invite.fromNumbers.value = "";
                    newState.invite.fromNumbers.list = [...list, createOption(value)];
                    newState.validation.fromNumbers.value = null;
                    newState.validation.fromNumbers.message = "";
                    this.setState(newState);
                    event.preventDefault();
            }
        }
    };

    handleFromNumberOnBlur = (event: React.FocusEvent<HTMLElement>): any => {
        event.preventDefault();
        const {invite: {fromNumbers: {value, list}}, validation} = this.state;
        const newState: IInviteesState = {...this.state};

        if (validation.fromNumbers.value === "success") {
            newState.invite.fromNumbers.value = "";
            newState.invite.fromNumbers.list = [...list, createOption(value)];
        }

        newState.validation.fromNumbers.value = null;
        newState.validation.fromNumbers.message = "";
        this.setState(newState);
    };

    handleFromNumbersInvite = (e: React.MouseEvent<HTMLButtonElement> | any): void => {
        e.preventDefault();
        const {invite: {fromNumbers}, limit, offset, initialFilters} = this.state;
        const {channelId} = this.props;
        const newState: IInviteesState = {...this.state};
        this.setState(newState);

        const newChannelInvites: string[] = initialFilters.phone.selected.map(item => item.value);
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        addChannelInvities(channelId, {channelInvites: newChannelInvites}).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            } else {
                showNotification("success", {
                    title: "Success!",
                    description: "Numbers successfully added to invite list",
                    id: toastId
                });
            }
        }).catch(e => {
            console.log(e);
            newState.request.add.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot add numbers to invite",
                    id: toastId
                });
            }
        })
    };

    handleFindUsers: any = async (value: string) => {
        const newState: IInviteesState = {...this.state};

        const response: any = await getSearchedUsersForInvite({value, all: true});
        console.log("response")
        if (response.data.err) {
            return [];
        }
        const result: any[] = response.data.result
       .filter(user => (user.nickname ? user.nickname : user.email ? user.email : user.username).toLowerCase().includes(value.toLowerCase()))
       .map(user => {
         return {
            value: user.username,
            label: user.nickname ? user.nickname : user.email ? user.email : user.username
         }
        });
        newState.initialFilters.phone.options = result;
        if (this.componentState) {
            this.setState(newState);
        }
        return result;
    };

    handlePhoneChange = (selected: any): void => {
        const newState: IInviteesState = {...this.state};
        newState.initialFilters.phone.selected = selected;
        this.setState(newState);
    };

    render(): JSX.Element {
        const {
            invite: {fromNumbers},
            validation, request: {add},
            initialFilters: {phone: {selected}}
        } = this.state;

        return (
            <div>
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-12">
                                <FormGroup validationState={validation.fromNumbers.value}>
                                    {/*<ControlLabel>Phone numbers</ControlLabel>*/}
                                    {/*<Creatable*/}
                                    {/*    isClearable={true}*/}
                                    {/*    isMulti={true}*/}
                                    {/*    menuIsOpen={false}*/}
                                    {/*    inputValue={fromNumbers.value}*/}
                                    {/*    value={fromNumbers.list}*/}
                                    {/*    styles={multiSelectMenuStyles}*/}
                                    {/*    placeholder="Enter phone number"*/}
                                    {/*    onChange={this.handleFromNumbersChange}*/}
                                    {/*    onInputChange={this.handleFromNumberInputChange}*/}
                                    {/*    onKeyDown={this.handleFromNumberKeyDown}*/}
                                    {/*    onBlur={this.handleFromNumberOnBlur}*/}
                                    {/*/>*/}
                                    <ControlLabel>
                                        Phone number / Email / Nickname
                                    </ControlLabel>
                                    <AsyncSelect
                                        inputId="phone-number"
                                        name="phone-number"
                                        placeholder="Phone number / Email / Nickname"
                                        cacheOptions={true}
                                        isClearable={true}
                                        autoFocus={true}
                                        isMulti={true}
                                        value={selected}
                                        styles={multiSelectMenuStyles}
                                        loadOptions={promiseSelectOptions(this.handleFindUsers)}
                                        onChange={this.handlePhoneChange}
                                    />
                                    {/*<HelpBlock>{validation.fromNumbers.message}</HelpBlock>*/}
                                </FormGroup>
                                <HelpBlock>You can input several phone numbers: specify a valid
                                    phone number, click Enter (or Tab) and continue specifying other phone
                                    numbers.</HelpBlock>
                                <button
                                    className="btn btn-info m-b-sm"
                                    disabled={selected.length === 0 || add.processing}
                                    onClick={this.handleFromNumbersInvite}
                                >Invite Members {add.processing &&
                                <i className="fa fa-spin fa-spinner m-l-xs"/>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Invitees;
