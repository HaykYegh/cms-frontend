"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import {connect} from "react-redux";
import Table from "react-bootstrap/es/Table";

import Pagination from "components/Common/Pagination";
import {getCurrentOffset} from "helpers/DataHelper";
import {showNotification} from "helpers/PageHelper";
import {getOnlineUsers} from "ajaxRequests/users";
import Loading from "components/Common/Loading";
import selector from "services/selector";

interface IOnlineState {
    offset: number,
    limit: number,
    isInitialLoading: boolean,
    onlineUsers: any[],
    request: {
        isPaging: boolean,
        isLoading: boolean,
    },
}

interface IOnlineProps {
    count: number,
}

class Online extends React.Component<IOnlineProps, IOnlineState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            offset: 0,
            limit: 15,
            isInitialLoading: true,
            onlineUsers: [],
            request: {
                isPaging: false,
                isLoading: true,
            },
        };
    }

    componentDidMount(): void {
        const newState: IOnlineState = {...this.state};
        this.initRequests(newState);
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    initRequests: any = (state: any, offset: number = 0, isPaging: boolean = false): void => {
        const {limit} = state;

        getOnlineUsers(offset, limit).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            state.onlineUsers = Object.keys(data.result).map((key: any) => {
                return[key, data.result[key]]
            }) || [];
            state.request.isLoading = false;
            state.isInitialLoading = false;

            if (isPaging) {
                state.offset = offset;
                state.request.isPaging = false;
            }

            if (this.componentState) {
                this.setState(state);
            }

        }).catch(e => {
            console.log(e);
            state.request.isLoading = false;
            state.isInitialLoading = false;

            if (isPaging) {
                state.request.isPaging = false;
            }

            if (this.componentState) {
                this.setState(state);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get online users",
                    timer: 3000,
                });
            }
        });
    };

    handleListChange = async (e: React.MouseEvent<HTMLInputElement>) => {
        const {offset} = this.state;
        const newState: IOnlineState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.isPaging = true;
        newState.request.isLoading = true;
        this.setState(newState);
        this.initRequests(newState, currentOffset, true)
    };

    render(): JSX.Element {
        const {onlineUsers, offset, limit, isInitialLoading, request: {isLoading, isPaging}} = this.state;
        const {count} = this.props;
        return (

            <div>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-4">
                                <span className="text-xlg padder-t-6 block">Online Users</span>
                            </div>
                        </div>
                    </div>
                </div>
                <hr/>

                {/*Online users list*/}
                {isInitialLoading ? <Loading/>
                    :
                    <div className={`${isLoading ? "inactive" : ""}`}>
                        <Table
                            hover={true}
                            condensed={true}
                            responsive={true}
                        >
                            <thead>
                            <tr>
                                <th/>
                                <th>Phone number / Email</th>
                            </tr>
                            </thead>
                            <tbody>
                            {onlineUsers && onlineUsers.length === 0 && <tr>
                                <td colSpan={2}>
                                    <div className="empty">No online users</div>
                                </td>
                            </tr>
                            }
                            {onlineUsers && onlineUsers.length > 0 && onlineUsers.map((item, index) => {
                                const N: number = (offset * limit) + index + 1;
                                return (
                                    <tr key={N}>
                                        <td>{N}</td>
                                        <td>{item[1] ? item[1] : item[0].slice(2)} </td>
                                    </tr>)
                            })}
                            </tbody>
                        </Table>
                    </div>}

                <div className="content-wrapper">
                    <div className="container-fluid">
                        {
                            !isInitialLoading && count > 0 &&
                            <div className={`row ${isLoading ? "inactive" : ""}`}>
                                <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6">
                                    <span className="text-xs">{`${count} entries`}</span>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                    <Pagination
                                        offset={offset}
                                        limit={limit}
                                        callback={this.handleListChange}
                                        length={onlineUsers.length}
                                        disabled={isPaging}
                                        count={count}
                                    />
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Online);
