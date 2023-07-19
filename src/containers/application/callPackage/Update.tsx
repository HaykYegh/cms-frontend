"use strict";

import * as React from "react";
import Select from "react-select";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import Form from "react-bootstrap/es/Form";
import {ToastContainer} from "react-toastify";
import Button from "react-bootstrap/es/Button";
import HelpBlock from "react-bootstrap/es/HelpBlock";
import Checkbox from "react-bootstrap/es/Checkbox";
import FormGroup from "react-bootstrap/es/FormGroup";
import ControlLabel from "react-bootstrap/es/ControlLabel";
import FormControl from "react-bootstrap/es/FormControl";

import {getCallPackage, updateCallPackage} from "ajaxRequests/callPackages";
import {ICallPackage, ISelect} from "services/interface";
import selector, {IStoreProps} from "services/selector";
import {showNotification} from "helpers/PageHelper";
import {PAGE_NAME} from "configs/constants";

interface IUpdateState {
    loading: boolean,
    processing: boolean,
    callPackageModel: ICallPackage,
    _country: Array<ISelect>,
    validation: any,
}

interface IUpdateProps extends IStoreProps {
    match: any,
}

class Update extends React.Component<IUpdateProps, IUpdateState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            loading: true,
            processing: false,
            callPackageModel: null,
            _country: null,
            validation: {
                country: {
                    value: null,
                    error: ""
                },
                cost: {
                    value: null,
                    error: ""
                },
                minutes: {
                    value: null,
                    error: ""
                },
                days: {
                    value: null,
                    error: ""
                }
            }
        };
    }

    componentWillMount(): void {
        document.title = PAGE_NAME["/call-package/update"];
    }

    componentDidMount(): void {
        const {match: {params}, countries} = this.props;

        if (!!params.id) {
            getCallPackage(params.id).then(response => {
                const newState: any = {...this.state};
                if (!response.data.err) {
                    const callPackageModel: any = response.data.result;
                    newState.callPackageModel = callPackageModel;
                    newState._country = countries.filter(item => callPackageModel.countryCodes.includes(item.region_code));
                } else {
                    showNotification("error", {
                        title: "You got an error!",
                        description: "Error during getting providers",
                        timer: 3000
                    });
                }
                newState.loading = false;
                if (this.componentState) {
                    this.setState(newState);
                }

            }).catch(error => console.log(error));
        }
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleCountryChange = (value: ISelect): void => {
        const selection: any = value;
        const newState: any = {...this.state};
        newState.callPackageModel.countryCodes = selection ? selection.map(item => item.region_code) : "";
        newState.validation.country.value = selection ? "success" : "error";
        newState.validation.country.error = selection ? "" : "Select country";
        newState._country = selection;
        this.setState(newState);
    };

    handleAttributesChange = ({currentTarget: {value, name}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: any = {...this.state};
        const parsedValue: number = parseInt(value);
        const isNumeric: boolean = /^\d+$/.test(value);

        newState.callPackageModel[name] = isNumeric && parsedValue > 0 ? parsedValue : "";
        newState.validation[name].value = isNumeric ? parsedValue > 0 ? "success" : null : "error";
        newState.validation[name].error = isNumeric ? "" : "This field is required or its value is to be number";
        this.setState(newState);

    };

    handlePricingChange = ({currentTarget: {value, name}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: any = {...this.state};
        const parsedValue: number = parseFloat(value);

        newState.callPackageModel[name] = parsedValue > 0 ? parsedValue : "";
        newState.validation[name].value = parsedValue > 0 ? "success" : "error";
        newState.validation[name].error = parsedValue > 0 ? "" : "This field is required or its value is to be number";
        this.setState(newState);
    };

    handleUnlimitedChange = ({currentTarget: {name, checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: any = {...this.state};
        newState.callPackageModel[name] = checked ? 0 : "";
        newState.validation[name] = {
            value: null,
            error: ""
        };
        this.setState(newState);
    };

    handleCheckboxChange = ({currentTarget: {name, checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: any = {...this.state};
        newState.callPackageModel[name] = checked;
        this.setState(newState);
    };

    handelSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        const {callPackageModel} = this.state;

        this.setState({processing: true});

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        updateCallPackage(callPackageModel.id, callPackageModel).then(response => {
            const newState: any = {...this.state};
            if (response.data.result) {
                for (const item in newState.validation) {
                    if (newState.validation.hasOwnProperty(item)) {
                        newState.validation[item] = {
                            value: null,
                            error: ""
                        };
                    }
                }
                showNotification("success", {
                    title: "Success!",
                    description: "Call package is successfully updates",
                    id: toastId
                })

            } else {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Call package is not updated",
                    id: toastId
                });
            }
            newState.processing = false;
            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(err => console.log(err));
    };

    render(): JSX.Element {
        const {loading, callPackageModel, validation, _country, processing} = this.state;
        const {countries} = this.props;
        let disabled: boolean = true;
        if (callPackageModel && Object.keys(callPackageModel).length > 0) {
            disabled = Object.keys(callPackageModel).every(item => callPackageModel[item] !== "");
        }

        return (
            <div className="container-fluid no-padder">
                {/*<div className="row m-b-md">*/}
                    {/*<div className="col-lg-6 col-md-4 col-sm-4 col-xs-4">*/}
                        {/*<span className="text-xsl text-black">{PAGE_NAME["/call-package/update"]}</span>*/}
                    {/*</div>*/}
                {/*</div>*/}
                <div className="row">
                    <div className="col-lg-12">
                        <div className="bg-white box-shadow content-wrapper r-3x">
                            <div className="container-fluid">
                                <div className="row">
                                    {
                                        loading ?
                                            <div className="col-lg-12">
                                                <div className="spinner">
                                                    <div className="double-bounce1"/>
                                                    <div className="double-bounce2"/>
                                                </div>
                                            </div>
                                            :
                                            <div className="col-lg-12">
                                                {callPackageModel && Object.keys(callPackageModel).length > 0 &&
                                                <div className="container-fluid no-padder">
                                                    <Form onSubmit={this.handelSubmit}>

                                                        <div className="row">
                                                            {/*Country*/}
                                                            <div className="col-lg-12">
                                                                <FormGroup validationState={validation.country.value}>
                                                                    <ControlLabel htmlFor="country_id">
                                                                        Country
                                                                    </ControlLabel>
                                                                    <Select
                                                                        closeMenuOnSelect={false}
                                                                        isMulti={true}
                                                                        id="country_id"
                                                                        name="country_id"
                                                                        onChange={this.handleCountryChange}
                                                                        value={_country}
                                                                        options={countries}
                                                                        placeholder="Choose country"
                                                                    />
                                                                    <HelpBlock>{validation.country.error}</HelpBlock>
                                                                </FormGroup>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            {/*Minutes*/}
                                                            <div className="col-lg-4">
                                                                <FormGroup validationState={validation.minutes.value}>
                                                                    <ControlLabel htmlFor="minutes">
                                                                        Minutes
                                                                    </ControlLabel>
                                                                    <FormControl
                                                                        type="number"
                                                                        name="minutes"
                                                                        id="minutes"
                                                                        placeholder="Minutes"
                                                                        value={callPackageModel.minutes === 0 ? "" : callPackageModel.minutes}
                                                                        disabled={callPackageModel.minutes === 0}
                                                                        onChange={this.handleAttributesChange}
                                                                    />
                                                                    <HelpBlock>
                                                                        {validation.minutes.error === "" ?
                                                                            "Example: 100" : validation.minutes.error
                                                                        }
                                                                    </HelpBlock>
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Checkbox
                                                                        disabled={callPackageModel.days === 0}
                                                                        inline={true}
                                                                        name="minutes"
                                                                        checked={callPackageModel.minutes === 0}
                                                                        onChange={this.handleUnlimitedChange}
                                                                    ><span className={callPackageModel.days === 0 ? "text-muted" : "font-bold"}>
                                                                        Unlimited minutes
                                                                    </span>
                                                                    </Checkbox>
                                                                </FormGroup>
                                                            </div>
                                                            {/*Days*/}
                                                            <div className="col-lg-4">
                                                                <FormGroup validationState={validation.days.value}>
                                                                    <ControlLabel htmlFor="days">Active
                                                                        days</ControlLabel>
                                                                    <FormControl
                                                                        type="number"
                                                                        name="days"
                                                                        id="days"
                                                                        placeholder="Days"
                                                                        value={callPackageModel.days === 0 ? "" : callPackageModel.days}
                                                                        disabled={callPackageModel.days === 0}
                                                                        onChange={this.handleAttributesChange}
                                                                    />
                                                                    <HelpBlock>
                                                                        {validation.days.error === "" ?
                                                                            "Example: 30" : validation.days.error
                                                                        }
                                                                    </HelpBlock>
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Checkbox
                                                                        disabled={callPackageModel.minutes === 0}
                                                                        inline={true}
                                                                        name="days"
                                                                        checked={callPackageModel.days === 0}
                                                                        onChange={this.handleUnlimitedChange}
                                                                    ><span className={callPackageModel.minutes === 0 ? "text-muted" : "font-bold"}>
                                                                        Unlimited days
                                                                    </span>
                                                                    </Checkbox>
                                                                </FormGroup>
                                                            </div>
                                                        </div>
                                                        <hr/>
                                                        {/*Pricing*/}
                                                        <div className="row">
                                                            <div className="col-lg-4">
                                                                <p className="text-lg font-bold">Pricing</p>
                                                                <FormGroup validationState={validation.cost.value}>
                                                                    <ControlLabel htmlFor="cost">Package price in
                                                                        USD</ControlLabel>
                                                                    <FormControl
                                                                        type="number"
                                                                        name="cost"
                                                                        id="cost"
                                                                        placeholder="Cost"
                                                                        value={callPackageModel.cost}
                                                                        onChange={this.handlePricingChange}
                                                                    />
                                                                    <HelpBlock>
                                                                        {validation.cost.error === "" ?
                                                                            "Example: 4.99" : validation.cost.error}
                                                                    </HelpBlock>
                                                                </FormGroup>
                                                            </div>
                                                        </div>
                                                        <hr/>
                                                        <div className="row">
                                                            <div
                                                                className="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                                                            >
                                                                <div className="f-l">
                                                                    <FormGroup>
                                                                        <Checkbox
                                                                            name="active"
                                                                            checked={callPackageModel.active}
                                                                            onChange={this.handleCheckboxChange}
                                                                        >Active
                                                                        </Checkbox>
                                                                    </FormGroup>
                                                                </div>
                                                                <div className="f-l m-l-md">
                                                                    <FormGroup>
                                                                        <Checkbox
                                                                            name="top"
                                                                            checked={callPackageModel.isTop}
                                                                            onChange={this.handleCheckboxChange}
                                                                        >Is top
                                                                        </Checkbox>
                                                                    </FormGroup>
                                                                </div>
                                                                <div className="f-r text-right">
                                                                    <Button
                                                                        type="submit"
                                                                        className="btn btn-info f-r m-r-xs"
                                                                        disabled={!disabled || processing}
                                                                    >
                                                                        {processing ?
                                                                            <i className="fa fa-refresh fa-spin m-r-xs"/> : ""}
                                                                        Update
                                                                    </Button>
                                                                    <Link
                                                                        className="text-info"
                                                                        to="/call-package"
                                                                    >
                                                                        <Button
                                                                            type="submit"
                                                                            className="btn btn-default f-r m-r-xs"
                                                                        >Cancel
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Form>
                                                </div>
                                                }
                                            </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ToastContainer/>
            </div>
        )

    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Update);
