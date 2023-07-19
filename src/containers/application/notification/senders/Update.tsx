"use strict";

import * as React from "react";
import {isEqual} from "lodash";
import {AxiosResponse} from "axios";
import Modal from "react-bootstrap/es/Modal";
import {ToastContainer} from "react-toastify";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {getSpecificSender, updateSender, getSenderImages, uploadSenderImage} from "ajaxRequests/notification";
import {isNumeric, validateNumber} from "helpers/DataHelper";
import {showNotification} from "helpers/PageHelper";
import {IMAGE_MIME_TYPE} from "configs/constants";
import Loading from "components/Common/Loading";
import {IVALIDATION} from "services/interface";

interface IUpdateState {
    request: {
        update: {
            isProcessing: boolean,
            isDisabled: boolean,
            isLoading: boolean,
        },
        upload: {
            isProcessing: boolean,
            isDisabled: boolean,
            isCompleted: boolean,
            isLoading: boolean
        }
    },
    isPhoneNumberValid: boolean,
    senderInfo: {
        messageSenderId: number,
        number: string,
        createdAt: string,
        label: string,
        isVerified: boolean,
        image: any
    };
    popup: {
        isUpdateFormShown: boolean,
        isImageFormShown: boolean,
        senderInfo: {
            messageSenderId: number,
            number: string,
            label: string,
            isVerified: boolean,
            createdAt: string,
            image: any
        },
        images: {
            file: File,
            blobUrl: string
        },
    },
    images: {
        file: File,
        blobUrl: string
    },
    validation: {
        label: IVALIDATION,
        phoneNumber: IVALIDATION,
        isVerified: IVALIDATION,
    },
}

interface IUpdateProps {
    messageSenderId: number,
    handleShowUpdateSender: (senderId?: number, offset?: number) => any,
    offset: number
}

class Update extends React.Component<IUpdateProps, IUpdateState> {

    isComponentMounted: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            request: {
                update: {
                    isProcessing: false,
                    isDisabled: true,
                    isLoading: true,
                },
                upload: {
                    isProcessing: false,
                    isDisabled: true,
                    isCompleted: false,
                    isLoading: true,
                }
            },
            isPhoneNumberValid: true,
            senderInfo: {
                messageSenderId: null,
                number: "",
                createdAt: "",
                label: "",
                isVerified: false,
                image: {},
            },
            popup: {
                isUpdateFormShown: false,
                isImageFormShown: false,
                senderInfo: {
                    messageSenderId: null,
                    number: "",
                    label: "",
                    isVerified: false,
                    createdAt: "",
                    image: {},
                },
                images: {
                    file: null,
                    blobUrl: ""
                },
            },
            images: {
                file: null,
                blobUrl: ""
            },
            validation: {
                label: {
                    value: null,
                    message: "",
                },
                phoneNumber: {
                    value: null,
                    message: "",
                },
                isVerified: {
                    value: null,
                    message: "",
                },
            },
        }
    };

    componentWillUnmount(): void {
        this.isComponentMounted = false;
    };

    componentDidMount(): void {
        const {messageSenderId} = this.props;

        const newState: IUpdateState = {...this.state};

        getSpecificSender(messageSenderId).then(({data}: AxiosResponse) => {
                newState.senderInfo = data.result;
                newState.request.update.isLoading = false;
                if (this.isComponentMounted) {
                    this.setState(newState)
                }
            }
        );

        getSenderImages(messageSenderId).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            if (data.result[0] && data.result[0].signedUrl !== "") {

                try {
                    (async (): Promise<any> => {
                        const getFile: any = await fetch(data.result[0].signedUrl);
                        newState.images.file = await getFile.blob();
                        newState.images.blobUrl = window.URL.createObjectURL(newState.images.file);
                        if (this.isComponentMounted) {
                            this.setState(newState);
                        }
                    })();
                } catch (e) {
                    console.log(e);
                    showNotification("error", {
                        title: "Error",
                        description: "Cannot get sender's avatar",
                        timer: 3000,
                        hideProgress: true
                    });
                }

            }
            newState.images = data.result[0] || {};
            newState.request.upload.isLoading = false;
            if (this.isComponentMounted) {
                this.setState(newState);
            }
        });
    };

    handleReturnToSenders = (e: React.MouseEvent<HTMLSpanElement>): void => {
        e.preventDefault();
        this.props.handleShowUpdateSender(null, this.props.offset);
    };

    handleCheckboxChange = ({currentTarget: {checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IUpdateState = {...this.state};
        newState.popup.senderInfo.isVerified = checked;
        newState.request.update.isDisabled = isEqual(newState.senderInfo, newState.popup.senderInfo);
        this.setState(newState);
    };

    handleInputChange = ({currentTarget: {value, name}}: React.ChangeEvent<HTMLInputElement>) => {
        const newState: IUpdateState = {...this.state};
        if (name === "phoneNumber") {
            let valueForValidate: string = value;
            if (isNumeric(valueForValidate) && valueForValidate.substr(0, 1) !== "+") {
                valueForValidate = "+" + valueForValidate.toString();
            }

            const {isValid} = validateNumber(valueForValidate);

            newState.isPhoneNumberValid = isValid;
            newState.validation.phoneNumber.value = value === "" ? null : isValid ? null : "error";
            newState.popup.senderInfo.number = valueForValidate;
        } else {
            newState.popup.senderInfo[name] = value;
            newState.validation[name].value = value ? "success" : "error";
        }
        newState.request.update.isDisabled = isEqual(newState.senderInfo, newState.popup.senderInfo) || !newState.isPhoneNumberValid || newState.popup.senderInfo.label === "";
        this.setState(newState);
    };

    handleSenderUpdate = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {popup} = this.state;
        const newState: IUpdateState = {...this.state};
        const updatedInfo: any = {
            label: popup.senderInfo.label,
            number: popup.senderInfo.number,
            isVerified: popup.senderInfo.isVerified,
            messageSenderId: popup.senderInfo.messageSenderId,
        };

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });
        newState.request.update.isProcessing = true;
        this.setState(newState);

        updateSender(updatedInfo).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data.err));
            }

            if (this.isComponentMounted) {
                newState.request.update.isProcessing = false;
                newState.senderInfo = {...popup.senderInfo};
                newState.popup.senderInfo = {
                    messageSenderId: null,
                    number: "",
                    label: "",
                    isVerified: false,
                    image: {},
                    createdAt: "",
                };
                newState.popup.isUpdateFormShown = false;
                showNotification("success", {
                    title: "Success!",
                    description: "You successfully updated a sender",
                    id: toastId
                });
                this.setState(newState);
            }
            this.handleSenderUpdateModalClose();
        }).catch(e => {
            console.log(e);
            newState.request.update.isProcessing = false;
            if (this.isComponentMounted) {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot update the sender for unknown reason",
                    timer: 3000
                });
                this.setState(newState);
            }

        })
    };

    handleUploadImage = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {popup: {images}, senderInfo: {messageSenderId}} = this.state;
        const newState: IUpdateState = {...this.state};
        newState.request.upload.isProcessing = true;
        this.setState(newState);

        const formData: any = new FormData();
        formData.append("image", images.file);
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: ""
        });

        uploadSenderImage(messageSenderId, formData).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            newState.request.upload.isCompleted = true;
            newState.request.upload.isProcessing = false;
            newState.request.upload.isDisabled = true;
            newState.images = {...images};
            newState.popup.isImageFormShown = false;
            if (this.isComponentMounted) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "Sender's image successfully uploaded",
                    id: toastId
                });
            }
        }).catch(err => {
            console.log(err);
            newState.request.upload.isProcessing = false;
            if (this.isComponentMounted) {
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot upload image for unknown reason",
                    id: toastId
                });
            }
        });
    };

    handleImageChange = ({currentTarget: {files}}: React.ChangeEvent<HTMLInputElement>): void => {
        if (files && files.length > 0) {
            const image: File = files[0];
            if (!IMAGE_MIME_TYPE.includes(image.type)) {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "File type is not supported",
                    timer: 3000,
                    hideProgress: true
                });
                return;
            }
            if (image.size === 0) {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Size of attached file is zero",
                    timer: 3000,
                    hideProgress: true
                });
                return;
            }
            const newState: IUpdateState = {...this.state};
            newState.popup.images.file = image;
            newState.popup.images.blobUrl = window.URL.createObjectURL(image);
            newState.request.upload.isCompleted = false;
            newState.request.upload.isDisabled = false;
            this.setState(newState);
        }
    };

    handleSenderUpdateModalOpen = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const newState: IUpdateState = {...this.state};
        newState.popup.isUpdateFormShown = true;
        newState.request.update.isDisabled = true;
        newState.popup.senderInfo = {...newState.senderInfo};
        this.setState(newState);
    };

    handleSenderUpdateModalClose = (): void => {
        const newState: IUpdateState = {...this.state};
        newState.popup.isUpdateFormShown = false;
        newState.popup.senderInfo = {
            messageSenderId: null,
            number: "",
            label: "",
            isVerified: false,
            image: {},
            createdAt: "",
        };
        newState.request.update.isDisabled = true;
        this.setState(newState);
    };

    handleSenderImageModalOpen = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const newState: IUpdateState = {...this.state};
        newState.popup.isImageFormShown = true;
        newState.popup.images = {...newState.images};
        newState.request.upload.isDisabled = true;
        this.setState(newState);
    };

    handleSenderImageModalClose = (): void => {
        const newState: IUpdateState = {...this.state};
        newState.popup.isImageFormShown = false;
        newState.popup.images = {
            file: null,
            blobUrl: ""
        };
        newState.request.upload.isDisabled = true;
        this.setState(newState);
    };

    render(): JSX.Element {
        const {validation, senderInfo, request: {update, upload}, images, popup} = this.state;
        const imageName: string = popup && popup.images && popup.images.file && popup.images.file.name && popup.images.file.name !== ""
            ? `${popup.images.file.name.length > 20 ? `${popup.images.file.name.slice(0, 20)}...` : popup.images.file.name}` : "Change file ...";
        return (
            <div>
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            {/*<div className="col-lg-12 m-b-md">*/}
                            {/*                <span className=" cursor-pointer return-to">*/}
                            {/*                    <i className="fa fa-arrow-left"/>*/}
                            {/*                    <span className="m-l-xs" onClick={this.handleReturnToSenders}>Return to Senders</span>*/}
                            {/*                </span>*/}
                            {/*</div>*/}
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-4">
                                <span className="text-xsl padder-t-3 block">Update Sender</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-8">
                                <div className="text-right flex-end">
                                    <button
                                        className="btn btn-default btn-addon m-r-sm"
                                        onClick={this.handleReturnToSenders}
                                    ><i className="fa fa-arrow-left"/>Go Back
                                    </button>
                                    <button
                                        className="btn btn-default btn-addon m-r-sm"
                                        onClick={this.handleSenderUpdateModalOpen}
                                    ><i className="fa fa-pencil"/>Update Sender
                                    </button>
                                    <button
                                        className="btn btn-default btn-addon"
                                        onClick={this.handleSenderImageModalOpen}
                                    ><i className="fa fa-upload"/>Upload Image
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr/>

                <div className="content-wrapper network-details">
                    <div className="container-fluid">
                        {(update.isLoading || upload.isLoading) ? <Loading/> :
                            <div className="row">
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                    <div className="container-fluid no-padder">
                                        <div className="row m-b-md">
                                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                                <span className="block font-bold text-base text-uppercase">Sender Information</span>
                                            </div>
                                        </div>
                                        <div className="row m-b-md">
                                            <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                <span className="block font-semi-bold">Label</span>
                                            </div>
                                            <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                <span className="block">{senderInfo && senderInfo.label}</span>
                                            </div>
                                        </div>
                                        <div className="row m-b-md">
                                            <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                <span className="block font-semi-bold">Phone Number</span>
                                            </div>
                                            <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                <span className="block">{senderInfo && senderInfo.number}</span>
                                            </div>
                                        </div>
                                        <div className="row m-b-md">
                                            <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12">
                                                <span className="block font-semi-bold">Status</span>
                                            </div>
                                            <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                                <span className="block">{(senderInfo && senderInfo.isVerified) ? "Verified" : "Not Verified"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                                    <div className="container-fluid no-padder">
                                        <div className="row m-b-md">
                                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                                <span className="block font-bold text-base text-uppercase">Image</span>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                                {
                                                    images && images.file && images.blobUrl !== "" &&
                                                    <img
                                                        className="img-responsive contain m-b-md"
                                                        src={images.blobUrl}
                                                        alt="Image"
                                                        style={{width: "100px", height: "100px"}}
                                                    />
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>}
                    </div>
                </div>

                <Modal show={popup.isUpdateFormShown} onHide={this.handleSenderUpdateModalClose} bsSize="large">
                    <Modal.Header closeButton={true}>
                        <span className="text-xlg">Update Sender Information</span>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{maxWidth: "650px", margin: "10px auto"}}>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                        <form className="form-horizontal">

                                            <FormGroup validationState={validation.label.value}>
                                                <label htmlFor="label" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">Label</label>
                                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                                    <FormControl
                                                        id="label"
                                                        name="label"
                                                        placeholder="Label"
                                                        onChange={this.handleInputChange}
                                                        defaultValue={popup.senderInfo && popup.senderInfo.label}
                                                    />
                                                    <span className="help-block text-muted"/>
                                                </div>
                                            </FormGroup>

                                            <FormGroup validationState={validation.phoneNumber.value}>
                                                <label htmlFor="phoneNumber" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">
                                                    Phone Number
                                                </label>
                                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                                    <FormControl
                                                        id="phoneNumber"
                                                        type="tel"
                                                        name="phoneNumber"
                                                        placeholder="Phone Number"
                                                        defaultValue={popup.senderInfo && popup.senderInfo.number}
                                                        onChange={this.handleInputChange}
                                                    />
                                                    <span className="help-block text-muted"/>
                                                </div>
                                            </FormGroup>

                                            <FormGroup>
                                                <label htmlFor="verified" className="col-lg-4 col-md-4 col-sm-4 col-xs-4 control-label">
                                                    Verified </label>
                                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                                    <label className="text-base checkbox-inline ">
                                                        <input
                                                            type="checkbox"
                                                            name="verified"
                                                            onChange={this.handleCheckboxChange}
                                                            checked={popup.senderInfo && popup.senderInfo.isVerified}
                                                        />&nbsp;
                                                    </label>
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
                                            onClick={this.handleSenderUpdateModalClose}
                                        >Cancel
                                        </button>
                                        <button
                                            className="btn btn-info"
                                            disabled={update.isDisabled || update.isProcessing}
                                            onClick={this.handleSenderUpdate}
                                        >Update{update.isProcessing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal>

                <Modal show={popup.isImageFormShown} onHide={this.handleSenderImageModalClose} bsSize="large">
                    <Modal.Header closeButton={true}>
                        <span className="text-xlg">Upload Image</span>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{maxWidth: "650px", margin: "10px auto"}}>
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                        <form className="form-horizontal">
                                            {/*Image*/}
                                            <FormGroup>
                                                <label htmlFor="avatar" className="col-lg-4 col-md-4 col-sm-4 col-xs-12 control-label">
                                                    Image
                                                </label>
                                                <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12">
                                                    <ControlLabel
                                                        htmlFor="avatar"
                                                        bsClass="btn btn-default btn-file"
                                                    >{imageName}
                                                    </ControlLabel>
                                                    <FormControl
                                                        type="file"
                                                        name="avatar"
                                                        onChange={this.handleImageChange}
                                                        className="hidden"
                                                        id="avatar"
                                                        disabled={upload.isProcessing}
                                                        accept=".png,.jpg,.jpeg"
                                                    />
                                                </div>
                                                <div className="col-lg-offset-4 col-lg-8 col-md-offset-4 col-md-8 col-sm-8 col-sm-offset-4 col-xs-12">
                                                    {
                                                        popup.images.blobUrl && popup.images.blobUrl !== "" &&
                                                        <img
                                                            className="img-responsive contain m-b-md m-t-md"
                                                            src={popup.images.blobUrl}
                                                            alt="Image"
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
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                    <div className="text-right flex-end">
                                        <button
                                            className="btn btn-default m-r-sm"
                                            onClick={this.handleSenderImageModalClose}
                                        >Cancel
                                        </button>
                                        <button
                                            className="btn btn-info"
                                            disabled={upload.isDisabled || upload.isProcessing}
                                            onClick={this.handleUploadImage}
                                        >Upload{upload.isProcessing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

export default Update;
