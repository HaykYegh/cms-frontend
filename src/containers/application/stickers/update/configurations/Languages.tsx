"use strict";

import * as React from "react";
import {isEqual} from "lodash";
import Select from "react-select";
import {connect} from "react-redux";
import {ToastContainer} from "react-toastify";
import {Form, FormGroup, ControlLabel, FormControl, HelpBlock} from "react-bootstrap";

import {addLanguage, deleteLanguage, getLanguages, updateLanguage} from "ajaxRequests/sticker";
import {IStoreProps, default as selector} from "services/selector";
import {ISelect, IVALIDATION} from "services/interface";
import {showNotification} from "helpers/PageHelper";
import Table from "react-bootstrap/es/Table";

interface ILanguagesState {
    languages: any,
    validation: {
        language: {
            id: IVALIDATION,
            title: IVALIDATION,
            introduction: IVALIDATION,
            description: IVALIDATION,
            tags: IVALIDATION,
        },
    },
    stickerLanguages: any[],
    isLanguageEditable: boolean,
    _language: any,
    isChanged: boolean
}

interface ILanguagesProps extends IStoreProps {
    configChange: (name: string, data: any) => void,
    configurations: any,
    packageId: number,
}

class Languages extends React.Component<ILanguagesProps, ILanguagesState> {

    componentState: boolean = true;

    constructor(props: ILanguagesProps) {
        super(props);
        this.state = {
            languages: [],
            stickerLanguages: [],
            isLanguageEditable: false,
            validation: {
                language: {
                    id: {
                        value: null,
                        message: "",
                    },
                    title: {
                        value: null,
                        message: "",
                    },
                    introduction: {
                        value: null,
                        message: "",
                    },
                    description: {
                        value: null,
                        message: "",
                    },
                    tags: {
                        value: null,
                        message: "",
                    }
                },
            },
            _language: {
                list: "",
                language_id: "",
                title: "",
                introduction: "",
                description: "",
                tags: "",
            },
            isChanged: false,
        }
    }

    componentDidMount(): void {
        const {languages, packageId} = this.props;
        const newState: ILanguagesState = {...this.state};

        getLanguages(packageId).then(response => {
                if (!response.data.err) {
                    if (response.data.result.length > 0) {
                        newState.stickerLanguages = response.data.result.map(item => {
                            return {
                                list: {
                                    label: item.language,
                                    value: item.language_id,
                                    code: item.code
                                },
                                language_id: item.language_id,
                                title: item.title,
                                introduction: item.introduction,
                                description: item.description,
                                tags: item.tags,
                            }
                        });
                        newState.isChanged = true;
                    }
                } else {
                    this.componentState && showNotification("error", {
                        title: "You got an error!",
                        description: "Error when getting languages",
                        timer: 3000,
                        hideProgress: true
                    });
                }
                newState.languages = languages;
                if (this.componentState) {
                    this.setState(newState);
                }
            }
        ).catch(error => console.log(error));
    }

    componentDidUpdate(prevProps: ILanguagesProps, prevState: ILanguagesState): void {
        const {stickerLanguages, isChanged} = this.state;
        if (isChanged && !isEqual(prevState.stickerLanguages, stickerLanguages)) {
            const {configChange} = this.props;
            configChange("languages", stickerLanguages);
        }
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleLanguageChange = (selection: ISelect): void => {
        const newState: ILanguagesState = {...this.state};
        newState._language.list = selection;
        newState._language.language_id = selection.value;
        newState.validation.language.id.value = selection ? "success" : "error";
        newState.validation.language.id.message = selection ? "" : "This field is required";
        this.setState(newState);
    };

    handleLanguageDetailsChange = ({currentTarget: {value, name}}: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {_language} = this.state;
        if (_language[name] !== value) {
            const newState: ILanguagesState = {...this.state};
            newState.validation.language[name].value = value === "" ? "error" : "success";
            newState.validation.language[name].error = value === "" ? "This field is required" : "";
            newState._language[name] = value;
            this.setState(newState);
        }
    };

    handleAddLanguage = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        const {_language, stickerLanguages, isLanguageEditable} = this.state;
        const {packageId} = this.props;
        const newState: ILanguagesState = {...this.state};
        const stickerLanguage: any = {
            list: _language.list,
            language_id: _language.list.value,
            title: _language.title,
            introduction: _language.introduction,
            description: _language.description,
            tags: _language.tags,
        };

        const isDuplicate: boolean = stickerLanguages.some(language => {
            return language.language_id.toString() === stickerLanguage.language_id.toString();
        });

        if (isLanguageEditable || isDuplicate) {
            updateLanguage(packageId, stickerLanguage.language_id, stickerLanguage).then(response => {
                if (!response.data.err) {
                    newState.stickerLanguages = stickerLanguages.map(item => {
                        if (item.language_id === stickerLanguage.language_id) {
                            item = stickerLanguage;
                        }
                        return item;
                    });

                    for (const item in newState._language) {
                        if (newState._language.hasOwnProperty(item)) {
                            newState._language[item] = "";
                        }
                    }

                    for (const item in newState.validation.language) {
                        if (newState.validation.language.hasOwnProperty(item)) {
                            newState.validation.language[item].value = null;
                            newState.validation.language[item].error = "";
                        }
                    }

                    newState.isLanguageEditable = false;
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
        } else {
            addLanguage(packageId, stickerLanguage.language_id, stickerLanguage).then(response => {
                if (!response.data.err) {
                    newState.stickerLanguages = stickerLanguages.slice();
                    newState.stickerLanguages.push(stickerLanguage);

                    for (const item in newState._language) {
                        if (newState._language.hasOwnProperty(item)) {
                            newState._language[item] = "";
                        }
                    }

                    for (const item in newState.validation.language) {
                        if (newState.validation.language.hasOwnProperty(item)) {
                            newState.validation.language[item].value = null;
                            newState.validation.language[item].error = "";
                        }
                    }
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

    handleDeleteLanguage = (event: React.MouseEvent<HTMLTableDataCellElement>): void => {
        event.preventDefault();
        const {stickerLanguages} = this.state;
        const {packageId} = this.props;
        const newState: ILanguagesState = {...this.state};
        const languageId: number = parseInt(event.currentTarget.id);
        const languageForDelete: any = stickerLanguages.find(item => item.language_id === languageId);

        deleteLanguage(packageId, languageForDelete.language_id).then(response => {
            if (!response.data.err) {
                newState.stickerLanguages = stickerLanguages.filter(item => item.language_id !== languageId);
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

    handleUpdateLanguage = (event: React.MouseEvent<HTMLTableDataCellElement>): void => {
        event.preventDefault();
        const {stickerLanguages} = this.state;
        const newState: ILanguagesState = {...this.state};
        const languageId: number = parseInt(event.currentTarget.id);

        newState._language = {...stickerLanguages.find(item => item.language_id === languageId)};
        newState.isLanguageEditable = true;
        for (const item in newState.validation.language) {
            if (newState.validation.language.hasOwnProperty(item)) {
                newState.validation.language[item].value = null;
                newState.validation.language[item].error = "";
            }
        }
        if (this.componentState) {
            this.setState(newState);
        }
    };

    render(): JSX.Element {
        const {stickerLanguages, _language, validation, isLanguageEditable, languages} = this.state;
        const buttonState: boolean = Object.keys(_language).some(item => _language[item] === "");
        return (
            <div className="m-t-lg">
                <div className="row">
                    <div className="col-lg-offset-2 col-lg-8">
                        <form className="m-b-lg">
                            <FormGroup validationState={validation.language.id.value}>
                                <Select
                                    isDisabled={false}
                                    name="languages"
                                    onChange={this.handleLanguageChange}
                                    value={_language.list}
                                    options={languages}
                                    placeholder="Choose Language"
                                />
                            </FormGroup>
                            <FormGroup validationState={validation.language.title.value}>
                                <FormControl
                                    type="text"
                                    name="title"
                                    onChange={this.handleLanguageDetailsChange}
                                    value={_language.title}
                                    placeholder="Name"
                                />
                                <HelpBlock>{validation.language.title.message}</HelpBlock>
                            </FormGroup>
                            <FormGroup validationState={validation.language.introduction.value}>
                                <FormControl
                                    type="text"
                                    name="introduction"
                                    onChange={this.handleLanguageDetailsChange}
                                    value={_language.introduction}
                                    placeholder="Introduction"
                                />
                                <HelpBlock>{validation.language.introduction.message}</HelpBlock>
                            </FormGroup>
                            <FormGroup validationState={validation.language.tags.value}>
                                <FormControl
                                    type="text"
                                    name="tags"
                                    onChange={this.handleLanguageDetailsChange}
                                    value={_language.tags}
                                    placeholder="Tags"
                                />
                                <HelpBlock>{validation.language.tags.message}</HelpBlock>
                            </FormGroup>
                            <FormGroup validationState={validation.language.description.value}>
                                <FormControl
                                    rows={5}
                                    name="description"
                                    componentClass="textarea"
                                    placeholder="Description"
                                    value={_language.description}
                                    onChange={this.handleLanguageDetailsChange}
                                    className="resize-v"
                                />
                                <HelpBlock>{validation.language.description.message}</HelpBlock>
                            </FormGroup>
                            <div className="form-group m-b-none">
                                <button
                                    disabled={buttonState}
                                    className="btn btn-default btn-addon"
                                    onClick={this.handleAddLanguage}
                                >
                                    <i className={`fa ${isLanguageEditable ? "fa-floppy-o" : "fa-flag"}`}/>
                                    {
                                        isLanguageEditable ? "Save Language" : "Add Language"
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="col-lg-offset-2 col-lg-8">
                        {
                            stickerLanguages.length > 0 &&
                            <Table
                                hover={true}
                                condensed={true}
                                responsive={true}
                            >
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Language</th>
                                    <th>Title</th>
                                    <th>Intro</th>
                                    <th>Description</th>
                                    <th>Tags</th>
                                    <th/>
                                </tr>
                                </thead>
                                <tbody>

                                {
                                    stickerLanguages.map((item, i) => {
                                        return (
                                            <tr key={item.language_id}>
                                                <td>{i + 1}</td>
                                                <td>{item.list.label}</td>
                                                <td>{item.title}</td>
                                                <td>{item.introduction}</td>
                                                <td>{item.description}</td>
                                                <td>{item.tags}</td>
                                                <td>
                                                    {
                                                        !isLanguageEditable &&
                                                        <span>
                                                                <i
                                                                    className="fa fa-pencil text-info wrapper-xs cursor-pointer"
                                                                    onClick={this.handleUpdateLanguage}
                                                                    id={item.language_id}
                                                                />
                                                                <i
                                                                    className="fa fa-times text-danger wrapper-xs cursor-pointer"
                                                                    onClick={this.handleDeleteLanguage}
                                                                    id={item.language_id}
                                                                />
                                                            </span>
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    })
                                }

                                </tbody>
                            </Table>
                        }

                    </div>
                </div>
                <ToastContainer/>
            </div>

        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Languages);
