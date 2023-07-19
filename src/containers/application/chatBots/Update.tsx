"use strict";

import * as React from "react";
import * as moment from "moment";
import {Link} from "react-router-dom";
import axios, {AxiosResponse} from "axios";
import Table from "react-bootstrap/es/Table";
import {toast, ToastContainer} from "react-toastify";
import Button from "react-bootstrap/es/Button";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {getChatBot, updateChatBot, getChatBotCredentials, deleteChatBotCredential, createChatBotCredential, uploadChatBotAvatar} from "ajaxRequests/chatBots";
import Pagination from "components/Common/Pagination";
import {selectMenuStyles, showNotification} from "helpers/PageHelper";
import {IMAGE_MIME_TYPE, LIST, PAGE_NAME} from "configs/constants";
import {IVALIDATION} from "services/interface";
import Popup from "components/Common/Popup";
import Select from "react-select";
import Loading from "components/Common/Loading";

interface IUpdateState {
    chatBot: any,
    chatBotId: any,
    chatBotCredentialId: number,
    chatBotCredentials: {
        count: number,
        records: any[]
    },
    avatar: {
        file: File,
        blobUrl: string
    },
    popup: {
        delete: {
            show: boolean
        }
    },
    offset: number,
    limit: number,
    validation: {
        description: IVALIDATION,
        name: IVALIDATION,
    },
    request: {
        loading: boolean,
        update: {
            processing: boolean,
            complete: boolean,
            disabled: boolean,
        },
        creating: {
            processing: boolean,
            disabled: boolean,
            pagination: boolean,
            loading: boolean
        },
        upload: {
            processing: boolean,
            disabled: boolean,
            complete: boolean,
            loading: boolean
        }
    }
}

interface IUpdateProps {
    match: any,
    history: any,
}

class Update extends React.Component<IUpdateProps, IUpdateState> {

    componentState: boolean = true;

    constructor(props: IUpdateProps) {
        super(props);
        this.state = {
            chatBot: {},
            chatBotId: props.match.params.id || null,
            chatBotCredentialId: null,
            chatBotCredentials: {
                count: null,
                records: []
            },
            avatar: {
                file: null,
                blobUrl: ""
            },
            popup: {
                delete: {
                    show: false
                }
            },
            offset: 0,
            limit: 20,
            validation: {
                description: {
                    value: null,
                    message: ""
                },
                name: {
                    value: null,
                    message: ""
                },
            },
            request: {
                loading: true,
                update: {
                    processing: false,
                    complete: false,
                    disabled: true,
                },
                creating: {
                    processing: false,
                    disabled: false,
                    pagination: false,
                    loading: true
                },
                upload: {
                    processing: false,
                    disabled: true,
                    complete: false,
                    loading: true
                }
            },
        }
    }

    componentWillMount(): void {
        document.title = PAGE_NAME["/chat-bots/update"];
    }

    componentDidMount(): void {
        const {history} = this.props;
        const {offset, limit, chatBotId} = this.state;
        if (!chatBotId) {
            history.push("/chat-bots");
        }
        const newState: IUpdateState = {...this.state};

        axios.all([
            getChatBot(chatBotId),
            getChatBotCredentials(chatBotId, offset, limit),
        ]).then(axios.spread((chatBot, credentials) => {

            if (chatBot.data.err) {
                throw new Error(JSON.stringify(chatBot.data));
            }

            if (credentials.data.err) {
                throw new Error(JSON.stringify(credentials.data));
            }

            if (chatBot.data.result.signedUrl !== "") {

                try {
                    (async (): Promise<any> => {
                        const getFile: any = await fetch(chatBot.data.result.signedUrl);
                        newState.avatar.file = await getFile.blob();
                        newState.avatar.blobUrl = window.URL.createObjectURL(newState.avatar.file);
                        this.setState(newState);
                    })();
                } catch (e) {
                    console.log(e);
                    showNotification("error", {
                        title: "Error",
                        description: "Cannot get chat bot avatar",
                        timer: 3000,
                        hideProgress: true
                    });
                }

            }

            newState.chatBot = chatBot.data.result || {};
            newState.chatBotCredentials.records = credentials.data.result.records || [];
            newState.chatBotCredentials.count = credentials.data.result.count || null;
            newState.request.loading = false;
            newState.request.creating.loading = false;
            if (this.componentState) {
                this.setState(newState);
            }
        })).catch(error => {
            console.log(error);
            newState.request.loading = false;
            newState.request.creating.loading = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not get chat bot info for unknown reason",
                    timer: 3000,
                    hideProgress: true
                });
            }
        });
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const {request: {update}} = this.state;
        const newState: IUpdateState = {...this.state};
        newState.chatBot[name] = value;
        if (update.complete) {
            newState.request.update.complete = false;
        }
        newState.validation[name].value = value === "" ? "error" : "success";
        this.handleToggleDisabled(newState);
        this.setState(newState);
    };

    handleToggleDisabled = (state: any): void => {
        state.request.disabled = Object.keys(state.validation).some(item => state.validation[item].value === "error");
    };

    handleModalOpen = (chatBotCredentialId: number): void => {
        const newState: IUpdateState = {...this.state};
        newState.popup.delete.show = true;
        newState.chatBotCredentialId = chatBotCredentialId;
        this.setState(newState);
    };

    handleModalClose = (): void => {
        const newState: any = {...this.state};
        for (const item in newState.popup) {
            if (newState.popup.hasOwnProperty(item)) {
                newState.popup[item].show = false;
            }
        }
        newState.chatBotCredentialId = null;
        this.setState(newState);
    };

    handleChatBotCredentialDelete = (): void => {
        const {chatBotCredentialId, chatBotId} = this.state;
        const newState: IUpdateState = {...this.state};

        for (const item in newState.popup) {
            if (newState.popup.hasOwnProperty(item)) {
                newState.popup[item].show = false;
            }
        }
        this.setState(newState);
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });
        deleteChatBotCredential(chatBotId, chatBotCredentialId).then(({data}: AxiosResponse) => {
            if (data.err || !data.result.deleted) {
                throw new Error(JSON.stringify(data));
            }
            newState.chatBotCredentials.records = newState.chatBotCredentials.records.filter(item => item.chatBotCredentialId !== chatBotCredentialId);
            newState.chatBotCredentialId = null;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "Chat bot was successfully deleted",
                    id: toastId
                });
            }

        }).catch(error => {
            console.log(error);
            newState.chatBotCredentialId = null;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Chat bot is not deleted",
                    id: toastId
                });
            }
        });
    };

    handleCreateCredential = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {offset, limit, chatBotCredentials, chatBotId} = this.state;
        const newState: IUpdateState = {...this.state};
        newState.request.creating.disabled = true;
        newState.request.creating.processing = true;
        this.setState(newState);
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });
        createChatBotCredential(chatBotId).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            if (offset === 0) {
                const result: any = data.result || [];
                let records: any = chatBotCredentials.records;
                records = [...result, ...records];
                if (records.length > limit) {
                    records = records.slice(0, limit);
                }
                newState.chatBotCredentials.records = records;
            }
            newState.chatBotCredentials.count++;
            newState.request.creating.disabled = false;
            newState.request.creating.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "Chat bot credential successfully created",
                    id: toastId
                });
            }

        }).catch(error => {
            console.log(error);
            newState.request.creating.disabled = false;
            newState.request.creating.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Chat bot credential not generate",
                    id: toastId
                });
            }
        });
    };

    handleAvatarChange = ({currentTarget: {files}}: React.ChangeEvent<HTMLInputElement>): void => {
        if (files && files.length > 0) {
            const avatar: File = files[0];
            if (!IMAGE_MIME_TYPE.includes(avatar.type)) {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Not supported file type",
                    timer: 3000,
                    hideProgress: true
                });
                return;
            }
            if (avatar.size === 0) {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Attached file size is zero",
                    timer: 3000,
                    hideProgress: true
                });
                return;
            }
            const newState: IUpdateState = {...this.state};
            newState.avatar.file = avatar;
            newState.avatar.blobUrl = window.URL.createObjectURL(avatar);
            newState.request.upload.complete = false;
            newState.request.upload.disabled = false;
            this.setState(newState);
        }
    };

    handleAvatarUpload = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {avatar, chatBot: {chatBotId}} = this.state;
        const newState: IUpdateState = {...this.state};

        newState.request.upload.processing = true;
        this.setState(newState);

        const formData: any = new FormData();
        formData.append("avatar", avatar.file);
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: ""
        });

        uploadChatBotAvatar(chatBotId, formData).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            newState.request.upload.complete = true;
            newState.request.upload.processing = false;
            newState.request.upload.disabled = true;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "Chat bot avatar successfully uploaded",
                    id: toastId
                });
            }
        }).catch(err => {
            console.log(err);
            newState.request.upload.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not upload avatar for unknown reason",
                    id: toastId
                });
            }
        });

    };

    handleSubmit = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        const {chatBot}: any = this.state;
        const newState: IUpdateState = {...this.state};
        const {match} = this.props;
        const id: number = parseInt(match.params.id);
        const toastId: number = showNotification("info", {
            title: "Updating...",
            description: "",
        });

        newState.request.update.processing = true;
        this.setState(newState);

        updateChatBot(id, chatBot).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            for (const item in newState.validation) {
                if (newState.validation.hasOwnProperty(item)) {
                    newState.validation[item] = {
                        value: null,
                        message: ""
                    }
                }
            }
            newState.request.update.complete = true;
            newState.request.update.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "Chat bot was successfully updated",
                    id: toastId
                });
            }
        }).catch(e => {
            console.log(e);
            newState.request.update.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Chat bot is not updated for unknown reason",
                    id: toastId
                });
            }
        })
    };

    handleListChange = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {offset, limit, chatBotId} = this.state;
        const newState: IUpdateState = {...this.state};
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

        newState.request.creating.pagination = true;
        this.setState(newState);

        getChatBotCredentials(chatBotId, currentOffset, limit).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            newState.chatBotCredentials.records = data.result.records || [];
            newState.chatBotCredentials.count = data.result.count || null;
            newState.request.creating.pagination = false;
            newState.offset = currentOffset;

            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(err => {
            console.log(err);
            newState.request.creating.pagination = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get chat bot info for unknown reason",
                    timer: 3000,
                    hideProgress: true
                });
            }
        })
    };

    render(): JSX.Element {
        const {validation, request: {update, creating, upload}, avatar, chatBot, chatBotCredentials: {records, count}, limit, offset, popup} = this.state;
        const popupMessage: any = popup.delete.show ? {
            info: "Are you sure you want to delete?",
            apply: "Apply",
            cancel: "Cancel",
        } : {};
        const chatBotAvatar: File = avatar.file;
        const blobUrl: string = avatar.blobUrl;

        return (
            <div>
                <div className="box-shadow r-3x bg-white m-b-md">
                    <ToastContainer/>
                    <div className="content-wrapper">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                    <span className="text-xsl padder-t-3">Update Provider</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr/>

                    <div className="content-wrapper">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <form className="form-horizontal">

                                        <FormGroup>
                                            <label htmlFor="nickname" className="col-lg-4 col-md-4 col-sm-4 col-xs-12 control-label">Nickname</label>
                                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                                <FormControl
                                                    id="nickname"
                                                    disabled={true}
                                                    placeholder="Nickname"
                                                    defaultValue={chatBot.nickname || ""}
                                                />
                                            </div>
                                        </FormGroup>

                                        <FormGroup validationState={validation.description.value}>
                                            <label htmlFor="description" className="col-lg-4 col-md-4 col-sm-4 col-xs-12 control-label">Description</label>
                                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                                <FormControl
                                                    name="description"
                                                    id="description"
                                                    placeholder="Description"
                                                    value={chatBot.description || ""}
                                                    onChange={this.handleChange}
                                                />
                                            </div>
                                        </FormGroup>

                                        <FormGroup validationState={validation.name.value}>
                                            <label htmlFor="uniqueName" className="col-lg-4 col-md-4 col-sm-4 col-xs-12 control-label">Name</label>
                                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                                <FormControl
                                                    name="name"
                                                    id="uniqueName"
                                                    placeholder="Name"
                                                    value={chatBot.name || ""}
                                                    onChange={this.handleChange}
                                                />
                                            </div>
                                        </FormGroup>

                                        <FormGroup>
                                            <label htmlFor="createdAt" className="col-lg-4 col-md-4 col-sm-4 col-xs-12 control-label">Created At</label>
                                            <div className="c ol-lg-6 col-md-6 col-sm-6 col-xs-12">
                                                <FormControl
                                                    name="createdAt"
                                                    id="createdAt"
                                                    placeholder="Created At"
                                                    defaultValue={moment(chatBot.createdAt).format("DD MMM YYYY hh:mm A")}
                                                    disabled={true}
                                                />
                                            </div>
                                        </FormGroup>
                                        {
                                            chatBot.updatedAt &&
                                            <FormGroup>
                                                <label htmlFor="updatedAt" className="col-lg-4 col-md-4 col-sm-4 col-xs-12 control-label">Updated At</label>
                                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                                    <FormControl
                                                        name="updatedAt"
                                                        id="updatedAt"
                                                        placeholder="Updated At"
                                                        value={moment(chatBot.updatedAt).format("DD MMM YYYY hh:mm A")}
                                                        disabled={true}
                                                    />
                                                </div>
                                            </FormGroup>
                                        }
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr/>

                    <div className="content-wrapper">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div className="text-right flex-end">
                                        <Button
                                            type="submit"
                                            className="btn btn-info f-r m-r-xs"
                                            disabled={update.disabled || update.processing}
                                            onClick={this.handleSubmit}
                                        >Update{update.processing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                        </Button>
                                        <Link
                                            className="btn btn-default"
                                            to="/chat-bots"
                                        >Cancel
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="box-shadow r-3x bg-white m-b-md">
                    <div className="content-wrapper">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                    <span className="text-xsl padder-t-3">Chat Bot Avatar</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr/>

                    <div className="content-wrapper">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <form className="form-horizontal">
                                        {/*Avatar*/}
                                        <FormGroup>
                                            <label htmlFor="avatar" className="col-lg-4 col-md-4 col-sm-4 col-xs-12 control-label">
                                                Avatar
                                            </label>
                                            <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12">
                                                <ControlLabel
                                                    htmlFor="avatar"
                                                    bsClass="btn btn-default btn-file"
                                                >{(chatBotAvatar && chatBotAvatar.name !== "" && chatBotAvatar.name) || "Change file ..."}
                                                </ControlLabel>
                                                <FormControl
                                                    type="file"
                                                    name="avatar"
                                                    onChange={this.handleAvatarChange}
                                                    className="hidden"
                                                    id="avatar"
                                                    disabled={upload.processing}
                                                    accept=".png,.jpg,.jpeg"
                                                />
                                            </div>
                                            <div className="col-lg-offset-4 col-lg-8 col-md-offset-4 col-md-8 col-sm-8 col-sm-offset-4 col-xs-12">
                                                {
                                                    blobUrl !== "" &&
                                                    <img
                                                        className="img-responsive contain m-b-md m-t-md"
                                                        src={blobUrl}
                                                        alt="Avatar"
                                                        style={{width: "100px", height: "100px"}}
                                                    />
                                                }
                                            </div>
                                        </FormGroup>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr/>

                    <div className="content-wrapper">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div className="text-right">
                                        <button
                                            className="btn btn-info"
                                            disabled={upload.disabled || upload.processing}
                                            onClick={this.handleAvatarUpload}
                                        >Upload {upload.processing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="box-shadow r-3x bg-white">
                    <div className="content-wrapper">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                    <span className="text-xsl padder-t-3">Credentials</span>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                    <div className="text-right">
                                        <button
                                            className="btn btn-default btn-addon"
                                            onClick={this.handleCreateCredential}
                                        ><i className="fa fa-plus"/>Create{creating.processing && <i className="fa fa-spinner fa-spin m"/>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr/>

                    {creating.loading ? <Loading/> :
                        <Table
                            hover={true}
                            condensed={true}
                            responsive={true}
                        >
                            <thead>
                            <tr>
                                <th/>
                                <th>Access key</th>
                                <th>Secret</th>
                                <th/>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                records.length === 0 &&
                                <tr>
                                    <td colSpan={4}>No result</td>
                                </tr>
                            }

                            {records.map((record, index) => {
                                const N: number = offset * limit + index + 1;
                                const deleteCredential: any = () => this.handleModalOpen(record.chatBotCredentialId);
                                return (
                                    <tr key={N}>
                                        <td>{N}</td>
                                        <td>{record.accessKey}</td>
                                        <td>{record.secret}</td>
                                        <td>
                                            <div className="flex">
                                                <button
                                                    className="btn btn-default btn-xs m-l-xs"
                                                    onClick={deleteCredential}
                                                ><i className="fa fa-close"/>
                                                </button>
                                            </div>

                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </Table>}

                    <div className="content-wrapper">
                        <div className="container-fluid">
                            <div className="row">
                                {
                                    !creating.loading && count > limit &&
                                    <div>
                                        <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6">
                                            <span className="text-xs">{`Showing 1 to ${limit} of ${count} entries`}</span>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                            <Pagination
                                                offset={offset}
                                                limit={limit}
                                                callback={this.handleListChange}
                                                length={count}
                                                disabled={creating.pagination}
                                            />
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <Popup
                    show={popup.delete.show}
                    message={popupMessage}
                    hideModal={this.handleModalClose}
                    confirmAction={this.handleChatBotCredentialDelete}
                />
                <ToastContainer/>
            </div>
        );
    }
}

export default Update;
