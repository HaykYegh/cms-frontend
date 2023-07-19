"use strict";

import * as React from "react";
import {isEqual} from "lodash";
import Select from "react-select";
import {connect} from "react-redux";
import axios, {AxiosResponse} from "axios";
import {ToastContainer} from "react-toastify";
import {Form, FormGroup, ControlLabel, FormControl, HelpBlock} from "react-bootstrap";

import {
    addCategories, addPlatforms, addStatus, deleteCategory, deletePlatform,
    getStickersCategories, getStickersStatuses
} from "ajaxRequests/sticker";
import {IStoreProps, default as selector} from "services/selector";
import {showNotification} from "helpers/PageHelper";
import {ISelect} from "services/interface";

interface ISettingsState {
    categories: any[],
    statuses: any[],
    stickerStatus: ISelect,
    stickerCategories: ISelect,
    stickerPlatforms: ISelect,
    isChanged: boolean
}

interface ISettingsProps extends IStoreProps {
    configChange: (name: string, data: any) => void,
    configurations: any,
    packageId: number,
}

class Settings extends React.Component<ISettingsProps, ISettingsState> {

    componentState: boolean = true;

    constructor(props: ISettingsProps) {
        super(props);
        this.state = {
            stickerCategories: null,
            stickerStatus: null,
            stickerPlatforms: null,
            categories: [],
            statuses: [],
            isChanged: false,
        }
    }

    componentDidMount(): void {
        const {configurations} = this.props;
        const newState: ISettingsState = {...this.state};
        axios.all([
            getStickersCategories(),
            getStickersStatuses()
        ]).then(axios.spread((category, status) => {

            if (!category.data.err) {
                const categories: any = category.data.result;
                if (categories.length > 0) {
                    newState.categories = categories.map(item => {
                        return {
                            label: item.name,
                            value: item.package_category_id
                        }
                    });
                }

            } else {
                this.componentState && showNotification("error", {
                    title: "You got an error!",
                    description: "Error when getting categories",
                    timer: 3000,
                    hideProgress: true
                });
            }
            if (!status.data.err) {
                const statuses: any = status.data.result;
                if (statuses.length > 0) {
                    newState.statuses = statuses.map(item => {
                        return {
                            label: item.name,
                            value: item.package_status_id
                        }
                    });
                }
            } else {
                this.componentState && showNotification("error", {
                    title: "You got an error!",
                    description: "Error when getting statuses",
                    timer: 3000,
                    hideProgress: true
                });
            }

            if (this.componentState) {
                this.setState(newState);
            }

        })).catch(error => console.log(error));

        newState.stickerPlatforms = configurations.platforms;
        newState.stickerCategories = configurations.categories;
        newState.stickerStatus = configurations.status;
        this.setState(newState);
    }

    componentDidUpdate(prevProps: ISettingsProps, prevState: ISettingsState): void {
        const {stickerStatus, stickerCategories, stickerPlatforms, isChanged} = this.state;
        const {configChange} = this.props;
        if (isChanged) {
            if (!isEqual(prevState.stickerStatus, stickerStatus)) {
                configChange("status", stickerStatus);
            }
            if (!isEqual(prevState.stickerCategories, stickerCategories)) {
                configChange("categories", stickerCategories);
            }
            if (!isEqual(prevState.stickerPlatforms, stickerPlatforms)) {
                configChange("platforms", stickerPlatforms);
            }
        }
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleCategoryChange = (value: ISelect, selection: any) => {
        const {packageId} = this.props;
        const newState: ISettingsState = {...this.state};
        let request: Promise<AxiosResponse> = null;

        if (selection.action === "select-option") {
            request = addCategories(packageId, {category_ids: [selection.option.value]});
        } else if (selection.action === "remove-value") {
            request = deleteCategory(packageId, selection.removedValue.value);
        }
        request.then(response => {
            if (!response.data.err) {
                newState.stickerCategories = value;
                newState.isChanged = true;
                if (this.componentState) {
                    this.setState(newState);
                }
            } else {
                this.componentState && showNotification("error", {
                    title: "You got an error!",
                    description: "Your changes is not saved for unknown reason",
                    timer: 3000,
                    hideProgress: true
                });
            }
        }).catch(error => console.log(error));
    };

    handlePlatformsChange = (value: ISelect, selection: any) => {
        const {packageId} = this.props;
        const newState: ISettingsState = {...this.state};
        let request: Promise<AxiosResponse> = null;

        if (selection.action === "select-option") {
            request = addPlatforms(packageId, {platform_ids: [selection.option.platform_id]});
        } else if (selection.action === "remove-value") {
            request = deletePlatform(packageId, selection.removedValue.platform_id);
        }

        request.then(response => {
            if (!response.data.err) {
                newState.stickerPlatforms = value;
                newState.isChanged = true;
                if (this.componentState) {
                    this.setState(newState);
                }
            } else {
                this.componentState && showNotification("error", {
                    title: "You got an error!",
                    description: "Your changes is not saved for unknown reason",
                    timer: 3000,
                    hideProgress: true
                });
            }
        }).catch(error => console.log(error));
    };

    handleStatusChange = (value: ISelect, option: any) => {
        const selection: any = value;
        const {packageId} = this.props;
        const newState: ISettingsState = {...this.state};

        if (option.action === "select-option") {
            addStatus(packageId, {status_id: selection.value}).then(response => {
                if (!response.data.err) {
                    newState.stickerStatus = value;
                    newState.isChanged = true;
                    if (this.componentState) {
                        this.setState(newState);
                    }
                } else {
                    this.componentState && showNotification("error", {
                        title: "You got an error!",
                        description: "Your changes is not saved for unknown reason",
                        timer: 3000,
                        hideProgress: true
                    });
                }
            }).catch(error => console.log(error));
        }
    };

    render(): JSX.Element {
        const {platforms} = this.props;
        const {categories, statuses, stickerPlatforms, stickerCategories, stickerStatus} = this.state;
        return (
            <div className="m-t-lg">
                <div className="row">
                    <div className="col-lg-offset-2 col-lg-8">
                        <form className="m-b-lg">
                            <FormGroup>
                                <ControlLabel bsClass="font-bold" htmlFor="category">Category</ControlLabel>
                                <Select
                                    isMulti={true}
                                    id="category"
                                    closeMenuOnSelect={false}
                                    isClearable={false}
                                    name="category"
                                    onChange={this.handleCategoryChange}
                                    value={stickerCategories}
                                    options={categories}
                                    placeholder="Choose category"
                                />
                            </FormGroup>

                            {/*Platforms*/}
                            <FormGroup>
                                <ControlLabel bsClass="font-bold" htmlFor="platforms">Platforms</ControlLabel>
                                <Select
                                    isMulti={true}
                                    id="platforms"
                                    closeMenuOnSelect={false}
                                    name="platforms"
                                    onChange={this.handlePlatformsChange}
                                    value={stickerPlatforms}
                                    options={platforms}
                                    placeholder="Choose platform"
                                />
                            </FormGroup>

                            {/*Status*/}
                            <FormGroup validationState={null}>
                                <ControlLabel bsClass="font-bold" htmlFor="status">Status</ControlLabel>
                                <Select
                                    isClearable={false}
                                    isMulti={false}
                                    id="status"
                                    closeMenuOnSelect={true}
                                    name="status"
                                    onChange={this.handleStatusChange}
                                    value={stickerStatus}
                                    options={statuses}
                                    placeholder="Choose status"
                                />
                            </FormGroup>
                        </form>
                    </div>
                </div>
                <ToastContainer/>
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
