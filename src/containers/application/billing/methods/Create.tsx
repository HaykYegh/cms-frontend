"use strict";

import * as React from "react";
import Select from "react-select";
import {connect} from "react-redux";
import Form from "react-bootstrap/es/Form";
import {ToastContainer} from "react-toastify";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import {StripeProvider, Elements, injectStripe, CardElement} from "react-stripe-elements";

import {addCreditCard, getPaymentConfig} from "ajaxRequests/billing";
import {validateNumber, isNumeric} from "helpers/DataHelper";
import {ISelect, IVALIDATION} from "services/interface";
import {selectMenuStyles, showNotification} from "helpers/PageHelper";
import selector, {IStoreProps} from "services/selector";
import Checkbox from "react-bootstrap/es/Checkbox";

interface ICreateState {
    stripe: any,
    model: any,
    validation: {
        card: IVALIDATION
        cardholderName: IVALIDATION
        streetAddress: IVALIDATION
        city: IVALIDATION
        stateOrRegion: IVALIDATION
        country: IVALIDATION
        phoneNumber: IVALIDATION
        zipCode: IVALIDATION
    },
    request: {
        disabled: boolean,
        processing: boolean,
        complete: boolean,
    },
    stripeInstance: boolean,

}

interface ICreateProps extends IStoreProps {
    isFirstCard?: boolean,
    history?: any,
    getCreditCards: () => void,
    goBack: (e: React.MouseEvent<HTMLAnchorElement>) => void,
}

class Create extends React.Component<ICreateProps, ICreateState> {

    cardRef: any = null;

    componentState: boolean = true;

    constructor(props: ICreateProps) {
        super(props);
        this.state = {
            stripe: null,
            request: {
                disabled: true,
                processing: false,
                complete: false,
            },
            stripeInstance: false,
            model: {
                card: null,
                cardholderName: "",
                streetAddress: "",
                city: "",
                stateOrRegion: "",
                country: null,
                phoneNumber: {
                    phone: "",
                    countryCode: "",
                    isValid: false
                },
                zipCode: "",
                isDefaultCard: false,
            },
            validation: {
                card: {
                    value: null,
                    message: ""
                },
                cardholderName: {
                    value: null,
                    message: ""
                },
                streetAddress: {
                    value: null,
                    message: ""
                },
                city: {
                    value: null,
                    message: ""
                },
                stateOrRegion: {
                    value: null,
                    message: ""
                },
                country: {
                    value: null,
                    message: ""
                },
                phoneNumber: {
                    value: null,
                    message: ""
                },
                zipCode: {
                    value: null,
                    message: ""
                }
            },
        }
    }

    componentWillMount(): void {
        document.title = "Add new card";
    }

    componentDidMount(): void {
        (async (): Promise<any> => {
            const config: any = await getPaymentConfig();
            if (config.data.err) {
                throw new Error(JSON.stringify(config.data));
            }
            const newState: ICreateState = this.state;
            if ((window as any).Stripe) {
                newState.stripe = (window as any).Stripe(config.data.result.publicKey);
            } else {
                document.querySelector("#stripe-js").addEventListener("load", () => {
                    // Create Stripe instance once Stripe.js loads
                    newState.stripe = (window as any).Stripe(config.data.result.publicKey);
                });
            }
            newState.stripeInstance = !!newState.stripe;

            this.setState(newState);
        })().catch(e => {
            console.log(e);
            showNotification("error", {
                title: "You got an error!",
                description: "Can not get config",
                timer: 3000,
                hideProgress: true
            });
        })
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>): Promise<any> => {
        event.preventDefault();
        const {model, stripe, request: {disabled, processing}} = this.state;
        const {getCreditCards} = this.props;
        if (stripe && !disabled) {
            const tokenToastId: number = showNotification("info", {
                title: "Processing...",
                description: "",
            });
            const newState: ICreateState = this.state;

            try {
                newState.request.processing = true;
                this.componentState && this.setState(newState);

                const cardDetails: any = {
                    address_line1: model.streetAddress,
                    // address_city: model.city,
                    // address_state: model.stateOrRegion,
                    address_country: model.country.region_code,
                    address_zip: model.zipCode,
                    name: model.cardholderName.toUpperCase()
                };
                const payload: any = await stripe.createToken(this.cardRef, cardDetails);
                const {token} = payload;

                showNotification("success", {
                    title: "Success!",
                    description: "Successfully generate token",
                    id: tokenToastId
                });
                const cardToastId: number = showNotification("info", {
                    title: "Adding...",
                    description: "",
                });

                try {
                    // Todo Add isDefaultCard property
                    const result: any = await addCreditCard({token});

                    if (!result.data.err && result.data.result.created) {
                        if (this.componentState) {
                            showNotification("success", {
                                title: "Success!",
                                description: "Successfully added credit card",
                                id: cardToastId
                            });
                            getCreditCards();
                        }

                    } else {
                        showNotification("error", {
                            title: "You got an error!",
                            description: "Can not add credit card for unknown reason",
                            id: cardToastId
                        });
                        newState.request.processing = false;
                    }

                } catch (e) {
                    console.log(e);
                    showNotification("error", {
                        title: "You got an error!",
                        description: "Can not add credit card for unknown reason",
                        id: cardToastId
                    });
                    newState.request.processing = false;
                }
            } catch (e) {
                console.log(e);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not generate token for unknown reason",
                    id: tokenToastId
                });
                newState.request.processing = false;
            }
            this.componentState && this.setState(newState);
        }
    };

    handleCardChange = (change: any): void => {
        const newState: ICreateState = this.state;
        newState.request.complete = change.complete;
        newState.validation.card.value = change.complete ? "success" : "error";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleInputChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: ICreateState = {...this.state};
        if (name === "phoneNumber") {
            let valueForValidate: string = value;
            if (isNumeric(valueForValidate) && valueForValidate.substr(0, 1) !== "+") {
                valueForValidate = "+" + valueForValidate.toString();
            }

            const {isValid, phone, countryCode} = validateNumber(valueForValidate);

            newState.validation[name].value = isValid ? "success" : "error";
            newState.model.phoneNumber = {
                phone: isValid ? phone : value,
                countryCode,
                isValid
            };
        } else {
            newState.model[name] = value;
            newState.validation[name].value = value ? "success" : "error";
        }
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleCountryChange = (value: ISelect): void => {
        const selection: any = value;
        const newState: ICreateState = {...this.state};
        newState.validation.country.value = value ? "success" : "error";
        newState.model.country = (selection);
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleDefaultCardChange = ({currentTarget: {checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const {isFirstCard} = this.props;
        if (isFirstCard) {
            return;
        }
        const newState: ICreateState = {...this.state};
        newState.model.isDefaultCard = checked;
        this.setState(newState);
    };

    handleToggleDisabled = (state: ICreateState): void => {
        state.request.disabled = !(state.model.cardholderName && state.model.streetAddress && state.model.country &&
            state.request.complete && !state.request.processing
        );
    };

    handleCardReady = (StripeElement: any): void => {
        this.cardRef = StripeElement;
    };

    render(): JSX.Element {
        const {stripe, model, validation, request: {disabled, processing}, stripeInstance} = this.state;
        const {isFirstCard, countries, goBack} = this.props;
        const createOptions: any = () => {
            return {
                style: {
                    base: {
                        "fontSize": "16px",
                        "fontWeight": "100",
                        "fontFamily": "'Source Sans Pro', sans-serif",
                        "::placeholder": {
                            color: "#a3a3a3",
                        },
                    },
                    invalid: {
                        color: "#f05050",
                    },
                    complete: {
                        color: "#1d9d74",
                    }
                },
            };
        };

        return (
            <div className="">
                {
                    !isFirstCard &&
                    <div className="col-lg-12">
                        <a href="javascript:void(0)" onClick={goBack} className="text-info">
                            <i className="fa fa-chevron-left text-xmd m-r-xs"/>
                            Go back
                        </a>
                    </div>
                }
                <div className="col-lg-offset-2 col-lg-8">
                    <StripeProvider stripe={stripe}>
                        <Elements>
                            <Form onSubmit={this.handleSubmit}>
                                <div className="col-lg-12">
                                    <h4>Add New Card</h4>
                                    <p>Your card will not be charged at this time. It will be kept on file and will be used as the default for future charges</p>
                                </div>
                                {/*Card details*/}
                                <div className="col-lg-12">
                                    <FormGroup validationState={validation.card.value}>
                                        {stripeInstance ?
                                            <CardElement
                                                hidePostalCode={false}
                                                onChange={this.handleCardChange}
                                                onReady={this.handleCardReady}
                                                {...createOptions()}
                                            /> : <FormControl
                                                placeholder="Card number"
                                                className="form-control inactive"
                                            />
                                        }
                                    </FormGroup>
                                </div>
                                {/*Card holder name*/}
                                <div className="col-lg-12">
                                    <FormGroup validationState={validation.cardholderName.value}>
                                        <FormControl
                                            name="cardholderName"
                                            placeholder="Cardholder name"
                                            onChange={this.handleInputChange}
                                        />
                                    </FormGroup>
                                </div>

                                {/*Street Address*/}
                                <div className="col-lg-12">
                                    <FormGroup validationState={validation.streetAddress.value}>
                                        <FormControl
                                            name="streetAddress"
                                            placeholder="Street address"
                                            onChange={this.handleInputChange}
                                        />
                                    </FormGroup>
                                </div>

                                {/*Country*/}
                                <div className="col-lg-12">
                                    <FormGroup validationState={validation.country.value}>
                                        <Select
                                            placeholder="Country"
                                            styles={selectMenuStyles}
                                            closeMenuOnSelect={true}
                                            isDisabled={false}
                                            value={model.country}
                                            options={countries}
                                            onChange={this.handleCountryChange}
                                        />
                                    </FormGroup>
                                </div>

                                {/*Default card*/}
                                <div className="col-lg-12">
                                    <FormGroup>
                                        <Checkbox
                                            name="defaultCard"
                                            inline={true}
                                            checked={isFirstCard || model.isDefaultCard}
                                            disabled={isFirstCard}
                                            onChange={this.handleDefaultCardChange}
                                        ><span className="font-semi-bold text-md">Default Credit Card</span>
                                        </Checkbox>
                                    </FormGroup>
                                </div>

                                {/*Buttons block*/}
                                <div className="col-lg-12">
                                    <FormGroup>
                                        <button
                                            type="submit"
                                            className="btn btn-info w-full"
                                            disabled={disabled || processing}
                                        >{processing ? <span>Processing <i className="fa fa-spinner fa-spin m-l-sm"/></span> : "Add Credit Card"}
                                        </button>
                                    </FormGroup>
                                </div>
                                <div className="col-lg-12">
                                    <div className="text-center text-muted text-md">
                                        <p className="m-b-none">* All Fields Required</p>
                                        <p>You may see a temporary $1 authorization hold on your card, which your bank should release soon</p>
                                    </div>
                                </div>
                            </Form>
                        </Elements>
                    </StripeProvider>
                    <ToastContainer/>
                </div>
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Create);
