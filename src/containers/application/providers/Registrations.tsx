"use strict";

import * as React from "react";
import Select from "react-select";
import {connect} from "react-redux";
import {AxiosResponse} from "axios";
import Modal from "react-bootstrap/es/Modal";
import Table from "react-bootstrap/es/Table";
import {ToastContainer} from "react-toastify";
import ReactCountryFlag from "react-country-flag";
import Checkbox from "react-bootstrap/es/Checkbox";
import FormGroup from "react-bootstrap/es/FormGroup";
import HelpBlock from "react-bootstrap/es/HelpBlock";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {
    deleteAttachedProvider,
    getCountryList,
    getProvidersList,
    setProviders,
    getCountryProviders
} from "ajaxRequests/providers";
import {multiSelectMenuStyles, showNotification} from "helpers/PageHelper";
import MoreActions from "components/Common/MoreActions";
import Pagination from "components/Common/Pagination";
import {getCurrentOffset} from "helpers/DataHelper";
import Loading from "components/Common/Loading";
import {PROVIDERS} from "configs/constants";
import {ISelect} from "services/interface";
import selector from "services/selector";

interface IRegistrationsState {
    isInitialLoading: boolean,
    offset: number,
    limit: number,
    countries: any[],
    providers: any[],
    selectedCountries: any[],
    selectedProviders: any[],
    currentPageData: any[],
    notification: string,
    popup: {
        selectedCountryIds: number[],
        selectedProviderIds: number[],
        selectedCountryName: string,
        offset: number,
        limit: number,
        configure: {
            isShown: boolean,
            isAllCountriesSelected: boolean,
        },
        add: {
            isShown: boolean,
        },
        remove: {
            isShown: boolean,
            attachedOperators: any[],
        }
    },
    request: {
        isLoading: boolean,
        isProcessing: boolean,
    }
}

class Registrations extends React.Component<any, IRegistrationsState> {

    isComponentMounted: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            isInitialLoading: true,
            offset: 0,
            limit: 15,
            countries: [],
            providers: [],
            selectedCountries: [],
            selectedProviders: [],
            currentPageData: [],
            notification: "",
            popup: {
                selectedCountryIds: [],
                selectedProviderIds: [],
                selectedCountryName: "",
                offset: 0,
                limit: 20,
                configure: {
                    isShown: false,
                    isAllCountriesSelected: false
                },
                add: {
                    isShown: false,
                },
                remove: {
                    isShown: false,
                    attachedOperators: [],
                }
            },
            request: {
                isLoading: false,
                isProcessing: false,
            }
        }
    }

    componentDidMount(): void {
        document.title = "Registrations";
        this.initRequest();
    };

    componentWillUnmount(): void {
        this.isComponentMounted = false;
    };

    initRequest = (): void => {
        const {offset, limit} = this.state;
        const newState: IRegistrationsState = {...this.state};
        getCountryList().then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.countries = data.result || [];

            if (newState.countries && newState.countries.length) {
                const start: number = offset * limit;
                const end: number = start + limit;
                newState.currentPageData = newState.countries.slice(start, end);
            }

            newState.isInitialLoading = false;

            if (this.isComponentMounted) {
                this.setState(newState);
            }
        }).catch(e => {
            console.log(e);
            if (this.isComponentMounted) {
                newState.isInitialLoading = false;
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get registrations by countries"
                });
            }
        });
    };

    handleConfigureModalOpen = (): void => {
        const {popup: {offset, limit}} = this.state;
        const newState: IRegistrationsState = {...this.state};
        newState.popup.configure.isShown = true;
        newState.request.isLoading = true;
        this.setState(newState);
        if (!newState.providers.length) {

            getProvidersList(offset, limit).then(({data}: AxiosResponse) => {
                if (data.err) {
                    throw new Error(JSON.stringify(data));
                }
                if (data.result.length > 0) {
                    newState.providers = data.result.map(item => {
                        return {
                            label: item.label,
                            value: item.providerId
                        };
                    });
                }
                newState.request.isLoading = false;

                if (this.isComponentMounted) {
                    this.setState(newState);
                }
            }).catch(e => {
                console.log(e);
                if (this.isComponentMounted) {
                    newState.request.isLoading = false;
                    showNotification("error", {
                        title: "You've got an error!",
                        description: "Cannot get operators",
                        timer: 3000
                    });
                    this.setState(newState);
                }
            })
        } else {
            newState.request.isLoading = false;
            this.setState(newState);
        }
    };

    handleConfigureModalClose = (): void => {
        const newState: IRegistrationsState = {...this.state};
        newState.popup.selectedCountryIds = [];
        newState.popup.selectedProviderIds = [];
        newState.selectedProviders = [];
        newState.selectedCountries = [];
        newState.popup.configure.isShown = false;
        newState.popup.configure.isAllCountriesSelected = false;
        this.setState(newState);
    };

    handleAddModalOpen = (e: React.MouseEvent<HTMLButtonElement>, countryId: string): void => {
        e.preventDefault();
        const {popup: {offset, limit}, countries} = this.state;
        const newState: IRegistrationsState = {...this.state};
        newState.popup.add.isShown = true;
        newState.request.isLoading = true;
        newState.popup.selectedCountryIds = [+countryId];
        newState.popup.selectedCountryName = countries.find(item => item.countryId === countryId).name;

        this.setState(newState);
        if (!newState.providers.length) {
            getProvidersList(offset, limit).then(({data}: AxiosResponse) => {
                if (data.err) {
                    throw new Error(JSON.stringify(data));
                }

                if (data.result.length > 0) {
                    newState.providers = data.result.map(item => {
                        return {
                            label: item.label,
                            value: item.providerId
                        };
                    });
                }
                newState.request.isLoading = false;

                if (this.isComponentMounted) {
                    this.setState(newState);
                }
            }).catch(e => {
                console.log(e);
                if (this.isComponentMounted) {

                    newState.request.isLoading = false;
                    showNotification("error", {
                        title: "You've got an error!",
                        description: "Cannot get operators",
                        timer: 3000
                    });
                    this.setState(newState);
                }
            })
        } else {
            newState.request.isLoading = false;
            this.setState(newState);
        }
    };

    handleAddModalClose = (): void => {
        const newState: IRegistrationsState = {...this.state};
        newState.popup.add.isShown = false;
        newState.popup.selectedProviderIds = [];
        newState.popup.selectedCountryIds = [];
        newState.selectedCountries = [];
        newState.selectedProviders = [];
        this.setState(newState);
    };

    handleRemoveModalOpen = (e: React.MouseEvent<HTMLButtonElement>, countryId: string): void => {
        e.preventDefault();
        const {countries} = this.state;
        const newState: IRegistrationsState = {...this.state};
        newState.popup.remove.isShown = true;
        newState.request.isLoading = true;
        newState.popup.selectedCountryName = countries.find(item => item.countryId === countryId).name;
        this.setState(newState);

        getCountryProviders(countryId).then(({data}) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            newState.popup.remove.attachedOperators = data.result;
            newState.request.isLoading = false;
            this.setState(newState);
        }).catch(e => {
            console.log(e);
            if (this.isComponentMounted) {
                newState.request.isLoading = false;
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get attached operators",
                    timer: 3000
                });
            }
        });
    };

    handleRemoveModalClose = (): void => {
        const newState: IRegistrationsState = {...this.state};
        newState.popup.remove.isShown = false;
        newState.popup.remove.attachedOperators = [];
        this.setState(newState);
    };

    handleListChange = (e: React.MouseEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const {offset, limit, countries} = this.state;
        const newState: IRegistrationsState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.offset = currentOffset;
        const start: number = currentOffset * limit;
        newState.currentPageData = countries.slice(start, start + limit);
        this.setState(newState);
    };

    handleCountryChange = (value: ISelect): void => {
        const newState: IRegistrationsState = {...this.state};
        const selection: any = value;
        const selectedCountries: number[] = [];

        for (const item of selection) {
            selectedCountries.push(item.value);
        }

        newState.selectedCountries = selection;
        newState.popup.selectedCountryIds = selectedCountries;
        this.setState(newState);
    };

    handleOperatorChange = (value: ISelect): void => {
        const newState: IRegistrationsState = {...this.state};
        const selection: any = value;
        const selectedProviders: number[] = [];

        for (const item of selection) {
            selectedProviders.push(item.value);
        }

        newState.selectedProviders = selection;
        if (newState.popup.configure.isShown) {
            newState.popup.selectedProviderIds = selectedProviders;
        } else if (newState.popup.add.isShown) {
            newState.popup.selectedProviderIds = selectedProviders;
        }
        this.setState(newState);
    };

    handleSetOperator = (e: React.MouseEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const {popup: {selectedCountryIds, selectedProviderIds}, countries} = this.state;
        const newState: IRegistrationsState = {...this.state};

        const countryProvidersIds: any[] = [];
        for (let p: number = 0; p < selectedProviderIds.length; p++) {
            for (let c: number = 0; c < selectedCountryIds.length; c++) {
                const countryId: number = selectedCountryIds[c];
                const providerId: number = selectedProviderIds[p];
                countryProvidersIds.push([countryId, providerId]);
            }
        }

        newState.request.isProcessing = true;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Setting Operators...",
            description: "",
        });

        setProviders(countryProvidersIds).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));

            } else if (!data.error && !data.result.length) {
                newState.request.isProcessing = false;
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Chosen Operators are already set fro chosen countries",
                    id: toastId
                });
                return;
            } else {
                newState.request.isProcessing = false;
                const updatedCountryIds: number[] = data.result.map(item => item.countryId);
                let notification: string = "";

                if (updatedCountryIds.length > 1) {
                    const updatedCountryNames: any = countries.filter(country => updatedCountryIds.includes(country.countryId)).map(country => country.name).join(", ");
                    notification = `Operators are set for ${updatedCountryNames}.`;
                    newState.notification = notification;
                }

                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "Operators are set",
                    id: toastId
                });
            }

            newState.popup.selectedCountryIds = [];
            newState.popup.selectedProviderIds = [];
            newState.selectedProviders = [];
            newState.selectedCountries = [];
            newState.popup.configure.isShown = false;
            newState.popup.configure.isAllCountriesSelected = false;
            newState.popup.add.isShown = false;
            this.setState(newState);
            this.initRequest();

        }).catch(e => {
            console.log(e);
            if (this.isComponentMounted) {
                newState.request.isProcessing = false;
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot set operators",
                    id: toastId
                });
            }
        });
    };

    handleRemoveAttachedOperator = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const attachedProviderId: number = parseInt(e.currentTarget.getAttribute("data-attached-id"));
        const {popup: {remove: {attachedOperators}}} = this.state;
        const newState: IRegistrationsState = {...this.state};
        newState.request.isProcessing = true;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Deleting...",
            description: "",
        });

        deleteAttachedProvider(attachedProviderId).then(({data}) => {
            if (!data.err && data.result.isDeleted) {

                newState.popup.remove.attachedOperators = attachedOperators.filter(item => item.countryProviderId !== attachedProviderId);
                newState.request.isProcessing = false;

                this.setState(newState);
                this.initRequest();
                showNotification("success", {
                    title: "Success!",
                    description: "Operator successfully removed",
                    id: toastId
                });
            } else {
                newState.request.isProcessing = false;
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot remove attached operator",
                    id: toastId
                });
            }
            if (this.isComponentMounted) {
                this.setState(newState);
            }
        }).catch(e => console.log(e))
    };

    handleNotificationClear = () => {
        this.setState({notification: ""});
    };

    handleRedirect = () => {
        const {handlePillChange} = this.props;
        handlePillChange(PROVIDERS.TABS.OPERATORS);
    };

    handleSelectAllCountries = ({currentTarget: {checked}}: React.ChangeEvent<HTMLInputElement>) => {
        const newState: IRegistrationsState = {...this.state};
        const {countries} = this.props;
        newState.popup.configure.isAllCountriesSelected = checked;
        newState.selectedCountries = [];

        if (checked) {
            newState.popup.selectedCountryIds = countries.map(country => country.value)
        } else {
            newState.popup.selectedCountryIds = [];
        }

        this.setState(newState);
    };

    render(): JSX.Element {
        const {
            popup: {configure, add, remove, selectedCountryIds, selectedProviderIds, selectedCountryName}, request: {isLoading, isProcessing},
            offset, limit, countries, currentPageData, providers, isInitialLoading, selectedCountries, selectedProviders, notification
        } = this.state;

        const countryOptions: any = this.props.countries;

        return (
            <div>
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl padder-t-3">Registrations</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <div className="text-right">
                                    <button className="btn btn-default btn-addon" onClick={this.handleConfigureModalOpen}>
                                        Configure Operators
                                    </button>
                                </div>
                            </div>
                        </div>

                        {
                            notification &&
                            <div className="row">
                                <div className="col-xs-12">
                                    <div className="alert alert-success alert-dismissible alert-for-registrations">
                                        <span>{notification}</span>
                                        <a href="#" className="close" data-dismiss="alert" aria-label="close" onClick={this.handleNotificationClear}>&times;</a>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>

                {isInitialLoading ? <Loading/>
                    :
                    <Table
                        hover={true}
                        condensed={true}
                        responsive={true}
                    >
                        <thead>
                        <tr>
                            <th className="col-sm-1"/>
                            <th className="col-sm-1"/>
                            <th className="col-sm-3">Country</th>
                            <th className="col-sm-3">Registration Type</th>
                            <th className="col-sm-3">Operator</th>
                            <th className="col-sm-1"/>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            countries && countries.length === 0 &&
                            <tr>
                                <td colSpan={6}>No result</td>
                            </tr>
                        }

                        {currentPageData && currentPageData.map((country, index) => {
                            const N: number = offset * limit + index + 1;

                            const addOperator: any = (e: React.MouseEvent<HTMLButtonElement>) => this.handleAddModalOpen(e, country.countryId);
                            const removeOperator: any = (e: React.MouseEvent<HTMLButtonElement>) => this.handleRemoveModalOpen(e, country.countryId);

                            const registrationTypes: string[] = country.providers && country.providers[0] && country.providers.map(item => item.type);
                            const isEmail: boolean = registrationTypes && registrationTypes.some(item => item === "EMAIL");
                            const isPhone: boolean = registrationTypes && registrationTypes.some(item => item === "SMS");
                            let registrationType: string = "";
                            if (isEmail && isPhone) {
                                registrationType = "Phone and Email"
                            } else if (isEmail) {
                                registrationType = "Only Email"
                            } else if (isPhone) {
                                registrationType = "Only Phone"
                            }

                            const operator: string = country.providers && country.providers[0] && country.providers.map(item => item.label).join(", ");

                            return (
                                <tr key={N} className="cursor-pointer">
                                    <td className="col-sm-1">{N}</td>
                                    <td className="col-sm-1">
                                        <span className="flag"><ReactCountryFlag code={country.regionCode} svg={true}/></span>
                                    </td>
                                    <td className="col-sm-3">{country.name}</td>
                                    <td className={`col-sm-3${!registrationType ? " text-danger" : ""}`}>{registrationType || "Not Set"}</td>
                                    <td className={`col-sm-3${!operator ? " text-danger" : ""}`}>{operator || "Not Set"}</td>
                                    <td className="col-sm-1">
                                        <MoreActions
                                            isDropup={(index === currentPageData.length - 1) && currentPageData.length !== 1}
                                            isAbsolute={true}
                                        >
                                            <li>
                                                <a href="javascript:void(0);" onClick={addOperator}>
                                                    <span>Add Operator</span>
                                                </a>
                                            </li>
                                            <li>
                                                <a href="javascript:void(0);" onClick={removeOperator}>
                                                    <span>Remove Operator</span>
                                                </a>
                                            </li>
                                        </MoreActions>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </Table>}

                {countries && countries.length !== 0 &&
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6">
                                <span className="text-xs">{`${countries.length} entries`}</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <Pagination
                                    offset={offset}
                                    limit={limit}
                                    callback={this.handleListChange}
                                    count={countries.length}
                                    length={currentPageData.length}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                }

                {/*Configure Operators*/}
                <Modal
                    show={configure.isShown}
                    onHide={this.handleConfigureModalClose}
                ><Modal.Header closeButton={true}>
                    <span className="text-xlg">Default Operators</span>
                </Modal.Header>
                    <Modal.Body>
                        {isLoading ? <Loading/> :
                            <form>
                                {/*Countries*/}
                                <FormGroup>
                                    <ControlLabel htmlFor="countries">Countries</ControlLabel>
                                    <Select
                                        isMulti={true}
                                        name="countries"
                                        placeholder={`${configure.isAllCountriesSelected ? "All countries" : "Choose countries"}`}
                                        styles={multiSelectMenuStyles}
                                        isDisabled={configure.isAllCountriesSelected}
                                        value={selectedCountries}
                                        options={countryOptions}
                                        closeMenuOnSelect={false}
                                        isClearable={true}
                                        onChange={this.handleCountryChange}
                                    />
                                    <HelpBlock>
                                        <FormGroup>
                                            <Checkbox
                                                inline={true}
                                                onChange={this.handleSelectAllCountries}
                                                checked={configure.isAllCountriesSelected}
                                            ><span>Select all countries</span>
                                            </Checkbox>
                                        </FormGroup>
                                    </HelpBlock>
                                </FormGroup>

                                {/*Operators*/}
                                <FormGroup>
                                    <ControlLabel htmlFor="providers">Operators</ControlLabel>
                                    <Select
                                        isMulti={true}
                                        isDisabled={!providers.length}
                                        name="providers"
                                        placeholder="Choose operator"
                                        styles={multiSelectMenuStyles}
                                        value={selectedProviders}
                                        options={providers}
                                        closeMenuOnSelect={false}
                                        isClearable={true}
                                        onChange={this.handleOperatorChange}
                                    />
                                    {!providers.length &&
                                    <HelpBlock>Go to <span className={"redirect-link"} onClick={this.handleRedirect}>Registrations</span> page to create operators.</HelpBlock>
                                    }
                                </FormGroup>
                            </form>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div className="text-right flex-end">
                                        <button
                                            className="btn btn-default m-r-sm"
                                            onClick={this.handleConfigureModalClose}
                                        >Cancel
                                        </button>
                                        <button
                                            className="btn btn-info"
                                            disabled={(!selectedProviderIds.length && !selectedCountryIds.length) || isProcessing}
                                            onClick={this.handleSetOperator}
                                        >Save{isProcessing ? <i className="fa fa-spinner fa-spin m-l-xs"/> : ""}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/*Remove Operators*/}
                <Modal
                    show={remove.isShown}
                    onHide={this.handleRemoveModalClose}
                ><Modal.Header closeButton={true}>
                    <span className="text-xlg">{`Remove Operators from ${selectedCountryName}`}</span>
                </Modal.Header>
                    <Modal.Body>

                        {isLoading ? <Loading/> :
                            <Table
                                hover={true}
                                condensed={true}
                                responsive={true}
                            >
                                <thead>
                                <tr>
                                    <th/>
                                    <th>Operator</th>
                                    <th/>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    remove.attachedOperators && remove.attachedOperators.length === 0 &&
                                    <tr>
                                        <td colSpan={3}>No results</td>
                                    </tr>
                                }
                                {
                                    remove.attachedOperators && remove.attachedOperators.map((item, index) => {
                                            const N: number = index + 1;
                                            return (
                                                <tr key={N}>
                                                    <td>{N}</td>
                                                    <td>{item.label}</td>

                                                    <td className="w-85">
                                                        <button
                                                            disabled={isProcessing}
                                                            className="btn btn-danger btn-xs"
                                                            onClick={this.handleRemoveAttachedOperator}
                                                            data-attached-id={item.countryProviderId}
                                                        ><i className="fa fa-close"/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        }
                                    )}
                                </tbody>
                            </Table>
                        }
                    </Modal.Body>
                </Modal>

                {/*Add Operators*/}
                <Modal
                    show={add.isShown}
                    onHide={this.handleAddModalClose}
                ><Modal.Header closeButton={true}>
                    <span className="text-xlg">{`Attach Operators to ${selectedCountryName}`}</span>
                </Modal.Header>
                    <Modal.Body>
                        {isLoading ? <Loading/> :
                            <form>
                                {/*Operators*/}
                                <FormGroup>
                                    <ControlLabel htmlFor="providers">Operators</ControlLabel>
                                    <Select
                                        isMulti={true}
                                        isDisabled={!providers.length}
                                        name="providers"
                                        placeholder="Choose operator"
                                        styles={multiSelectMenuStyles}
                                        value={selectedProviders}
                                        options={providers}
                                        closeMenuOnSelect={false}
                                        isClearable={true}
                                        onChange={this.handleOperatorChange}
                                    />
                                    {!providers.length &&
                                    <HelpBlock>Go to <span className={"redirect-link"} onClick={this.handleRedirect}>Registrations</span> page to create operators.</HelpBlock>
                                    }
                                </FormGroup>
                            </form>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div className="text-right flex-end">
                                        <button
                                            className="btn btn-default m-r-sm"
                                            onClick={this.handleAddModalClose}
                                        >Cancel
                                        </button>
                                        <button
                                            className="btn btn-info"
                                            disabled={!selectedProviderIds.length || isProcessing}
                                            onClick={this.handleSetOperator}
                                        >Add Operators{isProcessing ? <i className="fa fa-spinner fa-spin m-l-xs"/> : ""}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Registrations);
