"use strict";

import * as React from "react";
import Select from "react-select";
import {AxiosResponse} from "axios";
import {connect} from "react-redux";
import Table from "react-bootstrap/es/Table";
import Modal from "react-bootstrap/es/Modal";
import {ToastContainer} from "react-toastify";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";

import {createCallingCard, getCallingCards} from "ajaxRequests/callingCards";
import {selectMenuStyles, showNotification} from "helpers/PageHelper";
import Pagination from "components/Common/Pagination";
import {getCurrentOffset} from "helpers/DataHelper";
import Loading from "components/Common/Loading";
import {IVALIDATION} from "services/interface";
import {PAGE_NAME} from "configs/constants";
import selector, {IStoreProps} from "services/selector";

interface IIndexState {
    offset: number,
    limit: number,
    initialLoading: boolean,
    callingCards: any,
    isCreated: boolean,
    _countries: any,
    popup: any,
    validation: {
        chargingCard: {
            amount: IVALIDATION
            currency: IVALIDATION
            count: IVALIDATION
        }
    },
    request: {
        pagination: boolean,
        loading: boolean,
        create: {
            disabled: boolean,
            processing: boolean,
        }
    }
}

interface IIndexProps extends IStoreProps {
    userProfile?: any,
}

class Index extends React.Component<IIndexProps, IIndexState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            offset: 0,
            limit: 20,
            initialLoading: true,
            _countries: null,
            callingCards: null,
            isCreated: false,
            validation: {
                chargingCard: {
                    amount: {
                        value: null,
                        message: "",
                    },
                    currency: {
                        value: null,
                        message: "",
                    },
                    count: {
                        value: null,
                        message: "",
                    },
                }
            },
            popup: {
                show: false,
                chargingCard: {
                    amount: "",
                    currency: "",
                    count: "",
                }
            },
            request: {
                pagination: false,
                loading: false,
                create: {
                    disabled: true,
                    processing: false
                }
            }
        }
    }

    componentWillMount(): void {
        document.title = PAGE_NAME["/calling-cards"];
    }

    componentDidMount(): void {
        const newState: IIndexState = {...this.state};
        this.initRequests(newState);
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    componentDidUpdate(prevProps: any, prevState: IIndexState): void {
        const {isCreated} = this.state;
        if (isCreated && prevState.isCreated !== isCreated) {
            const newState: IIndexState = {...this.state};
            this.initRequests(newState, 0, false, true);
        }
    }

    initRequests = (state: IIndexState, offset: number = 0, isPaging: boolean = false, isCreated: boolean = false): void => {
        const {limit, initialLoading} = state;
        getCallingCards(offset, limit).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            state.callingCards = data.result.chargingCards || [];

            if (initialLoading) {
                state.initialLoading = false;
            }

            if (isPaging) {
                state.request.pagination = false;
                state.request.loading = false;
                state.offset = offset;
            }

            if (isCreated) {
                state.request.loading = false;
            }

            if (this.componentState) {
                this.setState(state);
            }
        }).catch(e => {
            console.log(e);
            if (this.componentState) {
                if (initialLoading) {
                    state.initialLoading = false;
                }
                if (isPaging) {
                    state.request.pagination = false;
                    state.request.loading = false;
                }
                if (isCreated) {
                    state.request.loading = false;
                }
                this.setState(state);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Error during getting charging cards",
                    timer: 3000
                });
            }
        });
    };

    handleListChange = (e: React.MouseEvent<HTMLInputElement>): void => {
        const {offset} = this.state;
        const currentOffset: number = getCurrentOffset(offset, e);
        const newState: IIndexState = {...this.state};
        newState.request.pagination = true;
        newState.request.loading = true;
        this.setState(newState);
        this.initRequests(newState, currentOffset, true);
    };

    handleModalOpen = (): void => {
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
        const newState: IIndexState = {...this.state};
        newState.popup.show = true;
        this.setState(newState);
    };

    handleModalClose = (): void => {
        const {popup: {chargingCard}, validation} = this.state;
        const newState: any = {...this.state};
        newState.popup.show = false;
        newState.request.create.disabled = true;
        for (const item in chargingCard) {
            if (chargingCard.hasOwnProperty(item)) {
                newState.popup.chargingCard[item] = "";
            }
        }
        for (const item in validation.chargingCard) {
            if (validation.chargingCard.hasOwnProperty(item)) {
                newState.validation.chargingCard[item] = {
                    value: null,
                    message: "",
                };
            }
        }
        this.setState(newState);
    };

    handleCallingCardAttributesChange = ({currentTarget: {value, name}}: React.ChangeEvent<HTMLInputElement>) => {
        const newState: any = {...this.state};
        newState.popup.chargingCard[name] = value;
        newState.validation.chargingCard[name].value = value === "" ? "error" : null;
        newState.validation.chargingCard[name].message = value === "" ? "Must be not empty" : "";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleCallingCardCurrencyChange = (value: any) => {
        const newState: any = {...this.state};
        newState.popup.chargingCard.currency = value;
        newState.validation.chargingCard.currency.value = value === "" ? "error" : null;
        newState.validation.chargingCard.currency.message = value === "" ? "Must be not empty" : "";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleToggleDisabled = (state: IIndexState): void => {
        state.request.create.disabled = Object.keys(state.popup.chargingCard).some(item => state.popup.chargingCard[item] === "");
    };

    handleSubmit = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {popup} = this.state;
        const newState: IIndexState = {...this.state};

        const chargingCard: any = {
            amount: popup.chargingCard.amount,
            currency: popup.chargingCard.currency.value,
            count: popup.chargingCard.count,
        };
        newState.request.create.processing = true;
        newState.request.loading = true;
        newState.isCreated = false;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        createCallingCard(chargingCard).then(({data}: AxiosResponse) => {

            if (data.err || !data.result.status) {
                throw new Error(JSON.stringify(data.err));

            }

            for (const item in newState.popup.chargingCard) {
                if (newState.popup.chargingCard.hasOwnProperty(item)) {
                    newState.popup.chargingCard[item] = "";
                }
            }
            for (const item in newState.validation.chargingCard) {
                if (newState.validation.chargingCard.hasOwnProperty(item)) {
                    newState.validation.chargingCard[item] = {
                        value: null,
                        message: "",
                    };
                }
            }
            newState.request.create.processing = false;
            newState.popup.show = false;
            newState.isCreated = true;
            if (this.componentState) {
                showNotification("success", {
                    title: "Success!",
                    description: "You have successfully created calling card",
                    id: toastId
                });
                this.setState(newState);
            }
        }).catch(e => {
            console.log(e);
            newState.request.create.processing = false;
            if (this.componentState) {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Error by create calling card for unknown reason",
                    timer: 3000
                });
                this.setState(newState);
            }

        })
    };

    render(): JSX.Element {
        const {callingCards, validation, offset, limit, popup, initialLoading, request: {pagination, create, loading}} = this.state;
        const {currencies} = this.props;
        return (

            <div className="box-shadow r-3x bg-white">
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl padder-t-3">{PAGE_NAME["/calling-cards"]}</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <div className="text-right">
                                    <button
                                        className="btn btn-default btn-addon"
                                        onClick={this.handleModalOpen}
                                    ><i className="fa fa-plus"/>Create card
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {initialLoading ? <Loading /> :
                    <div className={loading ? "inactive" : ""}>
                        <Table
                            hover={true}
                            condensed={true}
                            responsive={true}
                        >
                            <thead>
                            <tr>
                                <th/>
                                <th>Code</th>
                                <th>Amount</th>
                                <th>Currency</th>
                            </tr>
                            </thead>
                            <tbody>
                            {(callingCards && callingCards.length === 0) && <tr>
                                <td colSpan={4}>
                                    <div className="empty">No results found</div>
                                </td>
                            </tr>}

                            {callingCards && callingCards.length > 0 && callingCards.map((card, index) => {
                                const N: number = offset * limit + index + 1;
                                return (
                                    <tr key={N}>
                                        <td>{N}</td>
                                        <td>{card.code}</td>
                                        <td>{card.amount}</td>
                                        <td>{card.currency}</td>
                                    </tr>
                                )
                            })
                            }
                            </tbody>
                        </Table>
                    </div>}

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            {
                                !initialLoading && callingCards && callingCards.length > 0 &&
                                <div>
                                    <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6">
                                        {/*<span className="text-xs hidden">{`Showing 1 to ${limit} of ${chatBots.count} entries`}</span>*/}
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                        <Pagination
                                            offset={offset}
                                            limit={limit}
                                            callback={this.handleListChange}
                                            data={callingCards}
                                            disabled={pagination}
                                        />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <Modal show={popup.show} onHide={this.handleModalClose}>
                    <Modal.Header closeButton={true}>
                        <span className="text-xlg">Create Charging Card</span>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{maxWidth: "650px", margin: "10px auto"}}>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                        <form className="form-horizontal">

                                            <FormGroup validationState={validation.chargingCard.amount.value}>
                                                <label htmlFor="amount" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">Amount</label>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-8">
                                                    <FormControl
                                                        id="amount"
                                                        name="amount"
                                                        pattern="[0-9.]+"
                                                        placeholder="Amount"
                                                        onChange={this.handleCallingCardAttributesChange}
                                                        value={popup.chargingCard.amount}
                                                    />
                                                    <span className="help-block text-muted"/>
                                                </div>
                                            </FormGroup>

                                            <FormGroup validationState={validation.chargingCard.currency.value}>
                                                <label htmlFor="currency" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">
                                                    Currency
                                                </label>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-8">
                                                    <Select
                                                        id="currency"
                                                        name="countries"
                                                        placeholder="Currency"
                                                        styles={selectMenuStyles}
                                                        isMulti={false}
                                                        closeMenuOnSelect={true}
                                                        options={currencies}
                                                        value={popup.chargingCard.currency}
                                                        onChange={this.handleCallingCardCurrencyChange}
                                                    />
                                                    <span className="help-block text-muted"/>
                                                </div>
                                            </FormGroup>

                                            <FormGroup validationState={validation.chargingCard.count.value}>
                                                <label htmlFor="count" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">
                                                    Count
                                                </label>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-8">
                                                    <FormControl
                                                        min="1"
                                                        id="count"
                                                        name="count"
                                                        type="number"
                                                        placeholder="Count"
                                                        onChange={this.handleCallingCardAttributesChange}
                                                        value={popup.chargingCard.count}
                                                    />
                                                    <span className="help-block text-muted"/>
                                                </div>
                                            </FormGroup>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div className="text-right flex-end">
                                        <button
                                            className="btn btn-info"
                                            onClick={this.handleSubmit}
                                            disabled={create.disabled || create.processing}
                                        >Create charging card{create.processing && <i className="fa fa-spin fa-spinner m-l-xs"/>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Index);
