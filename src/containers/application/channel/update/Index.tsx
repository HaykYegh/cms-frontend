"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import * as moment from "moment";
import {Link} from "react-router-dom";
import Nav from "react-bootstrap/es/Nav";
import Checkbox from "react-bootstrap/es/Checkbox";
import FormGroup from "react-bootstrap/es/FormGroup";
import Button from "react-bootstrap/es/Button";
import {ToastContainer} from "react-toastify";
import NavItem from "react-bootstrap/es/NavItem";

import Invitees from "containers/application/channel/update/Invitees";
import Users from "containers/application/channel/update/Users";
import Admins from "containers/application/channel/update/Admins";
import {getChannel, editChannelVerifiedAndSensitive} from "ajaxRequests/channel";
import {CHANNEL} from "configs/constants";
import {showNotification} from "helpers/PageHelper";
import {IVALIDATION} from "services/interface";

interface IUpdateState {
    channelId: number,
    loading: boolean,
    channel: any,
    channelMembers: any,
    verifiedDefault: boolean,
    sensitiveContentDefault: boolean,
    isEditable: boolean,
    validation: {
        nickname: IVALIDATION,
        label: IVALIDATION,
    },
    request: {
        update: {
            processing: boolean,
            complete: boolean,
            disabled: boolean,
        }
    },
    pills: any,
    active: any,
    popup: {
        show: boolean,
        channel: {
            nickname: string,
            label: string,
            callName: string,
            isPublic: boolean
        }
    }
}

class Index extends React.Component<any, IUpdateState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        const channelId: number = this.props.match.params.id || null;
        this.state = {
            channelId,
            loading: true,
            channel: {},
            channelMembers: null,
            isEditable: false,
            verifiedDefault: false,
            sensitiveContentDefault: false,
            validation: {
                nickname: {
                    value: null,
                    message: ""
                },
                label: {
                    value: null,
                    message: ""
                }
            },
            request: {
                update: {
                    processing: false,
                    complete: false,
                    disabled: true,
                }
            },
            pills: [
                {
                    eventKey: CHANNEL.TABS.UPDATE.USERS,
                    component: Users,
                    title: "Users"
                },
                {
                    eventKey: CHANNEL.TABS.UPDATE.ADMINS,
                    component: Admins,
                    title: "Administrators"

                },
                {
                    eventKey: CHANNEL.TABS.UPDATE.INVITEES,
                    component: Invitees,
                    title: "Invitees"

                }
            ],
            active: {
                eventKey: CHANNEL.TABS.UPDATE.USERS,
                component: Users
            },
            popup: {
                show: false,
                channel: {
                    nickname: "",
                    label: "",
                    callName: "",
                    isPublic: true
                }
            }
        }
    }

    componentWillMount(): void {
        const {channelId} = this.state;
        const {history} = this.props;
        if (!channelId) {
            history.push("/channel");
        }
        document.title = `Channel - ${channelId || ""}`;
    }

    componentDidMount(): void {
        const {channelId} = this.state;
        const newState: IUpdateState = {...this.state};
        getChannel(channelId, 0, 0).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.channel = data.result || [];
            newState.verifiedDefault = data.result.verified || false;
            newState.sensitiveContentDefault = data.result.sensitiveContent || false;
            newState.loading = false;
            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(e => {
            console.log(e);
            newState.loading = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get owner info",
                    timer: 3000
                });
            }
        });
    }

    componentWillUnmount(): void {
        this.componentState = false
    }

    handlePillChange = (pillKey: number): void => {
        const newState: IUpdateState = {...this.state};
        const newPill: any = newState.pills.find(pill => pill.eventKey === pillKey);
        newState.active = {
            eventKey: newPill.eventKey,
            component: newPill.component,
        };

        this.setState(newState);
    };
    handleToggleDisabled = (state: any): void => {
        state.request.update.disabled = Object.keys(state.validation).some(item => state.validation[item].value === "error");
    };

    toggleChannelEditable = (isEditable: boolean): void => {
            this.setState({isEditable})
    };

    saveEditChannelChanges = (): void => {
        const {channelId, channel} = this.state;
        this.setState({verifiedDefault: channel.verified, sensitiveContentDefault: channel.sensitiveContent, isEditable: false});
        editChannelVerifiedAndSensitive(channelId, channel.verified, channel.sensitiveContent);
    };

    cancelEditChannelChanges = (): void => {
        const {verifiedDefault, sensitiveContentDefault, channel} = this.state;
        const newChannel: any = {...channel};
        newChannel.sensitiveContent = sensitiveContentDefault;
        newChannel.verified = verifiedDefault;
        this.setState({isEditable: false, channel: newChannel})
    }

    handleCheckboxChange = ({currentTarget: {checked, name}}: React.MouseEvent<HTMLInputElement>): void => {
        const newState: IUpdateState = {...this.state};
        newState.channel[name] = checked;
        this.setState(newState);
    };

    render(): JSX.Element {
        const {channel, active, pills, validation, request: {update}, popup, channelId,  isEditable} = this.state;
        return (
            <div>
                <div className="box-shadow r-3x bg-white m-b-lg">
                    <ToastContainer/>
                    <div className="content-wrapper">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div className="flexible">
                                        <Link
                                            className="btn btn-default m-r-sm"
                                            to="/channel"
                                        ><i className="fa fa-arrow-left m-r-xs"/>Channels
                                        </Link>
                                        <div className="flexible">
                                            {
                                                isEditable === false ? <Button
                                                    className="btn btn-default m-r-sm"
                                                    onClick={() => this.toggleChannelEditable(true)}
                                                >
                                                    Edit
                                                </Button> : <>
                                                    <Button
                                                        className="btn btn-default m-r-sm"
                                                        onClick={() => this.cancelEditChannelChanges()}
                                                    >
                                                        cancel
                                                    </Button>
                                                    <Button
                                                        className="btn btn-default m-r-sm"
                                                        onClick={() => this.saveEditChannelChanges()}
                                                    >
                                                        save
                                                    </Button>
                                                </>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr/>

                    <div className="content-wrapper network-details">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                    <div className="container-fluid no-padder">
                                        <div className="row m-b-md">
                                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                                <span className="block font-bold text-base text-uppercase">Channel Information</span>
                                            </div>
                                        </div>
                                        <div className="row m-b-md">
                                            <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                <span className="block font-semi-bold">Unique Short Name</span>
                                            </div>
                                            <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                <span className="block">{channel && channel.nickname}</span>
                                            </div>
                                        </div>
                                        <div className="row m-b-md">
                                            <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                <span className="block font-semi-bold">Channel Subject</span>
                                            </div>
                                            <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                <span className="block">{channel && channel.subject}</span>
                                            </div>
                                        </div>
                                        <div className="row m-b-md">
                                            <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                <span className="block font-semi-bold">Channel Description</span>
                                            </div>
                                            <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                <span className="block">{channel && channel.description}</span>
                                            </div>
                                        </div>
                                        <div className="row m-b-md">
                                            <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                <span className="block font-semi-bold">Is Verified Channel</span>
                                            </div>
                                            <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                <span className="block">
                                                    <FormGroup>
                                                        <Checkbox
                                                            onChange={this.handleCheckboxChange}
                                                            checked={channel.verified}
                                                            style={{marginTop: 0, marginBottom: 0}}
                                                            name="verified"
                                                            disabled={!this.state.isEditable}
                                                        />
                                                    </FormGroup>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="row m-b-md">
                                            <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                <span className="block font-semi-bold">Is Sensitive Content</span>
                                            </div>
                                            <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                <span className="block">
                                                    <FormGroup>
                                                        <Checkbox
                                                            onChange={this.handleCheckboxChange}
                                                            checked={channel.sensitiveContent}
                                                            style={{marginTop: 0, marginBottom: 0}}
                                                            name="sensitiveContent"
                                                            disabled={!this.state.isEditable}
                                                        />
                                                    </FormGroup>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                    <div className="container-fluid no-padder">
                                        <div className="row m-b-md">
                                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                                <span className="block font-bold text-base text-uppercase" style={{visibility: "hidden"}} >Customization</span>
                                            </div>
                                        </div>
                                        <div className="row m-b-md">
                                            <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                <span className="block font-semi-bold">Members Joining Mechanism</span>
                                            </div>
                                            <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                <span className="block">{channel && channel.private ? "Private" : "Public"}</span>
                                            </div>
                                        </div>
                                        <div className="row m-b-md">
                                            <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                <span className="block font-semi-bold">Payment Type</span>
                                            </div>
                                            <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                <span className="block">{channel && channel.paid ? "Paid" : "Free"}</span>
                                            </div>
                                        </div>
                                        <div className="row m-b-md">
                                            <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                <span className="block font-semi-bold">Creation Date</span>
                                            </div>
                                            <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                <span className="block">{channel && moment(channel.createdAt).format("DD/MM/YYYY")}</span>
                                            </div>
                                        </div>
                                        <div className="row m-b-md">
                                            <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                <span className="block font-semi-bold">Owner</span>
                                            </div>
                                            <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                <span className="block">
                                                    {channel && channel.ownerList &&
                                                    channel.ownerList.length > 0 && channel.ownerList[0].nickname ? channel.ownerList[0].nickname : channel && channel.ownerList &&
                                                        channel.ownerList.length > 0 ? (channel.ownerList[0].firstName + " " + channel.ownerList[0].lastName) : ""}
                                                </span>
                                                <p>
                                                    {channel && channel.ownerList &&
                                                    channel.ownerList > 0 &&
                                                    (channel.ownerList[0].email || channel.ownerList[0].number)}
                                                </p>
                                            </div>
                                        </div>
                                        {/*<div className="row m-b-md">*/}
                                        {/*    <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">*/}
                                        {/*        <span className="block font-semi-bold">Is Verified Channel</span>*/}
                                        {/*    </div>*/}
                                        {/*    <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">*/}
                                        {/*        <span className="block">{channel && channel.description}</span>*/}
                                        {/*    </div>*/}
                                        {/*</div>*/}
                                        {/*<div className="row m-b-md">*/}
                                        {/*    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">*/}
                                        {/*        <span className="block font-bold text-base text-uppercase">Customization</span>*/}
                                        {/*    </div>*/}
                                        {/*</div>*/}
                                        {/*<div className="row">*/}
                                        {/*    <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">*/}
                                        {/*        <span className="block font-semi-bold">Out call button name</span>*/}
                                        {/*    </div>*/}
                                        {/*    <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">*/}
                                        {/*        <span className="block m-b-sm">{channel && channel.callName || "Zangi-Out"}</span>*/}
                                        {/*        <span className="block text-muted m-b-sm">You can customize the name of Zangi-Out calling button inside Zangi apps.</span>*/}
                                        {/*        <img*/}
                                        {/*            src={"/assets/images/out-call-button-name.png"}*/}
                                        {/*            alt="Out call button name"*/}
                                        {/*            className="img-responsive"*/}
                                        {/*        />*/}
                                        {/*    </div>*/}
                                        {/*</div>*/}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="box-shadow r-3x bg-white">
                    <div className="container-fluid no-padder">
                        <div className="row">
                            <div className="col-lg-12">
                                <Nav
                                    bsStyle="pills"
                                    justified={true}
                                    activeKey={active.eventKey}
                                    onSelect={this.handlePillChange}
                                >
                                    {pills.map(pill =>
                                        <NavItem
                                            key={pill.eventKey}
                                            eventKey={pill.eventKey}
                                            title={pill.title}
                                        >{pill.title}
                                        </NavItem>
                                    )}
                                </Nav>
                            </div>
                        </div>
                    </div>
                    {React.createElement(active.component, {
                        channelName: channel.nickname,
                        admins: channel.adminList,
                        channelId
                    })}
                </div>
            </div>
        )
    }
}

export default Index;
