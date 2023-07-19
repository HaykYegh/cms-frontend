"use strict";

import * as React from "react";
import {connect} from "react-redux";
import Select, {makeAnimated} from "react-select";
import Checkbox from "react-bootstrap/es/Checkbox";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {checkNicknameUsersCount, notificationSendNicknameUsers} from "ajaxRequests/notification";
import {ISelect, IVALIDATION} from "services/interface";
import {multiSelectMenuStyles, selectMenuStyles, showNotification} from "helpers/PageHelper";
import selector, {IStoreProps} from "services/selector";
import {AxiosResponse} from "axios";

interface ICountriesAndPlatformsState {
    _platforms: Array<any>,
    _countries: Array<any>,
    isAllCountries: boolean,
    isAllPlatforms: boolean,
    startsWith: string,
    notification: {
        message: string,
    },
    request: {
        notify: {
            processing: boolean,
            disabled: boolean,
            complete: boolean
        },
        checkUser: {
            processing: boolean,
            disabled: boolean
            usersCount: number
        }
    },
    validation: {
        startsWith: IVALIDATION
    },
    selectedSender: any
}

interface ICountriesAndPlatformsProps extends IStoreProps {
    senders: any[];
    countries: any;
    platforms: any;
    userProfile: any,
}

class CountriesAndPlatforms extends React.Component<ICountriesAndPlatformsProps, ICountriesAndPlatformsState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            _platforms: [],
            _countries: [],
            startsWith: "",
            isAllCountries: false,
            isAllPlatforms: false,
            notification: {
                message: "",
            },
            request: {
                notify: {
                    processing: false,
                    disabled: true,
                    complete: false
                },
                checkUser: {
                    processing: false,
                    disabled: true,
                    usersCount: null
                }
            },
            validation: {
                startsWith: {
                    value: null,
                    message: ""
                }
            },
            selectedSender: null
        }
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleCountryChange = (value: ISelect): void => {
        const selection: any = value;
        const newState: ICountriesAndPlatformsState = {...this.state};
        newState._countries = selection;
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handlePlatformChange = (value: ISelect): void => {
        const selection: any = value;
        const newState: ICountriesAndPlatformsState = {...this.state};
        newState._platforms = selection;
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleSelectAllAttributes = ({currentTarget: {name, checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: ICountriesAndPlatformsState = {...this.state};
        if (name === "countries") {
            newState.isAllCountries = checked;
            newState._countries = [];
        }
        if (name === "platforms") {
            newState.isAllPlatforms = checked;
            newState._platforms = [];
        }
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleStartsWithChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        const newState: ICountriesAndPlatformsState = {...this.state};
        newState.startsWith = value;
        newState.validation.startsWith.value = value === "" ? "error" : null;
        newState.validation.startsWith.message = value === "" ? "error" : null;
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleMessageChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const newState: ICountriesAndPlatformsState = {...this.state};
        newState.notification.message = value;
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleToggleDisabled = (state: ICountriesAndPlatformsState): void => {
        state.request.notify.disabled = !((state.isAllCountries || state._countries.length > 0) &&
            (state.isAllPlatforms || state._platforms.length > 0) && state.notification.message !== "");
        state.request.checkUser.disabled = !((state.isAllCountries || state._countries.length > 0) &&
            (state.isAllPlatforms || state._platforms.length > 0));
        state.request.notify.complete = false;
    };

    handleCheckUsersCount = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        const newState: ICountriesAndPlatformsState = {...this.state};
        const {_countries, _platforms, isAllCountries, isAllPlatforms, startsWith} = this.state;
        const {countries, platforms} = this.props;
        newState.request.checkUser.processing = true;
        this.setState(newState);

        const countryIDs: string = (isAllCountries ? countries : _countries).map(property => property.country_id).join(",");
        const platformIDs: string = (isAllPlatforms ? platforms : _platforms).map(property => property.platform_id).join(",");

        checkNicknameUsersCount(countryIDs, platformIDs, startsWith).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.request.checkUser.usersCount = data.result.count || "0";
            newState.request.checkUser.processing = false;
            this.componentState && this.setState(newState);
        }).catch(e => {
            console.log(e);
            newState.request.checkUser.disabled = false;
            newState.request.checkUser.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "Error",
                    description: "Cannot check users count",
                    timer: 3000
                });
            }
        });

    };

    handleNotify = (e: React.MouseEvent<HTMLButtonElement>): void => {
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
        const newState: ICountriesAndPlatformsState = this.state;
        const {countries, platforms} = this.props;
        newState.request.notify.processing = true;
        newState.request.checkUser.disabled = true;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });
        const {notification: {message}, _platforms, _countries, isAllPlatforms, isAllCountries, startsWith, selectedSender} = this.state;
        const countryIDs: string = (isAllCountries ? countries : _countries).map(property => property.country_id).join(",");
        const platformIDs: string = (isAllPlatforms ? platforms : _platforms).map(property => property.platform_id).join(",");
        const senderId: number = selectedSender && selectedSender.value;

        notificationSendNicknameUsers(countryIDs, platformIDs, startsWith, senderId, {message}).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.notification = {message: ""};
            newState.request.notify.processing = false;
            newState.request.notify.disabled = true;
            newState.request.notify.complete = true;
            newState.request.checkUser.disabled = true;
            newState._platforms = [];
            newState._countries = [];
            newState.isAllPlatforms = false;
            newState.isAllCountries = false;
            newState.request.checkUser.usersCount = null;
            newState.validation.startsWith = {
                value: null,
                message: ""
            };
            newState.startsWith = "";
            newState.selectedSender = null;
            if (this.componentState) {
                showNotification("success", {
                    title: "Your notification has been sent successfully",
                    description: "Note that if you have specified some users who don’t belong to your network, the notification hasn’t been sent to those users.",
                    id: toastId
                });
                this.setState(newState);
            }
        }).catch(e => {
            console.log(e);
            if (this.componentState) {
                newState.request.notify.processing = false;
                newState.request.checkUser.disabled = true;
                this.setState(newState);
                showNotification("error", {
                    title: "Your notification will not be sent",
                    description: "The specified users don’t belong to your network. You can send notifications only to the users who joined your network.",
                    id: toastId
                });
            }
        });
    };

    handleSenderChange = (selectedSender: any): void => {
        this.setState({selectedSender});
    };

    render(): JSX.Element {
        const {
            _platforms, _countries, startsWith, isAllCountries, isAllPlatforms, selectedSender,
            request: {checkUser, notify}, notification: {message}, validation
        } = this.state;
        const {countries, platforms, senders} = this.props;
        return (
            <div className="container-fluid no-padder">
                <div className="row">

                    {/*Countries*/}
                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                        <FormGroup>
                            <ControlLabel htmlFor="countries">Countries</ControlLabel>
                            <Select
                                id="countries"
                                name="countries"
                                placeholder={`${isAllCountries ? "All countries" : "Choose countries"}`}
                                isMulti={true}
                                styles={multiSelectMenuStyles}
                                isDisabled={isAllCountries}
                                closeMenuOnSelect={false}
                                components={makeAnimated()}
                                options={countries}
                                value={_countries}
                                onChange={this.handleCountryChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Checkbox
                                name="countries"
                                inline={true}
                                checked={isAllCountries}
                                onChange={this.handleSelectAllAttributes}
                            ><span className="font-semi-bold">Select all countries</span>
                            </Checkbox>
                        </FormGroup>
                    </div>

                    {/*Platforms*/}
                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                        <FormGroup>
                            <ControlLabel htmlFor="platforms">Platforms</ControlLabel>
                            <Select
                                id="platforms"
                                name="platforms"
                                placeholder={`${isAllPlatforms ? "All platforms" : "Choose platforms"}`}
                                isMulti={true}
                                styles={multiSelectMenuStyles}
                                isDisabled={isAllPlatforms}
                                closeMenuOnSelect={false}
                                components={makeAnimated()}
                                options={platforms}
                                value={_platforms}
                                onChange={this.handlePlatformChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Checkbox
                                name="platforms"
                                inline={true}
                                checked={isAllPlatforms}
                                onChange={this.handleSelectAllAttributes}
                            ><span className="font-semi-bold">Select all platforms</span>
                            </Checkbox>
                        </FormGroup>
                    </div>

                    {/*Start with*/}
                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                        <FormGroup validationState={validation.startsWith.value}>
                            <ControlLabel htmlFor="startWithPhone">Start with</ControlLabel>
                            <FormControl
                                type="text"
                                min={1}
                                id="startWithPhone"
                                name="startWithPhone"
                                placeholder="Start with"
                                style={{height: "38px"}}
                                value={startsWith}
                                onChange={this.handleStartsWithChange}
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

                </div>
                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <FormGroup>
                            <ControlLabel htmlFor="message">Message</ControlLabel>
                            <FormControl
                                rows={5}
                                id="message"
                                name="message"
                                componentClass="textarea"
                                placeholder="Message"
                                value={message}
                                onChange={this.handleMessageChange}
                            />
                        </FormGroup>
                    </div>
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <button
                            disabled={notify.disabled || notify.processing}
                            className="btn btn-info"
                            onClick={this.handleNotify}
                        >Send {notify.processing ? <i className="fa fa-spinner fa-spin m-l-xs"/> :
                            notify.complete ? <i className="fa fa-check m-l-xs"/> : null}
                        </button>
                        <button
                            disabled={checkUser.disabled || checkUser.processing}
                            className="btn btn-info m-l-xs"
                            onClick={this.handleCheckUsersCount}
                        >Check user count {checkUser.processing ? <i className="fa fa-spinner fa-spin m-l-xs"/> : null}
                        </button>
                        {
                            checkUser.usersCount && checkUser.usersCount >= 0 &&
                            <span className="m-l-sm">
                                Users: <span className="font-bold">{checkUser.usersCount}</span>
                            </span>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CountriesAndPlatforms);
