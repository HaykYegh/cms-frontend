import axios from "axios";
import * as React from "react";
import Select from "react-select";
import * as numeral from "numeral";
import format from "date-fns/format";
import {Link} from "react-router-dom";
import Form from "react-bootstrap/es/Form";
import Modal from "react-bootstrap/es/Modal";
import Button from "react-bootstrap/es/Button";
import HelpBlock from "react-bootstrap/es/HelpBlock";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {getBalance, isBlocked, deleteUser, addBalance, unblockUser, blockUser, getUserGroup} from "ajaxRequests/users";
import MoreActions from "components/Common/MoreActions";
import {showNotification} from "helpers/PageHelper";
import Loader from "components/Common/Loading";
import {IVALIDATION} from "services/interface";
import Popup from "components/Common/Popup";
import moment from "moment";

interface IUserInformationState {
    isLoading: boolean,
    userBalance: any,
    userGroupList: any[],
    userGroup: string,
    popup: any,
    validation: {
        popup: {
            balance: {
                amount: IVALIDATION,
                currency: IVALIDATION,
            },
        },
    },
}

interface IUserInformationProps {
    user: any,
    history: any,
    currencies: any,
    userProfile: any,
}

class User extends React.Component<IUserInformationProps, IUserInformationState> {

    isComponentMounted: boolean = true;

    constructor(props: IUserInformationProps) {
        super(props);
        this.state = {
            isLoading: true,
            userBalance: null,
            userGroupList: [],
            userGroup: "",
            popup: {
                addBalance: {
                    isShown: false,
                    balance: {
                        amount: "",
                        currency: "",
                    },
                    isProcessing: false,
                },
                blockUser: {
                    isShown: false,
                    isBlocked: false,
                },
                deleteUser: {
                    isShown: false,
                }

            },
            validation: {
                popup: {
                    balance: {
                        amount: {
                            value: null,
                            message: "",
                        },
                        currency: {
                            value: null,
                            message: "",
                        },
                    },
                },
            },
        }
    }

    get isSubscribed(): boolean {
        const {user} = this.props;

        return (user.subscriptionType === "SUBSCRIPTION_PURCHASED" &&
            !moment(user.subscriptionEndDate).isBefore(moment()));
    }

    componentDidMount(): void {
        this.initRequests();
    }

    initRequests = (): void => {
        const {user} = this.props;
        const newState: IUserInformationState = {...this.state};
        axios.all([
            getBalance(user.username),
            isBlocked(user.username),
            getUserGroup(user.user_id, 0, 1000)
        ]).then(axios.spread((balance, isBlocked, userGroup) => {

            if (!balance.data.err) {
                newState.userBalance = balance.data.result;
            } else {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get user balance",
                    timer: 3000,
                    hideProgress: true
                });
            }

            if (!isBlocked.data.err) {
                newState.popup.blockUser.isBlocked = isBlocked.data.result.isLocked;
            } else {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get user information",
                    timer: 3000,
                    hideProgress: true
                });
            }

            if (!userGroup.data.err) {
                newState.userGroupList = userGroup.data.result && userGroup.data.result.records || [];
                newState.userGroup = newState.userGroupList.map(item => item.name).join(", ");

            } else {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get user information",
                    timer: 3000,
                    hideProgress: true
                });
            }
            newState.isLoading = false;
            if (this.isComponentMounted) {
                this.setState(newState);
            }

        })).catch((e) => {
            console.log(e);
            if (this.isComponentMounted) {
                if (newState.isLoading) {
                    newState.isLoading = false;
                }
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get user information",
                    timer: 3000
                });
            }
        });
    };

    handleUserBlock = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const {popup} = this.state;
        const {user} = this.props;
        const newState: any = {...this.state};

        newState.popup.blockUser.isShown = false;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        if (popup.blockUser.isBlocked) {
            unblockUser(user.username).then(response => {
                if (!response.data.err) {
                    newState.popup.blockUser.isBlocked = response.data.result.isLocked;
                } else {
                    showNotification("error", {
                        title: "You've got an error!",
                        description: "Error occurred while unblocking user for unknown reason",
                        id: toastId
                    });
                }
                if (!newState.popup.blockUser.isBlocked) {
                    showNotification("success", {
                        title: "Success!",
                        description: "User is unblocked",
                        id: toastId
                    });
                } else {
                    showNotification("error", {
                        title: "You've got an error!",
                        description: "Error occurred while unblocking user for unknown reason",
                        id: toastId
                    });
                }
                if (this.isComponentMounted) {
                    this.setState(newState);
                }
            }).catch(err => console.log(err));
        } else {
            blockUser(user.username).then(response => {
                if (!response.data.err) {
                    newState.popup.blockUser.isBlocked = response.data.result.isLocked;
                } else {
                    showNotification("error", {
                        title: "You've got an error!",
                        description: "Error occurred for unknown reason",
                        id: toastId
                    });
                }
                if (newState.popup.blockUser.isBlocked) {
                    showNotification("success", {
                        title: "Success!",
                        description: "User is blocked",
                        id: toastId
                    });
                } else {
                    showNotification("error", {
                        title: "You've got an error!",
                        description: "Error occurred for unknown reason",
                        id: toastId
                    });
                }
                if (this.isComponentMounted) {
                    this.setState(newState);
                }
            }).catch(err => console.log(err));
        }
    };

    handleUserDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const {user, history} = this.props;
        const newState: any = {...this.state};

        newState.popup.deleteUser.isShown = false;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        (async (): Promise<any> => {

            const response: any = await deleteUser(user.user_id);

            if (response.data.err || !response.data.result.deleted) {
                throw new Error(response.data);
            }

            history.push("/users");
            showNotification("success", {
                title: "Success!",
                description: "User was deleted",
                id: toastId
            });

        })().catch(e => {
            console.log(e);
            if (this.isComponentMounted) {
                this.setState(newState);
                showNotification("error", {
                    title: "Error",
                    description: "Cannot delete user",
                    id: toastId
                });
            }
        });
    };

    handleModalOpen = (e: React.MouseEvent<HTMLAnchorElement>): void => {
        const name: string = e.currentTarget.getAttribute("data-name");
        const newState: any = {...this.state};
        newState.popup[name].isShown = true;
        this.setState(newState);
    };

    handleModalClose = (): void => {
        const newState: any = {...this.state};
        for (const item in newState.popup) {
            if (newState.popup.hasOwnProperty(item)) {
                newState.popup[item].isShown = false;
            }
        }
        this.setState(newState);
    };

    handleAmountChange = ({currentTarget: {value, name}}: React.ChangeEvent<HTMLInputElement>) => {
        const newState: any = {...this.state};
        newState.popup.addBalance.balance[name] = value;
        newState.validation.popup.balance[name].value = value === "" ? "error" : "success";
        newState.validation.popup.balance[name].message = value === "" ? "Must be not empty" : "";
        this.setState(newState);
    };

    handleCurrencyChange = (value: any) => {
        const newState: any = {...this.state};
        newState.popup.addBalance.balance.currency = value;
        newState.validation.popup.balance.currency.value = value === "" ? "error" : "success";
        newState.validation.popup.balance.currency.message = value === "" ? "Must be not empty" : "";
        this.setState(newState);
    };

    handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<any> => {
        e.preventDefault();
        const {popup} = this.state;
        const {user} = this.props;
        const balance: any = {
            amount: popup.addBalance.balance.amount,
            currency: popup.addBalance.balance.currency.value,
        };
        const newState: IUserInformationState = {...this.state};

        newState.popup.addBalance.isProcessing = true;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        const addBalanceRequest: any = await addBalance(user.username, balance);

        if (!addBalanceRequest.data.err) {
            showNotification("success", {
                title: "Success!",
                description: "Balance is successfully added",
                id: toastId
            });
            if (addBalanceRequest.data.result) {
                const userBalance: any = await getBalance(user.username);

                if (!userBalance.data.err) {
                    newState.userBalance = userBalance.data.result;
                } else {
                    showNotification("error", {
                        title: "You've got an error!",
                        description: "Error whilst getting user balance",
                        id: toastId
                    });
                }

            }
        } else {
            showNotification("error", {
                title: "You've got an error!",
                description: "Error occurred when adding balance for unknown reason",
                id: toastId
            });
        }
        for (const item in newState.popup.balance) {
            if (newState.popup.addBalance.balance.hasOwnProperty(item)) {
                newState.popup.addBalance.balance[item] = "";
            }
        }
        for (const item in newState.validation.popup.balance) {
            if (newState.validation.popup.balance.hasOwnProperty(item)) {
                newState.validation.popup.balance[item] = {
                    value: null,
                    message: "",
                };
            }
        }
        newState.popup.addBalance.isProcessing = false;
        newState.popup.addBalance.isShown = false;
        if (this.isComponentMounted) {
            this.setState(newState);
        }
    };

    render(): JSX.Element {
        const {user, currencies, userProfile} = this.props;
        const {popup, userBalance, isLoading, validation, userGroup} = this.state;
        let popupMessage: any = {};
        if (popup.blockUser.isShown || popup.deleteUser.isShown) {
            popupMessage = {
                title: popup.blockUser.isShown ? "Block User" : "Delete User",
                apply: "Yes",
                cancel: "No",
                info: "Are you sure?"
            }
        }

        let addBalanceState: boolean = false;

        if (popup.addBalance.isShown) {
            addBalanceState = Object.keys(popup.addBalance.balance).every(item => popup.addBalance.balance[item] !== "");
        }

        return (
            <div className="bg-white box-shadow r-3x m-b-md">
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xs-6 col-sm-6 col-md-6 col-lg-6">
                                <span className="text-xsl padder-t-3">User Details</span>
                            </div>
                            <div className="col-xs-6 col-sm-6 col-md-6 col-lg-6 text-right">
                                <div className="inline m-r-sm">
                                    <Link className="text-info inline" to="/users">
                                        <Button className="btn btn-default btn-addon m-r-sm">
                                            <i className="fa fa-arrow-left"/>
                                            Go back
                                        </Button>
                                    </Link>
                                </div>
                                <div className="inline">
                                    <MoreActions>
                                        <li>
                                            <a
                                                data-name="blockUser"
                                                onClick={this.handleModalOpen}
                                            >
                                                {popup.blockUser.isBlocked ? "Unblock user" : "Block user"}
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                data-name="deleteUser"
                                                onClick={this.handleModalOpen}
                                            >Delete user
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                data-name="addBalance"
                                                onClick={this.handleModalOpen}
                                            > Add balance
                                            </a>
                                        </li>
                                    </MoreActions>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="content-wrapper network-details">
                    {
                        isLoading ? <Loader/> :
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                        <div className="container-fluid">
                                            <div className="row m-b-md">
                                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                                    <span className="block font-bold text-base text-uppercase">User Information</span>
                                                </div>
                                            </div>
                                            <div className="row m-b-md">
                                                <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                    <span className="block font-semi-bold">Email</span>
                                                </div>
                                                <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                    <span className="block">{user.nick_email || ""}</span>
                                                </div>
                                            </div>
                                            <div className="row m-b-md">
                                                <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                    <span className="block font-semi-bold">Nickname</span>
                                                </div>
                                                <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                    <span className="block">{user.nick_name}</span>
                                                </div>
                                            </div>
                                            <div className="row m-b-md">
                                                <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                    <span className="block font-semi-bold">Full Name</span>
                                                </div>
                                                <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                    <span className="block">
                                                        {`${user.first_name || user.first_name_nick || ""} ${user.last_name || user.last_name_nick || ""}`}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="row m-b-md">
                                                <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                    <span className="block font-semi-bold">Country</span>
                                                </div>
                                                <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                    <span className="block">{user.country}</span>
                                                </div>
                                            </div>
                                            <div className="row m-b-md">
                                                <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                    <span className="block font-semi-bold">Created At</span>
                                                </div>
                                                <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                    <span className="block">
                                                        {format(user.created_at, "DD MMM YYYY hh:mm A")}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="row m-b-md">
                                                <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                    <span className="block font-semi-bold">User Groups</span>
                                                </div>
                                                <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                    <span className="block">{userGroup || "Default"}</span>
                                                </div>
                                            </div>
                                            {/*<div className="row m-b-md">*/}
                                            {/*    <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">*/}
                                            {/*        <span className="block font-semi-bold">Channel</span>*/}
                                            {/*    </div>*/}
                                            {/*    <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">*/}
                                            {/*        <span className="block">*/}
                                            {/*            {user.channels.map((chaannel, elIndex) => {*/}
                                            {/*                if (elIndex === user.channels.length - 1) {*/}
                                            {/*                    return `${chaannel.name || ""}`*/}
                                            {/*                } else {*/}
                                            {/*                    return `${chaannel.name}, `*/}
                                            {/*                }*/}
                                            {/*            })}*/}
                                            {/*        </span>*/}
                                            {/*    </div>*/}
                                            {/*</div>*/}
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                        <div className="container-fluid no-padder">
                                            <div className="row m-b-md">
                                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                                    <span className="block font-bold text-base text-uppercase">Additional Information</span>
                                                </div>
                                            </div>
                                            <div className="row m-b-md">
                                                <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                    <span className="block font-semi-bold">Verification Code</span>
                                                </div>
                                                <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                    <span className="block">
                                                        {user.verification ? user.verification.verifyCode : ""}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="row m-b-md">
                                                <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                    <span className="block font-semi-bold">Attempt Date</span>
                                                </div>
                                                <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                    <span className="block">
                                                        {user.verification ? format(user.verification.date, "DD MMM YYYY hh:mm A") : ""}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="row m-b-md">
                                                <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                    <span className="block font-semi-bold">Contacts Count</span>
                                                </div>
                                                <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                    <span className="block">{user.contactsCount}</span>
                                                </div>
                                            </div>
                                            <div className="row m-b-md">
                                                <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                    <span className="block font-semi-bold">User Balance</span>
                                                </div>
                                                <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                        <span className="block">
                                                            {userBalance ? `${numeral(userBalance.balance).format("0.00")} ${userBalance.currencyCode}` : ""}
                                                        </span>
                                                </div>
                                            </div>
                                            <div className="row m-b-md">
                                                <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                    <span className="block font-semi-bold">Blocked status</span>
                                                </div>
                                                <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                        <span className="block">
                                                             {popup.blockUser.isBlocked ? "Blocked" : ""}
                                                        </span>
                                                </div>
                                            </div>
                                            <div className="row m-b-md">
                                                <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                    <span className="block font-semi-bold">Subscription status</span>
                                                </div>
                                                {
                                                    user.subscriptionType &&
                                                    <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                        <span className="block">
                                                             {this.isSubscribed ? "active" : "inactive"}
                                                        </span>
                                                    </div>
                                                }
                                            </div>
                                            <div className="row m-b-md">
                                                <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                    <span className="block font-semi-bold">Subscription date</span>
                                                </div>
                                                {
                                                    user.subscriptionType &&
                                                    <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                        <span className="block">
                                                            {format(user.subscriptionStartDate, "DD/MM/YYYY")} - {format(user.subscriptionEndDate, "DD/MM/YYYY")}
                                                        </span>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    }
                </div>
                <Modal show={popup.addBalance.isShown} onHide={this.handleModalClose} bsSize="sm">
                    <Modal.Header closeButton={true}><span className="text-xlg">Add Balance</span></Modal.Header>
                    <Modal.Body>
                        <Form className="wrapper-md" action="/" onSubmit={this.handleSubmit}>
                            <FormGroup validationState={validation.popup.balance.amount.value}>
                                <ControlLabel htmlFor="amount">Amount</ControlLabel>
                                <FormControl
                                    name="amount"
                                    pattern="[0-9.]+"
                                    className="form-control"
                                    onChange={this.handleAmountChange}
                                    value={popup.addBalance.balance.amount}
                                    id="amount"
                                    placeho0lder="Amount"
                                />
                                <HelpBlock>{validation.popup.balance.amount.message}</HelpBlock>
                            </FormGroup>
                            <FormGroup validationState={validation.popup.balance.currency.value}>
                                <ControlLabel htmlFor="currency">Currency</ControlLabel>
                                <Select
                                    isMulti={false}
                                    id="currency"
                                    closeMenuOnSelect={true}
                                    onChange={this.handleCurrencyChange}
                                    name="currency"
                                    value={popup.addBalance.balance.currency}
                                    options={currencies}
                                    placeholder="Currency"
                                />
                                <HelpBlock>{validation.popup.balance.currency.message}</HelpBlock>
                            </FormGroup>
                            <Button
                                type="submit"
                                className="btn btn-info btn-block"
                                disabled={!addBalanceState || popup.addBalance.isProcessing}
                            >{popup.addBalance.isProcessing ? "Processing" : "Add balance"}
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
                <Popup
                    show={popup.blockUser.isShown}
                    message={popupMessage}
                    hideModal={this.handleModalClose}
                    confirmAction={this.handleUserBlock}
                />
                <Popup
                    show={popup.deleteUser.isShown}
                    message={popupMessage}
                    hideModal={this.handleModalClose}
                    confirmAction={this.handleUserDelete}
                />
            </div>
        )
    }
}

export default User;
