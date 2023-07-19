"use strict";

import * as React from "react";
import Select from "react-select";
import * as moment from "moment";
import {connect} from "react-redux";
import {AxiosResponse} from "axios";
import format from "date-fns/format";
import {Link} from "react-router-dom";
import Table from "react-bootstrap/es/Table";
import Modal from "react-bootstrap/es/Modal";
import AsyncSelect from "react-select/lib/Async";
import MenuItem from "react-bootstrap/es/MenuItem";
import HelpBlock from "react-bootstrap/es/HelpBlock";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";
import DropdownButton from "react-bootstrap/es/DropdownButton";
import * as DatetimeRangePicker from "library/react-bootstrap-datetimerangepicker/lib/index";
import "react-datetime/css/react-datetime.css";
import Datetime from "react-datetime";

import {
    dateTimePickerRanges,
    getCurrentOffset,
    isNumeric,
    pickerLabel,
    promiseSelectOptions,
    replaceAll,
    validateNumber
} from "helpers/DataHelper";
import {ADDITIONAL_FILTERS, ERROR_TYPES, NEW_USER_CREATE, PAGE_NAME, PASSWORD_MIN_LENGTH, NICKNAME_MIN_LENGTH, NICKNAME_MAX_LENGTH} from "configs/constants";
import {getSearchedUsers, getUsersList, createNewUser, getUsersCount, getUserGroups} from "ajaxRequests/users";
import {selectMenuStyles, showNotification} from "helpers/PageHelper";
import {getVirtualNetworks} from "ajaxRequests/network";
import {ISelect, IVALIDATION} from "services/interface";
import MoreActions from "components/Common/MoreActions";
import Pagination from "components/Common/Pagination";
import Loading from "components/Common/Loading";
import selector, {IStoreProps} from "services/selector";
import {getSearchChannels} from "ajaxRequests/channel";
import Radio from "react-bootstrap/es/Radio";

interface IIndexState {
    offset: number,
    limit: number,
    users: any,
    userGroups: any[],
    ranges: any,
    startDate: any,
    initialFilters: any,
    additionalFilters: any,
    isInitialLoading: boolean,
    nickname: string,
    nickEmail: string,
    request: {
        reset: {
            isDisabled: boolean,
            isProcessing: boolean
        },
        search: {
            isChanged: boolean,
            isDisabled: boolean,
            isProcessing: boolean
        },
        createUser: {
            isDisabled: boolean,
            isProcessing: boolean
        },
        fetchCount: boolean,
        isLoading: boolean,
        isPaging: boolean,
    },
    validation: {
        newUser: {
            phoneNumber: IVALIDATION,
            email: IVALIDATION,
            username: IVALIDATION,
            country: IVALIDATION,
            password: IVALIDATION,
            confirmPassword: IVALIDATION,
        }
    },
    popup: {
        isShown: boolean,
        newUser: {
            country: any,
            phoneNumber: any,
            email: string,
            username: string,
            password: string,
            confirmPassword: string,
            selectedOption: string,
            isValidNumber: boolean,
            isValidEmail: boolean,
            isValidUsername: boolean,
        }
    }
}

interface IIndexProps extends IStoreProps {
    userProfile: any,
    history: any
}

class Index extends React.Component<IIndexProps, IIndexState> {

    filterKeys: string[] = Object.keys(ADDITIONAL_FILTERS).map(item => item);

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            offset: 0,
            limit: 20,
            startDate: null,
            isInitialLoading: true,
            nickname: "",
            nickEmail: "",
            request: {
                reset: {
                    isDisabled: true,
                    isProcessing: false
                },
                search: {
                    isChanged: false,
                    isDisabled: true,
                    isProcessing: false
                },
                createUser: {
                    isDisabled: true,
                    isProcessing: false
                },
                fetchCount: true,
                isLoading: false,
                isPaging: false
            },
            users: {
                records: [],
                count: "0"
            },
            userGroups: [],
            ranges: dateTimePickerRanges(),
            initialFilters: {
                registration: {
                    startDate: moment("2000-01-01"),
                    endDate: moment(),
                    selectedDate: moment(),
                },
                country: null,
                platform: null,
                phone: {
                    selected: null,
                    options: [],
                    value: ""
                },
                userGroup: null,
                channel: {
                    selected: null,
                    options: [],
                },
                isSubscribed: null,
            },
            additionalFilters: {
                activity: {
                    name: ADDITIONAL_FILTERS.activity,
                    startDate: "",
                    endDate: "",
                    enable: false,
                    active: true
                },
                network: {
                    name: ADDITIONAL_FILTERS.network,
                    selected: null,
                    options: [],
                    enable: false,
                    active: true
                },
                blocked: {
                    name: ADDITIONAL_FILTERS.blocked,
                    value: null,
                    enable: false,
                    active: false,
                },
                balance: {
                    name: ADDITIONAL_FILTERS.balance,
                    from: "",
                    to: "",
                    enable: false,
                    active: false,
                },
                callCount: {
                    name: ADDITIONAL_FILTERS.callCount,
                    from: "",
                    to: "",
                    enable: false,
                    active: true,
                },
                duration: {
                    name: ADDITIONAL_FILTERS.duration,
                    from: "",
                    to: "",
                    enable: false,
                    active: true,
                },
                messageCount: {
                    name: ADDITIONAL_FILTERS.messageCount,
                    from: "",
                    to: "",
                    enable: false,
                    active: true,
                }
            },
            validation: {
                newUser: {
                    phoneNumber: {
                        value: null,
                        message: "",
                    },
                    country: {
                        value: null,
                        message: "",
                    },
                    password: {
                        value: null,
                        message: "",
                    },
                    confirmPassword: {
                        value: null,
                        message: "",
                    },
                    email: {
                        value: null,
                        message: "",
                    },
                    username: {
                        value: null,
                        message: "",
                    }
                }
            },
            popup: {
                isShown: false,
                newUser: {
                    isValidNumber: false,
                    isValidEmail: false,
                    isValidUsername: false,
                    phoneNumber: "",
                    email: "",
                    username: "",
                    country: null,
                    password: "",
                    confirmPassword: "",
                    selectedOption: NEW_USER_CREATE.TYPE.VIA_PHONE_NUMBER
                }
            },

        };
    };

    componentDidMount(): void {
        document.title = PAGE_NAME["/users"];
        const newState: IIndexState = {...this.state};
        getUserGroups(0, 1000).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.userGroups = data.result.map(item => {
                return {
                    value: item.userGroupId,
                    label: item.name
                }
            }) || [];

            if (this.componentState) {
                this.setState(newState);
            }

        }).catch(e => {
            console.log(e);
            if (this.componentState) {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Cannot get user groups for unknown reason"
                });
            }
        });
        this.initRequests(newState);
        document.addEventListener("keypress", this.handleSearchByEnter);
    }

    componentWillUnmount(): void {
        document.removeEventListener("keypress", this.handleSearchByEnter);
        this.componentState = false;
    }

    handleSearchByEnter = (e: any): void => {
        if (13 === e.keyCode) {
            const {request: {search: {isChanged}}} = this.state;
            if (isChanged) {
                this.handleSearch(e);
            }
        }
    };

    initRequests: any = (state: IIndexState, offset: number = 0, isSearch: boolean = false, isReset: boolean = false, isPaging: boolean = false): void => {
        const {
            initialFilters: {registration, phone, country, platform, userGroup, channel, isSubscribed},
            additionalFilters: {activity, network, callCount, duration, messageCount},
            nickname, nickEmail, limit,
        } = state;

        const callCountFrom: any = (callCount.from === "" && callCount.to === "") ? null :
            (callCount.to !== "" && callCount.from === "") ? "0" : callCount.from;

        const callCountTo: any = (callCount.from === "" && callCount.to === "") ? null :
            (callCount.from !== "" && callCount.to === "") ? "999999999" : callCount.to;

        const messageCountFrom: any = (messageCount.from === "" && messageCount.to === "") ? null :
            (messageCount.to !== "" && messageCount.from === "") ? "0" : messageCount.from;

        const messageCountTo: any = (messageCount.from === "" && messageCount.to === "") ? null :
            (messageCount.from !== "" && messageCount.to === "") ? "999999999" : messageCount.to;

        const durationFrom: any = (duration.from === "" && duration.to === "") ? null :
            (duration.to !== "" && duration.from === "") ? "0" : duration.from;

        const durationTo: any = (duration.from === "" && duration.to === "") ? null :
            (duration.from !== "" && duration.to === "") ? "999999999" : duration.to;
        const channelName: any = (channel === null) ? channel : channel.selected ? channel.selected.value : null

        let byDate: boolean = false

        if (registration.startDate &&
            registration.startDate.format("YYYY-MM-DD") === moment("2000-01-01").format("YYYY-MM-DD") &&
            registration.endDate &&
            registration.selectedDate.format("YYYY-MM-DD") === registration.endDate.format("YYYY-MM-DD")) {
            byDate = true
        }

        const searchedData: any = {
            offset,
            limit,
            registrationStartDate: registration.startDate === "" ? null : registration.startDate.format("YYYY-MM-DD"),
            registrationEndDate: registration.endDate === "" ? null : registration.endDate.format("YYYY-MM-DD"),
            activityStartDate: activity.startDate === "" ? null : activity.startDate.format("YYYY-MM-DD"),
            activityEndDate: activity.endDate === "" ? null : activity.endDate.format("YYYY-MM-DD"),
            countryId: country ? country.country_id : null,
            platformId: platform ? platform.platform_id : null,
            userId: phone.selected ? phone.selected.value : null,
            networkId: network.selected ? network.selected.value : null,
            userGroupId: userGroup ? userGroup.value : null,
            subscribed: isSubscribed,
            callCountFrom,
            callCountTo,
            messageCountFrom,
            messageCountTo,
            durationFrom,
            durationTo,
            channelName,
            nickname,
            nickEmail,
            byDate: byDate || null
        };

        const pattern: any = /^\+?[0-9]+$/gm;
        if (phone.value !== "") {
            if (pattern.test(phone.value)) {
                searchedData.number = phone.value.substr(0, 1) === "+" ? phone.value.substring(1) : phone.value || null;
            } else {
                searchedData.email = phone.value || null;
            }
        }

        if (!isPaging) {
            getUsersCount(searchedData).then(({data}: AxiosResponse) => {
                if (data.err) {
                    throw new Error(JSON.stringify(data));
                }
                state.users.count = data.result || "0";
                state.request.fetchCount = false;
                if (this.componentState) {
                    this.setState(state);
                }
            }).catch(e => {
                console.log(e);
                state.request.fetchCount = false;
                if (this.componentState) {
                    this.setState(state);
                    showNotification("error", {
                        title: "You've got an error!",
                        description: "Cannot get users count for unknown reason",
                        timer: 3000
                    });
                }
            });
        }

        getUsersList(searchedData).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            state.users.records = data.result.records || [];
            state.request.isLoading = false;
            state.isInitialLoading = false;

            if (isSearch) {
                state.request.search.isProcessing = false;
                state.request.search.isChanged = false;
                state.request.reset.isDisabled = false;
            }

            if (isReset) {
                state.request.reset.isProcessing = false;
                state.request.reset.isDisabled = true;
                state.offset = 0;
            }

            if (isPaging) {
                state.offset = offset;
                state.request.isPaging = false;
            }

            if (this.componentState) {
                this.setState(state);
            }
        }).catch(e => {
            console.log(e);
            state.request.isLoading = false;
            state.isInitialLoading = false;
            if (isSearch) {
                state.request.search.isProcessing = false;
            }

            if (isReset) {
                state.request.reset.isProcessing = false;
            }

            if (isPaging) {
                state.request.isPaging = false;
            }
            if (this.componentState) {
                this.setState(state);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get users for unknown reason",
                    timer: 3000
                });
            }
        });
    };

    handleListChange = async (e: React.MouseEvent<HTMLInputElement>) => {
        const {offset} = this.state;
        const newState: IIndexState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.isPaging = true;
        newState.request.isLoading = true;
        this.setState(newState);
        this.initRequests(newState, currentOffset, false, false, true);

    };

    handleRegistrationApply = (e: React.MouseEvent<HTMLInputElement>, picker: any): void => {
        e.preventDefault();
        const newState: IIndexState = {...this.state};
        newState.initialFilters.registration.startDate = picker.startDate;
        newState.initialFilters.registration.endDate = picker.endDate;
        newState.request.search.isDisabled = false;
        newState.request.search.isChanged = true;
        this.setState(newState);
    };

    handleByDateChange = (picker: any): void => {
        const newState: IIndexState = {...this.state};
        newState.initialFilters.registration.startDate = moment("2000-01-01");
        newState.initialFilters.registration.endDate = picker;
        newState.initialFilters.registration.selectedDate = picker;

        // const now: any = moment().format("DD MMM YYYY hh:mm A")

        this.setState(newState);
    };

    handleSubscriptionChange = ({currentTarget: {value}}: React.MouseEvent<HTMLInputElement>): void => {
        const newState: IIndexState = {...this.state};
        switch (value) {
            case "subscribed":
                newState.initialFilters.isSubscribed = true;
                break;
            case "not-subscribed":
                newState.initialFilters.isSubscribed = false;
                break;
            default:
                newState.initialFilters.isSubscribed = null;
        }
        this.setState(newState);
    }

    handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
    };

    handleCountryChange = (value: ISelect): void => {
        const newState: IIndexState = {...this.state};
        newState.initialFilters.country = value;
        newState.request.search.isDisabled = false;
        newState.request.search.isChanged = true;
        this.setState(newState);
    };

    handlePlatformChange = (value: ISelect): void => {
        const newState: IIndexState = {...this.state};
        newState.initialFilters.platform = value;
        newState.request.search.isDisabled = false;
        newState.request.search.isChanged = true;
        this.setState(newState);
    };

    handleNetworkChange = (selected: any): void => {
        const newState: IIndexState = {...this.state};
        newState.additionalFilters.network.selected = selected;
        newState.request.search.isDisabled = false;
        newState.request.search.isChanged = true;
        this.setState(newState);
    };

    handleUserGroupChange = (selected: any): void => {
        const newState: IIndexState = {...this.state};
        newState.initialFilters.userGroup = selected;
        newState.request.search.isDisabled = false;
        newState.request.search.isChanged = true;
        this.setState(newState);
    };

    handleActivityApply = (e: React.MouseEvent<HTMLInputElement>, picker: any): void => {
        e.preventDefault();
        const newState: IIndexState = {...this.state};
        newState.additionalFilters.activity.startDate = picker.startDate;
        newState.additionalFilters.activity.endDate = picker.endDate;
        newState.request.search.isDisabled = false;
        newState.request.search.isChanged = true;
        this.setState(newState);
    };

    handleBlockedChange = (value: any): void => {
        const newState: IIndexState = {...this.state};
        newState.additionalFilters.blocked.value = value;
        newState.request.search.isDisabled = false;
        newState.request.search.isChanged = true;
        this.setState(newState);
    };

    handleOldPhoneChange = (selected: any): void => {
        const newState: IIndexState = {...this.state};
        newState.initialFilters.phone.selected = selected;
        newState.request.search.isDisabled = false;
        newState.request.search.isChanged = true;
        this.setState(newState);
    };

    handleEmailChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IIndexState = {...this.state};
        newState.nickEmail = value;
        newState.request.search.isDisabled = false;
        newState.request.search.isChanged = true;
        this.setState(newState);
    };

    handleNicknameChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IIndexState = {...this.state};
        newState.nickname = value;
        this.setState(newState);
    };

    handleBalanceChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IIndexState = {...this.state};
        newState.additionalFilters.balance[name] = value;
        newState.request.search.isDisabled = false;
        newState.request.search.isChanged = true;
        this.setState(newState);
    };

    handleAdditionFilterChange = ({currentTarget: {name, value, dataset}}: React.ChangeEvent<HTMLInputElement>): any => {
        const newState: IIndexState = {...this.state};
        newState.additionalFilters[dataset.id][name] = value === "" ? "" : (+value < 1 ? "1" : parseInt(value));
        newState.request.search.isDisabled = false;
        newState.request.search.isChanged = true;
        this.setState(newState);
    };

    handleAdditionFilterFocus = (e: React.FormEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const key: string = e.currentTarget.getAttribute("data-id");
        const {additionalFilters} = this.state;
        if (+additionalFilters[key].from > +additionalFilters[key].to) {
            const newState: IIndexState = {...this.state};
            newState.additionalFilters[key].to = +additionalFilters[key].from + 1;
            this.setState(newState);
        }
    };

    handleAdditionFilterBlur = (e: React.FormEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const key: string = e.currentTarget.getAttribute("data-id");
        const {additionalFilters} = this.state;
        if (+additionalFilters[key].from > +additionalFilters[key].to) {
            const newState: IIndexState = {...this.state};
            newState.additionalFilters[key].to = "";
            this.setState(newState);
        }
    };

    handleAddFilter = (eventKey: any, e: React.MouseEvent<HTMLAnchorElement>): void => {
        e.preventDefault();
        const newState: IIndexState = {...this.state};
        if (this.filterKeys.includes(eventKey)) {
            newState.additionalFilters[eventKey].enable = !newState.additionalFilters[eventKey].enable;
            this.setState(newState);
        }
    };

    handleRemoveFilter = (e: React.MouseEvent<HTMLSpanElement>): void => {
        e.preventDefault();
        const {request: {search: {isChanged}}} = this.state;
        const key: string = e.currentTarget.getAttribute("data-key");
        const newState: IIndexState = {...this.state};
        if (this.filterKeys.includes(key)) {
            if (key === "network") {
                newState.additionalFilters.network = {
                    name: ADDITIONAL_FILTERS.network,
                    selected: null,
                    options: [],
                    enable: false,
                    active: true
                };
            } else if (key === "activity") {
                newState.additionalFilters.activity = {
                    name: ADDITIONAL_FILTERS.activity,
                    startDate: "",
                    endDate: "",
                    enable: false,
                    active: true
                };
            } else if (key === "blocked") {
                newState.additionalFilters.blocked = {
                    name: ADDITIONAL_FILTERS.blocked,
                    value: null,
                    enable: false,
                    active: false,
                };
            } else {
                newState.additionalFilters[key] = {
                    name: ADDITIONAL_FILTERS[key],
                    from: "",
                    to: "",
                    enable: false,
                    active: true,
                };
            }
            if (isChanged) {
                newState.request.search.isDisabled = false;
            }
            this.setState(newState);
        }
    };

    handleReset = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {additionalFilters} = this.state;
        const newState: IIndexState = {...this.state};

        newState.initialFilters = {
            registration: {
                startDate: moment("2000-01-01"),
                endDate: moment(),
                selectedDate: moment(),
            },
            country: null,
            platform: null,
            phone: {
                selected: null,
                options: [],
                value: ""
            },
            channel: {
                selected: null,
                options: [],
            },
            userGroup: null
        };
        const additionalDefaultFilters: any = {
            activity: {
                name: ADDITIONAL_FILTERS.activity,
                startDate: "",
                endDate: "",
                enable: false,
                active: true
            },
            network: {
                name: ADDITIONAL_FILTERS.network,
                selected: null,
                options: [],
                enable: false,
                active: true
            },
            blocked: {
                name: ADDITIONAL_FILTERS.blocked,
                value: null,
                enable: false,
                active: false
            },
            balance: {
                name: ADDITIONAL_FILTERS.balance,
                from: "",
                to: "",
                enable: false,
                active: false
            },
            callCount: {
                name: ADDITIONAL_FILTERS.callCount,
                from: "",
                to: "",
                enable: false,
                active: true
            },
            duration: {
                name: ADDITIONAL_FILTERS.duration,
                from: "",
                to: "",
                enable: false,
                active: true
            },
            messageCount: {
                name: ADDITIONAL_FILTERS.messageCount,
                from: "",
                to: "",
                enable: false,
                active: true
            }
        };

        for (const item in additionalDefaultFilters) {
            if (additionalDefaultFilters.hasOwnProperty(item)) {
                additionalDefaultFilters[item].enable = additionalFilters[item].enable;
            }
        }
        newState.additionalFilters = additionalDefaultFilters;
        newState.request.reset.isProcessing = true;
        newState.request.isLoading = true;
        newState.request.fetchCount = true;
        newState.nickname = "";
        newState.nickEmail = "";
        this.setState(newState);
        this.initRequests(newState, 0, false, true);
    };

    handleSearch = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const newState: IIndexState = {...this.state};
        newState.request.search.isProcessing = true;
        newState.request.isLoading = true;
        newState.request.fetchCount = true;
        newState.offset = 0;
        this.setState(newState);
        this.initRequests(newState, newState.offset, true);
    };

    handleFindUsers: any = async (value: string) => {
        const newState: IIndexState = {...this.state};
        const response: any = await getSearchedUsers(value);
        if (response.data.err) {
            return [];
        }

        const result: any[] = response.data.result
            .filter(user => (user.email ? user.email : user.username).toLowerCase().includes(value.toLowerCase()))
            .map(user => {
                return {
                    value: user.userId,
                    label: user.email ? user.email : user.username
                }
            });

        newState.initialFilters.phone.options = result;
        if (this.componentState) {
            this.setState(newState);
        }
        return result;
    };

    handleGetNetworks: any = async (value: string) => {
        const newState: IIndexState = {...this.state};
        const response: any = await getVirtualNetworks(0, 50);
        if (response.data.err) {
            return [];
        }

        const result: any[] = response.data.result
            .filter(network => network.nickName.toLowerCase().includes(value.toLowerCase()))
            .map(network => {
                return {
                    value: network.networkId,
                    label: network.nickName
                }
            });

        newState.additionalFilters.network.options = result;
        if (this.componentState) {
            this.setState(newState);
        }
        return result;
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
        newState.popup.isShown = true;
        this.setState(newState);
    };

    handleModalClose = (): void => {
        const {validation} = this.state;
        const newState: IIndexState = {...this.state};

        newState.popup.isShown = false;
        newState.popup.newUser = {
            phoneNumber: "",
            email: "",
            username: "",
            country: null,
            password: "",
            confirmPassword: "",
            selectedOption: NEW_USER_CREATE.TYPE.VIA_PHONE_NUMBER,
            isValidNumber: false,
            isValidEmail: false,
            isValidUsername: false,
        };
        for (const item in validation.newUser) {
            if (validation.newUser.hasOwnProperty(item)) {
                newState.validation.newUser[item] = {
                    value: null,
                    message: ""
                }
            }
        }
        this.setState(newState);
    };

    handleNewUserPhoneNumberChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        const newState: IIndexState = {...this.state};
        let valueForValidate: string = value;

        if (isNumeric(valueForValidate) && valueForValidate.substr(0, 1) !== "+") {
            valueForValidate = "+" + valueForValidate.toString();
        }

        const {isValid} = validateNumber(valueForValidate);

        newState.popup.newUser.phoneNumber = value;
        newState.validation.newUser.phoneNumber.value = value === "" ? null : isValid ? "success" : "error";
        newState.validation.newUser.phoneNumber.message = (value === "" || isValid) ? "" : "Invalid phone number";
        newState.popup.newUser.isValidNumber = isValid;
        this.handleNewUserToggleDisabled(newState);
        this.setState(newState);
    };

    handleNewUserCountryChange = (value: ISelect): void => {
        const newState: IIndexState = {...this.state};
        newState.popup.newUser.country = value;
        newState.validation.newUser.country.value = !!value ? "success" : "error";
        this.handleNewUserToggleDisabled(newState);
        this.setState(newState);
    };

    handleNewUserPasswordChange = ({currentTarget: {value, name}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: any = {...this.state};
        if (name === "password") {
            newState.popup.newUser.password = value;
            // const pattern: any = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/g);
            const pattern: any = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/g);
            newState.validation.newUser.password.value = pattern.test(newState.popup.newUser.password) ? "success" : value === "" ? null : "error";
            // newState.validation.newUser.password.value = value.length >= PASSWORD_MIN_LENGTH ? "success" : value === "" ? null : "error";
            const errorString = `Please enter a password complying with the following rules: \n
                    . At least 8 characters long \n
                    . At least one lowercase \n
                    . At least one uppercase \n
                    . At least one number \n
                    . At least one special character`;

            newState.validation.newUser.password.message = (pattern.test(newState.popup.newUser.password) || value === "") ? ""
                : errorString;
            if (value.length >= PASSWORD_MIN_LENGTH && value === newState.popup.newUser.confirmPassword) {
                newState.validation.newUser.confirmPassword.message = "";
                newState.validation.newUser.confirmPassword.value = "success";
            }
        }
        if (name === "confirmPassword") {
            const password: string = newState.popup.newUser.password;
            newState.popup.newUser.confirmPassword = value;
            newState.validation.newUser.confirmPassword.value = (value === password && password.length >= PASSWORD_MIN_LENGTH) ?
                "success" : value === "" ? null : "error";
            newState.validation.newUser.confirmPassword.message = ((value === password && password.length >= PASSWORD_MIN_LENGTH) || value === "") ? ""
                : "Your password and confirmation password do not match";
        }
        this.handleNewUserToggleDisabled(newState);
        this.setState(newState);
    };

    handleNewUserToggleDisabled = (state: any): void => {
        const {selectedOption, country, password, confirmPassword, isValidNumber, isValidEmail, isValidUsername}: any = {...state.popup.newUser};
        state.request.createUser.isDisabled = ((selectedOption === NEW_USER_CREATE.TYPE.VIA_PHONE_NUMBER && !isValidNumber) ||
            (selectedOption === NEW_USER_CREATE.TYPE.VIA_EMAIL && !isValidEmail) ||
            (selectedOption === NEW_USER_CREATE.TYPE.VIA_USERNAME && !isValidUsername) ||
            !country || password === "" || confirmPassword === "" || password !== confirmPassword);
    };

    handleNewUserEmailChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IIndexState = {...this.state};
        const pattern: any = new RegExp(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        newState.popup.newUser.email = value;
        newState.popup.newUser.isValidEmail = pattern.test(value);
        newState.validation.newUser.email.value = newState.popup.newUser.isValidEmail ? "success" : "error";
        this.handleNewUserToggleDisabled(newState);
        this.setState(newState);
    };

    handleNewUserUsernameChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IIndexState = {...this.state};
        const pattern: any = new RegExp(/^(?=.*[a-z])[a-zA-Z0-9]{6,20}$/g);
        newState.popup.newUser.username = value;
        newState.popup.newUser.isValidUsername = pattern.test(value);
        newState.validation.newUser.username.value = newState.popup.newUser.isValidUsername ? "success" : "error";
        newState.validation.newUser.username.message = newState.popup.newUser.isValidUsername ? ""
            : `Username should be between ${NICKNAME_MIN_LENGTH} and ${NICKNAME_MAX_LENGTH} symbols. Only lowercase letters and numbers are allowed`;
        this.handleNewUserToggleDisabled(newState);
        this.setState(newState);
    };

    handleRegistrationTypeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const selectedOption: string = e.currentTarget.value;
        const newState: IIndexState = {...this.state};
        newState.popup.newUser.selectedOption = selectedOption;
        this.handleNewUserToggleDisabled(newState);
        this.setState(newState);
    };

    handleUserView = (userId: number): void => {
        const {history} = this.props;
        try {
            userId && history.push(`/users/${userId}`);
        } catch (e) {
            console.log(e);
        }
    };

    handleCreateUser = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {popup: {newUser}, validation} = this.state;
        const newState: IIndexState = {...this.state};

        newState.request.createUser.isProcessing = true;
        this.setState(newState);

        const newUserData: any = {
            password: newUser.password,
            regionCode: newUser.country.region_code,
        };
        if (newUser.selectedOption === NEW_USER_CREATE.TYPE.VIA_PHONE_NUMBER) {
            newUserData.phoneNumber = newUser.phoneNumber;
        }
        if (newUser.selectedOption === NEW_USER_CREATE.TYPE.VIA_EMAIL) {
            newUserData.email = newUser.email;
        }
        if (newUser.selectedOption === NEW_USER_CREATE.TYPE.VIA_USERNAME) {
            newUserData.nickname = newUser.username.toLowerCase();
        }

        createNewUser(newUserData).then(({data}: AxiosResponse) => {

            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.popup.isShown = false;
            newState.popup.newUser = {
                phoneNumber: "",
                email: "",
                username: "",
                country: null,
                password: "",
                confirmPassword: "",
                selectedOption: NEW_USER_CREATE.TYPE.VIA_PHONE_NUMBER,
                isValidNumber: false,
                isValidEmail: false,
                isValidUsername: false,
            };
            for (const item in validation.newUser) {
                if (validation.newUser.hasOwnProperty(item)) {
                    newState.validation.newUser[item] = {
                        value: null,
                        message: ""
                    }
                }
            }
            newState.request.createUser.isProcessing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "User successfully created",
                    timer: 3000,
                    hideProgress: true
                });
            }
            this.initRequests(newState);

        }).catch(err => {
            console.log(err);
            const errorType: string = (JSON.parse(err.message)).err_msg;
            const errorMessage: string = errorType === "USER_ALREADY_EXIST" ?
                replaceAll(ERROR_TYPES[errorType], {"{record}": newUserData.phoneNumber || newUserData.email}) : "";
            if (errorType === "USER_ALREADY_EXIST") {
                if (newUser.selectedOption === NEW_USER_CREATE.TYPE.VIA_PHONE_NUMBER) {
                    newState.validation.newUser.phoneNumber = {
                        value: "error",
                        message: "Phone number already exists"
                    }
                }
                if (newUser.selectedOption === NEW_USER_CREATE.TYPE.VIA_EMAIL) {
                    newState.validation.newUser.email = {
                        value: "error",
                        message: "Email already exists"
                    }
                }
                if (newUser.selectedOption === NEW_USER_CREATE.TYPE.VIA_USERNAME) {
                    newState.validation.newUser.username = {
                        value: "error",
                        message: "Username already exists"
                    }
                }
            }
            newState.request.createUser.isProcessing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: `${errorMessage === "" ? `Cannot create user, ${ERROR_TYPES[errorType]}` : errorMessage}`,
                    timer: 3000
                });
            }
        })
    };

    handleFindChannels: any = async (value: string) => {
        const newState: IIndexState = {...this.state};
        const response: any = await getSearchChannels(value);
        if (response.data.err) {
            return [];
        }

        const result: any[] = response.data.result
          .map(channel => {
              return {
                  value: channel.roomName,
                  label: channel.subject
              }
          });

        newState.initialFilters.channel.options = result;
        if (this.componentState) {
            this.setState(newState);
        }

        return result;
    };

    handleChannelChange = (value: any) => {
        const newState: IIndexState = {...this.state};
        newState.initialFilters.channel.selected = value;
        this.setState(newState);
    }

    render(): JSX.Element {
        const {
            offset, limit, ranges, users, userGroups, initialFilters, request: {isLoading, search, reset, isPaging, createUser, fetchCount}, isInitialLoading,
            additionalFilters: {activity, network, blocked, balance, callCount, duration, messageCount}, validation, popup: {isShown, newUser}, nickname, nickEmail
        }: IIndexState = this.state;
        const {countries, platforms} = this.props;
        const addFilter: any = Object.keys(this.state.additionalFilters).map((item, index) => {
            const filter: any = this.state.additionalFilters[item];
            return (
                <MenuItem key={index} eventKey={item} onSelect={this.handleAddFilter} disabled={!filter.active}>
                    <span className="p-r-sm">{filter.name}</span>
                    {filter.enable &&
                    <i className="fa fa-check f-r text-primary-nav padder-t-b-3x"/>}
                </MenuItem>
            )
        });

        return (
            <div>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-4">
                                <span className="text-xlg padder-t-3 block">Registered users</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-8">
                                <div className="text-right">
                                    <button
                                        className="btn btn-default btn-addon"
                                        onClick={this.handleModalOpen}
                                    ><i className="fa fa-plus"/>New User
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        {/*Filters section start*/}

                        {/*Default filters*/}
                        <div className="row">
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="phone-number">Username</ControlLabel>
                                    <FormControl
                                      name="phone-number"
                                      id="phone-number"
                                      onChange={this.handleNicknameChange}
                                      value={nickname}
                                      placeholder="Username"
                                      autoComplete={"new-password"}
                                    />
                                </FormGroup>
                            </div>

                            {/*Country*/}
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="country">Country</ControlLabel>
                                    <Select
                                        inputId="country"
                                        name="country"
                                        closeMenuOnSelect={true}
                                        isClearable={true}
                                        styles={selectMenuStyles}
                                        value={initialFilters.country}
                                        options={countries}
                                        onChange={this.handleCountryChange}
                                    />
                                </FormGroup>
                            </div>

                            {/*Phone number*/}
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="phone-number">Email</ControlLabel>
                                    {/*<AsyncSelect*/}
                                    {/*inputId="phone-number"*/}
                                    {/*name="phone-number"*/}
                                    {/*placeholder="Phone number / Email"*/}
                                    {/*cacheOptions={true}*/}
                                    {/*isClearable={true}*/}
                                    {/*value={initialFilters.phone.selected}*/}
                                    {/*styles={selectMenuStyles}*/}
                                    {/*defaultOptions={initialFilters.phone.options}*/}
                                    {/*loadOptions={promiseSelectOptions(this.handleFindUsers)}*/}
                                    {/*onChange={this.handlePhoneChange}*/}
                                    {/*/>*/}

                                    <FormControl
                                      name="phone-number"
                                      id="phone-number"
                                      onChange={this.handleEmailChange}
                                      value={nickEmail}
                                      placeholder="Email"
                                      autoComplete={"new-password"}
                                    />
                                </FormGroup>
                            </div>
                            {/*Platforms*/}
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="platform">Platform</ControlLabel>
                                    <Select
                                        inputId="platform"
                                        name="platform"
                                        isClearable={true}
                                        styles={selectMenuStyles}
                                        closeMenuOnSelect={true}
                                        value={initialFilters.platform}
                                        options={platforms}
                                        onChange={this.handlePlatformChange}
                                    />
                                </FormGroup>
                            </div>

                            {/*User Groups*/}

                            {/*different for Zangi: open for zangi, closed for others*/}

                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="userGroup">User Groups</ControlLabel>
                                    <Select
                                      inputId="userGroup"
                                      name="userGroup"
                                      isClearable={true}
                                      styles={selectMenuStyles}
                                      closeMenuOnSelect={true}
                                      value={initialFilters.userGroup}
                                      options={userGroups}
                                      onChange={this.handleUserGroupChange}
                                    />
                                </FormGroup>
                            </div>

                            {/*end*/}

                            {/*Registration date*/}
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="registration">Registration date</ControlLabel>
                                    <DatetimeRangePicker
                                        name="date"
                                        onApply={this.handleRegistrationApply}
                                        ranges={ranges}
                                        applyClass="btn-info"
                                    >
                                        <div className="input-group">
                                            <input
                                                className="form-control"
                                                id="registration"
                                                name="registration"
                                                value={pickerLabel(initialFilters.registration.startDate, initialFilters.registration.endDate)}
                                                onChange={this.handlePickerChange}
                                            />
                                            <span className="input-group-btn">
                                                <button className="btn btn-default default date-range-toggle">
                                                <i className="fa fa-calendar"/>
                                                </button>
                                            </span>
                                        </div>
                                    </DatetimeRangePicker>
                                </FormGroup>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="channel">Channel Name</ControlLabel>
                                    <AsyncSelect
                                      inputId="channel-name"
                                      name="channel-name"
                                      placeholder="Channel name"
                                      cacheOptions={true}
                                      isClearable={true}
                                      autoFocus={true}
                                      value={initialFilters.channel.selected}
                                      styles={selectMenuStyles}
                                      defaultOptions={initialFilters.channel.options}
                                      loadOptions={promiseSelectOptions(this.handleFindChannels)}
                                      onChange={this.handleChannelChange}
                                    />
                                </FormGroup>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="registration">Users by Date</ControlLabel>
                                    <Datetime
                                        value={new Date(initialFilters.registration.selectedDate.format("DD MMM YYYY hh:mm A"))}
                                        // initialValue={initialFilters.registration.selectedDate}
                                        // initialViewDate={initialFilters.registration.selectedDate}
                                        onChange={this.handleByDateChange}
                                        timeFormat={false}
                                    />
                                </FormGroup>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <span>Active Subscription</span>
                                    <Radio
                                        className="m-t-xs"
                                        value=""
                                        checked={initialFilters.isSubscribed === null}
                                        onChange={this.handleSubscriptionChange}
                                    >
                                        All
                                    </Radio>
                                    <Radio
                                        value="subscribed"
                                        checked={initialFilters.isSubscribed === true}
                                        onChange={this.handleSubscriptionChange}
                                    >
                                        Subscribed
                                    </Radio>
                                    <Radio
                                        value="not-subscribed"
                                        checked={initialFilters.isSubscribed === false}
                                        onChange={this.handleSubscriptionChange}
                                    >
                                        Not Subscribed
                                    </Radio>
                                </FormGroup>
                            </div>
                        </div>

                        {/*Additional filters*/}
                        <div className="row">
                            {/*Last Activity*/}
                            {
                                activity.enable &&
                                <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                    <FormGroup>
                                        <ControlLabel htmlFor="activity">
                                            Last Activity
                                            <span
                                                className="fa fa-close text-primary-nav m-l-xs cursor-pointer"
                                                data-key="activity"
                                                onClick={this.handleRemoveFilter}
                                            />
                                        </ControlLabel>
                                        <DatetimeRangePicker
                                            name="date"
                                            onApply={this.handleActivityApply}
                                            ranges={ranges}
                                            applyClass="btn-info"
                                        >
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="activity"
                                                    name="activity"
                                                    value={pickerLabel(activity.startDate, activity.endDate)}
                                                    onChange={this.handlePickerChange}
                                                />
                                                <span className="input-group-btn">
                                                    <button className="btn btn-default date-range-toggle">
                                                        <i className="fa fa-calendar"/>
                                                    </button>
                                                </span>
                                            </div>
                                        </DatetimeRangePicker>
                                    </FormGroup>
                                </div>
                            }
                            {/*Network*/}
                            {
                                network.enable &&
                                <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                    <FormGroup>
                                        <ControlLabel htmlFor="network">
                                            Network
                                            <span
                                                className="fa fa-close text-primary-nav m-l-xs cursor-pointer"
                                                data-key="network"
                                                onClick={this.handleRemoveFilter}
                                            />
                                        </ControlLabel>
                                        <AsyncSelect
                                            id="network"
                                            name="network"
                                            placeholder="Type to search network"
                                            cacheOptions={true}
                                            isClearable={true}
                                            styles={selectMenuStyles}
                                            value={network.selected}
                                            defaultOptions={network.options}
                                            loadOptions={promiseSelectOptions(this.handleGetNetworks)}
                                            onChange={this.handleNetworkChange}
                                        />
                                    </FormGroup>
                                </div>
                            }
                            {/*Blocked*/}
                            {
                                blocked.enable &&
                                <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                    <FormGroup>
                                        <ControlLabel htmlFor="blocked">
                                            Blocked
                                            <span
                                                className="fa fa-close text-primary-nav m-l-xs cursor-pointer"
                                                data-key="blocked"
                                                onClick={this.handleRemoveFilter}
                                            />
                                        </ControlLabel>
                                        <Select
                                            id="blocked"
                                            name="blocked"
                                            options={[
                                                {value: "yes", label: "Yes"},
                                                {value: "no", label: "No"},
                                            ]}
                                            value={blocked.value}
                                            onChange={this.handleBlockedChange}
                                        />
                                    </FormGroup>
                                </div>
                            }
                            {/*Balance*/}
                            {
                                balance.enable &&
                                <div className="balance-filter">
                                    <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                        <div className="container-fluid no-padder">
                                            <div className="row">
                                                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                                                    <FormGroup validationState={null}>
                                                        <ControlLabel htmlFor="balance-from">
                                                            Balance
                                                            <span
                                                                className="fa fa-close text-primary-nav m-l-xs cursor-pointer"
                                                                data-key="balance"
                                                                onClick={this.handleRemoveFilter}
                                                            />
                                                        </ControlLabel>
                                                        <FormControl
                                                            type="text"
                                                            name="balance-from"
                                                            id="balance-from"
                                                            onChange={this.handleBalanceChange}
                                                            value={balance.from}
                                                            placeholder="From"
                                                        />
                                                    </FormGroup>
                                                </div>
                                                <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                                                    <FormGroup>
                                                        <ControlLabel>&nbsp;</ControlLabel>
                                                        <FormControl
                                                            id="balance-to"
                                                            name="balance-to"
                                                            onChange={this.handleBalanceChange}
                                                            value={balance.to}
                                                            placeholder="Up to"
                                                        />
                                                    </FormGroup>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }

                            {/*Number of calls*/}
                            {
                                callCount.enable &&
                                <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                    <div className="container-fluid no-padder">
                                        <div className="row">
                                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                                <label htmlFor="call-count-from" className="text-md">
                                                    Number of calls
                                                    <span
                                                        className="fa fa-close text-primary-nav m-l-xs cursor-pointer"
                                                        data-key="callCount"
                                                        onClick={this.handleRemoveFilter}
                                                    />
                                                </label>
                                            </div>
                                            <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                                                <FormGroup>
                                                    <FormControl
                                                        min="1"
                                                        id="call-count-from"
                                                        data-id="callCount"
                                                        type="number"
                                                        name="from"
                                                        placeholder="From"
                                                        value={callCount.from}
                                                        onChange={this.handleAdditionFilterChange}
                                                    />
                                                </FormGroup>
                                            </div>
                                            <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                                                <FormGroup>
                                                    <FormControl
                                                        data-id="callCount"
                                                        name="to"
                                                        id="callCount"
                                                        type="number"
                                                        placeholder="Up to"
                                                        value={callCount.to}
                                                        min={(callCount.from && +callCount.from > 1) ? (callCount.from + 1) : "1"}
                                                        onChange={this.handleAdditionFilterChange}
                                                        onFocus={this.handleAdditionFilterFocus}
                                                        onBlur={this.handleAdditionFilterBlur}
                                                    />
                                                </FormGroup>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }

                            {/*Call duration*/}
                            {
                                duration.enable &&
                                <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                    <div className="container-fluid no-padder">
                                        <div className="row">
                                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                                <label htmlFor="duration-from" className="text-md">
                                                    Call duration
                                                    <span
                                                        className="fa fa-close text-primary-nav m-l-xs cursor-pointer"
                                                        data-key="duration"
                                                        onClick={this.handleRemoveFilter}
                                                    />
                                                </label>
                                            </div>
                                            <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                                                <FormGroup>
                                                    <FormControl
                                                        min="1"
                                                        id="duration-from"
                                                        type="number"
                                                        name="from"
                                                        pattern="[0-9.]+"
                                                        data-id="duration"
                                                        placeholder="From"
                                                        value={duration.from}
                                                        onChange={this.handleAdditionFilterChange}
                                                    />
                                                </FormGroup>
                                            </div>
                                            <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                                                <FormGroup>
                                                    <FormControl
                                                        name="to"
                                                        id="duration-to"
                                                        type="number"
                                                        data-id="duration"
                                                        pattern="[0-9.]+"
                                                        placeholder="Up to"
                                                        value={duration.to}
                                                        min={(duration.from && +duration.from > 1) ? (duration.from + 1) : "1"}
                                                        onChange={this.handleAdditionFilterChange}
                                                        onFocus={this.handleAdditionFilterFocus}
                                                        onBlur={this.handleAdditionFilterBlur}
                                                    />
                                                </FormGroup>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }

                            {/*Number of messages*/}
                            {
                                messageCount.enable &&
                                <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                    <div className="container-fluid no-padder">
                                        <div className="row">
                                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                                <label htmlFor="message-count-from" className="text-md">
                                                    Number of messages
                                                    <span
                                                        className="fa fa-close text-primary-nav m-l-xs cursor-pointer"
                                                        data-key="messageCount"
                                                        onClick={this.handleRemoveFilter}
                                                    />
                                                </label>
                                            </div>
                                            <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                                                <FormGroup>
                                                    <FormControl
                                                        min="1"
                                                        name="from"
                                                        type="number"
                                                        id="message-count-from"
                                                        data-id="messageCount"
                                                        placeholder="From"
                                                        onChange={this.handleAdditionFilterChange}
                                                        value={messageCount.from}
                                                    />
                                                </FormGroup>
                                            </div>
                                            <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                                                <FormGroup>
                                                    <FormControl
                                                        type="number"
                                                        name="to"
                                                        id="message-count-to"
                                                        data-id="messageCount"
                                                        placeholder="Up to"
                                                        value={messageCount.to}
                                                        min={(messageCount.from && +messageCount.from > 1) ? (messageCount.from + 1) : "1"}
                                                        onChange={this.handleAdditionFilterChange}
                                                        onFocus={this.handleAdditionFilterFocus}
                                                        onBlur={this.handleAdditionFilterBlur}
                                                    />
                                                </FormGroup>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                        {/*Filters section end*/}

                        <hr/>

                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-4">
                                <span className="block text-xl padder-t-8">
                                    {(isInitialLoading || fetchCount) ? <Loading isSmall={true}/> : users.count}
                                </span>
                                <span className="block">Number of users</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-8 text-right padder-t-16">
                                <DropdownButton title="Add filter" id="add-filter">{addFilter}</DropdownButton>
                                <button
                                    className="btn btn-default m-l-sm"
                                    disabled={reset.isDisabled || reset.isProcessing}
                                    onClick={this.handleReset}
                                >Reset{reset.isProcessing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                </button>
                                <button
                                    className="btn btn-info m-l-sm"
                                    disabled={search.isProcessing || isInitialLoading}
                                    onClick={this.handleSearch}
                                >Search{search.isProcessing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/*Users list*/}

                {isInitialLoading ? <Loading/> :
                    <div className={`${isLoading ? "inactive" : ""}`}>
                        <Table
                            hover={true}
                            condensed={true}
                            responsive={true}
                        >
                            <thead>
                            <tr>
                                <th/>
                                <th>Nickname</th>
                                <th>Email</th>
                                <th>Full Name</th>
                                <th>Registered</th>
                                {/*<th>Channel</th>*/}

                                {/*different for Zangi: open for zangi, closed for others*/}

                                {/*<th>User Group</th>*/}
                                <th>Subscription status</th>
                                <th>Date</th>
                                {/*end*/}
                                <th/>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                (users.records && users.records.length === 0) &&
                                <tr>
                                    <td colSpan={6}>No results</td>
                                </tr>
                            }

                            {users.records && users.records.length > 0 && users.records.map((user, index) => {
                                const N: number = offset * limit + index + 1;
                                const userView: any = () => this.handleUserView(user.userId);
                                return (
                                    <tr key={user.userId} className="cursor-pointer" onClick={userView}>
                                        <td>{N}</td>
                                        <td>{user.nickname}</td>
                                        <td>{user.nickEmail || ""}</td>
                                        <td>{`${user.firstName || user.firstNameNick || ""} ${user.lastName || user.lastNameNick || ""}`}</td>
                                        <td>{format(new Date(user.createdAt), "DD MMM YYYY hh:mm A")}</td>
                                        {/*<td>*/}
                                        {/*    {(user.channels && user.channels[0].name) || ""}*/}
                                        {/*    <span className="zangi-count-channel">{(user.channels && user.channels.length > 1) ? ` +${user.channels.length - 1}` : ""}</span>*/}
                                        {/*</td>*/}
                                        {/*different for Zangi: Open for zangi, closed for others*/}

                                        {/*<td>{user.userGroup && user.userGroup.groupName || "Default"}</td>*/}
                                        <td>{user.isSubscribed ? "active" : "inactive"}</td>
                                        <td className="space-nowrap">{moment(user.createdAt).format("YY-MM-DD")}</td>
                                        {/*end*/}
                                        <td className="padder-l-lg-important">
                                            <MoreActions
                                                isDropup={(index === users.records.length - 1) && users.records.length !== 1}
                                                isAbsolute={true}
                                            >
                                                <li>
                                                    <Link
                                                        to={`/users/${user.userId}`}
                                                        title="View"
                                                    >View
                                                    </Link>
                                                </li>
                                            </MoreActions>

                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </Table>
                    </div>}
                <div className="content-wrapper">
                    <div className="container-fluid">
                        {
                            !isInitialLoading && users.count > limit &&
                            <div className={`row ${isLoading ? "inactive" : ""}`}>
                                <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6">
                                    <span className="text-xs">{`Showing ${users.records.length} of ${users.count} entries`}</span>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                    <Pagination
                                        offset={offset}
                                        limit={limit}
                                        callback={promiseSelectOptions(this.handleListChange)}
                                        length={users.records.length}
                                        disabled={isPaging}
                                        count={users.count}
                                    />
                                </div>
                            </div>
                        }
                    </div>
                </div>
                {/*Create user*/}
                <Modal show={isShown} onHide={this.handleModalClose}>
                    <Modal.Header closeButton={true}>
                        <span className="font-semi-bold text-lg">Create New User</span>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <label className="radio-inline m-b-xs">
                                        <input
                                            type="radio"
                                            value={NEW_USER_CREATE.TYPE.VIA_PHONE_NUMBER}
                                            checked={newUser.selectedOption === NEW_USER_CREATE.TYPE.VIA_PHONE_NUMBER}
                                            onChange={this.handleRegistrationTypeChange}
                                        />
                                        Phone number
                                    </label>
                                    <label className="radio-inline m-b-xs">
                                        <input
                                            type="radio"
                                            value={NEW_USER_CREATE.TYPE.VIA_EMAIL}
                                            checked={newUser.selectedOption === NEW_USER_CREATE.TYPE.VIA_EMAIL}
                                            onChange={this.handleRegistrationTypeChange}
                                        />
                                        Email
                                    </label>
                                    <label className="radio-inline m-b-xs">
                                        <input
                                            type="radio"
                                            value={NEW_USER_CREATE.TYPE.VIA_USERNAME}
                                            checked={newUser.selectedOption === NEW_USER_CREATE.TYPE.VIA_USERNAME}
                                            onChange={this.handleRegistrationTypeChange}
                                        />
                                        Username
                                    </label>

                                    {
                                        newUser.selectedOption === NEW_USER_CREATE.TYPE.VIA_PHONE_NUMBER &&
                                        <FormGroup validationState={validation.newUser.phoneNumber.value}>
                                            <FormControl
                                                min="1"
                                                type="number"
                                                id="new-user-phone-number"
                                                name="new-user-phone-number"
                                                placeholder="Phone number"
                                                autoFocus={true}
                                                value={newUser.phoneNumber}
                                                onChange={this.handleNewUserPhoneNumberChange}
                                                autoComplete={"new-password"}
                                            />
                                            <HelpBlock>{validation.newUser.phoneNumber.message}</HelpBlock>
                                        </FormGroup>}
                                    {
                                        newUser.selectedOption === NEW_USER_CREATE.TYPE.VIA_EMAIL &&
                                        <FormGroup validationState={validation.newUser.email.value}>
                                            <FormControl
                                                type="mail"
                                                id="new-user-email"
                                                name="new-user-email"
                                                placeholder="Email"
                                                autoFocus={true}
                                                value={newUser.email}
                                                onChange={this.handleNewUserEmailChange}
                                                autoComplete={"new-password"}
                                            />
                                            <HelpBlock>{validation.newUser.email.message}</HelpBlock>
                                        </FormGroup>
                                    }
                                    {
                                        newUser.selectedOption === NEW_USER_CREATE.TYPE.VIA_USERNAME &&
                                        <FormGroup validationState={validation.newUser.username.value}>
                                            <FormControl
                                                type="text"
                                                id="new-user-username"
                                                name="new-user-username"
                                                placeholder="username"
                                                autoFocus={true}
                                                value={newUser.username}
                                                onChange={this.handleNewUserUsernameChange}
                                                autoComplete={"new-password"}
                                            />
                                            <HelpBlock>{validation.newUser.username.message}</HelpBlock>
                                        </FormGroup>
                                    }
                                </div>
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <FormGroup validationState={validation.newUser.country.value}>
                                        <ControlLabel htmlFor="new-user-country">Country</ControlLabel>
                                        <Select
                                            id="new-user-country"
                                            name="new-user-country"
                                            placeholder="Choose"
                                            closeMenuOnSelect={true}
                                            styles={selectMenuStyles}
                                            value={newUser.country}
                                            options={countries}
                                            onChange={this.handleNewUserCountryChange}
                                        />
                                    </FormGroup>
                                </div>
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <FormGroup validationState={validation.newUser.password.value}>
                                        <ControlLabel htmlFor="password">Password</ControlLabel>
                                        <FormControl
                                            type="password"
                                            name="password"
                                            id="password"
                                            placeholder="Password"
                                            value={newUser.password}
                                            onChange={this.handleNewUserPasswordChange}
                                        />
                                        <HelpBlock>{validation.newUser.password.message}</HelpBlock>
                                    </FormGroup>
                                </div>
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <FormGroup validationState={validation.newUser.confirmPassword.value}>
                                        <ControlLabel htmlFor="confirmPassword">Confirm password</ControlLabel>
                                        <FormControl
                                            name="confirmPassword"
                                            type="password"
                                            id="confirmPassword"
                                            placeholder="Confirm password"
                                            value={newUser.confirmPassword}
                                            onChange={this.handleNewUserPasswordChange}
                                        />
                                        <HelpBlock>{validation.newUser.confirmPassword.message}</HelpBlock>
                                    </FormGroup>
                                </div>
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <button
                                        className="btn btn-info btn-block m-b-sm"
                                        disabled={createUser.isDisabled || createUser.isProcessing}
                                        onClick={this.handleCreateUser}
                                    >Create user &nbsp;{createUser.isProcessing && <i className="fa fa-spinner fa-spin"/>}
                                    </button>
                                </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Index);
