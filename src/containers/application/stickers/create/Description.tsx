"use strict";

import * as React from "react";
import {ToastContainer} from "react-toastify";
import {FormGroup, ControlLabel, FormControl, HelpBlock} from "react-bootstrap";

import {createStickerPackage, getDescription, updateDescription} from "ajaxRequests/sticker";
import {IStickerPackage, IVALIDATION} from "services/interface";
import {showNotification} from "helpers/PageHelper";
import {STICKERS} from "configs/constants";

interface IDescriptionState {
    packageDescription: {
        name: string,
        note: string,
        copyright: string,
        orderNumber: number | string,
    },
    validation: {
        name: IVALIDATION,
        note: IVALIDATION,
        copyright: IVALIDATION,
        orderNumber: IVALIDATION,
    },
    nextStep: boolean,
    loading: boolean,
    complete: boolean,
}

interface IDescriptionProps {
    changeStep: (e: React.MouseEvent<HTMLButtonElement>) => void,
    createPackage: (data: any) => void
    stickerPackage: IStickerPackage
}

export default class Description extends React.Component<IDescriptionProps, IDescriptionState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            packageDescription: {
                name: "",
                note: "",
                copyright: "",
                orderNumber: "",
            },
            validation: {
                name: {
                    value: null,
                    message: "",
                },
                note: {
                    value: null,
                    message: "",
                },
                copyright: {
                    value: null,
                    message: "",
                },
                orderNumber: {
                    value: null,
                    message: "",
                },
            },
            nextStep: false,
            loading: false,
            complete: false,
        }
    }

    componentDidMount(): void {
        const {stickerPackage: {packageId}} = this.props;
        if (packageId) {
            getDescription(packageId).then(response => {
                const newState: any = {...this.state};
                if (!response.data.err) {
                    const description: any = response.data.result;
                    newState.packageDescription.name = description.name;
                    newState.packageDescription.note = description.note;
                    newState.packageDescription.copyright = description.copyright;
                    newState.packageDescription.orderNumber = description.order_number;
                }

                newState.nextStep = true;

                if (this.componentState) {
                    this.setState(newState);
                }

            }).catch(error => console.log(error));
        }
    }

    handlePackageDescriptionChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: any = {...this.state};
        newState.packageDescription[name] = value;
        newState.validation[name].value = value === "" ? "error" : "success";
        newState.validation[name].message = value === "" ? "This field is required" : "";
        newState.complete = false;
        this.setState(newState);
    };

    handleStepChange = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        this.props.changeStep(e);
    };

    handleSaveChange = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {packageDescription} = this.state;
        const {createPackage, stickerPackage: {packageId}} = this.props;
        const newState: any = {...this.state};
        const isSaved: boolean = Object.keys(packageDescription).every(item => packageDescription[item] !== "");

        if (isSaved) {
            const toastId: number = showNotification("info", {
                title: "Processing...",
                description: "",
            });
            newState.loading = true;
            this.setState(newState);
            if (packageId) {
                updateDescription(packageId, packageDescription).then(response => {
                    if (!response.data.err) {
                        for (const item in newState.validation) {
                            if (newState.validation.hasOwnProperty(item)) {
                                newState.validation[item].value = null;
                                newState.validation[item].message = "";
                            }
                        }
                        newState.complete = true;
                        showNotification("success", {
                            title: "Success!",
                            description: "Package successfully updated",
                            id: toastId
                        });
                    } else {
                        showNotification("error", {
                            title: "You got an error!",
                            description: "Your changes is not updated for unknown reason",
                            id: toastId
                        });
                    }
                    newState.loading = false;
                    if (this.componentState) {
                        this.setState(newState);
                    }
                }).catch(error => console.log(error));
            } else {
                createStickerPackage(packageDescription).then(response => {
                    if (!response.data.err) {
                        createPackage(response.data.result);
                        newState.nextStep = true;
                        newState.complete = true;
                        for (const item in newState.validation) {
                            if (newState.validation.hasOwnProperty(item)) {
                                newState.validation[item].value = null;
                                newState.validation[item].message = "";
                            }
                        }
                        showNotification("success", {
                            title: "Success!",
                            description: "Package successfully created",
                            id: toastId
                        });
                    } else {
                        showNotification("error", {
                            title: "You got an error!",
                            description: "Your changes is not saved for unknown reason",
                            id: toastId
                        });
                    }
                    newState.loading = false;
                    if (this.componentState) {
                        this.setState(newState);
                    }

                }).catch(error => console.log(error));
            }

        } else {
            for (const item in packageDescription) {
                if (packageDescription.hasOwnProperty(item) && packageDescription[item] === "") {
                    newState.validation[item].value = "error";
                    newState.validation[item].message = "This field is required";
                }
            }
            this.setState(newState);
        }
    };

    render(): JSX.Element {
        const {packageDescription, validation, nextStep, loading, complete} = this.state;

        return (
            <div className="container-fluid no-padder">
                <ToastContainer/>
                <div className="row b-t b-b wrapper-md">
                    <div className="col-lg-offset-3 col-lg-6">
                        <FormGroup validationState={validation.name.value}>
                            <ControlLabel htmlFor="packageName">Internal Name</ControlLabel>
                            <FormControl
                                name="name"
                                value={packageDescription.name}
                                onChange={this.handlePackageDescriptionChange}
                                id="packageName"
                                placeholder="Internal Name"
                            />
                            <HelpBlock>{validation.name.message}</HelpBlock>
                        </FormGroup>
                    </div>
                    <div className="col-lg-offset-3 col-lg-6">
                        <FormGroup validationState={validation.note.value}>
                            <ControlLabel htmlFor="packageNote">Internal Note</ControlLabel>
                            <FormControl
                                name="note"
                                value={packageDescription.note}
                                onChange={this.handlePackageDescriptionChange}
                                id="packageNote"
                                placeholder="Internal Note"
                            />
                            <HelpBlock>{validation.note.message}</HelpBlock>
                        </FormGroup>
                    </div>
                    <div className="col-lg-offset-3 col-lg-6">
                        <FormGroup validationState={validation.copyright.value}>
                            <ControlLabel htmlFor="packageCopyright">Copyright</ControlLabel>
                            <FormControl
                                name="copyright"
                                value={packageDescription.copyright}
                                onChange={this.handlePackageDescriptionChange}
                                id="packageCopyright"
                                placeholder="Copyright"
                            />
                            <HelpBlock>{validation.copyright.message}</HelpBlock>
                        </FormGroup>
                    </div>
                    <div className="col-lg-offset-3 col-lg-6">
                        <FormGroup validationState={validation.orderNumber.value}>
                            <ControlLabel htmlFor="packageOrder">Sticker Pack Order</ControlLabel>
                            <FormControl
                                type="number"
                                min="1"
                                name="orderNumber"
                                defaultValue={packageDescription.orderNumber}
                                onChange={this.handlePackageDescriptionChange}
                                id="packageOrder"
                                placeholder="Sticker Pack Order"
                            />
                            <HelpBlock>{validation.orderNumber.message}</HelpBlock>
                        </FormGroup>
                    </div>
                </div>
                <div className="row wrapper">
                    <div className="col-lg-4"/>
                    <div className="col-lg-4"/>
                    <div className="col-lg-4">
                        <button
                            className="btn btn-info pull-right"
                            onClick={this.handleStepChange}
                            data-tab-key={STICKERS.TABS.UPLOAD}
                            disabled={!nextStep}
                        >Next
                        </button>
                        <button
                            disabled={loading}
                            className="btn btn-default pull-right m-r-sm"
                            onClick={this.handleSaveChange}
                        >Save
                            {loading ?
                                <i className="fa fa-spinner fa-spin m-l-xs"/>
                                : complete ? <i className="fa fa-check m-l-xs"/> : null}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
};
