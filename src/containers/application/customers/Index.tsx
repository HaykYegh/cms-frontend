"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import Table from "react-bootstrap/es/Table";
import {ToastContainer} from "react-toastify";

import {getCustomerList, getCustomerCount} from "ajaxRequests/customers"
import MoreActions from "components/Common/MoreActions";
import Pagination from "components/Common/Pagination";
import {showNotification} from "helpers/PageHelper";
import {getCurrentOffset} from "helpers/DataHelper";
import Loading from "components/Common/Loading";
import {PAGE_NAME} from "configs/constants";

interface IIndexState {
    isInitialLoading: boolean,
    count: number,
    offset: number,
    limit: number,
    customers: any,
    popup: any,
    request: {
        isPaging: boolean,
        isLoading: boolean,
        isProcessing: boolean,
        isDisabled: boolean,
    },
}

class Index extends React.Component<any, IIndexState> {

    isComponentMounted: boolean = true;

    constructor(props: any) {
        super(props);

        this.state = {
            isInitialLoading: true,
            count: null,
            offset: 0,
            limit: 20,
            customers: [],
            popup: {
                show: true
            },
            request: {
                isPaging: false,
                isLoading: false,
                isProcessing: false,
                isDisabled: true,
            },
        }
    }

    componentDidMount(): void {
        document.title = PAGE_NAME["/customers"];
        const newState: IIndexState = {...this.state};
        this.initRequests(newState);
    }

    initRequests = (state: IIndexState, offset: number = 0, isPaging: boolean = false): void => {
        const {limit, isInitialLoading} = state;

        getCustomerCount().then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data))
            }
            state.count = data.result.count;

            if (this.isComponentMounted) {
                this.setState(state);
            }
        }).catch(e => console.log(e));

        getCustomerList(offset, limit).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            if (isInitialLoading) {
                state.isInitialLoading = false;
            }

            if (isPaging) {
                state.request.isPaging = false;
                state.offset = offset;
            }

            state.customers = data.result || [];

            if (this.isComponentMounted) {
                this.setState(state);
            }
        }).catch(e => {
            console.log(e);
            if (this.isComponentMounted) {
                if (isInitialLoading) {
                    state.isInitialLoading = false;
                }

                if (isPaging) {
                    state.request.isPaging = false;
                }
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get customers",
                    timer: 3000
                });
                this.setState(state);
            }
        })
    };

    handleAddCustomerModalOpen = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const newState: IIndexState = {...this.state};
        newState.popup.show = true;
        this.setState(newState);
    };

    handleAddCustomerModalClose = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const newState: IIndexState = {...this.state};
        newState.popup.show = false;
        this.setState(newState);
    };

    handleCustomerListChange = (e: React.MouseEvent<HTMLInputElement>): void => {
        const {offset} = this.state;
        const newState: IIndexState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.isPaging = true;
        this.setState(newState);
        this.initRequests(newState, currentOffset, true);
    };

    render(): JSX.Element {
        const {isInitialLoading, customers, limit, offset, popup, request: {isPaging}, count} = this.state;

        return (
            <div className="box-shadow r-3x bg-white">
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl padder-t-3">{PAGE_NAME["/customers"]}</span>
                            </div>
                            {/*<div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">*/}
                            {/*    <div className="text-right">*/}
                            {/*        <button className="btn btn-default btn-addon" onClick={this.handleAddCustomerModalOpen}>*/}
                            {/*            <i className="fa fa-plus"/>Add Customer*/}
                            {/*        </button>*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                        </div>
                    </div>
                </div>

                {isInitialLoading ? <Loading/> :
                    <Table
                        hover={true}
                        condensed={true}
                        responsive={true}
                    >
                        <thead>
                        <tr>
                            <th/>
                            <th>Name</th>
                            <th>Currency</th>
                            <th>Number</th>
                            {/*<th/>*/}
                        </tr>
                        </thead>
                        <tbody>
                        {
                            customers && customers.length === 0 &&
                            <tr>
                                <td colSpan={4}>No results</td>
                            </tr>
                        }
                        {
                            customers && customers.map((customer, index) => {
                                const N: number = offset * limit + index + 1;
                                return (
                                    <tr key={N} className="cursor-pointer">
                                        <td>{N}</td>
                                        <td>{customer.name}</td>
                                        <td>{customer.currency}</td>
                                        <td>{customer.number ? customer.number : "Number is  missing"}</td>
                                        {/*<td>*/}
                                        {/*    <MoreActions*/}
                                        {/*        isDropup={(index === customers.length - 1) && customers.length > 2}*/}
                                        {/*        isAbsolute={true}*/}
                                        {/*    >*/}
                                        {/*        <li>*/}
                                        {/*            <a href="javascript:void(0);" onClick={updateCustomer}>*/}
                                        {/*                Update Provider*/}
                                        {/*            </a>*/}
                                        {/*        </li>*/}
                                        {/*        <li>*/}
                                        {/*            <a href="javascript:void(0);" onClick={deleteCustomer}>*/}
                                        {/*                Attach Country*/}
                                        {/*            </a>*/}
                                        {/*        </li>*/}
                                        {/*    </MoreActions>*/}
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
                                !isInitialLoading && count > limit &&
                                <div>
                                    <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6">
                                        <span className="text-xs">{`${count} entries`}</span>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                        <Pagination
                                            offset={offset}
                                            limit={limit}
                                            callback={this.handleCustomerListChange}
                                            length={customers.length}
                                            disabled={isPaging}
                                            count={count}
                                        />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Index;
