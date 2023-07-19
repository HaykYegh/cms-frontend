"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import Table from "react-bootstrap/es/Table";
import {ToastContainer} from "react-toastify";

import {deleteUserFromNetwork, getUsersFromNetwork} from "ajaxRequests/network";
import Loading from "components/Common/Loading";
import {showNotification} from "helpers/PageHelper";
import Popup from "components/Common/Popup";
import Pagination from "components/Common/Pagination";
import {getCurrentOffset} from "helpers/DataHelper";

interface IUsersState {
    offset: number,
    limit: number,
    users: {
        count: number,
        list: any[]
    },
    loading: boolean,
    userId: number
    request: {
        remove: {
            processing: boolean
        },
        pagination: boolean
    },
    popup: {
        show: boolean
    }
}

interface IUsersProps {
    networkId: any,
    networkName: string
}

class Users extends React.Component<IUsersProps, IUsersState> {

    componentState: boolean = true;

    constructor(props: IUsersProps) {
        super(props);
        this.state = {
            loading: true,
            offset: 0,
            limit: 20,
            users: {
                count: 0,
                list: []
            },
            userId: null,
            request: {
                remove: {
                    processing: false
                },
                pagination: false
            },
            popup: {
                show: false
            }
        }
    }

    componentDidMount(): void {
        const newState: IUsersState = {...this.state};
        this.initRequests(newState);
    }

    initRequests = (state: any, offset: number = 0): void => {
        const {networkId} = this.props;
        const {limit} = state;
        getUsersFromNetwork(networkId, offset, limit).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            state.users.list = data.result.records || [];
            state.users.count = data.result.count || 0;
            state.loading = false;
            state.request.pagination = false;
            state.offset = offset;
            if (this.componentState) {
                this.setState(state);
            }
        }).catch(e => {
            console.log(e);
            state.loading = false;
            state.request.pagination = false;
            if (this.componentState) {
                this.setState(state);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not get network users",
                    timer: 3000
                });
            }
        });
    };

    handleModalClose = (): any => {
        const newState: IUsersState = {...this.state};
        newState.popup.show = false;
        newState.userId = null;
        this.setState(newState);
    };

    handleModalOpen = (userId: number): any => {
        const newState: IUsersState = {...this.state};
        newState.popup.show = true;
        newState.userId = userId;
        this.setState(newState);
    };

    handleUserDelete = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {networkId} = this.props;
        const {userId} = this.state;
        const newState: IUsersState = {...this.state};

        newState.popup.show = false;
        newState.request.remove.processing = true;
        this.setState(newState);
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        deleteUserFromNetwork(networkId, userId).then(({data}: AxiosResponse) => {
            if (data.err || !data.result.kick) {
                throw new Error(JSON.stringify(data));
            }

            newState.users.list = newState.users.list.filter(item => item.userId !== userId);
            newState.users.count--;
            newState.request.remove.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "Successfully deleted user from network",
                    id: toastId
                });
            }
        }).catch(e => {
            console.log(e);
            newState.request.remove.processing = false
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not remove user from network for unknown reason",
                    id: toastId
                });
            }
        });
    };

    handleListChange = (e: React.MouseEvent<HTMLButtonElement>): void => {
        const {offset} = this.state;
        const newState: IUsersState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.pagination = true;
        this.setState(newState);
        this.initRequests(newState, currentOffset);
    };

    render(): JSX.Element {
        const {loading, request, users, offset, limit, popup} = this.state;
        const {networkName} = this.props;
        const popupMessage: any = popup.show ? {
            info: "Are you sure you want to delete?",
            apply: "Apply",
            cancel: "Cancel",
        } : {};
        return (

            <div>
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <span className="text-lg m-b-md block">Joined users{networkName === "" ? "" : ` from ${networkName}`}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? <Loading/> :
                    <Table
                        hover={true}
                        condensed={true}
                        responsive={true}
                    >
                        <thead>
                        <tr>
                            <th/>
                            <th>Full name</th>
                            <th>Number</th>
                            <th/>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            users.list.length === 0 &&
                            <tr>
                                <td colSpan={4}>No result</td>
                            </tr>
                        }
                        {
                            users.list.map((user, index) => {
                                const N: number = offset * limit + index + 1;
                                const deleteUser: any = () => this.handleModalOpen(user.userId);
                                return (
                                    <tr key={N}>
                                        <td>{N}</td>
                                        <td>{user.firstName + " " + user.lastName}</td>
                                        <td>{user.number}</td>
                                        <td>
                                            <div className="flex">
                                                <button
                                                    disabled={request.remove.processing}
                                                    className="btn btn-default btn-xs m-l-xs"
                                                    onClick={deleteUser}
                                                ><i className="fa fa-close"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>

                    </Table>}

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            {
                                !loading && users.count > limit &&
                                <div>
                                    <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6">
                                        <span className="text-xs">{`Showing 1 to ${limit} of ${users.count} entries`}</span>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                        <Pagination
                                            offset={offset}
                                            limit={limit}
                                            callback={this.handleListChange}
                                            length={users.list.length}
                                            disabled={request.pagination}
                                        />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <Popup
                    show={popup.show}
                    message={popupMessage}
                    hideModal={this.handleModalClose}
                    confirmAction={this.handleUserDelete}
                />
            </div>
        );
    }
}

export default Users;
