"use strict";

import * as React from "react";
import {ToastContainer} from "react-toastify";
import Button from "react-bootstrap/es/Button";

import {getCreditCards, removeCreditCard, setDefaultCreditCard} from "ajaxRequests/billing";
import Create from "containers/application/billing/methods/Create";
import {isCreditCardExpire} from "helpers/DataHelper";
import PageLoader from "components/Common/PageLoader";
import {showNotification} from "helpers/PageHelper";
import {CREDIT_CARD_TYPES} from "configs/constants";
import Popup from "components/Common/Popup";
import Table from "react-bootstrap/es/Table";

interface IIndexState {
    offset: number,
    limit: number,
    creditCards: any[],
    cardId: number,
    popup: {
        remove: {
            show: boolean
        }
    },
    request: {
        processing: boolean,
        remove: {
            disable: boolean,
            processing: boolean
        },
        addNewCard: boolean,
        loading: boolean,
    }
}

class Index extends React.Component<any, IIndexState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            offset: 0,
            limit: 10,
            creditCards: [],
            cardId: null,
            popup: {
                remove: {
                    show: false
                }
            },
            request: {
                processing: false,
                remove: {
                    disable: false,
                    processing: false,
                },
                loading: true,
                addNewCard: false,
            }
        }
    }

    componentDidMount(): void {
        const {offset, limit} = this.state;
        const newState: IIndexState = {...this.state};
        this.initRequests(offset, limit, newState);
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    initRequests = (offset: number, limit: number, state: any): void => {
        (async (): Promise<any> => {
            const response: any = await getCreditCards(offset, limit);

            if (response.data.err) {
                throw new Error(JSON.stringify(response.data));
            }
            state.creditCards = response.data.result || [];
            state.request.loading = false;
            state.request.addNewCard = state.creditCards.length === 0;
            this.componentState && this.setState(state);
        })().catch(e => {
            console.log(e);
            if (this.componentState) {
                state.request.loading = false;
                state.request.addNewCard = false;
                this.setState(state);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not get credit cards for unknown reason",
                    timer: 3000,
                    hideProgress: true
                });
            }
        });
    };

    handleGetCreditCards = (): void => {
        const {offset, limit} = this.state;
        const newState: IIndexState = {...this.state};
        newState.request.loading = true;
        this.setState(newState);
        this.initRequests(offset, limit, newState);
    };

    handleModalOpen = (id: number): void => {
        const newState: IIndexState = {...this.state};
        newState.cardId = id;
        newState.popup.remove.show = true;
        this.setState(newState);
    };

    handleModalClose = (): void => {
        const newState: IIndexState = {...this.state};
        newState.popup.remove.show = false;
        newState.cardId = null;
        this.setState(newState);
    };

    handleCardRemove = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const newState: IIndexState = {...this.state};
        newState.request.remove.processing = true;
        newState.request.processing = true;
        newState.popup.remove.show = false;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Deleting...",
            description: "",
        });

        (async (): Promise<any> => {
            const {cardId, creditCards} = this.state;
            const response: any = await removeCreditCard(cardId);
            if (response.data.err || !response.data.result.deleted) {
                throw new Error(JSON.stringify(response.data));
            }

            newState.creditCards = creditCards.filter(item => item.cardId !== cardId);
            newState.cardId = null;
            newState.request.remove.processing = false;
            newState.request.processing = false;
            if (this.componentState) {
                showNotification("success", {
                    title: "Success!",
                    description: "Credit card successfully deleted",
                    id: toastId
                });
                this.setState(newState);
            }
        })().catch(e => {
            console.log(e);
            if (this.componentState) {
                newState.cardId = null;
                newState.request.remove.processing = false;
                newState.request.processing = false;
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not remove credit card for unknown reason",
                    id: toastId
                });
            }
        })
    };

    handleMakeDefault = (cardId: number): void => {
        const newState: IIndexState = {...this.state};
        newState.request.processing = true;
        newState.cardId = cardId;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        (async (): Promise<any> => {
            const response: any = await setDefaultCreditCard(cardId);
            if (response.data.err) {
                throw new Error(JSON.stringify(response.data));
            }

            for (const item of newState.creditCards) {
                item.isDefault = item.cardId === cardId;
            }

            newState.cardId = null;
            newState.request.processing = false;
            if (this.componentState) {
                showNotification("success", {
                    title: "Success!",
                    description: "Credit card successfully make default",
                    id: toastId
                });
                this.setState(newState);
            }
        })().catch(e => {
            console.log(e);
            if (this.componentState) {
                newState.cardId = null;
                newState.request.processing = false;
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not set credit card to default for unknown reason",
                    id: toastId
                });
            }
        })
    };

    handleAddCreditCard = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const newState: IIndexState = {...this.state};
        newState.request.addNewCard = true;
        this.setState(newState);
    };

    handleGoBack = (e: React.MouseEvent<HTMLAnchorElement>): void => {
        e.preventDefault();
        const newState: IIndexState = {...this.state};
        newState.request.addNewCard = false;
        this.setState(newState);
    };

    render(): JSX.Element {
        const {request: {loading, addNewCard, remove, processing}, popup, cardId, creditCards, offset, limit} = this.state;
        const isFirstCard: boolean = creditCards.length === 0;
        const popupMessage: any = popup.remove.show ? {
            info: "Are you sure you want to remove the credit card?",
            apply: "OK",
            cancel: "Cancel",
        } : {};

        return (
            <div className="row">
                {addNewCard ?
                    <Create
                        isFirstCard={isFirstCard}
                        getCreditCards={this.handleGetCreditCards}
                        goBack={this.handleGoBack}
                    />
                    :
                    <div className="col-lg-12">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                <span className="text-lg m-b-md block">Added Credit Cards</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12 text-right">
                                <Button
                                    className="btn btn-default m-b-md"
                                    onClick={this.handleAddCreditCard}
                                >Add Credit Card
                                </Button>
                            </div>
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                {loading ? <PageLoader showBtn={false}/> :
                                    <Table
                                        hover={true}
                                        condensed={true}
                                        responsive={true}
                                    >
                                        <tbody>
                                        {
                                            creditCards.length === 0 &&
                                            <tr>
                                                <td colSpan={6}>No result</td>
                                            </tr>
                                        }
                                        {creditCards.map((item, index) => {
                                            const N: number = offset * limit + index + 1;
                                            const removeCard: any = () => this.handleModalOpen(item.cardId);
                                            const makeDefault: any = () => this.handleMakeDefault(item.cardId);
                                            const isCardExpire: boolean = isCreditCardExpire(item.card.exp_month, item.card.exp_year);

                                            return (
                                                <tr key={N}>
                                                    <td>
                                                        <img
                                                            src={`assets/images/billing_icons/${CREDIT_CARD_TYPES[item.card.brand]}.svg`}
                                                            alt={item.card.brand}
                                                            className="billing-icon"
                                                        />
                                                    </td>
                                                    <td>{item.card.brand}</td>
                                                    <td>
                                                        <div className="flex-direction">
                                                            <span>xxxx xxxx xxxx xxxx {item.card.last4}</span>
                                                            <span style={{color: `${isCardExpire ? "red" : "black"}`}}>Exp. {item.card.exp_month} / {item.card.exp_year}</span>
                                                        </div>
                                                    </td>
                                                    <td>{item.card.name}</td>
                                                    <td className={processing ? "inactive" : ""}>
                                                        {
                                                            item.isDefault ?
                                                                <span className="text-black font-semi-bold">
                                                                <i className="fa fa-circle m-r-sm" aria-hidden="true"/>Default
                                                            </span> :
                                                                isCardExpire ? "" :
                                                                    <span
                                                                        onClick={makeDefault}
                                                                        className="font-semi-bold text-info cursor-pointer"
                                                                    >Make Default
                                                                    </span>
                                                        }
                                                    </td>
                                                    <td className={processing ? "inactive" : ""}>
                                                        <span
                                                            className="font-semi-bold text-info cursor-pointer"
                                                            onClick={removeCard}
                                                        >{(remove.processing && cardId === item.cardId) ?
                                                            <i className="fa fa-spinner fa-spin"/> :
                                                            item.isDefault ? "" : "Remove"
                                                        }
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        </tbody>
                                    </Table>}
                            </div>
                        </div>
                    </div>}

                <Popup
                    show={popup.remove.show}
                    message={popupMessage}
                    hideModal={this.handleModalClose}
                    confirmAction={this.handleCardRemove}
                />
                <ToastContainer/>
            </div>
        );
    }
}

export default Index;
