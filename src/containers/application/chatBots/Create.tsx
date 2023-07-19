"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import {Link} from "react-router-dom";
import Form from "react-bootstrap/es/Form";
import Modal from "react-bootstrap/es/Modal";
import {toast, ToastContainer} from "react-toastify";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {createChatBot, uploadChatBotAvatar} from "ajaxRequests/chatBots";
import {IMAGE_MIME_TYPE, PAGE_NAME} from "configs/constants";
import {showNotification} from "helpers/PageHelper";
import {IVALIDATION} from "services/interface";

interface ICreateState {
    chatBot: {
        nickname: string,
        description: string,
        name: string,
        avatar: {
            file: File,
            blobUrl: string
        }
    },
    chatBotId: number,
    validation: {
        nickname: IVALIDATION,
        description: IVALIDATION,
        name: IVALIDATION,
    },
    request: {
        create: {
            processing: boolean,
            complete: boolean,
            disabled: boolean,
        }
        upload: {
            processing: boolean,
            complete: boolean,
            disabled: boolean
        }
    }
}

class Create extends React.Component<any, ICreateState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            chatBot: {
                nickname: "",
                description: "",
                name: "",
                avatar: {
                    file: null,
                    blobUrl: ""
                }
            },
            chatBotId: null,
            validation: {
                nickname: {
                    value: null,
                    message: ""
                },
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
                create: {
                    processing: false,
                    complete: false,
                    disabled: true,
                },
                upload: {
                    processing: false,
                    complete: false,
                    disabled: true,
                }
            }
        }
    }

    componentWillMount(): void {
        document.title = PAGE_NAME["/chat-bots/create"];
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const {request: {create: {complete}}} = this.state;
        const newState: ICreateState = {...this.state};
        if (complete) {
            newState.request.create.complete = false;
        }
        newState.chatBot[name] = value;
        newState.validation[name].value = value === "" ? "error" : "success";
        newState.request.create.disabled = !Object.keys(newState.chatBot).every(item => newState.chatBot[item] !== "");
        this.setState(newState);
    };

    handleAvatarChange = ({currentTarget: {name, files}}: React.ChangeEvent<HTMLInputElement>): void => {
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
            const newState: ICreateState = {...this.state};
            newState.chatBot.avatar.file = avatar;
            newState.chatBot.avatar.blobUrl = window.URL.createObjectURL(avatar);
            newState.request.upload.complete = false;
            newState.request.upload.disabled = false;
            this.setState(newState);
        }
    };

    handleAvatarUpload = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {chatBot: {avatar}, chatBotId} = this.state;
        const newState: ICreateState = {...this.state};

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
                toast.dismiss(toastId);
                this.setState(newState);
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
        const newState: ICreateState = {...this.state};
        const chatBotData: any = {
            nickname: newState.chatBot.nickname,
            description: newState.chatBot.description,
            name: newState.chatBot.name
        };
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: ""
        });

        newState.request.create.processing = true;
        this.setState(newState);

        createChatBot(chatBotData).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));

            }
            newState.chatBotId = data.result.chatBotId || null;

            for (const item in newState.validation) {
                if (newState.validation.hasOwnProperty(item)) {
                    newState.validation[item] = {
                        value: null,
                        error: ""
                    };
                }
            }
            newState.request.create.complete = true;
            newState.request.create.processing = false;
            newState.request.create.disabled = false;
            if (this.componentState) {
                showNotification("success", {
                    title: "Success!",
                    description: "Chat bot was successfully created",
                    id: toastId
                });
                this.setState(newState);
            }
        }).catch(err => {
            console.log(err);
            newState.request.create.complete = true;
            newState.request.create.processing = false;
            newState.request.create.disabled = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not create chat bot for unknown reason",
                    id: toastId
                });
            }
        });
    };

    handleModalClose = (): void => {
        const {history} = this.props;
        const newState: ICreateState = {...this.state};
        newState.request.upload.complete = false;
        this.setState(newState);
        history.push("/chat-bots");
    };

    render(): JSX.Element {
        const {validation, chatBot, chatBotId, request: {create, upload}}: ICreateState = this.state;
        const avatar: File = chatBot.avatar.file;
        const blobUrl: string = chatBot.avatar.blobUrl;

        return (
            <div>
                <div className="box-shadow r-3x bg-white m-b-md">
                    <ToastContainer/>
                    <div className="content-wrapper">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <span className="text-xsl padder-t-3">{PAGE_NAME["/chat-bots/create"]}</span>
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
                                        {/*Nick name*/}
                                        <FormGroup validationState={validation.nickname.value}>
                                            <label htmlFor="nickname" className="col-lg-4 col-md-4 col-sm-4 col-xs-12 control-label">Nick name</label>
                                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                                <FormControl
                                                    name="nickname"
                                                    id="nickname"
                                                    placeholder="Nick name"
                                                    value={chatBot.nickname}
                                                    disabled={!!chatBotId}
                                                    onChange={this.handleChange}
                                                />
                                            </div>
                                        </FormGroup>

                                        {/*Description*/}
                                        <FormGroup validationState={validation.description.value}>
                                            <label htmlFor="description" className="col-lg-4 col-md-4 col-sm-4 col-xs-12 control-label">Description</label>
                                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                                <FormControl
                                                    name="description"
                                                    id="description"
                                                    placeholder="Description"
                                                    disabled={!!chatBotId}
                                                    value={chatBot.description}
                                                    onChange={this.handleChange}
                                                />
                                            </div>
                                        </FormGroup>

                                        {/*Name*/}
                                        <FormGroup validationState={validation.name.value}>
                                            <label htmlFor="name" className="col-lg-4 col-md-4 col-sm-4 col-xs-12 control-label">Name</label>
                                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                                <FormControl
                                                    name="name"
                                                    id="name"
                                                    placeholder="Name"
                                                    disabled={!!chatBotId}
                                                    value={chatBot.name}
                                                    onChange={this.handleChange}
                                                />
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
                                    <div className="text-right flex-end">
                                        <button
                                            type="submit"
                                            className="btn btn-info m-r-xs"
                                            disabled={create.disabled || create.processing || !!chatBotId}
                                            onClick={this.handleSubmit}
                                        >Create {create.processing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                        </button>
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

                <div className="box-shadow r-3x bg-white">
                    <div className="content-wrapper">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
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
                                                >{(avatar && avatar.size > 0) ? avatar.name : "Choose file ..."}
                                                </ControlLabel>
                                                <FormControl
                                                    type="file"
                                                    name="avatar"
                                                    onChange={this.handleAvatarChange}
                                                    className="hidden"
                                                    id="avatar"
                                                    disabled={!chatBotId || upload.processing}
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

                <Modal show={upload.complete} onHide={this.handleModalClose} bsSize="small">
                    <Modal.Header closeButton={true}/>
                    <Modal.Body>
                        <Form className="wrapper-md text-center">
                            <button
                                className="btn btn-info btn-block"
                                onClick={this.handleModalClose}
                            >Finish
                            </button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}

export default Create;
