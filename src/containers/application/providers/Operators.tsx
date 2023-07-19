"use strict";

import * as React from "react";
import {isBoolean} from "lodash";
import Select from "react-select";
import {connect} from "react-redux";
import format from "date-fns/format";
import axios, {AxiosResponse} from "axios";
import Table from "react-bootstrap/es/Table";
import Modal from "react-bootstrap/es/Modal";
import {ToastContainer} from "react-toastify";
import Checkbox from "react-bootstrap/es/Checkbox"
import HelpBlock from "react-bootstrap/es/HelpBlock";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {
    addAttachedCountry,
    createProvider,
    deleteAttachedCountry,
    deleteProvider,
    getAttachedCountries,
    getProvider,
    getProvidersList,
    getProviderTypes,
    getProviderTypeCount,
    getProviderCount,
    getAttachedCountriesCount,
    updateProvider,
} from "ajaxRequests/providers";
import {selectMenuStyles, showNotification} from "helpers/PageHelper";
import MoreActions from "components/Common/MoreActions";
import Pagination from "components/Common/Pagination";
import {getCurrentOffset} from "helpers/DataHelper";
import Loading from "components/Common/Loading";
import Popup from "components/Common/Popup";
import {ISelect} from "services/interface";
import selector, {IStoreProps} from "services/selector";

interface IOperatorsState {
    isInitialLoading: boolean,
    offset: number,
    limit: number,
    providers: any[],
    popup: any,
    providerId: number,
    request: {
        isDeleted: boolean,
        isPaging: boolean,
        isLoading: boolean,
        isProcessing: boolean,
        isDisabled: boolean,
        add: {
            isProcessing: boolean,
            isCompleted: boolean
        },
    },
    validation: any,
    providerTypesCount: number,
    providersCount: number,
    attachedCountryCount: number,
}

interface IOperatorsProps extends IStoreProps {
    userProfile?: any
}

class Operators extends React.Component<IOperatorsProps, IOperatorsState> {

    isComponentMounted: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            isInitialLoading: true,
            offset: 0,
            limit: 20,
            providers: [],
            popup: {
                remove: {
                    isShown: false,
                    message: {}
                },
                create: {
                    isShown: false,
                    providers: null,
                    providerTypes: [],
                    selectedProvider: null,
                },
                update: {
                    isShown: false,
                },
                countries: {
                    isShown: false,
                    isPaging: false,
                    attachedCountries: [],
                    selectedCountry: [],
                },
                provider: {},
                offset: 0,
                limit: 10,
            },
            providerId: null,
            request: {
                isDeleted: false,
                isPaging: false,
                isLoading: false,
                isProcessing: false,
                isDisabled: true,
                add: {
                    isProcessing: false,
                    isCompleted: false
                },
            },
            providerTypesCount: null,
            providersCount: null,
            attachedCountryCount: null,
            validation: {},
        }
    };

    componentDidMount(): void {
        document.title = "Operators";
        const newState: IOperatorsState = {...this.state};
        this.initProviderRequest(newState);
    }

    componentWillUnmount(): void {
        this.isComponentMounted = false;
    }

    initProviderRequest = (state: IOperatorsState, offset: number = 0, isPaging: boolean = false): void => {
        const {limit, isInitialLoading} = state;

        getProviderCount().then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data))
            }
            state.providersCount = data.result.count;

            if (this.isComponentMounted) {
                this.setState(state);
            }
        }).catch(e => console.log(e));

        getProvidersList(offset, limit).then(({data}: AxiosResponse) => {
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

            state.providers = data.result || [];

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
                    description: "Cannot get providers",
                    timer: 3000
                });
                this.setState(state);
            }
        })
    };

    initCountryRequests = (state: IOperatorsState, offset: number = 0, isPaging: boolean = false): void => {
        const {providerId, popup: {limit}} = state;
        state.request.isLoading = true;
        state.request.isDisabled = true;
        this.setState(state);

        axios.all([
            getAttachedCountriesCount(providerId),
            getProvider(providerId),
            getAttachedCountries(providerId, offset, limit),
        ]).then(axios.spread((count, provider, attachedCountries) => {
            if (count.data.err) {
                throw new Error(JSON.stringify(count))
            }
            state.attachedCountryCount = count.data.result.count || null;

            if (!provider.data.err) {
                const result: any = provider.data.result;
                state.popup.provider = result;

                for (const item in result.config) {
                    if (result.config.hasOwnProperty(item)) {
                        state.validation[item] = {
                            value: null,
                            error: "",
                        };
                    }
                }
                state.validation.label = {
                    value: null,
                    error: "",
                }
            } else {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get providers",
                    timer: 3000,
                    hideProgress: true
                });
            }

            if (!attachedCountries.data.err) {
                state.popup.countries.attachedCountries = attachedCountries.data.result;
            } else {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get attached countries",
                    timer: 3000,
                    hideProgress: true
                });
            }

            if (isPaging) {
                state.popup.countries.isPaging = false;
                state.popup.offset = offset;
            }
            state.request.isLoading = false;
            if (this.isComponentMounted) {
                this.setState(state);
            }
        })).catch(e => {
            console.log(e);
            if (this.isComponentMounted) {
                if (isPaging) {
                    state.popup.countries.isPaging = false;
                }
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get providers",
                    timer: 3000
                });
                this.setState(state);
            }
        });
    };

    handleProviderListChange = (e: React.MouseEvent<HTMLInputElement>): void => {
        const {offset} = this.state;
        const newState: IOperatorsState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.isPaging = true;
        this.setState(newState);
        this.initProviderRequest(newState, currentOffset, true);
    };

    handleCountryListChange = (e: React.MouseEvent<HTMLInputElement>): void => {
        const {offset} = this.state.popup;
        const newState: IOperatorsState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.popup.countries.isPaging = true;
        this.setState(newState);
        this.initCountryRequests(newState, currentOffset, true);
    };

    handleDeleteModalOpen = (e: React.MouseEvent<HTMLElement>, providerId: number): void => {
        e.stopPropagation();
        const newState: IOperatorsState = {...this.state};
        newState.popup.remove.isShown = true;
        newState.providerId = providerId;
        const providerLabel: string = newState.providers.find(item => item.providerId === providerId).label;
        newState.popup.remove.message = {
            info: `Are you sure you want to delete ${providerLabel} provider?`,
            apply: "Apply",
            cancel: "Cancel",
        };
        this.setState(newState);
    };

    handleDeleteModalClose = (): void => {
        const newState: IOperatorsState = {...this.state};
        newState.popup.remove.isShown = false;
        newState.popup.remove.message = {};
        newState.popup.provider = null;
        this.setState(newState);
    };

    handleCreateModalOpen = (): void => {
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
        const {offset, limit} = this.state;
        const newState: IOperatorsState = {...this.state};
        newState.popup.create.isShown = true;
        newState.request.isLoading = true;
        this.setState(newState);
        if (!Object.keys(newState.popup.create.providerTypes).length) {

            getProviderTypeCount().then(({data}: AxiosResponse) => {
                if (data.error) {
                    throw new Error(JSON.stringify(data))
                }
                newState.providerTypesCount = data.result.count;
                this.setState(newState);
            }).catch(e => console.log(e));

            getProviderTypes(offset, limit).then(({data}: AxiosResponse) => {
                const newState: IOperatorsState = {...this.state};
                if (!data.err) {
                    const result: any = data.result;
                    newState.popup.create.providers = result;
                    if (result.length > 0) {
                        newState.popup.create.providerTypes = data.result.map(item => {
                            return {
                                label: item.label,
                                value: item.tp2Id
                            };
                        });
                    }
                } else {
                    showNotification("error", {
                        title: "You've got an error!",
                        description: "Cannot get provider types",
                        timer: 3000,
                        hideProgress: true
                    });
                }
                newState.request.isLoading = false;
                if (this.isComponentMounted) {
                    this.setState(newState);
                }
            }).catch(e => console.log(e));
            this.setState(newState);
        } else {
            newState.request.isLoading = false;
            this.setState(newState);
        }
    };

    handleCreateModalClose = (): void => {
        const newState: IOperatorsState = {...this.state};
        newState.popup.create.isShown = false;
        newState.request.isDisabled = true;
        newState.popup.create.selectedProvider = null;
        this.setState(newState);
    };

    handleUpdateModalOpen = (providerId: number): void => {
        const {userProfile} = this.props;
        if (userProfile.readonly) {
            return
        }
        const newState: IOperatorsState = {...this.state};
        newState.request.isLoading = true;
        newState.popup.update.isShown = true;
        newState.providerId = providerId;
        this.setState(newState);
        getProvider(providerId).then(({data}: AxiosResponse) => {
            const newState: IOperatorsState = {...this.state};
            if (!data.err) {
                newState.popup.provider = data.result;

                for (const item in data.config) {
                    if (data.config.hasOwnProperty(item)) {
                        newState.validation[item] = {
                            value: null,
                            error: "",
                        };
                    }
                }
                newState.validation.label = {
                    value: null,
                    error: "",
                };
            } else {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get provider",
                    timer: 3000,
                    hideProgress: true
                });
            }
            newState.request.isLoading = false;
            if (this.isComponentMounted) {
                this.setState(newState);
            }
        }).catch(e => console.log(e));
        this.setState(newState);
    };

    handleUpdateModalClose = (): void => {
        const newState: IOperatorsState = {...this.state};
        newState.popup.update.isShown = false;
        newState.popup.provider = {};
        newState.request.isDisabled = true;
        newState.validation = {};
        this.setState(newState);
    };

    handleAttachCountryModalOpen = (e: React.MouseEvent<HTMLElement>, providerId: number): void => {
        e.stopPropagation();
        const {offset} = this.state.popup;
        const newState: IOperatorsState = {...this.state};
        newState.popup.countries.isShown = true;
        newState.providerId = providerId;
        this.setState(newState);
        this.initCountryRequests(newState, offset, true);
    };

    handleAttachCountryModalClose = (): void => {
        const newState: IOperatorsState = {...this.state};
        newState.popup.countries.isShown = false;
        newState.request.isDisabled = true;
        newState.popup.countries.selectedCountry = [];
        newState.attachedCountryCount = null;
        this.setState(newState);
    };

    handleTypeChange = (value: any): void => {
        const selection: any = value;
        const {popup: {create: {providers}}} = this.state;
        const newState: IOperatorsState = {...this.state};

        if (selection) {
            const provider: any = providers.find(item => item.tp2Id === selection.value);
            newState.popup.provider = {...newState.popup.provider, ...provider};
            newState.popup.provider.orderNumber = 1;
            newState.popup.create.selectedProvider = selection;

            const validation: any = {};
            for (const item in provider.config) {
                if (provider.config.hasOwnProperty(item)) {
                    validation[item] = {
                        value: null,
                        error: ""
                    }
                }
            }
            validation.orderNumber = {
                value: null,
                error: ""
            };
            validation.label = {
                value: null,
                error: ""
            };
            newState.validation = validation;
            this.setState(newState);
        }

    };

    handleAttributeChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IOperatorsState = {...this.state};
        const config: any = newState.popup.provider.config;

        newState.popup.provider.config[name] = value;
        newState.validation[name] = {};
        newState.validation[name].value = value === "" ? "error" : "success";
        newState.validation[name].error = value === "" ? "Must not be empty" : "";
        newState.request.isDisabled = (parseInt(newState.popup.provider.orderNumber) < 1 ||
            Object.keys(config).filter(item => config[item] === "").length > 0 ||
            newState.popup.provider.label.length === 0 ||
            newState.request.isProcessing);
        this.setState(newState);
    };

    handleLabelChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IOperatorsState = {...this.state};
        const config: any = newState.popup.provider.config;

        newState.popup.provider[name] = value;
        newState.validation[name] = {};
        newState.validation[name].value = value === "" ? "error" : "success";
        newState.validation[name].error = value === "" ? "Must not be empty" : "";
        newState.request.isDisabled = (parseInt(newState.popup.provider.orderNumber) < 1 ||
            Object.keys(config).filter(item => config[item] === "").length > 0 ||
            newState.popup.provider.label.length === 0 ||
            newState.request.isProcessing);
        this.setState(newState);
    };

    handleCheckboxChange = ({currentTarget: {name, checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IOperatorsState = {...this.state};
        const config: any = newState.popup.provider.config;
        newState.popup.provider.config[name] = checked;
        newState.request.isDisabled = (parseInt(newState.popup.provider.orderNumber) < 1 ||
            Object.keys(config).filter(item => config[item] === "").length > 0 ||
            newState.popup.provider.label.length === 0 ||
            newState.request.isProcessing);
        this.setState(newState);
    };

    handleActiveChange = ({currentTarget: {name, checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IOperatorsState = {...this.state};
        newState.popup.provider[name] = checked;
        newState.request.isDisabled = false;
        this.setState(newState);
    };

    handleOrderChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IOperatorsState = {...this.state};
        const config: any = newState.popup.provider.config;
        newState.popup.provider[name] = parseInt(value) >= 1 ? value : 1;
        newState.validation[name] = {};
        newState.validation[name].value = value === "" ? "error" : "success";
        newState.validation[name].error = value === "" ? "Must not be empty" : "";
        newState.request.isDisabled = (parseInt(newState.popup.provider.orderNumber) < 1 ||
            Object.keys(config).filter(item => config[item] === "").length > 0 ||
            newState.popup.provider.label.length === 0 ||
            newState.request.isProcessing);
        this.setState(newState);
        this.setState(newState);
    };

    handleCountryChange = (value: ISelect): void => {
        const newState: IOperatorsState = {...this.state};
        if (newState.request.add.isCompleted) {
            newState.request.add.isCompleted = false;
        }
        newState.popup.countries.selectedCountry = value;
        this.setState(newState);
    };

    handleDeleteProvider = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {request, providerId, offset} = this.state;
        const newState: IOperatorsState = {...this.state};
        const toastId: number = showNotification("info", {
            title: "Deleting...",
            description: "",
        });

        if (!request.isDeleted) {
            newState.request.isDeleted = true;
            newState.popup.remove.isShown = false;
            newState.isInitialLoading = true;
            this.setState(newState);
            deleteProvider(providerId).then(response => {
                if (!response.data.err) {
                    showNotification("success", {
                        title: "Success!",
                        description: "Provider is deleted",
                        id: toastId
                    });
                    this.initProviderRequest(newState, offset, true);
                } else {
                    showNotification("error", {
                        title: "You've got an error!",
                        description: "Provider isn't deleted",
                        id: toastId
                    });
                }
                newState.request.isDeleted = false;
                newState.popup.provider = null;
                if (this.isComponentMounted) {
                    this.setState(newState);
                }
            }).catch(e => console.log(e));
        }
    };

    handelCreateProvider = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {popup: {provider}, offset, limit} = this.state;
        const newState: IOperatorsState = {...this.state};
        newState.request.isProcessing = true;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        const newProvider: any = {};
        newProvider.config = provider.config;
        newProvider.orderNumber = provider.orderNumber;
        newProvider.label = provider.label;
        newProvider.tp2Id = provider.tp2Id;

        createProvider(newProvider).then(({data}: AxiosResponse) => {
            const newState: IOperatorsState = {...this.state};
            if (!data.err) {
                showNotification("success", {
                    title: "Success!",
                    description: "Provider successfully created",
                    id: toastId
                });
                if (data.result) {
                    if (offset === 0) {
                        newProvider.createdAt = data.result.createdAt;
                        newProvider.active = true;

                        newState.providers.unshift(newProvider);

                        if (newState.providers.length > limit) {
                            newState.providers = newState.providers.slice(0, limit);
                        }
                    }
                    newState.popup.countries.selectedCountry = [];
                    newState.request.add.isCompleted = true;
                    newState.providersCount++;

                }
                newState.popup.create.selectedProvider = null;
                newState.popup.provider = null;
                newState.validation = {};

            } else {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Provider has not created for unknown reason",
                    id: toastId
                });
            }
            newState.request.isProcessing = false;
            newState.request.isDisabled = true;
            newState.popup.create.isShown = false;
            if (this.isComponentMounted) {
                this.setState(newState);
            }
        }).catch(e => console.log(e));
    };

    handleUpdateProvider = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {popup: {provider}} = this.state;
        const updatedInfo: any = {
            orderNumber: provider.orderNumber,
            active: provider.active,
            config: provider.config,
            label: provider.label,
            createdAt: provider.createdAt
        };
        const newState: IOperatorsState = {...this.state};
        newState.request.isProcessing = true;

        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        updateProvider(provider.providerId, updatedInfo).then(({data}) => {

            const newState: IOperatorsState = {...this.state};
            if (!data.err) {
                showNotification("success", {
                    title: "Success!",
                    description: "Provider is successfully updated",
                    id: toastId
                });

                if (data.result) {

                    newState.providers = newState.providers.map((item) => {
                        return (item.providerId === provider.providerId) ? updatedInfo : item
                    });
                    this.setState(newState);

                } else {
                    showNotification("error", {
                        title: "You've got an error!",
                        description: "Error during provider update",
                        timer: 3000,
                        id: toastId,
                    });
                }
            } else {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Error during provider update",
                    id: toastId
                });
            }

            for (const item in newState.validation) {
                if (newState.validation.hasOwnProperty(item)) {
                    newState.validation[item] = {
                        value: null,
                        error: ""
                    }
                }
            }
            newState.request.isProcessing = false;
            newState.request.isDisabled = true;
            newState.popup.update.isShown = false;
            if (this.isComponentMounted) {
                this.setState(newState);
            }
        }).catch(e => console.log(e));
    };

    handleAddCountry = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {popup: {provider, offset, limit, countries: {selectedCountry}}, request} = this.state;

        const newState: IOperatorsState = {...this.state};
        newState.request.add.isProcessing = true;

        let errorMessage: string = "";

        this.setState(newState);
        const toastId: number = showNotification("info", {
            title: "Adding...",
            description: "",
        });

        addAttachedCountry(provider.providerId, selectedCountry.country_id).then(({data}) => {

            if (data.err) {
                errorMessage = data.err_msg === "PROVIDER_COUNTRY_ALREADY_EXISTS" ?
                    "Selected country is already attached to the provider" : "Cannot add country for unknown reason";
                throw new Error(JSON.stringify(data));
            }

            if (!data.err) {
                showNotification("success", {
                    title: "Success!",
                    description: "Country successfully added",
                    id: toastId
                });

                if (data.result) {

                    if (offset === 0) {
                        const attachedCountry: any = {
                            country: {
                                name: selectedCountry.label,
                                countryId: selectedCountry.country_id,
                            },
                            providerCountryId: data.result.providerCountryId,
                            createdAt: data.result.createdAt,
                        };

                        newState.popup.countries.attachedCountries.unshift(attachedCountry);

                        if (newState.popup.countries.attachedCountries > limit) {
                            newState.popup.countries.attachedCountries = newState.popup.countries.attachedCountries.slice(0, limit);
                        }
                    }
                    newState.popup.countries.selectedCountry = [];
                    newState.request.add.isCompleted = true;
                    newState.attachedCountryCount++;
                    this.setState(newState);

                } else {
                    showNotification("error", {
                        title: "You've got an error!",
                        description: errorMessage,
                        timer: 3000,
                        id: toastId,
                    });
                }
            } else {
                showNotification("error", {
                    title: "You've got an error!",
                    description: errorMessage,
                    timer: 3000,
                    id: toastId,
                });
            }
            newState.request.add.isProcessing = false;
            if (this.isComponentMounted) {
                this.setState(newState);
            }
        }).catch(e => {
            console.log(e);
            request.add.isProcessing = false;
            this.setState(newState);
            showNotification("error", {
                title: "You've got an error!",
                description: errorMessage,
                timer: 3000,
                id: toastId
            });

        })
    };

    handleAttachedCountryDelete = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {provider, offset} = this.state.popup;
        const attachedCountryId: number = parseInt(e.currentTarget.getAttribute("data-attached-id"));
        const newState: IOperatorsState = {...this.state};

        const toastId: number = showNotification("info", {
            title: "Deleting...",
            description: "",
        });

        deleteAttachedCountry(provider.providerId, attachedCountryId).then(({data}) => {
            if (!data.err && data.result.isDeleted) {
                this.initCountryRequests(newState, offset, true);
                showNotification("success", {
                    title: "Success!",
                    description: "Country successfully deleted",
                    id: toastId
                });
            } else {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot delete attached country",
                    id: toastId
                });
            }
            if (this.isComponentMounted) {
                this.setState(newState);
            }
        }).catch(e => console.log(e))
    };

    render(): JSX.Element {
        const {
            isInitialLoading, providers, limit, offset, popup, request: {isPaging}, validation, popup: {create, update, countries}, request, providersCount, attachedCountryCount
        } = this.state;
        const {userProfile} = this.props

        const countryOptions: any = this.props.countries;

        return (
            <div>
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl padder-t-3">Operators</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <div className="text-right">
                                    <button
                                        onClick={this.handleCreateModalOpen}
                                        className="btn btn-default btn-addon"
                                    ><i className="fa fa-plus"/>Create Operator
                                    </button>
                                </div>
                            </div>
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
                            <th>Label</th>
                            <th>Created at</th>
                            <th>Status</th>
                            <th>Order Number</th>
                            {!userProfile.readonly && <th/>}
                        </tr>
                        </thead>
                        <tbody>
                        {
                            providers && providers.length === 0 &&
                            <tr>
                                <td colSpan={6}>No results</td>
                            </tr>
                        }
                        {
                            providers && providers.map((provider, index) => {
                                const N: number = offset * limit + index + 1;
                                const updateProvider: any = () => this.handleUpdateModalOpen(provider.providerId);
                                const attachCountry: any = (e: React.MouseEvent<HTMLElement>) => this.handleAttachCountryModalOpen(e, provider.providerId);
                                const deleteProvider: any = (e: React.MouseEvent<HTMLElement>) => this.handleDeleteModalOpen(e, provider.providerId);
                                return (
                                    <tr key={N} className="cursor-pointer" onClick={updateProvider}>
                                        <td>{N}</td>
                                        <td>{provider.label}</td>
                                        <td>{format(provider.createdAt, "DD MMM YYYY hh:mm A")}</td>
                                        <td>{provider.active ? "Active" : "Not Active"}</td>
                                        <td>{provider.orderNumber}</td>
                                        {!userProfile.readonly && <td>
                                            <MoreActions
                                                isDropup={(index === providers.length - 1) && providers.length > 2}
                                                isAbsolute={true}
                                            >
                                                <li>
                                                    <a href="javascript:void(0);" onClick={updateProvider}>
                                                        Update Provider
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="javascript:void(0);" onClick={attachCountry}>
                                                        Attach Country
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="javascript:void(0);" onClick={deleteProvider}>
                                                        Delete
                                                    </a>
                                                </li>
                                            </MoreActions>
                                        </td>}
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
                                !isInitialLoading && providersCount > limit &&
                                <div>
                                    <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6">
                                        <span className="text-xs">{`${providersCount} entries`}</span>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                        <Pagination
                                            offset={offset}
                                            limit={limit}
                                            callback={this.handleProviderListChange}
                                            length={providers.length}
                                            disabled={isPaging}
                                            count={providersCount}
                                        />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>

                {/*Delete Provider*/}

                <Popup
                    show={popup.remove.isShown}
                    message={popup.remove.message}
                    hideModal={this.handleDeleteModalClose}
                    confirmAction={this.handleDeleteProvider}
                />

                {/*Create Provider*/}

                <Modal show={popup.create.isShown} onHide={this.handleCreateModalClose}>
                    <Modal.Header closeButton={true}>
                        <span className="text-xlg">Create New Provider</span>
                    </Modal.Header>
                    <Modal.Body>
                        {request.isLoading ? <Loading/> :
                            <div>
                                <form>
                                    {/*Provider Type*/}
                                    <FormGroup>
                                        <ControlLabel htmlFor="provider">Choose provider type</ControlLabel>
                                        <Select
                                            isMulti={false}
                                            id="provider"
                                            placeholder="Choose provider type"
                                            styles={selectMenuStyles}
                                            value={create.selectedProvider}
                                            options={create.providerTypes}
                                            closeMenuOnSelect={true}
                                            onChange={this.handleTypeChange}
                                        />
                                    </FormGroup>

                                    {/*Label*/}
                                    {
                                        create.selectedProvider &&
                                        <FormGroup validationState={validation.label && validation.label.value}>
                                            <ControlLabel htmlFor="label">Label</ControlLabel>
                                            <FormControl
                                                name="label"
                                                type="text"
                                                placeholder="Enter label name"
                                                value={popup.provider && popup.provider["label"] || ""}
                                                onChange={this.handleLabelChange}
                                            />
                                            <HelpBlock>{validation.label && validation.label.error}</HelpBlock>
                                        </FormGroup>
                                    }

                                    {/*Configs*/}
                                    {
                                        create.selectedProvider && popup.provider.config && Object.keys(popup.provider.config).map((item, i) => {
                                            const label: string = item.replace(/([a-z]+)([A-Z][a-z]+)/g, "$1 $2");
                                            return (
                                                <FormGroup validationState={validation[item].value} key={i}>
                                                    {
                                                        !isBoolean(popup.provider.config[item]) &&
                                                        <ControlLabel
                                                            htmlFor={item}
                                                            className="text-capitalize"
                                                        >{label.toLowerCase()}
                                                        </ControlLabel>
                                                    }

                                                    {
                                                        isBoolean(popup.provider.config[item]) ?
                                                            <Checkbox
                                                                name={item}
                                                                onChange={this.handleCheckboxChange}
                                                                checked={popup.provider && popup.provider.config[item]}
                                                            ><span className="text-c">{item}</span>
                                                            </Checkbox> :
                                                            <FormControl
                                                                name={item}
                                                                type={item === "password" ? "password" : "text"}
                                                                value={popup.provider && popup.provider.config[item]}
                                                                onChange={this.handleAttributeChange}
                                                            />
                                                    }
                                                    <HelpBlock>{validation[item] && validation[item].error}</HelpBlock>
                                                </FormGroup>
                                            )
                                        })
                                    }

                                    {/*Order*/}
                                    {
                                        create.selectedProvider && popup.provider &&
                                        <FormGroup>
                                            <ControlLabel htmlFor="orderNumber">Order</ControlLabel>
                                            <FormControl
                                                name="orderNumber"
                                                type="number"
                                                value={popup.provider && popup.provider.orderNumber}
                                                onChange={this.handleOrderChange}
                                            />
                                        </FormGroup>
                                    }
                                </form>
                            </div>}
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="text-right">
                            <button
                                className="btn btn-info m-r-xs"
                                disabled={request.isDisabled}
                                onClick={this.handelCreateProvider}
                            >Create{request.isProcessing && <i className="fa fa-refresh fa-spin m-l-xs"/>}
                            </button>
                            <button
                                className="btn btn-default text-info"
                                onClick={this.handleCreateModalClose}
                            >Cancel
                            </button>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/*Update Provider*/}

                <Modal show={update.isShown} onHide={this.handleUpdateModalClose}>
                    <Modal.Header closeButton={true}>
                        <span className="text-xlg">Update Provider</span>
                    </Modal.Header>
                    <Modal.Body>
                        <div>
                            {request.isLoading ? <Loading/> :
                                <div>
                                    <form>
                                        <div className="container-fluid">
                                            <div className="row">
                                                <div className="col-xs-6">

                                                    {/*Name*/}
                                                    <FormGroup>
                                                        <ControlLabel htmlFor="provider">Provider</ControlLabel>
                                                        <FormControl
                                                            id="provider"
                                                            disabled={true}
                                                            name="provider"
                                                            defaultValue={popup.provider && popup.provider.name}
                                                        />
                                                    </FormGroup>
                                                </div>
                                                <div className="col-xs-6">

                                                    {/*Created at*/}
                                                    <FormGroup>
                                                        <ControlLabel htmlFor="created-at">Created At</ControlLabel>
                                                        <FormControl
                                                            disabled={true}
                                                            name="created-at"
                                                            type="text"
                                                            defaultValue={popup.provider && format(popup.provider.createdAt, "DD MMM YYYY hh:mm A")}
                                                        />
                                                    </FormGroup>
                                                </div>
                                            </div>
                                        </div>
                                        <hr/>
                                        <br/>

                                        {/*Label*/}
                                        {
                                            popup.provider &&
                                            <FormGroup validationState={validation.label && validation.label.value}>
                                                <ControlLabel htmlFor="label">Label</ControlLabel>
                                                <FormControl
                                                    name="label"
                                                    type="text"
                                                    placeholder="Enter label name"
                                                    value={popup.provider && popup.provider["label"] || ""}
                                                    onChange={this.handleLabelChange}
                                                />
                                                <HelpBlock>{validation.label && validation.label.error}</HelpBlock>
                                            </FormGroup>
                                        }

                                        {/*Configs*/}
                                        {popup.provider && popup.provider.config && Object.keys(popup.provider.config).map((item, i) => {
                                            const label: string = item.replace(/([a-z]+)([A-Z][a-z]+)/g, "$1 $2");
                                            return (
                                                <FormGroup validationState={validation[item] && validation[item].value} key={i}>
                                                    {
                                                        popup.provider && !isBoolean(popup.provider.config[item]) &&
                                                        <ControlLabel
                                                            htmlFor={item}
                                                            className="text-capitalize"
                                                        >{label.toLowerCase()}
                                                        </ControlLabel>
                                                    }
                                                    {isBoolean(popup.provider && popup.provider.config[item]) ?
                                                        <Checkbox
                                                            name={item}
                                                            onChange={this.handleCheckboxChange}
                                                            checked={popup.provider && popup.provider.config[item]}
                                                        ><span className="text-capitalize">{item}</span>
                                                        </Checkbox>
                                                        :
                                                        <FormControl
                                                            name={item}
                                                            type={item === "password" ? "password" : "text"}
                                                            value={popup.provider && popup.provider.config[item]}
                                                            onChange={this.handleAttributeChange}
                                                        />
                                                    }
                                                    <HelpBlock>{validation[item] && validation[item].error}</HelpBlock>
                                                </FormGroup>
                                            )
                                        })}

                                        {/*Order*/}
                                        <FormGroup>
                                            <ControlLabel htmlFor="orderNumber">Order</ControlLabel>
                                            <FormControl
                                                name="orderNumber"
                                                type="number"
                                                value={popup.provider && popup.provider.orderNumber || ""}
                                                onChange={this.handleOrderChange}
                                            />
                                        </FormGroup>

                                        {/*Active*/}
                                        <FormGroup>
                                            <Checkbox
                                                name="active"
                                                onChange={this.handleActiveChange}
                                                checked={popup.provider && popup.provider.active || ""}
                                            >Active
                                            </Checkbox>
                                        </FormGroup>
                                    </form>
                                </div>}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="text-right flex-end">
                            <button
                                className="btn btn-info m-r-xs"
                                disabled={request.isDisabled}
                                onClick={this.handleUpdateProvider}
                            >Update{request.isProcessing && <i className="fa fa-refresh fa-spin m-l-xs"/>}
                            </button>
                            <button
                                className="btn btn-default text-info"
                                onClick={this.handleUpdateModalClose}
                            >Cancel
                            </button>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/*Attached Countries*/}

                <Modal show={countries.isShown} onHide={this.handleAttachCountryModalClose}>
                    <Modal.Header closeButton={true}>
                        <span className="text-xlg">Attached Countries</span>
                    </Modal.Header>
                    <Modal.Body>
                        <div>
                            {request.isLoading ? <Loading/> :
                                <div>
                                    <form>
                                        <div className="row">

                                            {/*Country*/}
                                            <div className="col-xs-9">
                                                <FormGroup>
                                                    <Select
                                                        isMulti={false}
                                                        closeMenuOnSelect={true}
                                                        options={countryOptions}
                                                        value={countries.selectedCountry}
                                                        onChange={this.handleCountryChange}
                                                        placeholder="Choose country"
                                                    />
                                                </FormGroup>
                                            </div>

                                            {/*Add Countries*/}
                                            <div className="col-xs-3 m-t-2x text-right">
                                                <FormGroup>
                                                    <button
                                                        className="btn btn-info"
                                                        disabled={countries.selectedCountry.length === 0}
                                                        onClick={this.handleAddCountry}
                                                    >Add country{request.add.isProcessing && <i className="fa fa-refresh fa-spin m-l-xs"/>}
                                                    </button>
                                                </FormGroup>
                                            </div>
                                        </div>
                                    </form>

                                    <Table
                                        hover={true}
                                        condensed={true}
                                        responsive={true}
                                    >
                                        <thead>
                                        <tr>
                                            <th/>
                                            <th>Country</th>
                                            <th/>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            countries.attachedCountries && countries.attachedCountries.length === 0 &&
                                            <tr>
                                                <td colSpan={3}>No results</td>
                                            </tr>
                                        }
                                        {
                                            countries.attachedCountries && countries.attachedCountries.map((item, index) => {
                                                    const N: number = popup.offset * popup.limit + index + 1;
                                                    return (
                                                        <tr key={N}>
                                                            <td>{N}</td>
                                                            <td>{item.country.name}</td>

                                                            <td className="w-85">
                                                                <button
                                                                    disabled={request.isProcessing}
                                                                    className="btn btn-danger btn-xs"
                                                                    onClick={this.handleAttachedCountryDelete}
                                                                    data-id={item.country.countryId}
                                                                    data-attached-id={item.providerCountryId}
                                                                ><i className="fa fa-close"/>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            }
                        </div>
                        <div className="container-fluid">
                            <div className="row">
                                {
                                    !request.isLoading && attachedCountryCount > popup.limit &&
                                    <div>
                                        <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6">
                                            <span className="text-xs">{`${attachedCountryCount} entries`}</span>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                            <Pagination
                                                offset={popup.offset}
                                                limit={popup.limit}
                                                callback={this.handleCountryListChange}
                                                data={countries.attachedCountries}
                                                disabled={popup.countries.isPaging}
                                                count={attachedCountryCount}
                                            />
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        )

    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Operators);
