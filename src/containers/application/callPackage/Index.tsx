"use strict";

import * as React from "react";
import {Link} from "react-router-dom";
import Table from "react-bootstrap/es/Table";
import {ToastContainer} from "react-toastify";
import Button from "react-bootstrap/es/Button";

import {deleteCallPackage, getCallPackages, updateCallPackage} from "ajaxRequests/callPackages";
import {getCurrentOffset, promiseSelectOptions, setPaginationRange} from "helpers/DataHelper";
import {showNotification} from "helpers/PageHelper";
import {LIST, PAGE_NAME} from "configs/constants";
import {ICallPackage} from "services/interface";
import Loading from "components/Common/Loading";
import Popup from "components/Common/Popup";
import {AxiosResponse} from "axios";
import Pagination from "components/Common/Pagination";
import MoreActions from "components/Common/MoreActions";
import selector, {IStoreProps} from "services/selector";
import {connect} from "react-redux";

interface IIndexState {
    isLoading: boolean,
    callPackages: Array<ICallPackage>,
    offset: number,
    limit: number,
    callPackageId: number,
    request: {
        isPaging: boolean
    },
    popup: {
        isShown: boolean,
        message: any
    }
}

class Index extends React.Component<any, IIndexState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: true,
            callPackages: null,
            offset: 0,
            limit: 20,
            callPackageId: null,
            request: {
                isPaging: false
            },
            popup: {
                isShown: false,
                message: {}
            }
        }
    }

    componentDidMount(): void {
        document.title = PAGE_NAME["/call-package"];
        const {offset} = this.state;
        const newState: IIndexState = {...this.state};
        getCallPackages(offset).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            newState.callPackages = data.result || [];
            newState.isLoading = false;
            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(err => {
            console.log(err);
            newState.isLoading = false;
            if (this.componentState) {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Error when getting call package",
                    timer: 3000
                });
            }
        })
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleModalOpen = (e: React.MouseEvent<HTMLElement>, callPackageId: number): void => {
        e.stopPropagation();
        const newState: IIndexState = {...this.state};
        newState.popup.isShown = true;
        newState.callPackageId = callPackageId;
        newState.popup.message = {
            info: "Are you sure you want to delete?",
            apply: "Apply",
            cancel: "Cancel",
        };
        this.setState(newState);
    };

    handleModalClose = (): void => {
        const newState: IIndexState = {...this.state};
        newState.popup.isShown = false;
        newState.callPackageId = null;
        newState.popup.message = {};
        this.setState(newState);
    };

    handleListChange = async (e: React.MouseEvent<HTMLInputElement>) => {
        e.preventDefault();
        const {offset}: IIndexState = this.state;
        const newState: IIndexState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.isPaging = true;
        this.setState(newState);

        getCallPackages(currentOffset).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            newState.callPackages = data.result || [];
            newState.request.isPaging = false;
            newState.offset = currentOffset;
            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(err => {
            console.log(err);
            newState.request.isPaging = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Error when getting call package",
                    timer: 3000
                });
            }
        })
    };

    handleCallPackageDelete = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {callPackageId, callPackages} = this.state;
        const newState: IIndexState = {...this.state};
        deleteCallPackage(callPackageId).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.callPackages = callPackages.filter(item => item.id !== callPackageId);
            newState.callPackageId = null;
            newState.popup.isShown = false;
            newState.popup.message = {};
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "Call package successfully deleted",
                    timer: 3000
                });
            }
        }).catch(err => {
            console.log(err);
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Your changes is not updated for unknown reason",
                    timer: 3000
                });
            }
        });
    };

    handleUpdateCallPackage = (e: React.MouseEvent<HTMLElement>, callPackageId: number): void => {
        e.preventDefault();
        e.stopPropagation();
        const {history} = this.props;

        history && history.push(`/call-package/${callPackageId}`);

    };

    render(): JSX.Element {
        const {callPackages, isLoading, popup, offset, limit, request: {isPaging}} = this.state;
        const {userProfile} = this.props
        return (

            <div className="box-shadow r-3x bg-white">
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl padder-t-3">{PAGE_NAME["/call-package"]}</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <div className="text-right">
                                    {userProfile.readonly ? <button
                                        onClick={() => {
                                            showNotification("error", {
                                                title: "Read-Only admin",
                                                description: "Read-Only admin: the access to this functionality is restricted for your user role",
                                                timer: 3000,
                                                hideProgress: true
                                            });
                                        }}
                                        className="btn btn-default btn-addon"
                                    ><i className="fa fa-plus"/>
                                        Create Call Package
                                    </button> : <Link
                                        to={"/call-package/create"}
                                        className="btn btn-default btn-addon"
                                    ><i className="fa fa-plus"/>Create Call Package
                                    </Link>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading ? <Loading/>
                    :
                    <Table
                        hover={true}
                        condensed={true}
                        responsive={true}
                    >
                        <thead>
                        <tr>
                            <th/>
                            <th>Name</th>
                            <th>Countries</th>
                            <th>Minutes</th>
                            <th>Days</th>
                            <th>Cost</th>
                            <th/>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            callPackages && callPackages.length === 0 &&
                            <tr>
                                <td colSpan={8}>
                                    <div className="empty">No results found</div>
                                </td>
                            </tr>
                        }
                        {
                            callPackages && callPackages.length > 0 && callPackages.map((item, index) => {
                                const N: number = (offset * limit) + index + 1;
                                const deleteCallPackage: any = (e: React.MouseEvent<HTMLElement>) => this.handleModalOpen(e, item.id);
                                const updateCallPackage: any = (e: React.MouseEvent<HTMLElement>) => this.handleUpdateCallPackage(e, item.id);
                                return (
                                    <tr key={item.id}>
                                        <td>{N}</td>
                                        <td>{item.name}</td>
                                        <td>{item.countryCodes.join(", ")}</td>
                                        <td>{item.minutes}</td>
                                        <td>{item.days}</td>
                                        <td>{item.cost}</td>
                                        <td>
                                            <MoreActions
                                                isDropup={(index === callPackages.length - 1) && callPackages.length !== 1}
                                                isAbsolute={true}
                                            >
                                                <li>
                                                    <a href="javascript:void(0);" onClick={updateCallPackage}>
                                                        <span>Edit</span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="javascript:void(0);" onClick={deleteCallPackage}>
                                                        <span>Delete</span>
                                                    </a>
                                                </li>
                                            </MoreActions>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </Table>
                }

                {callPackages && callPackages.length > 0 &&
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <Pagination
                                    offset={offset}
                                    limit={limit}
                                    callback={promiseSelectOptions(this.handleListChange)}
                                    data={callPackages}
                                    disabled={isPaging}
                                />
                            </div>
                        </div>
                    </div>
                </div>}

                <Popup
                    show={popup.isShown}
                    message={popup.message}
                    hideModal={this.handleModalClose}
                    confirmAction={this.handleCallPackageDelete}
                />
            </div>
        )
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Index);
