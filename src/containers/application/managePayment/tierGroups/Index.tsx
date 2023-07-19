"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import Table from "react-bootstrap/es/Table";
import {ToastContainer} from "react-toastify";
import Button from "react-bootstrap/es/Button";
import FormGroup from "react-bootstrap/es/FormGroup";
import InputGroup from "react-bootstrap/es/InputGroup";
import FormControl from "react-bootstrap/es/FormControl";

import {createTierGroup, deleteTierGroup, getTierGroups} from "ajaxRequests/managePayment";
import Update from "containers/application/managePayment/tierGroups/Update";
import {setPaginationRange} from "helpers/DataHelper";
import PageLoader from "components/Common/PageLoader";
import {showNotification} from "helpers/PageHelper";
import {LIST, PAGE_NAME} from "configs/constants";
import {IVALIDATION} from "services/interface";
import Popup from "components/Common/Popup";

interface IIndexState {
    loading: boolean,
    offset: number,
    limit: number,
    tierGroups: any[],
    tierGroupId: number,
    validation: {
        tierGroup: IVALIDATION
    },
    tierGroup: {
        tierGroupId: number
        name: string,
    },
    popup: {
        delete: {
            show: boolean
        }
    },
    request: {
        create: {
            processing: boolean
        },
        edit: {
            status: boolean,
            tierGroupId: number
        }
    }
}

class Index extends React.Component<{}, IIndexState> {

    componentState: boolean = true;

    constructor(props: {}) {
        super(props);
        this.state = {
            loading: true,
            offset: 0,
            limit: 20,
            tierGroups: [],
            tierGroupId: null,
            validation: {
                tierGroup: {
                    value: null,
                    message: "",
                }
            },
            tierGroup: {
                tierGroupId: null,
                name: ""
            },
            popup: {
                delete: {
                    show: false
                }
            },
            request: {
                create: {
                    processing: false
                },
                edit: {
                    status: false,
                    tierGroupId: null
                }
            }
        }
    }

    componentWillMount(): void {
        document.title = PAGE_NAME["/manage-payment"];
    }

    componentDidMount(): void {
        const {offset, limit} = this.state;
        getTierGroups(offset, limit).then(({data}: AxiosResponse) => {
            if (!data.err) {
                const newState: IIndexState = {...this.state};
                newState.tierGroups = data.result;
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

    handleListChange = (e: React.MouseEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const {offset, limit} = this.state;
        const newState: IIndexState = {...this.state};
        const ACTION: number = parseInt(e.currentTarget.getAttribute("data-action"));

        let currentOffset: number = offset;
        if (ACTION === LIST.ACTION.NEXT) {
            currentOffset++;
        } else if (ACTION === LIST.ACTION.PREVIOUS) {
            if (offset !== 0) {
                currentOffset--;
            }
        } else {
            currentOffset = 0;
        }

        newState.offset = currentOffset;

        getTierGroups(currentOffset, limit).then(({data}: AxiosResponse) => {
            if (!data.err) {
                newState.tierGroups = data.result;
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
    };

    handleModalOpen = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const groupId: number = parseInt(e.currentTarget.getAttribute("data-id"));
        const newState: IIndexState = {...this.state};
        newState.popup.delete.show = true;
        newState.tierGroupId = groupId;
        this.setState(newState);

    };

    handleModalClose = (): void => {
        const newState: any = {...this.state};
        for (const item in newState.popup) {
            if (newState.popup.hasOwnProperty(item)) {
                newState.popup[item].show = false;
            }
        }
        newState.tierGroupId = null;
        this.setState(newState);
    };

    handleTierGroupDelete = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {tierGroupId} = this.state;
        this.handleModalClose();

        const toastId: number = showNotification("info", {
            title: "Deleting...",
            description: "",
        });

        deleteTierGroup(tierGroupId).then(({data}: AxiosResponse) => {
            if (!data.err) {
                if (data.result.deleted) {
                    showNotification("success", {
                        title: "Success!",
                        description: "This tier group was deleted",
                        id: toastId
                    });
                    const newState: IIndexState = {...this.state};
                    newState.tierGroups = newState.tierGroups.filter(item => item.tierGroupId !== tierGroupId);
                    if (this.componentState) {
                        this.setState(newState);
                    }
                } else {
                    showNotification("error", {
                        title: "You got an error!",
                        description: "This tier group is not deleted for unknown reason",
                        id: toastId
                    });
                }

            } else {
                showNotification("error", {
                    title: "You got an error!",
                    description: "This tier group is not deleted for unknown reason",
                    id: toastId
                });
            }
        }).catch(error => console.log(error));
    };

    handleTierGroupCreate = (e: React.MouseEvent<HTMLButtonElement> | any) => {
        e.preventDefault();
        const {tierGroup, tierGroups, limit} = this.state;
        const newState: IIndexState = {...this.state};
        const toastId: number = showNotification("info", {
            title: "Creating...",
            description: "",
        });

        newState.request.create.processing = true;
        this.setState(newState);

        createTierGroup({name: tierGroup.name}).then(({data}: AxiosResponse) => {
            if (!data.err) {

                newState.tierGroup.tierGroupId = data.result.tierGroupId;
                newState.tierGroups = [tierGroup, ...tierGroups].slice(0, limit);
                newState.tierGroup = {
                    name: "",
                    tierGroupId: null
                };
                for (const item in newState.validation) {
                    if (newState.validation.hasOwnProperty(item)) {
                        newState.validation[item] = {
                            value: null,
                            message: ""
                        };
                    }
                }

                showNotification("success", {
                    title: "Success!",
                    description: "Tier group successfully created",
                    id: toastId
                });
            } else {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not create tier group for unknown reason",
                    timer: 3000,
                    hideProgress: true
                });
            }
            newState.request.create.processing = false;
            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(err => console.log(err))
    };

    handleTierGroupEdit = (id: number) => {
        const newState: IIndexState = {...this.state};
        newState.request.edit.status = true;
        newState.request.edit.tierGroupId = id;
        this.setState(newState);
    };

    handleTierGroupChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        const newState: IIndexState = {...this.state};
        newState.tierGroup.name = value;
        newState.validation.tierGroup.value = value === "" ? "error" : "success";
        newState.validation.tierGroup.message = value === "" ? "Must be not empty" : "";
        this.setState(newState);
    };

    handleEnterKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.keyCode === 13) {
            const {tierGroup} = this.state;
            if (tierGroup.name !== "") {
                this.handleTierGroupCreate(event);
            }
        }
    };

    render(): JSX.Element {
        const {loading, offset, limit, tierGroups, popup, validation, tierGroup, request: {create, edit}} = this.state;
        const {start, end} = setPaginationRange(tierGroups, offset, limit);
        let popupMessage: any = {};
        if (popup.delete.show) {
            popupMessage = {
                info: "Are you sure delete?",
                apply: "Apply",
                cancel: "Cancel",
            }
        }
        return (
            <div className="row">
                {
                    (!edit.status && !edit.tierGroupId) ?
                        <div>
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <FormGroup validationState={validation.tierGroup.value}>
                                    <InputGroup>
                                        <FormControl
                                            onChange={this.handleTierGroupChange}
                                            onKeyUp={this.handleEnterKeyUp}
                                            value={tierGroup.name}
                                            name="tierGroup"
                                            placeholder="New group"
                                        />
                                        <InputGroup.Button>
                                            <button
                                                className="btn btn-info"
                                                disabled={tierGroup.name === "" || create.processing}
                                                onClick={this.handleTierGroupCreate}
                                            ><i className={`fa ${create.processing ? "fa fa-spin fa-spinner" : "fa-plus"}`}/>
                                            </button>
                                        </InputGroup.Button>
                                    </InputGroup>
                                </FormGroup>
                            </div>
                            {
                                loading ? <PageLoader showBtn={false}/> :
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                        <Table
                                            hover={true}
                                            condensed={true}
                                            responsive={true}
                                        >
                                            <thead>
                                            <tr>
                                                <th/>
                                                <th>Group name</th>
                                                <th/>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                tierGroups.length === 0 &&
                                                <tr>
                                                    <td colSpan={3}>No result</td>
                                                </tr>
                                            }

                                            {tierGroups.map((group, index) => {
                                                const N: number = offset * limit + index + 1;
                                                const editTierGroup: any = () => this.handleTierGroupEdit(group.tierGroupId);
                                                return (
                                                    <tr key={N}>
                                                        <td>{N}</td>
                                                        <td>{group.name}</td>
                                                        <td>
                                                            <div className="flex">
                                                                <button
                                                                    className="btn btn-info btn-xs"
                                                                    onClick={editTierGroup}
                                                                ><i className="fa fa-pencil"/>
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-xs m-l-xs"
                                                                    onClick={this.handleModalOpen}
                                                                    data-id={group.tierGroupId}
                                                                ><i className="fa fa-close"/>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                            </tbody>
                                        </Table>
                                    </div>}
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <ul className="list-inline text-right">
                                    {
                                        offset !== 0 &&
                                        <li>
                                            <Button
                                                data-action={LIST.ACTION.RESET}
                                                onClick={this.handleListChange}
                                            ><i className="fa fa-step-backward"/>
                                            </Button>
                                        </li>
                                    }
                                    <li><span>{start + "-" + end}</span></li>
                                    <li>
                                        <Button
                                            disabled={offset === 0}
                                            data-action={LIST.ACTION.PREVIOUS}
                                            bsClass="btn btn-default b-t-l b-b-l"
                                            onClick={this.handleListChange}
                                        ><i className="fa fa-chevron-left"/>
                                        </Button>
                                    </li>
                                    <li>
                                        <Button
                                            disabled={tierGroups && tierGroups.length < limit}
                                            data-action={LIST.ACTION.NEXT}
                                            bsClass="btn btn-default b-t-r b-b-r"
                                            onClick={this.handleListChange}
                                        ><i className="fa fa-chevron-right"/>
                                        </Button>
                                    </li>
                                </ul>
                            </div>
                        </div> :
                        <Update tierGroupId={edit.tierGroupId}/>
                }

                <ToastContainer/>
                <Popup
                    show={popup.delete.show}
                    message={popupMessage}
                    hideModal={this.handleModalClose}
                    confirmAction={this.handleTierGroupDelete}
                />
            </div>
        );
    }
}

export default Index;
