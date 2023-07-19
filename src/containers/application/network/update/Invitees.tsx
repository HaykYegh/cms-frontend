"use strict";

import * as React from "react";
import format from "date-fns/format";
import {AxiosResponse} from "axios";
import {Creatable} from "react-select";
import Table from "react-bootstrap/es/Table";
import {ToastContainer} from "react-toastify";
import HelpBlock from "react-bootstrap/es/HelpBlock";
import FormGroup from "react-bootstrap/es/FormGroup";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {createOption, getCurrentOffset, isNumeric, validateNumber, testableNumbersValidate} from "helpers/DataHelper";
import {addNetworkInvitees, deleteNetworkInvitee, getNetworkInvitees} from "ajaxRequests/network";
import {multiSelectMenuStyles, showNotification} from "helpers/PageHelper";
import {ISelect, IVALIDATION} from "services/interface";
import Pagination from "components/Common/Pagination";
import Loading from "components/Common/Loading";

interface IInviteesState {
    loading: boolean,
    offset: number,
    limit: number,
    networkInvites: any[],
    invite: any,
    validation: {
        fromNumbers: IVALIDATION
    }
    request: {
        add: {
            processing: boolean,
            disabled: boolean
        },
        remove: {
            processing: boolean,
        },
        pagination: boolean
    }
}

interface IInviteesProps {
    networkId: any
}

class Invitees extends React.Component<IInviteesProps, IInviteesState> {

    componentState: boolean = true;

    constructor(props: IInviteesProps) {
        super(props);
        this.state = {
            loading: true,
            offset: 0,
            limit: 20,
            networkInvites: [],
            invite: {
                fromNumbers: {
                    value: "",
                    list: []
                }
            },
            validation: {
                fromNumbers: {
                    value: null,
                    message: ""
                }
            },
            request: {
                add: {
                    processing: false,
                    disabled: true
                },
                remove: {
                    processing: false,
                },
                pagination: false
            },
        }
    }

    componentDidMount(): void {
        const {networkId} = this.props;
        const {offset, limit} = this.state;
        const newState: IInviteesState = {...this.state};
        getNetworkInvitees(networkId, offset, limit).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.networkInvites = data.result || [];
            newState.loading = false;
            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(e => {
            console.log(e);
            newState.loading = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get network info",
                    timer: 3000,
                    hideProgress: true
                });
            }
        });
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleListChange = (e: React.MouseEvent<HTMLButtonElement>): void => {
        const {offset, limit} = this.state;
        const {networkId} = this.props;
        const newState: IInviteesState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.pagination = true;
        this.setState(newState);

        getNetworkInvitees(networkId, currentOffset, limit).then(({data}: AxiosResponse) => {
            if (!data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.networkInvites = data.result || [];
            newState.offset = currentOffset;
            newState.request.pagination = false;
            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(e => {
            console.log(e);
            newState.request.pagination = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get network info",
                    timer: 3000,
                    hideProgress: true
                });
            }
        })
    };

    handleFromNumberInputChange = (value: string): any => {
        const newState: IInviteesState = {...this.state};
        const {invite: {fromNumbers: {list}}} = this.state;
        let valueForValidate: string = value;

        if (isNumeric(valueForValidate) && valueForValidate.substr(0, 1) !== "+") {
            valueForValidate = "+" + valueForValidate.toString();
        }
        const {isValid} = validateNumber(valueForValidate);

        if (!isValid) {
            if (valueForValidate !== "") {
                newState.validation.fromNumbers.value = "error";
                newState.validation.fromNumbers.message = "Invalid phone number";
            }
            // Handle fake number set to success number
            const isTestableNumber: any = testableNumbersValidate(valueForValidate);

            if (isTestableNumber) {
                newState.validation.fromNumbers.value = "success";
                newState.validation.fromNumbers.message = "Valid number";
            }
        } else if (list.some(item => item.value === valueForValidate)) {
            newState.validation.fromNumbers.value = "warning";
            newState.validation.fromNumbers.message = "Phone number exists";
        } else {
            newState.validation.fromNumbers.value = "success";
            newState.validation.fromNumbers.message = "Valid number";
        }
        newState.invite.fromNumbers.value = valueForValidate;
        this.setState(newState);
    };

    handleFromNumbersChange = (value: Array<ISelect>) => {
        const newState: IInviteesState = {...this.state};
        newState.invite.fromNumbers.list = value ? value : [];
        this.setState(newState);
    };

    handleFromNumberKeyDown = (event: React.KeyboardEvent<HTMLElement>): any => {
        const {invite: {fromNumbers: {value, list}}, validation} = this.state;
        if (!value) {
            return;
        }
        if (validation.fromNumbers.value === "success") {
            const newState: IInviteesState = {...this.state};
            switch (event.key) {
                case "Enter":
                case "Tab":
                    newState.invite.fromNumbers.value = "";
                    newState.invite.fromNumbers.list = [...list, createOption(value)];
                    newState.validation.fromNumbers.value = null;
                    newState.validation.fromNumbers.message = "";
                    this.setState(newState);
                    event.preventDefault();
            }
        }
    };

    handleFromNumberOnBlur = (event: React.FocusEvent<HTMLElement>): any => {
        event.preventDefault();
        const {invite: {fromNumbers: {value, list}}, validation} = this.state;
        const newState: IInviteesState = {...this.state};

        if (validation.fromNumbers.value === "success") {
            newState.invite.fromNumbers.value = "";
            newState.invite.fromNumbers.list = [...list, createOption(value)];
        }

        newState.validation.fromNumbers.value = null;
        newState.validation.fromNumbers.message = "";
        this.setState(newState);
    };

    handleFromNumbersInvite = (e: React.MouseEvent<HTMLButtonElement> | any): void => {
        e.preventDefault();
        const {invite: {fromNumbers}, limit, offset} = this.state;
        const {networkId} = this.props;
        const newState: IInviteesState = {...this.state};

        newState.request.add.processing = true;
        this.setState(newState);

        const newNetworkInvites: string[] = fromNumbers.list.map(item => item.value);
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        addNetworkInvitees(networkId, {networkInvites: newNetworkInvites}).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            if (offset === 0) {
                let networkInvites: any[] = newState.networkInvites;
                const networkInviteIds: any[] = networkInvites.map(item => item.networkInviteId);
                const newNetworkInvites: any[] = [];
                for (const item of data.result) {
                    if (networkInviteIds.includes(item.networkInviteId)) {
                        for (const property of networkInvites) {
                            if (item.networkInviteId === property.networkInviteId) {
                                property.updatedAt = item.updatedAt;
                                property.token = item.token;
                            }
                        }
                    } else {
                        newNetworkInvites.push(item);
                    }
                }
                if (newNetworkInvites.length > 0) {
                    networkInvites = [...newNetworkInvites, ...networkInvites];
                    if (networkInvites.length > limit) {
                        networkInvites = networkInvites.slice(0, limit);
                    }
                }
                newState.networkInvites = networkInvites;
            }
            newState.invite.fromNumbers = {
                value: "",
                list: []
            };
            newState.validation.fromNumbers.value = null;
            newState.validation.fromNumbers.message = "";
            newState.request.add.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "Numbers successfully added to invite list",
                    id: toastId
                });
            }
        }).catch(e => {
            console.log(e);
            newState.request.add.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot add numbers to invite",
                    id: toastId
                });
            }
        })
    };

    handleFromNumberDelete = (id: number): void => {
        const {networkInvites} = this.state;
        const {networkId} = this.props;
        const newState: IInviteesState = {...this.state};

        newState.request.remove.processing = true;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        deleteNetworkInvitee(networkId, id).then(({data}: AxiosResponse) => {
            if (data.err || !data.result.deleted) {
                throw new Error(JSON.stringify(data));
            }
            newState.networkInvites = networkInvites.filter(item => item.networkInviteId !== id);
            newState.request.remove.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "Invitee successfully deleted",
                    id: toastId
                });
            }
        }).catch(e => {
            console.log(e);
            newState.request.remove.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot delete invitee for unknown reason",
                    id: toastId
                });
            }
        })
    };

    render(): JSX.Element {
        const {
            networkInvites, invite: {fromNumbers},
            loading, offset, limit, validation, request: {add, remove, pagination}
        } = this.state;

        return (
            <div>
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-12">
                                <FormGroup validationState={validation.fromNumbers.value}>
                                    <ControlLabel>Phone numbers</ControlLabel>
                                    <Creatable
                                        isClearable={true}
                                        isMulti={true}
                                        menuIsOpen={false}
                                        inputValue={fromNumbers.value}
                                        value={fromNumbers.list}
                                        styles={multiSelectMenuStyles}
                                        placeholder="Enter phone number"
                                        onChange={this.handleFromNumbersChange}
                                        onInputChange={this.handleFromNumberInputChange}
                                        onKeyDown={this.handleFromNumberKeyDown}
                                        onBlur={this.handleFromNumberOnBlur}
                                    />
                                    <HelpBlock>{validation.fromNumbers.message}</HelpBlock>
                                </FormGroup>
                                <HelpBlock>You can input several phone numbers: specify a valid
                                    phone number, click Enter (or Tab) and continue specifying other phone
                                    numbers.</HelpBlock>
                                <button
                                    className="btn btn-info m-b-sm"
                                    disabled={fromNumbers.list.length === 0 || add.processing}
                                    onClick={this.handleFromNumbersInvite}
                                >Invite Members {add.processing &&
                                <i className="fa fa-spin fa-spinner m-l-xs"/>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? <Loading/>
                    :
                    <Table
                        hover={true}
                        condensed={true}
                        responsive={true}
                    >
                        <thead>
                        <tr>
                            <th/>
                            <th>Invitee</th>
                            <th>Created at</th>
                            <th>Updated at</th>
                            <th>Invite link</th>
                            <th/>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            networkInvites.length === 0 &&
                            <tr>
                                <td colSpan={6}>No result</td>
                            </tr>
                        }
                        {
                            networkInvites.map((invite, index) => {
                                const N: number = offset * limit + index + 1;
                                const deleteInviteNumber: any = () => this.handleFromNumberDelete(invite.networkInviteId);
                                return (
                                    <tr key={N}>
                                        <td>{N}</td>
                                        <td>{invite.invitee.replace(process.env.APP_PREFIX, "")}</td>
                                        <td>{format(new Date(invite.createdAt), "DD MMM YYYY hh:mm A")}</td>
                                        <td>{format(new Date(invite.updatedAt), "DD MMM YYYY hh:mm A")}</td>
                                        <td>{`${process.env.NETWORK_BASE_URL}/networks/${invite.token}`}</td>
                                        <td>
                                            <div className="flex">
                                                <button
                                                    disabled={remove.processing}
                                                    className="btn btn-default btn-xs m-l-xs"
                                                    onClick={deleteInviteNumber}
                                                ><i className="fa fa-close"/>
                                                </button>
                                            </div>
                                        </td>
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
                                !loading &&
                                <div>
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                        <Pagination
                                            offset={offset}
                                            limit={limit}
                                            callback={this.handleListChange}
                                            data={networkInvites}
                                            disabled={pagination}
                                        />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Invitees;
