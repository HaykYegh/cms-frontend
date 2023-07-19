"use strict";

import * as React from "react";
import Select from "react-select";
import * as moment from "moment";
import {AxiosResponse} from "axios";
import {connect} from "react-redux";
import Table from "react-bootstrap/es/Table";
import Modal from "react-bootstrap/es/Modal";
import {ToastContainer} from "react-toastify";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {
    getReleases,
    getRelease,
    getReleasesCount,
    getReleaseNote,
    createReleaseNote,
    updateReleaseVersion,
    createRelease,
    deleteRelease,
    publishUpdate
} from "ajaxRequests/appReleases";
import {selectMenuStyles, showNotification} from "helpers/PageHelper";
import MoreActions from "components/Common/MoreActions";
import Pagination from "components/Common/Pagination";
import {getCurrentOffset} from "helpers/DataHelper";
import Loading from "components/Common/Loading";
import Popup from "components/Common/Popup";
import {PAGE_NAME} from "configs/constants";
import selector, {IStoreProps} from "services/selector";

interface IAppReleasesState {
    isInitialLoading: boolean,
    offset: number,
    limit: number,
    appReleases: any,
    appReleasesCount: number,
    request: {
        isLoading: boolean,
        isPaging: boolean,
        isProcessing: boolean,
        isDisabled: boolean
    },
    popup: {
        selectedReleaseId: number,
        selectedPlatform: any,
        description: string,
        version: string,
        remove: {
            isShown: boolean,
            message: any
        },
        edit: {
            isShown: boolean,
            selectedLanguage: any,
            isLoading: boolean
        }
        create: {
            isShown: boolean,
        },
        update: {
            isShown: boolean,
        }
    }
}

interface IAppReleasesProps extends IStoreProps {
    userProfile?: any,
}

class AppReleases extends React.Component<IAppReleasesProps, IAppReleasesState> {

    isComponentMounted: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            isInitialLoading: true,
            offset: 0,
            limit: 15,
            appReleases: [],
            appReleasesCount: 0,
            request: {
                isLoading: false,
                isPaging: false,
                isProcessing: false,
                isDisabled: true
            },
            popup: {
                selectedPlatform: null,
                selectedReleaseId: null,
                description: "",
                version: "",
                remove: {
                    isShown: false,
                    message: {}
                },
                edit: {
                    isShown: false,
                    selectedLanguage: null,
                    isLoading: false
                },
                create: {
                    isShown: false,
                },
                update: {
                    isShown: false,
                }
            },
        };
    }

    componentDidMount(): void {
        document.title = PAGE_NAME["/settings/app-releases"];
        const newState: IAppReleasesState = {...this.state};
        this.initRequests(newState);
    }

    componentWillUnmount(): void {
        this.isComponentMounted = false;
    }

    initRequests: any = (state: IAppReleasesState, offset: number = 0, isPaging: boolean = false): void => {
        const {limit} = state;

        if (!isPaging) {
            getReleases(offset, limit).then(({data}: AxiosResponse) => {

                if (data.err) {
                    throw new Error(JSON.stringify(data));
                }

                state.appReleases = data.result || [];

                state.isInitialLoading = false;
                state.request.isLoading = false;
                state.request.isPaging = false;
                state.offset = offset;

                if (this.isComponentMounted) {
                    this.setState(state);
                }

            }).catch(e => {
                console.log(e);
                if (this.isComponentMounted) {
                    state.isInitialLoading = false;
                    state.request.isLoading = false;
                    state.request.isPaging = false;
                    showNotification("error", {
                        title: "You've got an error!",
                        description: "Cannot get app releases for unknown reason"
                    });
                }
            });

            getReleasesCount().then(({data}: AxiosResponse) => {
                if (data.err) {
                    throw new Error(JSON.stringify(data));
                }

                state.appReleasesCount = data.result;
                if (this.isComponentMounted) {
                    this.setState(state);
                }

            }).catch(err => {
                console.log(err);
                if (this.isComponentMounted) {
                    this.setState(state);
                    showNotification("error", {
                        title: "You've got an error!",
                        description: "Cannot get app releases count",
                        timer: 3000
                    });
                }
            });
        }
    };

    handleListChange = (e: React.MouseEvent<HTMLInputElement>): void => {
        const {offset} = this.state;
        const newState: IAppReleasesState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.isPaging = true;
        newState.request.isLoading = true;
        this.setState(newState);
        this.initRequests(newState, currentOffset);
    };

    handleRemoveModalOpen = (appReleaseId: number): void => {
        const newState: IAppReleasesState = {...this.state};
        newState.popup.remove.isShown = true;
        newState.popup.selectedReleaseId = appReleaseId;
        newState.popup.remove.message = {
            info: "Are you sure you want to remove this release?",
            apply: "Apply",
            cancel: "Cancel",
        };
        this.setState(newState);
    };

    handleEditReleaseNoteModalOpen = (appReleaseId: number): void => {
        const newState: IAppReleasesState = {...this.state};
        newState.popup.edit.isShown = true;
        newState.popup.selectedReleaseId = appReleaseId;
        this.setState(newState);
    };

    handleRemoveModalClose = (): void => {
        const newState: IAppReleasesState = {...this.state};
        newState.popup.remove.isShown = false;
        newState.popup.remove.message = {};
        newState.popup.selectedReleaseId = null;
        this.setState(newState);
    };

    handleCreateModalOpen = (): void => {
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
        const newState: IAppReleasesState = {...this.state};
        newState.popup.create.isShown = true;
        this.setState(newState);
    };

    handleCreateModalClose = (): void => {
        const newState: IAppReleasesState = {...this.state};
        newState.popup.create.isShown = false;
        newState.popup.selectedReleaseId = null;
        this.setState(newState);
    };

    handleUpdateVersionModalOpen = (appReleaseId: number): void => {
        const {appReleases} = this.state;
        const selectedAppRelease: any = appReleases.find(appRelease => appRelease.appReleaseId === appReleaseId);
        const newState: IAppReleasesState = {...this.state};
        const {platforms} = this.props;
        newState.popup.update.isShown = true;
        newState.popup.selectedReleaseId = appReleaseId;
        newState.popup.selectedPlatform = platforms.find(platform => platform.platform_id === selectedAppRelease.platformId);
        newState.popup.version = selectedAppRelease.version;
        this.setState(newState);
    };

    handleUpdateVersionModalClose = (): void => {
        const newState: IAppReleasesState = {...this.state};
        newState.popup.update.isShown = false;
        newState.request.isProcessing = false;
        newState.request.isDisabled = true;
        newState.popup.selectedReleaseId = null;
        newState.popup.selectedPlatform = null;
        newState.popup.version = "";
        this.setState(newState);
    };

    handleEditModalClose = (): void => {
        const newState: IAppReleasesState = {...this.state};
        newState.popup.edit.isShown = false;
        newState.popup.edit.selectedLanguage = null;
        newState.popup.edit.isLoading = false;
        newState.popup.description = "";
        newState.request.isProcessing = false;
        newState.popup.selectedReleaseId = null;
        this.setState(newState);
    };

    handlePlatformChange = (selection: any): void => {
        const newState: IAppReleasesState = {...this.state};
        if (selection) {
            newState.popup.selectedPlatform = selection;
            newState.request.isDisabled = false;
            this.setState(newState);
        }
    };

    handleLanguageChange = (selection: any): void => {
        const newState: IAppReleasesState = {...this.state};
        if (selection) {
            newState.popup.edit.selectedLanguage = selection;
            newState.popup.edit.isLoading = true;
            newState.popup.description = "";
            this.setState(newState);

            getReleaseNote(newState.popup.selectedReleaseId, selection.value).then(({data}: AxiosResponse) => {

                if (data.err) {
                    throw new Error(JSON.stringify(data));
                }

                if (!data.result.isEmpty) {
                    newState.popup.description = data.result.description || "";
                }
                newState.popup.edit.isLoading = false;

                if (this.isComponentMounted) {
                    this.setState(newState);
                }
            }).catch(err => {
                console.log(err);
                if (this.isComponentMounted) {
                    newState.popup.edit.isLoading = false;
                    this.setState(newState);
                    showNotification("error", {
                        title: "You've got an error!",
                        description: "Cannot get release note",
                        timer: 3000,
                        hideProgress: true
                    });
                }

            });
        }
    };

    handleChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IAppReleasesState = {...this.state};
        newState.request.isDisabled = false;
        newState.popup[name] = value;
        this.setState(newState);
    };

    handleCreateRelease = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {offset} = this.state;
        const newState: IAppReleasesState = {...this.state};
        const platformId: number = newState.popup.selectedPlatform.platform_id;
        const version: string = newState.popup.version;
        newState.request.isProcessing = true;
        newState.request.isLoading = true;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        createRelease(platformId, version).then(({data}: AxiosResponse) => {

            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            showNotification("success", {
                title: "Success!",
                description: "Release successfully created",
                id: toastId
            });

            newState.request.isProcessing = false;
            newState.popup.create.isShown = false;
            newState.popup.selectedPlatform = null;
            newState.popup.version = "";
            this.initRequests(newState, offset);
            if (this.isComponentMounted) {
                this.setState(newState);
            }
        }).catch(err => {
            console.log(err);
            if (this.isComponentMounted) {
                newState.request.isLoading = false;
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot create release",
                    timer: 3000,
                    hideProgress: true
                });
            }

        });

    };

    handleRemoveRelease = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {offset, popup: {selectedReleaseId}} = this.state;
        const newState: IAppReleasesState = {...this.state};
        const toastId: number = showNotification("info", {
            title: "Deleting...",
            description: "",
        });

        newState.popup.remove.isShown = false;
        newState.request.isLoading = true;
        this.setState(newState);
        deleteRelease(selectedReleaseId).then(({data}: AxiosResponse) => {

            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            showNotification("success", {
                title: "Success!",
                description: "Release is deleted",
                id: toastId
            });
            this.initRequests(newState, offset);

            newState.popup.selectedReleaseId = null;
            if (this.isComponentMounted) {
                this.setState(newState);
            }
        }).catch(err => {
            console.log(err);
            if (this.isComponentMounted) {
                newState.request.isLoading = false;
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Release is not deleted",
                    timer: 3000,
                    hideProgress: true,
                    id: toastId
                });
            }

        });
    };

    handleUpdateReleaseVersion = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {offset} = this.state;
        const newState: IAppReleasesState = {...this.state};
        const platformId: number = newState.popup.selectedPlatform.platform_id;
        const version: string = newState.popup.version;
        const appReleaseId: number = newState.popup.selectedReleaseId;
        newState.request.isProcessing = true;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        updateReleaseVersion(platformId, version, appReleaseId).then(({data}: AxiosResponse) => {

            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            showNotification("success", {
                title: "Success!",
                description: "Release successfully updated",
                id: toastId
            });

            this.handleUpdateVersionModalClose();
            this.initRequests(newState, offset);

        }).catch(err => {
            console.log(err);
            if (this.isComponentMounted) {
                newState.request.isProcessing = false;
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot update release",
                    timer: 3000,
                    hideProgress: true
                });
            }

        });

    };

    handleUpdateReleaseNote = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {popup: {edit: {selectedLanguage}, description, selectedReleaseId}} = this.state;
        const newState: IAppReleasesState = {...this.state};
        newState.request.isProcessing = true;
        this.setState(newState);

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        createReleaseNote(selectedReleaseId, selectedLanguage.value, description).then(({data}: AxiosResponse) => {

            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            showNotification("success", {
                title: "Success!",
                description: "Release Note successfully updated",
                id: toastId
            });

            this.handleEditModalClose();
        }).catch(err => {
            console.log(err);
            if (this.isComponentMounted) {
                newState.request.isProcessing = false;
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot create release",
                    timer: 3000,
                    hideProgress: true,
                    id: toastId
                });
            }

        });

    };

    handlePublish = (appReleaseId: string) => {
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        publishUpdate(appReleaseId).then(({data}: AxiosResponse) => {

            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            showNotification("success", {
                title: "Success!",
                description: "Update successfully published",
                id: toastId
            });

            this.handleEditModalClose();
        }).catch(err => {
            console.log(err);
            if (this.isComponentMounted) {
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot publish update",
                    timer: 3000,
                    hideProgress: true,
                    id: toastId
                });
            }

        });
    };

    render(): JSX.Element {
        const {
            isInitialLoading, appReleases, appReleasesCount, limit, offset,
            request: {isLoading, isPaging, isProcessing, isDisabled}, popup: {remove, create, update, edit, selectedPlatform, version, description}
        } = this.state;
        const {platforms, languages, userProfile} = this.props;

        const availableLanguages: any = languages.filter(language => language.code === "en" || language.code === "ru");

        return (
            <div>
                <div className="content-wrapper">
                    <ToastContainer/>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl">App Releases</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <div className="text-right">
                                    <button
                                        className="btn btn-default btn-addon"
                                        onClick={this.handleCreateModalOpen}
                                    ><i className="fa fa-plus"/> Add Release
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {isInitialLoading ? <Loading/> :
                    <div className={`${isLoading ? "inactive" : ""}`}>
                        <Table
                            hover={true}
                            condensed={true}
                            responsive={true}
                        >
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Version</th>
                                <th>Platform</th>
                                <th>Created At</th>
                                {!userProfile.readonly && <th/>}
                            </tr>
                            </thead>
                            <tbody>
                            {
                                appReleases && appReleases.length === 0 &&
                                <tr>
                                    <td colSpan={5}>No result</td>
                                </tr>
                            }

                            {appReleases && appReleases.map((appRelease, index) => {
                                    const N: number = offset * limit + index + 1;
                                    const platform: any = platforms.find(platform => platform.platform_id === appRelease.platformId);
                                    const editReleaseNote: any = () => this.handleEditReleaseNoteModalOpen(appRelease.appReleaseId);
                                    const updateReleaseVersion: any = () => this.handleUpdateVersionModalOpen(appRelease.appReleaseId);
                                    const removeRelease: any = () => this.handleRemoveModalOpen(appRelease.appReleaseId);
                                    const publish: any = () => this.handlePublish(appRelease.appReleaseId);

                                    return (
                                        <tr key={N}>
                                            <td>{N}</td>
                                            <td>{appRelease.version}</td>
                                            <td>{platform && platform.label}</td>
                                            <td>{moment(appRelease.createdAt).format("DD MMM YYYY hh:mm A")}</td>
                                            {!userProfile.readonly && <td>
                                                <MoreActions
                                                    isDropup={(index === appReleases.length - 1 || index === appReleases.length - 2) && appReleases.length > 3}
                                                    isAbsolute={true}
                                                >
                                                    <li>
                                                        <a href="javascript:void(0);" onClick={editReleaseNote}>
                                                            Edit Release Note
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0);" onClick={updateReleaseVersion}>
                                                            Update Release Version
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0);" onClick={removeRelease}>
                                                            Remove Release
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0);" onClick={publish}>
                                                            Publish
                                                        </a>
                                                    </li>
                                                </MoreActions>
                                            </td>}
                                        </tr>
                                    )
                                }
                            )}
                            </tbody>
                        </Table>
                    </div>
                }

                <div className="content-wrapper">
                    <div className="container-fluid">
                        {
                            !isInitialLoading && appReleasesCount && appReleasesCount > limit &&
                            <div className="row">
                                <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6 ">
                                    <span className="text-xs">{`${appReleasesCount} entries`}</span>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                    <Pagination
                                        offset={offset}
                                        limit={limit}
                                        length={appReleases.length}
                                        count={appReleasesCount}
                                        disabled={isPaging}
                                        callback={this.handleListChange}
                                    />
                                </div>
                            </div>
                        }
                    </div>
                </div>

                {/*Remove Release*/}

                <Popup
                    show={remove.isShown}
                    message={remove.message}
                    hideModal={this.handleRemoveModalClose}
                    confirmAction={this.handleRemoveRelease}
                />

                {/*Create Release*/}

                <Modal show={create.isShown} onHide={this.handleCreateModalClose}>
                    <Modal.Header closeButton={true}>
                        <span className="text-xlg">Create New Release</span>
                    </Modal.Header>
                    <Modal.Body>
                        {isLoading ? <Loading/> :
                            <form>
                                {/*Platform*/}
                                <FormGroup>
                                    <ControlLabel htmlFor="platform">Choose platform</ControlLabel>
                                    <Select
                                        isMulti={false}
                                        id="platform"
                                        placeholder="Choose platform"
                                        styles={selectMenuStyles}
                                        value={selectedPlatform}
                                        options={platforms}
                                        closeMenuOnSelect={true}
                                        onChange={this.handlePlatformChange}
                                    />
                                </FormGroup>

                                {/*Version*/}
                                {
                                    <FormGroup>
                                        <ControlLabel htmlFor="version">Version</ControlLabel>
                                        <FormControl
                                            name="version"
                                            type="text"
                                            placeholder="Enter version"
                                            value={version}
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                }
                            </form>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="text-right">
                            <button
                                className="btn btn-info m-r-xs"
                                disabled={!selectedPlatform || !version || isDisabled}
                                onClick={this.handleCreateRelease}
                            >Create{isProcessing && <i className="fa fa-refresh fa-spin m-l-xs"/>}
                            </button>
                            <button
                                className="btn btn-default text-info"
                                onClick={this.handleCreateModalClose}
                            >Cancel
                            </button>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/*Update Release Version*/}

                <Modal show={update.isShown} onHide={this.handleUpdateVersionModalClose}>
                    <Modal.Header closeButton={true}>
                        <span className="text-xlg">Update Release Version</span>
                    </Modal.Header>
                    <Modal.Body>
                        <form>
                            {/*Platform*/}
                            <FormGroup>
                                <ControlLabel htmlFor="platform">Choose platform</ControlLabel>
                                <Select
                                    isMulti={false}
                                    id="platform"
                                    placeholder="Choose platform"
                                    styles={selectMenuStyles}
                                    value={selectedPlatform}
                                    options={platforms}
                                    closeMenuOnSelect={true}
                                    onChange={this.handlePlatformChange}
                                />
                            </FormGroup>

                            {/*Version*/}
                            {
                                <FormGroup>
                                    <ControlLabel htmlFor="version">Version</ControlLabel>
                                    <FormControl
                                        name="version"
                                        type="text"
                                        placeholder="Enter version"
                                        value={version}
                                        onChange={this.handleChange}
                                    />
                                </FormGroup>
                            }
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="text-right flex-end">
                            <button
                                className="btn btn-info m-r-xs"
                                disabled={!selectedPlatform || !version || isDisabled}
                                onClick={this.handleUpdateReleaseVersion}
                            >Update{isProcessing && <i className="fa fa-refresh fa-spin m-l-xs"/>}
                            </button>
                            <button
                                className="btn btn-default text-info"
                                onClick={this.handleUpdateVersionModalClose}
                            >Cancel
                            </button>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/*Edit Release Note*/}

                <Modal show={edit.isShown} onHide={this.handleEditModalClose}>
                    <Modal.Header closeButton={true}>
                        <span className="text-xlg">Update Release</span>
                    </Modal.Header>
                    <Modal.Body>
                        <div>
                            <form>
                                {/*Language*/}
                                <FormGroup>
                                    <ControlLabel htmlFor="language">Choose language</ControlLabel>
                                    <Select
                                        isMulti={false}
                                        placeholder="Choose language"
                                        styles={selectMenuStyles}
                                        value={edit.selectedLanguage}
                                        options={availableLanguages}
                                        closeMenuOnSelect={true}
                                        onChange={this.handleLanguageChange}
                                    />
                                </FormGroup>

                                {edit.isLoading && <Loading/>}

                                {/*Description*/}
                                {!edit.isLoading && edit.selectedLanguage &&
                                <FormGroup>
                                    <ControlLabel htmlFor="description">Description</ControlLabel>
                                    <FormControl
                                        rows={7}
                                        name="description"
                                        placeholder="Enter description"
                                        value={description}
                                        onChange={this.handleChange}
                                        componentClass="textarea"
                                    />
                                </FormGroup>
                                }
                            </form>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="text-right flex-end">
                            <button
                                className="btn btn-info m-r-xs"
                                disabled={!edit.selectedLanguage || !description || isDisabled}
                                onClick={this.handleUpdateReleaseNote}
                            >Update{isProcessing && <i className="fa fa-refresh fa-spin m-l-xs"/>}
                            </button>
                            <button
                                className="btn btn-default text-info"
                                onClick={this.handleEditModalClose}
                            >Cancel
                            </button>
                        </div>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AppReleases);
