"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import format from "date-fns/format";
import {Creatable} from "react-select";
import Modal from "react-bootstrap/es/Modal";
import Table from "react-bootstrap/es/Table";
import HelpBlock from "react-bootstrap/es/HelpBlock";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {
    addUserGroupMembers,
    createUserGroup,
    deleteUserGroup, deleteUserGroupMember,
    getUserGroupMembers,
    getUserGroupMembersCount,
    getUserGroups,
    getUserGroupsCount,
    updateUserGroup
} from "ajaxRequests/users";
import {
    createOption,
    getCurrentOffset,
    isNumeric,
    testableNumbersValidate,
    validateNumber
} from "helpers/DataHelper";
import {multiSelectMenuStyles, showNotification} from "helpers/PageHelper";
import MoreActions from "components/Common/MoreActions";
import {ISelect, IVALIDATION} from "services/interface";
import Pagination from "components/Common/Pagination";
import {getGateways} from "ajaxRequests/gateways";
import Loading from "components/Common/Loading";
import Popup from "components/Common/Popup";
import axios from "helpers/Axios";
import selector, {IStoreProps} from "services/selector";
import {connect} from "react-redux";

interface IUsersGroupState {
    offset: number,
    limit: number,
    isInitialLoading: boolean,
    userGroup: {
        gatewayList: any[],
        info: any
    },
    userGroups: any,
    gateway: {
        list: any[],
        offset: number,
        limit: number
    },
    request: {
        isPaging: boolean,
        loading: boolean,
        update: {
            processing: boolean,
            disabled: boolean
        },
        create: {
            processing: boolean,
            disabled: boolean
        },
        addMembers: {
            processing: boolean,
        },
        deleteMember: {
            processing: boolean,
        },
    }
    popup: {
        isNewGroupShow: boolean,
        isGroupUpdateShow: boolean,
        isMembersShow: boolean,
        isGroupDeleteShow: boolean,
        showAttachedGateways: boolean,
        message: any,
        newGroup: {
            name: string
        },
        members: {
            list: any[],
            count: number,
            offset: number,
            limit: number
        },
    },
    userGroupId: number,
    memberId: number,
    validation: {
        newGroupName: IVALIDATION,
        updateGroupName: IVALIDATION,
        fromNumbers: IVALIDATION,
    },
    phone: {
        fromNumbers: any,
    }
}

interface IUserGroupsProps extends IStoreProps {
    userProfile: any
}

class UserGroups extends React.Component<IUserGroupsProps, IUsersGroupState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            offset: 0,
            limit: 20,
            isInitialLoading: true,
            userGroup: {
                gatewayList: [],
                info: {},
            },
            gateway: {
                list: [],
                offset: 0,
                limit: 20
            },
            request: {
                isPaging: false,
                loading: false,
                update: {
                    processing: false,
                    disabled: true
                },
                create: {
                    processing: false,
                    disabled: true
                },
                addMembers: {
                    processing: false,
                },
                deleteMember: {
                    processing: false,
                },
            },
            userGroups: {
                records: [],
                count: 0
            },
            popup: {
                isNewGroupShow: false,
                isGroupUpdateShow: false,
                isGroupDeleteShow: false,
                showAttachedGateways: false,
                isMembersShow: false,
                newGroup: {
                    name: ""
                },
                members: {
                    list: [],
                    count: 0,
                    offset: 0,
                    limit: 20
                },
                message: {}
            },
            validation: {
                newGroupName: {
                    value: null,
                    message: "",
                },
                updateGroupName: {
                    value: null,
                    message: "",
                },
                fromNumbers: {
                    value: null,
                    message: "",
                }
            },
            userGroupId: null,
            memberId: null,
            phone: {
                fromNumbers: {
                    inputValue: "",
                    list: []
                },
            },
        }
    }

    componentDidMount(): void {
        document.title = "User Groups";
        const newState: IUsersGroupState = {...this.state};
        getUserGroupsCount().then(({data}: AxiosResponse) => {

            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.userGroups.count = data.result || 0;

            if (this.componentState) {
                this.setState(newState);
            }

        }).catch(e => {
            console.log(e);
            if (this.componentState) {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Cannot get user groups count for unknown reason"
                });
            }
        });
        this.initRequest(newState);
    }

    initRequest = (state: IUsersGroupState, offset: number = 0, isPaging: boolean = false): void => {
        const {limit} = state;
        getUserGroups(offset, limit).then(({data}: AxiosResponse) => {

            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            if (isPaging) {
                state.offset = offset;
                state.request.isPaging = false;
            }

            state.userGroups.records = data.result || [];

            state.isInitialLoading = false;

            if (this.componentState) {
                this.setState(state);
            }

        }).catch(e => {
            console.log(e);
            if (this.componentState) {
                state.isInitialLoading = false;

                if (isPaging) {
                    state.request.isPaging = false;
                }
                this.setState(state);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Cannot show user groups for unknown reason",
                    timer: 3000
                });
            }
        });
    };

    handleNewGroupModalOpen = (): void => {
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
        const newState: IUsersGroupState = {...this.state};
        newState.popup.isNewGroupShow = true;
        this.setState(newState);
    };

    handleGroupUpdateModalOpen = (e: React.MouseEvent<HTMLElement>, userGroupId: any): void => {
        e.preventDefault();
        e.stopPropagation();
        const {userGroups} = this.state;
        const newState: IUsersGroupState = {...this.state};
        newState.popup.isGroupUpdateShow = true;
        newState.userGroup.info = {...userGroups.records.find(item => item.userGroupId.toString() === userGroupId.toString())};
        this.setState(newState);
    };

    handleGroupNameChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        const newState: IUsersGroupState = {...this.state};
        if (name === "updateGroupName") {
            newState.userGroup.info.name = value;
            newState.validation.updateGroupName.value = value === "" ? "error" : null;
            newState.validation.updateGroupName.message = value === "" ? "Not empty" : "";
            newState.request.update.disabled = value === "";
        }

        if (name === "newGroupName") {
            newState.popup.newGroup.name = value;
            newState.validation.newGroupName.value = value === "" ? "error" : null;
            newState.validation.newGroupName.message = value === "" ? "Not empty" : "";
            newState.request.create.disabled = value === "";
        }

        this.setState(newState);
    };

    handleShowAttachedGateways = (e: React.MouseEvent<HTMLElement>, userGroupId: any) => {
        e.preventDefault();
        e.stopPropagation();
        const {gateway: {offset, limit}, userGroups} = this.state;

        const newState: IUsersGroupState = {...this.state};
        newState.userGroup.info = {...userGroups.records.find(item => item.userGroupId.toString() === userGroupId.toString())};
        this.setState(newState);

        getGateways(offset, limit, null, userGroupId).then(({data}: AxiosResponse) => {

            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.popup.showAttachedGateways = true;
            newState.gateway.list = data.result || [];
            newState.request.loading = false;

            if (this.componentState) {
                this.setState(newState);
            }

        }).catch(e => {
            console.log(e);
            newState.request.loading = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Cannot get attached gateways for unknown reason",
                    timer: 3000
                });
            }
        });
    };

    handleListChange = (e: React.MouseEvent<HTMLButtonElement>): void => {
        const {offset} = this.state;
        const newState: IUsersGroupState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.isPaging = true;
        this.setState(newState);
        this.initRequest(newState, currentOffset, true);
    };

    handleMembersListChange = (e: React.MouseEvent<HTMLButtonElement>): void => {
        const {popup: {members: {offset, limit}}, userGroup} = this.state;
        const newState: IUsersGroupState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.isPaging = true;
        this.setState(newState);
        getUserGroupMembers(userGroup.info.userGroupId, currentOffset, limit).then(({data}: AxiosResponse) => {

            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.popup.members.list = data.result || [];
            newState.popup.members.offset = currentOffset;
            newState.request.isPaging = false;

            if (this.componentState) {
                this.setState(newState);
            }

        }).catch(err => {
            console.log(err);
            newState.request.isPaging = false;
            if (this.componentState) {
                this.setState(newState);
            }
            showNotification("error", {
                title: "You got an error!",
                description: "Cannot get group members list for unknown reason",
                timer: 3000
            });
        });
    };

    handleGroupUpdate = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const {userGroup: {info}} = this.state;
        const newState: IUsersGroupState = {...this.state};
        newState.request.update.processing = true;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        updateUserGroup(info.userGroupId, info.name).then(({data}: AxiosResponse) => {

            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.request.update.processing = false;
            newState.popup.isGroupUpdateShow = false;
            newState.userGroup.info = {};

            for (const item of newState.userGroups.records) {
                if (item.userGroupId === info.userGroupId) {
                    item.createdAt = data.result.createdAt;
                    item.name = data.result.name
                }
            }
            newState.userGroup.info = {};

            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "User group successfully updated",
                    id: toastId
                });
            }

        }).catch(e => {
            console.log(e);
            newState.request.update.processing = false;
            if (this.componentState) {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Cannot update user groups for unknown reason",
                    id: toastId
                });
            }
        });
    };

    handleGroupDeleteModalOpen = (e: React.MouseEvent<HTMLElement>, userGroupId: any) => {
        e.preventDefault();
        e.stopPropagation();
        const newState: IUsersGroupState = {...this.state};
        newState.popup.isGroupDeleteShow = true;
        newState.popup.message = {
            info: "Are you sure delete?",
            apply: "Apply",
            cancel: "Cancel",
        };
        newState.userGroupId = userGroupId;
        this.setState(newState);
    };

    handleUserGroupDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const {userGroupId, userGroups} = this.state;
        const newState: IUsersGroupState = {...this.state};
        newState.popup.isGroupDeleteShow = false;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Deleting...",
            description: "",
        });

        deleteUserGroup(userGroupId).then(({data}: AxiosResponse) => {

            if (data.err || !data.result.isDeleted) {
                throw new Error(JSON.stringify(data));
            }

            newState.userGroups.records = userGroups.records.filter(item => item.userGroupId !== userGroupId);
            newState.userGroups.count--;
            newState.userGroupId = null;
            newState.popup.message = {};

            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "User group successfully deleted",
                    id: toastId
                });
            }

        }).catch(e => {
            console.log(e);
            if (this.componentState) {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Cannot delete user group for unknown reason",
                    id: toastId
                });
            }
        });
    };

    handleUserGroupCreate = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const {popup: {newGroup}} = this.state;
        const newState: IUsersGroupState = {...this.state};
        newState.request.create.processing = true;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Creating...",
            description: ""
        });

        createUserGroup({name: newGroup.name}).then(({data}: AxiosResponse) => {

            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.popup.newGroup.name = "";
            newState.userGroups.records = [...newState.userGroups.records, data.result];
            newState.userGroups.count++;
            newState.request.create.processing = false;
            newState.request.create.disabled = false;
            newState.popup.isNewGroupShow = false;
            newState.validation.newGroupName = {
                value: null,
                message: ""
            };

            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "User group successfully created",
                    id: toastId
                });
            }

        }).catch(e => {
            console.log(e);
            newState.request.create.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Cannot create user group for unknown reason",
                    id: toastId
                });
            }
        });
    };

    handleGetMembersModalOpen = (e: React.MouseEvent<HTMLElement>, userGroupId: any) => {
        e.preventDefault();
        e.stopPropagation();
        const {popup: {members: {offset, limit}}, userGroups} = this.state;
        const newState: IUsersGroupState = {...this.state};

        newState.popup.isMembersShow = true;
        newState.request.loading = true;
        newState.userGroup.info = {...userGroups.records.find(item => item.userGroupId.toString() === userGroupId.toString())};
        newState.userGroupId = userGroupId;
        this.setState(newState);

        axios.all([
            getUserGroupMembersCount(userGroupId),
            getUserGroupMembers(userGroupId, offset, limit)
        ]).then(axios.spread((count, members) => {

            if (count.data.err) {
                throw new Error(JSON.stringify(count));
            }

            if (members.data.err) {
                throw new Error(JSON.stringify(members));
            }

            newState.popup.members.list = members.data.result || [];
            newState.popup.members.count = count.data.result || 0;
            newState.request.loading = false;

            if (this.componentState) {
                this.setState(newState);
            }

        })).catch(err => {
            console.log(err);
            newState.request.loading = false;
            if (this.componentState) {
                this.setState(newState);
            }
            showNotification("error", {
                title: "You got an error!",
                description: "Cannot get group members details for unknown reason",
                timer: 3000
            });
        });
    };

    handleFromNumberInputChange = (inputValue: string): any => {
        const newState: IUsersGroupState = {...this.state};
        const {phone: {fromNumbers: {list}}} = this.state;
        let valueForValidate: string = inputValue;

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
            newState.validation.fromNumbers.message = "Phone number is existing";
        } else {
            newState.validation.fromNumbers.value = "success";
            newState.validation.fromNumbers.message = "Valid number";
        }
        newState.phone.fromNumbers.inputValue = valueForValidate;
        this.setState(newState);
    };

    handleFromNumbersChange = (value: ISelect[]) => {
        const newState: IUsersGroupState = {...this.state};
        newState.phone.fromNumbers.list = value || [];
        this.setState(newState);
    };

    handleFromNumberKeyDown = (e: React.KeyboardEvent<HTMLElement>): any => {
        const {phone: {fromNumbers: {inputValue, list}}, validation} = this.state;
        if (!inputValue) {
            return;
        }
        if (validation.fromNumbers.value === "success") {
            const newState: IUsersGroupState = {...this.state};
            switch (e.key) {
                case "Enter":
                case "Tab":
                    newState.phone.fromNumbers.inputValue = "";
                    newState.phone.fromNumbers.list = [...list, createOption(inputValue)];
                    newState.validation.fromNumbers.value = null;
                    newState.validation.fromNumbers.message = "";
                    this.setState(newState);
                    e.preventDefault();
            }
        }
    };

    handleFromNumberOnBlur = (e: React.FocusEvent<HTMLElement>): any => {
        e.preventDefault();
        const {validation} = this.state;
        const newState: IUsersGroupState = {...this.state};
        if (validation.fromNumbers.value === "success") {
            const {phone: {fromNumbers: {inputValue, list}}} = this.state;
            newState.phone.fromNumbers.inputValue = "";
            newState.phone.fromNumbers.list = [...list, createOption(inputValue)];
        }
        newState.validation.fromNumbers.value = null;
        newState.validation.fromNumbers.message = "";
        this.setState(newState);
    };

    handleAddMembers = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const {phone: {fromNumbers}, userGroupId, popup: {members: {offset, limit, list}}} = this.state;
        const newState: IUsersGroupState = {...this.state};
        newState.request.addMembers.processing = true;
        this.setState(newState);

        const members: string[] = fromNumbers.list.map(item => item.value);

        addUserGroupMembers(userGroupId, members).then(({data}: AxiosResponse) => {

            let description: string = "";

            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            if (offset === 0) {
                if (data.result && data.result.length > 0) {
                    let newList: any[] = [];
                    const membersIds: string[] = list.map(item => item.userId);
                    for (const item of data.result) {
                        if (!membersIds.includes(item.userId)) {
                            newList.push(item);
                            description += `${item.number}` + ", ";
                        }
                    }

                    if (newList.length > limit) {
                        newList = newList.slice(0, limit);
                    }

                    newState.popup.members.list = [...newList, ...newState.popup.members.list];
                }

            }

            newState.request.addMembers.processing = false;
            newState.validation.fromNumbers = {
                value: null,
                message: ""
            };
            newState.phone.fromNumbers = {
                list: [],
                inputValue: ""
            };

            if (this.componentState) {
                this.setState(newState);

                if (description !== "") {
                    showNotification("success", {
                        title: "Success!",
                        description: `You have successfully added this numbers - ${description}`,
                        timer: 3000
                    });
                }
            }

        }).catch(e => {
            console.log(e);
            newState.request.addMembers.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Cannot add user to group for unknown reason",
                    timer: 3000
                });
            }
        });

    };

    handleDeleteMember = (e: React.MouseEvent<HTMLButtonElement>, memberId: any) => {
        e.preventDefault();
        e.stopPropagation();
        const {userGroupId, popup: {members: {list}}} = this.state;
        const newState: IUsersGroupState = {...this.state};
        newState.request.deleteMember.processing = true;
        newState.memberId = memberId;
        this.setState(newState);

        deleteUserGroupMember(userGroupId, memberId).then(({data}: AxiosResponse) => {

            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.request.deleteMember.processing = false;
            newState.popup.members.list = list.filter(item => item.memberId !== memberId);
            newState.popup.members.count--;

            if (this.componentState) {
                this.setState(newState);
            }

        }).catch(e => {
            console.log(e);
            newState.request.deleteMember.processing = false;
            if (this.componentState) {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Cannot delete user for unknown reason",
                    timer: 3000
                });
            }
        });
    };

    handleModalClose = (): void => {
        const {
            popup: {isNewGroupShow, isGroupUpdateShow, isGroupDeleteShow, showAttachedGateways, isMembersShow}, validation, userGroupId,
            request: {update, loading, isPaging, addMembers, deleteMember, create}, memberId
        } = this.state;
        const newState: IUsersGroupState = {...this.state};

        if (isNewGroupShow) {
            newState.popup.isNewGroupShow = false;
            newState.popup.newGroup = {
                name: ""
            };
            newState.request.create = {
                disabled: true,
                processing: false,
            };
        }

        if (isGroupUpdateShow) {
            newState.popup.isGroupUpdateShow = false;
            newState.request.update = {
                disabled: true,
                processing: false,
            };
        }

        if (isGroupDeleteShow) {
            newState.popup.isGroupDeleteShow = false;
        }

        if (showAttachedGateways) {
            newState.popup.showAttachedGateways = false;
            newState.userGroup.gatewayList = [];
        }

        if (isMembersShow) {
            newState.popup.isMembersShow = false;
            newState.popup.members.list = [];
            newState.popup.members.count = 0;
            newState.phone.fromNumbers.inputValue = "";
            newState.phone.fromNumbers.list = [];
            newState.userGroupId = null;
        }

        if (update.processing) {
            newState.request.update.processing = false;
            newState.request.update.disabled = true;
        }

        if (create.processing) {
            newState.request.create.processing = false;
            newState.request.create.disabled = true;
        }

        if (deleteMember.processing) {
            newState.request.deleteMember.processing = false;
        }

        if (addMembers.processing) {
            newState.request.addMembers.processing = false;
        }

        if (userGroupId) {
            newState.userGroupId = null;
        }

        if (memberId) {
            newState.memberId = null;
        }

        if (loading) {
            newState.request.loading = false;
        }

        if (isPaging) {
            newState.request.isPaging = false;
        }

        newState.userGroup.info = {};

        for (const item in validation) {
            if (validation.hasOwnProperty(item)) {
                newState.validation[item] = {
                    value: null,
                    message: ""
                }
            }
        }
        this.setState(newState);
    };

    render(): JSX.Element {
        const {
            popup: {isGroupUpdateShow, showAttachedGateways, isNewGroupShow, isGroupDeleteShow, message, newGroup, isMembersShow, members},
            gateway, userGroup, offset, limit, isInitialLoading, userGroups, memberId,
            request: {isPaging, update, create, loading, addMembers, deleteMember}, validation, phone: {fromNumbers}
        } = this.state;

        const {userProfile} = this.props

        return (
            <div>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-4">
                                <span className="text-xlg padder-t-3 block">User groups</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-8">
                                <div className="text-right">
                                    <button
                                        className="btn btn-default btn-addon"
                                        onClick={this.handleNewGroupModalOpen}
                                    ><i className="fa fa-plus"/>New Group
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr/>

                {isInitialLoading ? <Loading/> :
                    <Table
                        hover={true}
                        condensed={true}
                        responsive={true}
                    >
                        <thead>
                        <tr>
                            <th/>
                            <th>Group ID</th>
                            <th>Group Name</th>
                            <th>Created On</th>
                            {!userProfile.readonly && <th/>}
                        </tr>
                        </thead>
                        <tbody>
                        {
                            (userGroups.records && userGroups.records.length === 0) &&
                            <tr>
                                <td colSpan={5}>No results</td>
                            </tr>
                        }

                        {userGroups.records && userGroups.records.length > 0 && userGroups.records.map((userGroup, index) => {
                            const N: number = offset * limit + index + 1;
                            const userGroupUpdate: any = (e: React.MouseEvent<HTMLElement>) => this.handleGroupUpdateModalOpen(e, userGroup.userGroupId);
                            const userGroupDelete: any = (e: React.MouseEvent<HTMLElement>) => this.handleGroupDeleteModalOpen(e, userGroup.userGroupId);
                            const showGateways: any = (e: React.MouseEvent<HTMLElement>) => this.handleShowAttachedGateways(e, userGroup.userGroupId);
                            const getMembers: any = (e: React.MouseEvent<HTMLElement>) => this.handleGetMembersModalOpen(e, userGroup.userGroupId);
                            return (
                                <tr key={userGroup.userGroupId} className="cursor-pointer" onClick={userGroupUpdate}>
                                    <td>{N}</td>
                                    <td>{userGroup.userGroupId > 0 ? userGroup.userGroupId : "Default Group"}</td>
                                    <td>{userGroup.name}</td>
                                    <td>{userGroup.createdAt ? format(new Date(userGroup.createdAt), "DD MMM YYYY hh:mm A") : ""}</td>
                                    {!userProfile.readonly && <td>
                                        <MoreActions
                                            isDropup={(index === userGroups.records.length - 1) && userGroups.records.length !== 1}
                                            isAbsolute={true}
                                        >
                                            <li>
                                                <a href="javascript:void(0);" onClick={userGroupUpdate}>
                                                    Update
                                                </a>
                                            </li>
                                            <li>
                                                <a href="javascript:void(0);" onClick={getMembers}>
                                                    Add users
                                                </a>
                                            </li>
                                            <li>
                                                <a href="javascript:void(0);" onClick={showGateways}>
                                                    Attached gateways
                                                </a>
                                            </li>
                                            <li>
                                                <a href="javascript:void(0);" onClick={userGroupDelete}>
                                                    Delete
                                                </a>
                                            </li>
                                        </MoreActions>
                                    </td>}
                                </tr>
                            )
                        })}
                        </tbody>
                    </Table>
                }

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            {
                                !isInitialLoading && userGroups.count > limit &&
                                <div>
                                    <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6">
                                        <span className="text-xs">{`Showing ${limit} of ${userGroups.count}`}</span>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                        <Pagination
                                            offset={offset}
                                            limit={limit}
                                            callback={this.handleListChange}
                                            length={userGroups.records.length}
                                            disabled={isPaging}
                                            count={userGroups.count}
                                        />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>

                {/*Update group*/}

                <Modal show={isGroupUpdateShow} onHide={this.handleModalClose}>
                    <Modal.Header closeButton={true}>
                        <span className="font-semi-bold text-lg">Update Group</span>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{maxWidth: "650px", margin: "10px auto"}}>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                        <form className="form-horizontal">

                                            <FormGroup validationState={validation.updateGroupName.value}>
                                                <label htmlFor="groupName" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">Group Name</label>
                                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                                    <FormControl
                                                        id="groupName"
                                                        name="updateGroupName"
                                                        placeholder="Group Name"
                                                        value={userGroup.info.name || ""}
                                                        onChange={this.handleGroupNameChange}
                                                    />
                                                </div>
                                            </FormGroup>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div className="text-right flex-end">
                                        <button
                                            className="btn btn-default m-r-sm"
                                            onClick={this.handleModalClose}
                                        >Cancel
                                        </button>
                                        <button
                                            className="btn btn-info"
                                            disabled={update.disabled || update.processing}
                                            onClick={this.handleGroupUpdate}
                                        >Update {update.processing ? <i className="fa fa-spinner fa-spin m-l-xs"/> : ""}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/*Create new group*/}

                <Modal show={isNewGroupShow} onHide={this.handleModalClose}>
                    <Modal.Header closeButton={true}>
                        <span className="font-semi-bold text-lg">Create New Group</span>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <form className="form-horizontal">

                                        <FormGroup validationState={validation.newGroupName.value}>
                                            <label htmlFor="newGroupName" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">New Group Name</label>
                                            <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                                <FormControl
                                                    id="newGroupName"
                                                    name="newGroupName"
                                                    placeholder="New Group Name"
                                                    value={newGroup.name}
                                                    onChange={this.handleGroupNameChange}
                                                />
                                            </div>
                                        </FormGroup>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div className="text-right flex-end">
                                        <button
                                            className="btn btn-default m-r-sm"
                                            onClick={this.handleModalClose}
                                        >Cancel
                                        </button>
                                        <button
                                            className="btn btn-info"
                                            disabled={create.disabled || create.processing}
                                            onClick={this.handleUserGroupCreate}
                                        >Create {create.processing ? <i className="fa fa-spinner fa-spin m-l-xs"/> : ""}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/*Attach gateway*/}

                <Modal show={showAttachedGateways} onHide={this.handleModalClose}>
                    <Modal.Header closeButton={true}>
                        <span className="font-semi-bold text-lg">Group - {userGroup.info && userGroup.info.name}</span>
                    </Modal.Header>
                    <Modal.Body style={{padding: "0 0 15px 0"}}>
                        {
                            loading ? <Loading/> :
                                <Table
                                    hover={true}
                                    condensed={true}
                                    responsive={true}
                                >
                                    <thead>
                                    <tr>
                                        <th/>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Pricing markup</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        gateway.list.length === 0 &&
                                        <tr>
                                            <td colSpan={4}>No results</td>
                                        </tr>
                                    }

                                    {
                                        gateway.list.map((item, index) => {
                                            const N: number = gateway.offset * gateway.limit + index + 1;
                                            return (
                                                <tr key={item.id}>
                                                    <td>{N}</td>
                                                    <td>{item.host}</td>
                                                    <td>{item.description}</td>
                                                    <td>( Price * {item.param1} ) + {item.param2}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                    </tbody>
                                </Table>
                        }
                    </Modal.Body>
                </Modal>

                {/*Add new user*/}
                <Modal show={isMembersShow} onHide={this.handleModalClose}>
                    <Modal.Header closeButton={true}>
                        <span className="font-semi-bold text-lg">Group - {userGroup.info && userGroup.info.name}</span>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container-fluid no-padder">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <FormGroup validationState={validation.fromNumbers.value}>
                                        <ControlLabel>Phone numbers</ControlLabel>
                                        <Creatable
                                            isClearable={true}
                                            isMulti={true}
                                            menuIsOpen={false}
                                            inputValue={fromNumbers.inputValue}
                                            value={fromNumbers.list}
                                            placeholder="Enter phone number"
                                            styles={multiSelectMenuStyles}
                                            onChange={this.handleFromNumbersChange}
                                            onInputChange={this.handleFromNumberInputChange}
                                            onKeyDown={this.handleFromNumberKeyDown}
                                            onBlur={this.handleFromNumberOnBlur}
                                        />
                                        <HelpBlock>{validation.fromNumbers.message}</HelpBlock>
                                    </FormGroup>
                                    <button
                                        className="btn btn-info m-b-sm"
                                        disabled={fromNumbers.list.length === 0 || addMembers.processing}
                                        onClick={this.handleAddMembers}
                                    >Add members {addMembers.processing && <i className="fa fa-spin fa-spinner m-l-xs"/>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {
                            loading ? <Loading/> :
                                <Table
                                    hover={true}
                                    condensed={true}
                                    responsive={true}
                                >
                                    <thead>
                                    <tr>
                                        <th/>
                                        <th>Phone / Email</th>
                                        <th/>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        members.list.length === 0 &&
                                        <tr>
                                            <td colSpan={4}>No results</td>
                                        </tr>
                                    }
                                    {
                                        members.list.map((member, index) => {
                                            const N: number = members.offset * members.limit + index + 1;
                                            const deleteGroupMember: any = (e: React.MouseEvent<HTMLButtonElement>) => this.handleDeleteMember(e, member.memberId);

                                            return (
                                                <tr key={member.memberId}>
                                                    <td>{N}</td>
                                                    <td>{member.email || member.number}</td>
                                                    <td className="text-right">
                                                        <button
                                                            className="btn btn-default btn-xs"
                                                            onClick={deleteGroupMember}
                                                        ><i className={`fa ${member.memberId === memberId && deleteMember.processing ? "fa-repeat fa-spin" : "fa-close"}`}/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                    </tbody>
                                </Table>
                        }
                        <div className="content-wrapper">
                            <div className="container-fluid">
                                <div className="row">
                                    {
                                        !loading && members.count > members.limit &&
                                        <div>
                                            <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6">
                                                <span className="text-xs">{`Showing ${members.limit} of ${members.count}`}</span>
                                            </div>
                                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                                <Pagination
                                                    offset={members.offset}
                                                    limit={members.limit}
                                                    callback={this.handleMembersListChange}
                                                    length={members.list.length}
                                                    disabled={isPaging}
                                                    count={members.count}
                                                />
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>

                    </Modal.Body>
                </Modal>

                {/*Delete group*/}

                <Popup
                    show={isGroupDeleteShow}
                    message={message}
                    hideModal={this.handleModalClose}
                    confirmAction={this.handleUserGroupDelete}
                />
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(UserGroups);
