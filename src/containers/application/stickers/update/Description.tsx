"use strict";

import * as React from "react";
import {ToastContainer} from "react-toastify";
import {FormGroup, ControlLabel, FormControl, HelpBlock} from "react-bootstrap";

import {getDescription, updateDescription} from "ajaxRequests/sticker";
import {showNotification} from "helpers/PageHelper";
import {IVALIDATION} from "services/interface";
import {STICKERS} from "configs/constants";
import {isEqual} from "lodash";

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
    packageNumber: number,
    isUpdate: boolean;
    loading: boolean;
    complete: boolean;
}

interface IDescriptionProps {
    changeStep: (e: React.MouseEvent<HTMLButtonElement>) => void,
    changeBlockCount?: (count: number) => void,
    saveUploadedIcons: (files: any, loaded: boolean) => void,
    stickerPackage: any,
    setPackageNumber?: (packageNumber: number) => void,
}

export default class Description extends React.Component<IDescriptionProps, IDescriptionState> {

    componentState: boolean = true;

    constructor(props: IDescriptionProps) {
        super(props);
        this.state = {
            packageDescription: {
                name: "",
                note: "",
                copyright: "",
                orderNumber: "",
            },
            packageNumber: null,
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
            isUpdate: false,
            loading: false,
            complete: false,
        }
    }

    componentDidMount(): void {
        const {stickerPackage: {packageId}, changeBlockCount, saveUploadedIcons} = this.props;
        getDescription(packageId).then(response => {
            const newState: IDescriptionState = {...this.state};
            if (!response.data.err) {
                const description: any = response.data.result;
                newState.packageDescription.name = description.name;
                newState.packageDescription.note = description.note;
                newState.packageDescription.copyright = description.copyright;
                newState.packageDescription.orderNumber = description.order_number.toString();
                newState.packageNumber = parseInt(description.package_number);

                // Save block count in parent component
                if (description.coords) {
                    changeBlockCount(description.coords.length);
                } else {
                    saveUploadedIcons(null, true);
                }
            }

            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(error => console.log(error));
    }

    componentDidUpdate(prevProps: IDescriptionProps, prevState: IDescriptionState): void {
        const {packageNumber} = this.state;
        if (!isEqual(prevState.packageNumber, packageNumber)) {
            const {setPackageNumber} = this.props;
            setPackageNumber(packageNumber);
        }
    }

    handlePackageDescriptionChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const {packageDescription} = this.state;
        const newState: IDescriptionState = {...this.state};
        newState.packageDescription[name] = value;
        newState.validation[name].value = value === "" ? "error" : "success";
        newState.validation[name].message = value === "" ? "This field is required" : "";
        newState.isUpdate = value === packageDescription[name];
        newState.complete = false;
        this.setState(newState);
    };

    handleUpdateDescription = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {packageDescription} = this.state;
        const newState: IDescriptionState = {...this.state};
        const {stickerPackage: {packageId}} = this.props;
        const isSaved: boolean = Object.keys(packageDescription).every(item => packageDescription[item] !== "");

        if (isSaved && packageId) {
            const toastId: number = showNotification("info", {
                title: "Updating...",
                description: "",
            });

            newState.isUpdate = false;
            newState.loading = true;
            this.setState(newState);

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
                        description: "Your changes is saved",
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
        const {packageDescription, validation, isUpdate, loading, complete} = this.state;
        const {changeStep} = this.props;

        return (
            <div className="container-fluid no-padder">
                <div className="row b-t b-b wrapper-md scroll-340">
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
                                value={packageDescription.orderNumber}
                                onChange={this.handlePackageDescriptionChange}
                                id="packageOrder"
                                placeholder="Sticker Pack Order"
                            />
                            <HelpBlock>{validation.orderNumber.message}</HelpBlock>
                        </FormGroup>
                    </div>

                </div>
                <div className="row wrapper">
                    <div className="col-lg-offset-8 col-lg-4">
                        <button
                            className="btn btn-info pull-right"
                            onClick={changeStep}
                            data-tab-key={STICKERS.TABS.UPLOAD}
                        >Next
                        </button>
                        <button
                            disabled={!isUpdate || loading}
                            className="btn btn-default pull-right m-r-sm"
                            onClick={this.handleUpdateDescription}
                        >Update
                            {loading ?
                                <i className="fa fa-spinner fa-spin m-l-xs"/>
                                : complete ? <i className="fa fa-check m-l-xs"/> : null}
                        </button>
                    </div>
                </div>
                <ToastContainer/>
            </div>
        );
    }
};
