"use strict";

import * as React from "react";
import * as moment from "moment";
import * as numeral from "numeral";
import {AxiosResponse} from "axios";
import Table from "react-bootstrap/es/Table";
import {ToastContainer} from "react-toastify";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";

import {addTierInGroup, deleteTierInGroup, getGroupTiers, updateTierInGroup} from "ajaxRequests/managePayment";
import PageLoader from "components/Common/PageLoader";
import {showNotification} from "helpers/PageHelper";
import {IVALIDATION} from "services/interface";

interface IIndexState {
    loading: boolean,
    request: {
        add: {
            disable: boolean,
            processing: boolean,
        },
        remove: {
            disable: boolean,
            processing: boolean,
        },
        update: {
            processing: boolean,
            disable: boolean,
        }
    },
    validation: {
        newTier: {
            upToNumber: IVALIDATION,
            amount: IVALIDATION,
        },
        updateTier: {
            amount: IVALIDATION,
        },
    },
    tiers: any[],
    newTier: {
        upToNumber: any,
        amount: string | number,
    },
    updateTier: any,
    tierId: number
}

interface IIndexProps {
    tierGroupId: number
}

class Index extends React.Component<IIndexProps, IIndexState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            loading: true,
            request: {
                add: {
                    disable: true,
                    processing: false,
                },
                remove: {
                    disable: true,
                    processing: false,
                },
                update: {
                    processing: false,
                    disable: true,
                }
            },
            validation: {
                newTier: {
                    upToNumber: {
                        value: null,
                        message: ""
                    },
                    amount: {
                        value: null,
                        message: ""
                    },
                },
                updateTier: {
                    amount: {
                        value: null,
                        message: ""
                    },
                },

            },
            tiers: [],
            newTier: {
                upToNumber: "",
                amount: "",
            },
            updateTier: null,
            tierId: null
        }
    }

    componentDidMount(): void {
        const {tierGroupId} = this.props;
        getGroupTiers(tierGroupId).then(({data}: AxiosResponse) => {
            if (!data.err) {
                const newState: IIndexState = {...this.state};
                newState.tiers = data.result;
                newState.loading = false;
                if (this.componentState) {
                    this.setState(newState);
                }
            } else {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not get payments tier groups",
                    timer: 3000,
                    hideProgress: true
                });
            }
        }).catch(err => console.log(err))
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleTierAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const {newTier} = this.state;
        const {tierGroupId} = this.props;
        const newState: IIndexState = {...this.state};

        newState.request.add.processing = true;
        newState.request.add.disable = true;
        this.setState(newState);

        addTierInGroup(tierGroupId, newTier).then(({data}: AxiosResponse) => {
            if (!data.err) {

                const tierIds: number[] = newState.tiers.map(item => item.tierId);
                if (tierIds.includes(data.result.tierId)) {
                    for (const item of newState.tiers) {
                        if (data.result.tierId === item.tierId) {
                            item.amount = data.result.amount;
                            item.updatedAt = data.result.updatedAt;
                        }
                    }
                } else {
                    newState.tiers = [...newState.tiers, data.result];
                    newState.tiers.sort((a, b) => a.upToNumber - b.upToNumber);
                }
                showNotification("success", {
                    title: "Success!",
                    description: "Tier was successfully created",
                    timer: 3000,
                    hideProgress: true
                });
            } else {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not get payments tiers",
                    timer: 3000,
                    hideProgress: true
                });
            }
            newState.request.add.processing = false;

            const validation: any = newState.validation.newTier;
            for (const item in validation) {
                if (validation.hasOwnProperty(item)) {
                    validation[item] = {
                        value: null,
                        message: ""
                    }
                }
            }

            for (const item in newState.newTier) {
                if (newState.newTier.hasOwnProperty(item)) {
                    newState.newTier[item] = "";
                }
            }

            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(err => console.log(err));
    };

    handleNewTierNumberChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        const newState: IIndexState = {...this.state};
        newState.newTier[name] = value === "" ? value : parseInt(value);
        newState.validation.newTier[name].value = value === "" ? "error" : "success";
        newState.request.add.disable = !Object.keys(newState.validation.newTier).every(item => {
            return newState.validation.newTier[item].value === "success";
        });
        this.setState(newState);
    };

    handleNewTierAmountChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        const newState: IIndexState = {...this.state};
        newState.validation.newTier[name].value = value === "" ? "error" : "success";
        newState.newTier[name] = value;
        newState.request.add.disable = !Object.keys(newState.validation.newTier).every(item => {
            return newState.validation.newTier[item].value === "success";
        });
        this.setState(newState);
    };

    handleTierAmountChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        const {tierId} = this.state;
        if (tierId) {
            const newState: IIndexState = {...this.state};
            const validation: any = newState.validation.updateTier;
            validation[name].value = value === "" ? "error" : "success";
            newState.updateTier[name] = value;
            newState.request.update.disable = !Object.keys(validation).every(item => validation[item].value === "success");
            this.setState(newState);
        }
    };

    handleTierFormShow = (tierId: number) => {
        const {tiers} = this.state;
        const tier: any = tiers.find(item => item.tierId === tierId);
        const newState: IIndexState = {...this.state};
        newState.updateTier = tier;
        newState.tierId = tierId;
        this.setState(newState);
    };

    handleTierFormHide = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const newState: IIndexState = {...this.state};
        newState.updateTier = null;
        newState.request.update = {
            processing: false,
            disable: false,
        };
        newState.tierId = null;
        this.setState(newState);
    };

    handleTierDelete = (tierId: number) => {
        const {tierGroupId} = this.props;
        const newState: IIndexState = {...this.state};
        newState.request.remove.processing = true;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        deleteTierInGroup(tierGroupId, tierId).then(({data}: AxiosResponse) => {
            if (!data.err) {
                if (data.result.deleted) {
                    newState.tiers = newState.tiers.filter(item => item.tierId !== tierId);
                    showNotification("success", {
                        title: "Success!",
                        description: "Group tier successfully deleted",
                        id: toastId
                    });
                } else {
                    showNotification("error", {
                        title: "You got an error!",
                        description: "Can not delete tier for unknown reason",
                        timer: 3000,
                        hideProgress: true
                    });
                }

            } else {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not delete tier for unknown reason",
                    timer: 3000,
                    hideProgress: true
                });
            }
            newState.request.remove.processing = false;
            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(err => console.log(err));
    };

    handleTierUpdate = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const {tierGroupId} = this.props;
        const {tierId, updateTier} = this.state;
        const newState: IIndexState = {...this.state};
        newState.request.update.processing = true;
        this.setState(newState);
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        updateTierInGroup(tierGroupId, tierId, {amount: updateTier.amount}).then(({data}: AxiosResponse) => {
            if (!data.err) {
                for (const item of newState.tiers) {
                    if (data.result.tierId === item.tierId) {
                        item.amount = data.result.amount;
                        item.updatedAt = data.result.updatedAt;
                    }
                }
                newState.updateTier = null;
                newState.request.update.disable = true;
                newState.tierId = null;

                showNotification("success", {
                    title: "Success!",
                    description: "Group tier successfully updated",
                    id: toastId
                });

            } else {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not update tier for unknown reason",
                    id: toastId
                });
            }
            newState.request.update.processing = false;
            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(err => console.log(err));

    };

    render(): JSX.Element {
        const {loading, validation, request: {add, remove, update}, tiers, newTier, updateTier, tierId} = this.state;

        return (
            <div className="container-fluid">
                <div className="row">
                    {
                        loading ? <PageLoader showBtn={false}/> :
                            <div className="col-lg-12">
                                <span className="text-muted">Group tiers</span>
                                <Table
                                    hover={true}
                                    condensed={true}
                                    responsive={true}
                                >
                                    <thead>
                                    <tr>
                                        <th/>
                                        <th>Number</th>
                                        <th>Amount</th>
                                        <th>Updated at</th>
                                        <th/>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        tiers.length === 0 &&
                                        <tr>
                                            <td colSpan={5}>No result</td>
                                        </tr>
                                    }
                                    {tiers.map((tier, index) => {
                                        const tierDelete: any = () => this.handleTierDelete(tier.tierId);
                                        const tierUpdate: any = () => this.handleTierFormShow(tier.tierId);
                                        const amount: any = tierId === tier.tierId ? updateTier.amount : (tier.amount * 100) % 100 === 0 ? parseInt(tier.amount) :
                                            numeral(tier.amount).format("0.00");
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{tier.upToNumber}</td>
                                                <td>
                                                    {
                                                        <FormGroup validationState={tierId === tier.tierId ? validation.updateTier.amount.value : null}>
                                                            <FormControl
                                                                min="1"
                                                                type="number"
                                                                name="amount"
                                                                pattern="[0-9.]+"
                                                                value={amount}
                                                                disabled={tierId !== tier.tierId}
                                                                onChange={this.handleTierAmountChange}
                                                            />
                                                        </FormGroup>}
                                                </td>
                                                <td>{moment(tier.updatedAt).format("DD MMM YYYY hh:mm A")}</td>
                                                <td>
                                                    {
                                                        (tierId && tier.tierId === tierId) ?
                                                            <div className="flex">
                                                                <button
                                                                    disabled={updateTier.amount === "" || update.disable || update.processing}
                                                                    className="btn btn-default btn-xs m-l-xs"
                                                                    onClick={this.handleTierUpdate}
                                                                ><i className="fa fa-save"/>
                                                                </button>
                                                                <button
                                                                    disabled={update.processing}
                                                                    className="btn btn-default btn-xs m-l-xs"
                                                                    onClick={this.handleTierFormHide}
                                                                ><i className="fa fa-close"/>
                                                                </button>
                                                            </div> :
                                                            <div className="flex">
                                                                <button
                                                                    className="btn btn-info btn-xs m-l-xs"
                                                                    onClick={tierUpdate}
                                                                ><i className="fa fa-pencil"/>
                                                                </button>
                                                                <button
                                                                    disabled={remove.processing}
                                                                    className="btn btn-danger btn-xs m-l-xs"
                                                                    onClick={tierDelete}
                                                                ><i className={`fa ${remove.processing ? "fa fa-spin fa-spinner" : "fa fa-close"}`}/>
                                                                </button>
                                                            </div>
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    </tbody>
                                </Table>
                            </div>}
                </div>
                <div className="row">
                    <div className="col-lg-4">
                        <FormGroup validationState={validation.newTier.upToNumber.value}>
                            <FormControl
                                min="1"
                                type="number"
                                name="upToNumber"
                                placeholder="Up to number"
                                value={newTier.upToNumber}
                                onChange={this.handleNewTierNumberChange}
                            />
                        </FormGroup>
                    </div>
                    <div className="col-lg-4">
                        <FormGroup validationState={validation.newTier.amount.value}>
                            <FormControl
                                min="1"
                                type="number"
                                name="amount"
                                placeholder="Amount"
                                pattern="[0-9.]+"
                                value={newTier.amount}
                                onChange={this.handleNewTierAmountChange}
                            />
                        </FormGroup>
                    </div>
                    <div className="col-lg-4">
                        <button
                            disabled={add.disable || add.processing}
                            className="btn btn-info"
                            onClick={this.handleTierAdd}
                        >Create tier {add.processing && <i className="fa fa-spin fa-spinner m-l-xs"/>}
                        </button>
                    </div>
                </div>
                <ToastContainer/>
            </div>

        );
    }
}

export default Index;
