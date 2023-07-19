"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import Table from "react-bootstrap/es/Table";
import Modal from "react-bootstrap/es/Modal";
import {ToastContainer} from "react-toastify";

import {getCurrentOffset, getStructuredArray} from "helpers/DataHelper";
import {COUNTRIES_SHOW_LIMIT, PAGE_NAME} from "configs/constants";
import {deleteGateway, getGateways} from "ajaxRequests/gateways";
import MoreActions from "components/Common/MoreActions";
import Pagination from "components/Common/Pagination";
import {showNotification} from "helpers/PageHelper";
import Loading from "components/Common/Loading";
import Popup from "components/Common/Popup";
import selector from "services/selector";

interface IGatewaysState {
    offset: number,
    limit: number,
    gateways: any[],
    gatewayId: number,
    popup: any,
    request: {
        loading: boolean,
        pagination: boolean
    }
}

class Gateways extends React.Component<any, IGatewaysState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            offset: 0,
            limit: 20,
            gateways: [],
            gatewayId: null,
            popup: {
                delete: {
                    show: false,
                    message: {}
                },
                more: {
                    show: false,
                    countries: []
                }
            },
            request: {
                loading: true,
                pagination: false
            }
        }
    }

    componentWillMount(): void {
        document.title = PAGE_NAME["/gateways"];
    }

    componentDidMount(): void {
        const newState: IGatewaysState = {...this.state};
        this.initRequest(newState);
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    initRequest = (state: any, offset: number = 0, isPaging: boolean = false): void => {
        const {limit} = state;
        getGateways(offset, limit).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            state.gateways = data.result || [];
            for (const gateway of state.gateways) {
                gateway.countries = getStructuredArray(gateway.countries.split(";"));
            }

            if (isPaging) {
                state.offset = offset;
                state.request.pagination = false;
            }
            state.request.loading = false;

            if (this.componentState) {
                this.setState(state);
            }
        }).catch(e => {
            console.log(e);
            if (this.componentState) {
                state.request.loading = false;
                if (isPaging) {
                    state.request.pagination = false;
                }
                this.setState(state);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Cannot show gateways"
                });
            }
        });
    };

    handleGatewayDelete = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {gatewayId} = this.state;
        const newState: IGatewaysState = {...this.state};
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

        deleteGateway(gatewayId).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            newState.gateways = newState.gateways.filter(item => item.id !== gatewayId);
            newState.gatewayId = null;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "This gateway was deleted",
                    id: toastId
                });
            }
        }).catch(e => {
            console.log(e);
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not delete gateway",
                    id: toastId
                });
            }
        });
    };

    handleShowMoreCountries = (e: React.MouseEvent<HTMLSpanElement>): void => {
        e.stopPropagation();
        const {gateways} = this.state;
        const gatewayId: number = parseInt(e.currentTarget.id);
        const newState: IGatewaysState = {...this.state};
        newState.popup.more.show = true;
        newState.popup.more.countries = gateways.find(item => item.id === gatewayId).countries || [];
        newState.gatewayId = gatewayId;

        this.setState(newState);
    };

    handleModalOpen = (e: React.MouseEvent<HTMLElement>, gatewayId: number): void => {
        e.stopPropagation();
        const newState: IGatewaysState = {...this.state};
        newState.popup.delete.show = true;
        newState.popup.delete.message = {
            info: "Are you sure?",
            apply: "Apply",
            cancel: "Cancel",
        };
        newState.gatewayId = gatewayId;
        this.setState(newState);
    };

    handleModalClose = (): void => {
        const newState: IGatewaysState = {...this.state};
        for (const item in newState.popup) {
            if (newState.popup.hasOwnProperty(item)) {
                newState.popup[item].show = false;
            }
        }
        newState.popup.delete.message = {};
        newState.gatewayId = null;
        this.setState(newState);
    };

    handleListChange = (e: React.MouseEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const {offset} = this.state;
        const newState: IGatewaysState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.pagination = true;
        this.setState(newState);
        this.initRequest(newState, currentOffset);
    };

    handleGatewayEdit = (gatewayId: number): void => {
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
        if (gatewayId) {
            const {history} = this.props;
            history && history.push(`/gateways/${gatewayId}`);
        }
    };

    render(): JSX.Element {
        const {gateways, popup, offset, limit, request: {loading, pagination}} = this.state;
        const {countries, regionCodes, userProfile} = this.props;

        return (
            <div className="box-shadow r-3x bg-white">
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl padder-t-3">{PAGE_NAME["/gateways"]}</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <div className="text-right">
                                    {userProfile.readonly ?
                                        <button
                                            onClick={(e) => {
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
                                            }}
                                            className="btn btn-default btn-addon">
                                        <i className="fa fa-plus"/>Create SIP Thrunk
                                    </button> : <Link
                                        to={"/gateways/create"}
                                        className="btn btn-default btn-addon"
                                    ><i className="fa fa-plus"/>Create SIP Thrunk
                                    </Link>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? <Loading/>
                    :
                    <Table
                        hover={true}
                        condensed={true}
                        responsive={true}
                    >
                        <thead>
                        <tr>
                            <th/>
                            <th>Description</th>
                            <th>Host</th>
                            <th>Dial Prefix</th>
                            <th>Countries</th>
                            <th>Active</th>
                            <th>Pricing markup</th>
                            {!userProfile.readonly && <th/>}
                        </tr>
                        </thead>
                        <tbody>
                        {
                            gateways && gateways.length === 0 &&
                            <tr>
                                <td colSpan={8}>No result</td>
                            </tr>
                        }

                        {gateways && gateways.map((gateway, index) => {
                            const N: number = offset * limit + index + 1;
                            const editGateway: any = () => this.handleGatewayEdit(gateway.id);
                            const deleteGateway: any = (e: React.MouseEvent<HTMLElement>) => this.handleModalOpen(e, gateway.id);
                            const gatewayCountries: string[] = gateway.countries;
                            const showMore: JSX.Element = gatewayCountries.length > COUNTRIES_SHOW_LIMIT ?
                                <span
                                    className="fa fa-info-circle cursor-pointer f-r padder-t-b-xs"
                                    onClick={this.handleShowMoreCountries}
                                    id={gateway.id}
                                /> : null;
                            return (
                                <tr
                                    key={N}
                                    onClick={editGateway}
                                    className="cursor-pointer"
                                >
                                    <td>{N}</td>
                                    <td>{gateway.description}</td>
                                    <td>{gateway.host}</td>
                                    <td>{gateway.dialPrefix}</td>
                                    <td>
                                        {gatewayCountries.length === countries.length && "World wide"}

                                        <div className="flexible">
                                            <div className="flex flex-wrap flex-direction">
                                                {
                                                    gatewayCountries.slice(0, COUNTRIES_SHOW_LIMIT).map((item, index) => {
                                                        return (
                                                            <span key={index}>
                                                                {
                                                                    regionCodes && regionCodes[item] && regionCodes[item].label
                                                                }
                                                            </span>
                                                        )
                                                    })
                                                }
                                            </div>
                                            {showMore}
                                        </div>

                                    </td>
                                    <td>{gateway.active ? "Active" : "Not active"}</td>
                                    <td>( Price * {gateway.param1} ) + {gateway.param2}</td>
                                    {!userProfile.readonly && <td>
                                        <MoreActions
                                            isDropup={(index === gateways.length - 1) && gateways.length !== 1}
                                            isAbsolute={true}
                                        >
                                            <li><Link to={`/gateways/${gateway.id}`}>Edit</Link></li>
                                            <li>
                                                <a href="javascript:void(0);" onClick={deleteGateway}>
                                                    <span>Delete</span>
                                                </a>
                                            </li>
                                        </MoreActions>
                                    </td>}
                                </tr>
                            )
                        })}
                        </tbody>
                    </Table>}

                {gateways && gateways.length > 0 && <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <Pagination
                                    offset={offset}
                                    limit={limit}
                                    callback={this.handleListChange}
                                    data={gateways}
                                    disabled={pagination}
                                />
                            </div>
                        </div>
                    </div>
                </div>}
                <Popup
                    show={popup.delete.show}
                    message={popup.delete.message}
                    hideModal={this.handleModalClose}
                    confirmAction={this.handleGatewayDelete}
                />

                <Modal
                    show={popup.more.show}
                    onHide={this.handleModalClose}
                    bsSize="lg"
                ><Modal.Header closeButton={true}>
                    <span className="text-xlg">Countries</span>
                </Modal.Header>
                    <Modal.Body>
                        <Table
                            className="bg-white box-shadow m-b-none"
                            hover={true}
                            condensed={true}
                            responsive={true}
                        >
                            <thead>
                            <tr>
                                <th/>
                                <th>Country</th>
                            </tr>
                            </thead>
                            <tbody>

                            {popup.more.countries.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{regionCodes[item] ? regionCodes[item].label : ""}</td>
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

export default connect(mapStateToProps, mapDispatchToProps)(Gateways);
