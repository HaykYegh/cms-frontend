"use strict";

import * as React from "react";
import Select from "react-select";
import {AxiosResponse} from "axios";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {sendNotificationToUserGroups} from "ajaxRequests/notification";
import {multiSelectMenuStyles, selectMenuStyles, showNotification} from "helpers/PageHelper";
import {getUserGroups} from "ajaxRequests/users";
import selector from "services/selector";
import {connect} from "react-redux";

interface IGroupsState {
    userGroups: any[],
    message: string;

    selectedUserGroup: any;
    selectedSender: any;

    isProcessing: boolean,
}

interface IGroupsProps {
    senders: any[],
    userProfile: any,
}

class Groups extends React.Component<IGroupsProps, IGroupsState> {

    isComponentMounted: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            userGroups: [],
            message: "",

            selectedUserGroup: null,
            selectedSender: null,

            isProcessing: false,
        }
    }

    componentDidMount(): void {
        const newState: IGroupsState = {...this.state};

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

            if (this.isComponentMounted) {
                this.setState(newState);
            }

        }).catch(e => {
            console.log(e);
            if (this.isComponentMounted) {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get user groups for unknown reason"
                });
            }
        });
    }

    componentWillUnmount(): void {
        this.isComponentMounted = false;
    }

    handleMessageChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IGroupsState = {...this.state};
        newState.message = value;
        this.setState(newState);
    };

    handleUserGroupChange = (selected: any): void => {
        const newState: IGroupsState = {...this.state};
        newState.selectedUserGroup = selected;
        this.setState(newState);
    };

    handleSenderChange = (selected: any): void => {
        this.setState({selectedSender: selected});
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
        const newState: IGroupsState = this.state;
        const {message, selectedUserGroup, selectedSender} = this.state;

        newState.isProcessing = true;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        const senderId: number = selectedSender && selectedSender.value;
        const userGroupId: number = selectedUserGroup.value;

        sendNotificationToUserGroups({message, userGroupId, senderId}).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            console.log(data.result);

            newState.isProcessing = false;
            newState.selectedSender = null;
            newState.selectedUserGroup = null;
            newState.message = "";
            if (this.isComponentMounted) {
                this.setState(newState);
                showNotification("success", {
                    title: "Your notification has been sent successfully",
                    description: "",
                    id: toastId,
                    timer: 3000
                });
            }
        }).catch(err => {
            console.log(err);
            newState.isProcessing = false;
            if (this.isComponentMounted) {
                this.setState(newState);
                showNotification("error", {
                    title: "Your notification will not be sent",
                    description: "",
                    id: toastId,
                    timer: 3000
                });
            }
        });
    };

    render(): JSX.Element {
        const {message, selectedSender, selectedUserGroup, isProcessing, userGroups} = this.state;
        const {senders} = this.props;
        return (
            <div className="container-fluid no-padder">
                <div className="row">

                    {/*User Groups*/}
                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                        <FormGroup>
                            <ControlLabel htmlFor="userGroup">User Groups</ControlLabel>
                            <Select
                                inputId="userGroup"
                                name="userGroup"
                                placeholder={"Select user group..."}
                                isClearable={true}
                                styles={multiSelectMenuStyles}
                                closeMenuOnSelect={true}
                                value={selectedUserGroup}
                                options={userGroups}
                                onChange={this.handleUserGroupChange}
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

                    {/*Button*/}
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <button
                            disabled={message === "" || selectedSender === null || selectedUserGroup === null}
                            className="btn btn-info"
                            onClick={this.handleNotify}
                        >{isProcessing ? "Processing..." : "Send"}
                        </button>
                    </div>

                </div>
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Groups);
