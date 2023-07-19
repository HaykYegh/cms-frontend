"use strict";

import * as React from "react";
import {ListGroup, ListGroupItem, Checkbox, Button} from "react-bootstrap";
import {getSystemMessages} from "ajaxRequests/notification";
import {showNotification} from "helpers/PageHelper";
import {ToastContainer} from "react-toastify";
import Loading from "components/Common/Loading";

interface ISentProps {
}

interface ISentState {
    sentList: Array<any>,
    selectedSent: any,
    messagesIds: number[],
    offset: number,
    limit: number,
    loading: boolean
}

class Sent extends React.Component<ISentProps, ISentState> {

    componentState: boolean = true;

    constructor(props: ISentProps) {
        super(props);
        this.state = {
            sentList: null,
            selectedSent: null,
            messagesIds: [],
            offset: 0,
            limit: 50,
            loading: true
        }
    }

    componentDidMount(): void {
        const {offset} = this.state;
        const newState: ISentState = {...this.state};

        getSystemMessages(offset).then(response => {
            if (!response.data.err) {
                newState.sentList = response.data.result;
                newState.loading = false;
            } else {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Error getting system messages",
                    timer: 3000,
                    hideProgress: true
                });
            }
            if (this.componentState) {
                this.setState(newState);
            }

        }).catch(err => console.log(err));
    }

    handleSelectAllSent = ({currentTarget: {checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: ISentState = {...this.state};
        const messagesIds: number[] = [];
        for (const item of newState.sentList) {
            item.checked = checked;
            if (checked) {
                messagesIds.push(item.messageId);
            }
        }
        newState.messagesIds = messagesIds;
        this.setState(newState);
    };

    handleSelectSent = ({currentTarget: {id, checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: ISentState = {...this.state};
        for (const item of newState.sentList) {
            if (+id === item.messageId) {
                item.checked = checked;
                if (checked) {
                    newState.messagesIds.push(item.messageId);
                } else {
                    newState.messagesIds = newState.messagesIds.filter(item => item !== +id)
                }
            }
        }
        this.setState(newState);
    };

    handleViewSent = (id: number): void => {
        const newState: ISentState = {...this.state};
        newState.selectedSent = newState.sentList.find(item => +id === item.messageId);
        this.setState(newState);
    };

    handleGoToSentPage = (): void => {
        const newState: any = {...this.state};
        newState.selectedSent = null;
        this.setState(newState);

    };

    handleDelete = (): void => {
        const {messagesIds} = this.state;
        const newState: any = {...this.state};
        newState.sentList = newState.sentList.filter(item => !messagesIds.includes(item.messageId));
        this.setState(newState);
    };

    handleSelectedSentDelete = (event: React.MouseEvent<HTMLSpanElement>): void => {
        event.preventDefault();
        const {selectedSent} = this.state;
        const newState: any = {...this.state};
        newState.sentList = newState.sentList.filter(item => item.messageId !== selectedSent.messageId);
        newState.selectedSent = null;
        this.setState(newState);
    };

    handleSendMessage = (event: React.MouseEvent<HTMLSpanElement>): void => {
        event.preventDefault();
    };

    render(): JSX.Element {
        const {sentList, selectedSent, loading} = this.state;

        return (
            <div>
                {
                    selectedSent && Object.keys(selectedSent).length > 0 ?
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="container-fluid no-padder">
                                    <div className="row">
                                        <div className="border-bottom-custom">
                                            <div className="col-lg-4">
                                                <h4>Notification</h4>
                                            </div>
                                            <div className="col-lg-8">
                                                <div className="f-r">
                                                <span id="send" className="custom-button ">
                                                     <i className="fa fa-share pr-10" aria-hidden="true"/>
                                                        Send
                                                </span>
                                                    <span
                                                        className="custom-button"
                                                        onClick={this.handleSelectedSentDelete}
                                                    ><i className="fa fa-trash-o pr-10" aria-hidden="true"/>Delete
                                                    </span>
                                                    <i
                                                        className="fa fa-times close-button"
                                                        aria-hidden="true"
                                                        onClick={this.handleGoToSentPage}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-12">
                                <div className="container-fluid no-padder">
                                    <div className="row">
                                        <div className="scroll">
                                            <div className="col-lg-12">
                                                <h4>Sent</h4>
                                                <p>
                                                    {selectedSent.createdAt}
                                                </p>
                                            </div>
                                            {
                                                selectedSent.phoneNumbers === "" ?
                                                    <div>
                                                        <div className="col-lg-12">
                                                            <h4>Country</h4>
                                                            <p>{selectedSent.countries}</p>
                                                        </div>
                                                        <div className="col-lg-12">
                                                            <h4>platforms</h4>
                                                            <p>{selectedSent.platforms}</p>
                                                        </div>
                                                    </div> :
                                                    <div className="col-lg-12">
                                                        <h4>Phone Number</h4>
                                                        <p>{selectedSent.phoneNumbers}</p>
                                                    </div>
                                            }
                                            <div className="col-lg-12">
                                                <h4>Message</h4>
                                                <p>{selectedSent.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        :
                        loading ? <Loading /> :
                            <div className="row">
                                <div className="col-lg-12">
                                    <Checkbox
                                        className="f-l"
                                        onChange={this.handleSelectAllSent}
                                    />
                                    {
                                        sentList && sentList.length > 0 &&
                                        <div className="m-t-sm m-b-sm f-r">
                                            {
                                                sentList.filter(item => item.checked === true).length === 1 &&
                                                <span
                                                    className="cursor-pointer"
                                                    onClick={this.handleSendMessage}
                                                ><i
                                                    className="fa fa-share p-r-sm"
                                                    aria-hidden="true"
                                                />Send
                                                </span>
                                            }
                                            {
                                                sentList.some(item => item.checked === true) &&
                                                <span className="p-l-lg cursor-pointer" onClick={this.handleDelete}>
                                                <i
                                                    className="fa fa-trash-o p-r-sm"
                                                    aria-hidden="true"
                                                />Delete
                                            </span>
                                            }
                                        </div>
                                    }
                                </div>
                                <div className="col-lg-12">
                                    <div className="scroll container-fluid b-b b-t">
                                        {
                                            sentList && sentList.length > 0 && sentList.map(item => {
                                                    const viewSent: any = () => this.handleViewSent(item.messageId);
                                                    return (
                                                        <div className="row b-b" key={item.messageId}>
                                                            <div className="col-lg-1 no-padder">
                                                                <Checkbox
                                                                    id={item.messageId}
                                                                    onChange={this.handleSelectSent}
                                                                />
                                                            </div>
                                                            <div className="col-lg-11 no-padder">
                                                                <div
                                                                    className=""
                                                                    onClick={viewSent}

                                                                ><span className="font-bold text-md">{item.title}</span>
                                                                    <p>{item.content}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                }
                <ToastContainer/>
            </div>
        )
    }
}

export default Sent;
