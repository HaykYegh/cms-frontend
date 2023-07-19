"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import Table from "react-bootstrap/es/Table";
import {ToastContainer} from "react-toastify";
import Loading from "components/Common/Loading";
import {showNotification} from "helpers/PageHelper";
import Pagination from "components/Common/Pagination";
import {getCurrentOffset} from "helpers/DataHelper";
import {getChannel} from "ajaxRequests/channel";
import Nav from "react-bootstrap/es/Nav";
import NavItem from "react-bootstrap/es/NavItem";

const PREFIX: string = process.env.APP_PREFIX;

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
    },
    activeKey: any,
}

interface IUsersProps {
    channelId: any,
    channelName: string,
    admins: any[]
}

class Users extends React.Component<IUsersProps, IUsersState> {

    componentState: boolean = true;

    constructor(props: IUsersProps) {
        super(props);
        this.state = {
            loading: true,
            offset: 0,
            limit: 10,
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
            },
            activeKey: 5,
        }
    }

    componentDidMount(): void {
        const newState: IUsersState = {...this.state};
        this.initRequests(newState);
    }

    initRequests = (state: any, offset: number = 0): void => {
        const {channelId} = this.props;
        const {limit} = state;

        getChannel(channelId, offset, limit).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            state.users.list = data.result.memberList || [];
            state.users.count = data.result.memberCount || 0;
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
                    description: "Can not get channel users",
                    timer: 3000
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
        const {channelName} = this.props;
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
                                <span
                                    className="text-lg m-b-md block">Joined users{channelName === "" ? "" : ` from ${channelName}`}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container-fluid no-padder" style={{marginBottom: "20px"}}>
                    <div className="row">
                        <div className="col-lg-12">
                            <Nav
                                bsStyle="pills"
                                justified={true}
                                activeKey={this.state.activeKey}
                            >
                                <NavItem
                                    title="Members"
                                    eventKey={5}
                                    onClick={() => this.setState({activeKey: 5})}
                                >
                                    Members
                                </NavItem>
                                <NavItem
                                    title="Admins"
                                    eventKey={6}
                                    onClick={() => this.setState({activeKey: 6})}
                                >
                                    Admins
                                </NavItem>
                            </Nav>
                        </div>
                    </div>
                </div>

                {loading ? <Loading/> :
                    (this.state.activeKey === 5) && <Table
                    hover={true}
                    condensed={true}
                    responsive={true}
                  >
                    <thead>
                    <tr>
                      <th/>
                      <th>Full name</th>
                      <th>{["el"].includes(PREFIX) ? "Nickname" : "Number / Email"}</th>
                        {/*<th/>*/}
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
                            return (
                                <tr key={N}>
                                    <td>{N}</td>
                                    <td>{user.firstName + " " + user.lastName}</td>
                                    <td>{["el"].includes(PREFIX) ? user.nickname : user.email || user.number}</td>
                                    {/*<td />*/}
                                </tr>
                            )
                        })
                    }
                    </tbody>

                  </Table>}
                {(this.state.activeKey === 6) && !!this.props.admins.length && <Table
                  hover={true}
                  condensed={true}
                  responsive={true}
                >
                  <thead>
                  <tr>
                    <th/>
                    <th>Full name</th>
                    <th>{["el"].includes(PREFIX) ? "Nickname" : "Number / Email"}</th>
                      {/*<th/>*/}
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
                      this.props.admins.map((user, index) => {
                          const N: number = offset * limit + index + 1;
                          return (
                              <tr key={N}>
                                  <td>{N}</td>
                                  <td>{user.firstName + " " + user.lastName}</td>
                                  <td>{["el"].includes(PREFIX) ? user.nickname : user.email || user.number}</td>
                                  {/*<td>*/}
                                  {/*    <div className="flex">*/}
                                  {/*        <button*/}
                                  {/*          disabled={request.remove.processing}*/}
                                  {/*          className="btn btn-default btn-xs m-l-xs"*/}
                                  {/*          onClick={deleteUser}*/}
                                  {/*        ><i className="fa fa-close"/>*/}
                                  {/*        </button>*/}
                                  {/*    </div>*/}
                                  {/*</td>*/}
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
                                !loading && users.count > limit && this.state.activeKey === 5 &&
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
            </div>
        );
    }
}

export default Users;
