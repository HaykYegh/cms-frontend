"use strict";

import * as React from "react";
import format from "date-fns/format";
import parse from "date-fns/parse";
import {AxiosResponse} from "axios";
import {Link} from "react-router-dom";
import Table from "react-bootstrap/es/Table";
import {ToastContainer} from "react-toastify";

import {deleteChatBot, getChatBots} from "ajaxRequests/chatBots";
import Pagination from "components/Common/Pagination";
import {showNotification} from "helpers/PageHelper";
import {getCurrentOffset} from "helpers/DataHelper";
import Popup from "components/Common/Popup";
import {PAGE_NAME} from "configs/constants";
import Loading from "components/Common/Loading";
import MoreActions from "components/Common/MoreActions";

interface IIndexState {
    chatBots: {
        count: number,
        records: any[]
    },
    chatBotId: number,
    popup: any;
    offset: number,
    limit: number,
    initialLoading: boolean,
    request: {
        pagination: boolean,
        loading: boolean,
    },
}

class Index extends React.Component<any, IIndexState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            offset: 0,
            limit: 20,
            chatBots: {
                count: 0,
                records: []
            },
            chatBotId: null,
            initialLoading: true,
            request: {
                pagination: false,
                loading: true,
            },
            popup: {
                delete: {
                    show: false,
                }
            }
        }
    }

    componentWillMount(): void {
        document.title = PAGE_NAME["/chat-bots"];
    }

    componentDidMount(): void {
        const newState: IIndexState = {...this.state};
        this.initRequests(newState);
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    initRequests = (state: IIndexState, offset: number = 0, isPaging: boolean = false): void => {
        const {limit, initialLoading} = state;
        getChatBots(offset, limit).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            state.chatBots.records = data.result.records || [];
            state.chatBots.count = data.result.count || 0;

            if (initialLoading) {
                state.initialLoading = false;
            }

            if (isPaging) {
                state.request.pagination = false;
                state.offset = offset;
            }

            if (this.componentState) {
                this.setState(state);
            }

        }).catch(e => {
            console.log(e);
            if (isPaging) {
                state.request.pagination = false;
            }
            if (initialLoading) {
                state.initialLoading = false;
            }
            if (this.componentState) {
                this.setState(state);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not get chatBots for unknown reason",
                    timer: 3000
                });
            }
        });
    };

    handleBotDelete = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {chatBotId} = this.state;
        const newState: IIndexState = {...this.state};
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        for (const item in newState.popup) {
            if (newState.popup.hasOwnProperty(item)) {
                newState.popup[item].show = false;
            }
        }
        this.setState(newState);

        deleteChatBot(chatBotId).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            newState.chatBots.records = newState.chatBots.records.filter(item => item.chatBotId.toString() !== chatBotId.toString());
            newState.chatBots.count--;
            newState.chatBotId = null;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "Chat bot was successfully deleted",
                    id: toastId
                });
            }

        }).catch(error => {
            console.log(error);
            newState.chatBotId = null;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Chat bot is not deleted",
                    id: toastId
                });
            }
        });
    };

    handleModalOpen = (e: React.MouseEvent<HTMLElement>, chatBotId: number): void => {
        e.stopPropagation();
        const newState: IIndexState = {...this.state};
        newState.popup.delete.show = true;
        newState.popup.delete.message = {
            info: "Are you sure you want to delete delete?",
            apply: "Apply",
            cancel: "Cancel",
        };
        newState.chatBotId = chatBotId;
        this.setState(newState);
    };

    handleModalClose = (): void => {
        const newState: IIndexState = {...this.state};
        for (const item in newState.popup) {
            if (newState.popup.hasOwnProperty(item)) {
                newState.popup[item].show = false;
            }
        }
        newState.popup.delete.message = null;
        newState.chatBotId = null;
        this.setState(newState);
    };

    handleListChange = (e: React.MouseEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const {offset} = this.state;
        const newState: IIndexState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.pagination = true;
        this.setState(newState);
        this.initRequests(newState, currentOffset, true);
    };

    handleEditChatBot = (chatBotId: number): void => {
        if (chatBotId) {
            try {
                const {history} = this.props;
                history.push(`/chat-bots/${chatBotId}`)
            } catch (e) {
                console.log(e);
            }
        }
    };

    render(): JSX.Element {
        const {offset, limit, chatBots, popup, request: {pagination}, initialLoading} = this.state;

        return (
            <div className="box-shadow r-3x bg-white">
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl padder-t-3">{PAGE_NAME["/chat-bots"]}</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <div className="text-right">
                                    <Link
                                        to={"/chat-bots/create"}
                                        className="btn btn-default btn-addon"
                                    ><i className="fa fa-plus"/>New
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {initialLoading ? <Loading/> :
                    <Table
                        hover={true}
                        condensed={true}
                        responsive={true}
                    >
                        <thead>
                        <tr>
                            <th/>
                            <th>Name</th>
                            <th>Created at</th>
                            <th>Updated at</th>
                            <th/>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            chatBots.records.length === 0 &&
                            <tr>
                                <td colSpan={5}>No result</td>
                            </tr>
                        }

                        {chatBots.records.map((chatBot, index) => {
                            const N: number = offset * limit + index + 1;
                            const deleteChatBot: any = (e: React.MouseEvent<HTMLElement>) => this.handleModalOpen(e, chatBot.chatBotId);
                            const editChatBot: any = () => this.handleEditChatBot(chatBot.chatBotId);
                            return (
                                <tr key={N} className="cursor-pointer" onClick={editChatBot}>
                                    <td>{N}</td>
                                    <td>{chatBot.name}</td>
                                    <td>{format(parse(chatBot.createdAt), "DD MMM YYYY hh:mm A")}</td>
                                    <td>{chatBot.updatedAt ? format(parse(chatBot.createdAt), "DD MMM YYYY hh:mm A") : "Never"}</td>
                                    <td>
                                        <MoreActions
                                            isDropup={(index === chatBots.records.length - 1) && chatBots.records.length !== 1}
                                            isAbsolute={true}
                                        >
                                            <li>
                                                <Link
                                                    to={`/chat-bots/${chatBot.chatBotId}`}
                                                >Edit
                                                </Link>
                                            </li>
                                            <li>
                                                <a href="javascript:void(0);" onClick={deleteChatBot}>
                                                    Delete
                                                </a>
                                            </li>
                                        </MoreActions>

                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </Table>}

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            {
                                !initialLoading && chatBots.count > limit &&
                                <div>
                                    <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6">
                                        <span className="text-xs">{`Showing ${limit} of ${chatBots.count}`}</span>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                        <Pagination
                                            offset={offset}
                                            limit={limit}
                                            disabled={pagination}
                                            length={chatBots.records.length}
                                            callback={this.handleListChange}
                                        />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>

                <Popup
                    show={popup.delete.show}
                    message={popup.delete.message}
                    hideModal={this.handleModalClose}
                    confirmAction={this.handleBotDelete}
                />
            </div>
        );
    }
}

export default Index;
