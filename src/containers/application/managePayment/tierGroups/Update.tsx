"use strict";

import {AxiosResponse} from "axios";
import * as React from "react";
import {ToastContainer} from "react-toastify";
import FormGroup from "react-bootstrap/es/FormGroup";
import InputGroup from "react-bootstrap/es/InputGroup";
import FormControl from "react-bootstrap/es/FormControl";

import {getTierGroup, updateTierGroup} from "ajaxRequests/managePayment";
import {showNotification} from "helpers/PageHelper";
import {IVALIDATION} from "services/interface";
import {PAGE_NAME} from "configs/constants";
import Tiers from "containers/application/managePayment/tierGroups/tiers/Index";

interface IUpdateProps {
    tierGroupId: number
}

interface IUpdateState {
    loading: boolean,
    tierGroup: any,
    validation: {
        tierGroup: IVALIDATION,
    },
    request: {
        edit: {
            processing: boolean,
            modified: boolean
        }
    }
}

class Update extends React.Component<IUpdateProps, IUpdateState> {

    componentState: boolean = true;

    constructor(props: IUpdateProps) {
        super(props);
        this.state = {
            loading: true,
            tierGroup: null,
            validation: {
                tierGroup: {
                    value: null,
                    message: "",
                },
            },
            request: {
                edit: {
                    processing: false,
                    modified: false
                }
            }
        }
    }

    componentWillMount(): void {
        document.title = PAGE_NAME["/manage-payment"];
    }

    componentDidMount(): void {
        const {tierGroupId} = this.props;
        getTierGroup(tierGroupId).then(({data}: AxiosResponse) => {
            const newState: IUpdateState = {...this.state};
            if (!data.err) {
                newState.tierGroup = data.result;
            } else {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not get tier group",
                    timer: 3000,
                    hideProgress: true
                });
            }

            newState.loading = false;
            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(err => console.log(err));
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleTierGroupChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        const newState: IUpdateState = {...this.state};
        newState.tierGroup.name = value;
        newState.validation.tierGroup.value = value === "" ? "error" : "success";
        newState.validation.tierGroup.message = value === "" ? "Must be not empty" : "";
        newState.request.edit.modified = true;
        this.setState(newState);

    };

    handleTierGroupUpdate = (e: React.MouseEvent<HTMLButtonElement> | any) => {
        e.preventDefault();
        const {tierGroup} = this.state;
        const {tierGroupId} = this.props;
        const newState: IUpdateState = {...this.state};
        const toastId: number = showNotification("info", {
            title: "Updating...",
            description: "",
        });

        newState.request.edit.processing = true;
        this.setState(newState);

        updateTierGroup(tierGroupId, {name: tierGroup.name}).then(({data}: AxiosResponse) => {
            if (!data.err) {
                newState.tierGroup = data.result;
                newState.request.edit.processing = false;
                newState.request.edit.modified = false;
                for (const item in newState.validation) {
                    if (newState.validation.hasOwnProperty(item)) {
                        newState.validation[item] = {
                            value: null,
                            message: ""
                        };
                    }
                }
                if (this.componentState) {
                    this.setState(newState);
                }
                showNotification("success", {
                    title: "Success!",
                    description: "Tier group successfully updated",
                    id: toastId
                });
            } else {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Can not update tier group for unknown reason",
                    timer: 3000,
                    hideProgress: true
                });
            }
        }).catch(err => console.log(err));
    };

    handleEnterKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.keyCode === 13) {
            const {tierGroup, request: {edit}} = this.state;
            if (tierGroup.name !== "" && edit.modified) {
                this.handleTierGroupUpdate(event);
            }
        }
    };

    render(): JSX.Element {
        const {tierGroup, request: {edit}, validation} = this.state;
        const {tierGroupId} = this.props;

        return (
            <div className="col-lg-12 no-padder">
                <div className="container-fluid">
                    <div className="row">
                        {
                            tierGroup &&
                            <div className="col-lg-12">
                                <FormGroup validationState={validation.tierGroup.value}>
                                    <InputGroup>
                                        <FormControl
                                            onChange={this.handleTierGroupChange}
                                            onKeyUp={this.handleEnterKeyUp}
                                            value={tierGroup.name}
                                            name="tierGroup"
                                        />
                                        <InputGroup.Button>
                                            <button
                                                className="btn btn-info"
                                                disabled={tierGroup.name === "" || edit.processing || !edit.modified}
                                                onClick={this.handleTierGroupUpdate}
                                            ><i className={`fa ${edit.processing ? "fa fa-spin fa-spinner" : "fa-save"}`}/>
                                            </button>
                                        </InputGroup.Button>
                                    </InputGroup>
                                </FormGroup>
                            </div>
                        }
                        {tierGroupId && <Tiers tierGroupId={tierGroupId}/>}
                    </div>

                    <ToastContainer/>
                </div>
            </div>
        );
    }
}

export default Update;
