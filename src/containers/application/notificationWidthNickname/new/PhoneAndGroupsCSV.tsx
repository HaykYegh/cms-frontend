"use strict";

import * as React from "react";
import {Creatable} from "react-select";
import Modal from "react-bootstrap/es/Modal";
import FormGroup from "react-bootstrap/es/FormGroup";
import HelpBlock from "react-bootstrap/es/HelpBlock";
import FormControl from "react-bootstrap/es/FormControl";
import {AxiosResponse} from "axios";
import Table from "react-bootstrap/es/Table";
import ControlLabel from "react-bootstrap/es/ControlLabel";

import {validateNumber, isNumeric, createOption, testableNumbersValidate} from "helpers/DataHelper";
import {notificationSendUsers} from "ajaxRequests/notification";
import {ISelect, IVALIDATION} from "services/interface";
import {multiSelectMenuStyles, showNotification} from "helpers/PageHelper";

interface IPhoneAndGroupsState {
    phone: {
        fromNumbers: any,
    },
    notification: {
        message: string,
        title: string,
    },
    request: {
        inProgress: boolean,
    },
    validation: {
        fromNumbers: IVALIDATION,
    },
    finallyResult: any[],
    popup: {
        show: boolean
    },
    inputTypeFile: any,
    start: number,
    end: number,
    isNotPaginationLeft: boolean,
    isNotPaginationRight: boolean,
}

class PhoneAndGroups extends React.Component<{}, IPhoneAndGroupsState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            phone: {
                fromNumbers: {
                    inputValue: "",
                    value: [],
                    isAfterPaste: false,
                    inValidNumbers: [],
                },
            },
            notification: {
                message: "",
                title: "",
            },
            request: {
                inProgress: false,
            },
            validation: {
                fromNumbers: {
                    value: null,
                    message: "",
                }
            },
            finallyResult: [],
            popup: {
                show: false
            },
            inputTypeFile: {
                isNotCSV: true,
                isFileChosen: false,
                isInvalidNumbersShown: false,
                inputFileName: "",
                isDragged: false,
            },
            start: 0,
            end: 10,
            isNotPaginationLeft: true,
            isNotPaginationRight: false,
        }
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleFromNumberInputChange = (inputValue: string): any => {

        const newState: any = {...this.state};
        const {phone: {fromNumbers: {value, isAfterPaste}}} = this.state;
        let valueForValidate: string = inputValue;

        if (isAfterPaste) {
            newState.phone.fromNumbers.isAfterPaste = false;
            this.setState(newState);
            return;
        }
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
        } else if (value.some(item => item.value === valueForValidate)) {
            newState.validation.fromNumbers.value = "warning";
            newState.validation.fromNumbers.message = "Phone number is existing";
        } else {
            newState.validation.fromNumbers.value = "success";
            newState.validation.fromNumbers.message = "Valid number";
        }
        newState.phone.fromNumbers.inputValue = valueForValidate;
        this.setState(newState);
    };

    handleFromNumbersChange = (value: Array<ISelect>) => {
        const newState: any = {...this.state};
        newState.phone.fromNumbers.value = value ? value : [];
        this.setState(newState);
    };

    handleFromNumberKeyDown = (event: React.KeyboardEvent<HTMLElement>): any => {
        const {phone: {fromNumbers: {inputValue, value}}, validation} = this.state;
        if (!inputValue) {
            return;
        }
        if (validation.fromNumbers.value === "success") {
            const newState: IPhoneAndGroupsState = {...this.state};
            switch (event.key) {
                case "Enter":
                case "Tab":
                    newState.phone.fromNumbers.inputValue = "";
                    newState.phone.fromNumbers.value = [...value, createOption(inputValue)];
                    newState.validation.fromNumbers.value = null;
                    newState.validation.fromNumbers.message = "";
                    this.setState(newState);
                    event.preventDefault();
            }
        }
    };

    handleFromNumberOnBlur = (event: React.FocusEvent<HTMLElement>): any => {
        event.preventDefault();
        const {validation} = this.state;
        const newState: IPhoneAndGroupsState = {...this.state};
        if (validation.fromNumbers.value === "success") {
            const {phone: {fromNumbers: {inputValue, value}}} = this.state;
            newState.phone.fromNumbers.inputValue = "";
            newState.phone.fromNumbers.value = [...value, createOption(inputValue)];
        }
        newState.validation.fromNumbers.value = null;
        newState.validation.fromNumbers.message = "";
        this.setState(newState);
    };

    handleFromNumbersPaste = (event: React.ClipboardEvent<any>) => {
        const newState: any = {...this.state};
        const valuesForValidate: string[] = event.clipboardData.getData("text").split(", ");
        for (let item of valuesForValidate) {
            if (isNumeric(item) && item.substr(0, 1) !== "+") {
                item = "+" + item.toString();
            }
            const {isValid} = validateNumber(item);
            if (isValid) {
                newState.phone.fromNumbers.inputValue = "";
                newState.phone.fromNumbers.value = [...newState.phone.fromNumbers.value, createOption(item)];
                newState.validation.fromNumbers.value = null;
                newState.validation.fromNumbers.message = "";
            } else {
                newState.phone.fromNumbers.inValidNumbers = [...newState.phone.fromNumbers.inValidNumbers, item];
                newState.phone.fromNumbers.textareaValue = newState.phone.fromNumbers.inValidNumbers.join()
            }
            newState.phone.fromNumbers.isAfterPaste = true;
        }
        this.setState(newState);
    };

    handleInvalidNumbersDelete = () => {
        const newState: IPhoneAndGroupsState = {...this.state};
        newState.phone.fromNumbers.inValidNumbers = [];
        newState.inputTypeFile.isFileChosen = false;
        newState.inputTypeFile.isDragged = false;
        this.setState(newState);
    };

    handleFileReaderOnLoad = (newState: IPhoneAndGroupsState, csvFileReader: any) => {
        newState.inputTypeFile.isFileChosen = true;
        const csvToStringArray: string[] = csvFileReader.result.split("\"");
        for (let item of csvToStringArray) {
            if (isNumeric(item) && item.substr(0, 1) !== "+") {
                item = "+" + item.toString();
            }
            const {isValid} = validateNumber(item);
            if (isValid) {
                if (csvToStringArray.length > 60) {
                    newState.phone.fromNumbers.value = [...newState.phone.fromNumbers.value, item];
                    newState.inputTypeFile.isNotCSV = false;
                } else {
                    newState.phone.fromNumbers.inputValue = "";
                    newState.phone.fromNumbers.value = [...newState.phone.fromNumbers.value, createOption(item)];
                    newState.validation.fromNumbers.value = null;
                    newState.validation.fromNumbers.message = "";
                }
            } else {
                if (item.length > 1) {
                    newState.phone.fromNumbers.inValidNumbers = [...newState.phone.fromNumbers.inValidNumbers, item];
                }
                if (csvToStringArray.length <= 60 && item.length > 1) {
                    newState.phone.fromNumbers.textareaValue = newState.phone.fromNumbers.inValidNumbers.join();
                }
            }
            newState.phone.fromNumbers.isAfterPaste = true;
        }
        this.setState(newState);
    };

    handleFromFileChoose = (event: React.FormEvent<HTMLInputElement>) => {
        const newState: IPhoneAndGroupsState = {...this.state};
        const csvFileReader: any = new FileReader();
        newState.inputTypeFile.inputFileName = event.currentTarget.value.slice(12, event.currentTarget.value.length);
        csvFileReader.onload = () => {
            this.handleFileReaderOnLoad(newState, csvFileReader)
        };
        csvFileReader.readAsText(event.currentTarget.files[0]);
    };

    handleFromInvalidNumbers = () => {
        const newState: IPhoneAndGroupsState = {...this.state};
        newState.inputTypeFile.isInvalidNumbersShown = true;
        this.setState(newState);
    };

    handleFromFileChooseMessageDelete = (): void => {
        const newState: IPhoneAndGroupsState = {...this.state};
        newState.phone.fromNumbers.inValidNumbers = [];
        newState.phone.fromNumbers.value = [];
        newState.inputTypeFile.isFileChosen = false;
        newState.inputTypeFile.isNotCSV = true;
        newState.inputTypeFile.isInvalidNumbersShown = false;
        newState.inputTypeFile.isDragged = false;
        this.setState(newState);
    };

    handleMessageChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IPhoneAndGroupsState = {...this.state};
        newState.notification.message = value;
        this.setState(newState);
    };

    handleNotify = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        const newState: IPhoneAndGroupsState = this.state;
        const {notification: {message}, phone: {fromNumbers}, validation} = this.state;

        newState.request.inProgress = true;
        this.setState(newState);

        const numbers: string[] = fromNumbers.value.map(item => item.value.replace("+", ""));

        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        notificationSendUsers({message, numbers}).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }

            if (data.result.affectedUsers && data.result.affectedUsers.length > 0) {
                const affectedUsers: string[] = data.result.affectedUsers.map(item => item.username.replace(process.env.APP_PREFIX, "+"));
                newState.popup.show = true;
                for (const item of fromNumbers.value) {
                    item.isNotify = affectedUsers.includes(item.value);
                    newState.finallyResult.push(item)
                }
            }
            newState.phone.fromNumbers = {
                inputValue: "",
                value: []
            };
            newState.notification = {
                message: "",
                title: "",
            };
            for (const item in validation) {
                if (validation.hasOwnProperty(item)) {
                    newState.validation[item] = {
                        value: null,
                        message: "",
                    };
                }
            }
            newState.request.inProgress = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Your notification has been sent successfully",
                    description: "Note that if you have specified some users who don’t belong to your network, the notification hasn’t been sent to those users.",
                    id: toastId
                });
            }
        }).catch(err => {
            console.log(err);
            newState.request.inProgress = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "Your notification will not be sent",
                    description: "The specified users don’t belong to your network. You can send notifications only to the users who joined your network.",
                    id: toastId
                });
            }
        });
    };

    handleInvalidNumbersModalClose = () => {
        const newState: IPhoneAndGroupsState = this.state;
        newState.inputTypeFile.isInvalidNumbersShown = false;
        this.setState(newState);
    };

    handleModalClose = (): void => {
        const newState: IPhoneAndGroupsState = this.state;
        newState.finallyResult = [];
        newState.popup.show = false;
        this.setState(newState);
    };

    handleFromFileDrag = (event: React.DragEvent<HTMLElement>) => {
        if (event.dataTransfer.items[0].type === "text/csv") {
            const {inputTypeFile: {isDragged}} = this.state;
            if (!isDragged) {
                const newState: IPhoneAndGroupsState = this.state;
                newState.inputTypeFile.isDragged = true;
                this.setState(newState);
            }
            event.stopPropagation();
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
        }
    };

    handleFromDragLeave = () => {
        const newState: IPhoneAndGroupsState = this.state;
        newState.inputTypeFile.isDragged = false;
        this.setState(newState);
    };

    handleFromFileDrop = (event: any) => {
        const newState: IPhoneAndGroupsState = this.state;
        event.stopPropagation();
        event.preventDefault();
        const files: any = event.dataTransfer.files;
        const csvFileReader: any = new FileReader();
        csvFileReader.onload = () => {
            this.handleFileReaderOnLoad(newState, csvFileReader)
        };
        csvFileReader.readAsText(files[0]);
    };

    handleFromRightClick = (): void => {
        const newState: IPhoneAndGroupsState = this.state;
        const {phone: {fromNumbers: {inValidNumbers}}} = this.state;
        if (newState.isNotPaginationLeft) {
            newState.isNotPaginationLeft = false;
        }
        if (newState.end + 10 >= inValidNumbers.length) {
            newState.isNotPaginationRight = true;
        }
        newState.start += 10;
        newState.end += 10;
        this.setState(newState);
    };

    handleFromLeftClick = (): void => {
        const newState: IPhoneAndGroupsState = this.state;
        const {phone: {fromNumbers: {inValidNumbers}}} = this.state;
        if (newState.start - 10 === 0) {
            newState.isNotPaginationLeft = true;
        }
        if (newState.end >= inValidNumbers.length) {
            newState.isNotPaginationRight = false;
        }
        newState.start -= 10;
        newState.end -= 10;
        this.setState(newState);
    }

    handleFromCSVFileDownload = () => {
        const {phone: {fromNumbers: {inValidNumbers}}} = this.state;
        let csvContent: string = "data:text/csv;charset=utf-8,";
        for (const item of inValidNumbers) {
            csvContent += item + "\r\n";
        }
        const encodedUri: any = encodeURI(csvContent);
        window.open(encodedUri);
    }

    render(): JSX.Element {
        const {
            phone: {fromNumbers}, notification: {message}, inputTypeFile, start, end, isNotPaginationLeft, isNotPaginationRight,
            request: {inProgress}, validation, finallyResult, popup
        } = this.state;
        const isReady: boolean = (message === "" || (inputTypeFile.isNotCSV && fromNumbers.value.length === 0));

        return (
            <div className="container-fluid no-padder">
                <div className="row">
                    {
                        fromNumbers.value.length + fromNumbers.inValidNumbers.length <= 60 ?
                            <div
                                className="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                                onPaste={this.handleFromNumbersPaste}
                            >
                                <FormGroup validationState={validation.fromNumbers.value}>
                                    <ControlLabel>Phone numbers</ControlLabel>
                                    <Creatable
                                        isClearable={true}
                                        isMulti={true}
                                        menuIsOpen={false}
                                        inputValue={fromNumbers.inputValue}
                                        value={inputTypeFile.isNotCSV ? fromNumbers.value : []}
                                        placeholder="Enter phone number"
                                        styles={multiSelectMenuStyles}
                                        onChange={this.handleFromNumbersChange}
                                        onInputChange={this.handleFromNumberInputChange}
                                        onKeyDown={this.handleFromNumberKeyDown}
                                        onBlur={this.handleFromNumberOnBlur}
                                    />
                                    <HelpBlock>{validation.fromNumbers.message}</HelpBlock>
                                </FormGroup>
                            </div> : null
                    }
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <FormGroup bsClass="hidden">
                            <ControlLabel htmlFor="title">Title</ControlLabel>
                            <FormControl
                                id="title"
                                type="text"
                                name="title"
                                className="hidden"
                                placeholder="Title"
                                onChange={this.handleMessageChange}
                            />
                        </FormGroup>
                    </div>
                    {
                        inputTypeFile.isFileChosen ?
                            <div
                                className="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                            >{inputTypeFile.inputFileName}
                            </div> :
                            <div
                                className="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                                id="drop-zone"
                            >
                                <div
                                    className={`dropZone${inputTypeFile.isDragged ? " dragged" : ""}`}
                                    onDragOver={this.handleFromFileDrag}
                                    onDrop={this.handleFromFileDrop}
                                    onDragLeave={this.handleFromDragLeave}
                                >Drop File here or
                                    <label htmlFor="choosing" className="control-label btn btn-default btn-file">Choose
                                        it</label>
                                    <input
                                        type="file"
                                        id="choosing"
                                        className="hidden"
                                        accept=".csv"
                                        multiple={false}
                                        disabled={fromNumbers.value.length + fromNumbers.inValidNumbers.length > 60}
                                        onChange={this.handleFromFileChoose}
                                    />
                                </div>
                            </div>
                    }
                    {
                        fromNumbers.inValidNumbers.length <= 60 && fromNumbers.inValidNumbers.length > 0 ?
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <div
                                    className="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                                >{fromNumbers.inValidNumbers.length > 1 ? "Invalid Numbers" : "Invalid Number"}
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                        {fromNumbers.inValidNumbers.join()}
                                    </div>
                                </div>
                                <button
                                    style={{float: "right"}}
                                    className="btn btn-default"
                                    onClick={this.handleInvalidNumbersDelete}
                                >X
                                </button>
                            </div> : null
                    }
                    {
                        fromNumbers.value.length + fromNumbers.inValidNumbers.length > 60 ?
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <div
                                    className="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                                >From {fromNumbers.value.length + fromNumbers.inValidNumbers.length} numbers
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                        {
                                            fromNumbers.value.length > 1 ? "Valid Numbers" + " " + fromNumbers.value.length
                                                : "Valid Number" + " " + fromNumbers.value.length
                                        }
                                    </div>
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                        {
                                            fromNumbers.inValidNumbers.length > 1 ? "Invalid Numbers" + " " + fromNumbers.inValidNumbers.length
                                                : "Invalid Number" + " " + fromNumbers.inValidNumbers
                                        }
                                    </div>
                                </div>
                                <button
                                    className="btn btn-default"
                                    style={{float: "right"}}
                                    onClick={this.handleFromFileChooseMessageDelete}
                                >X
                                </button>
                                <button
                                    className="btn btn-default"
                                    style={{float: "right"}}
                                    onClick={this.handleFromInvalidNumbers}
                                >See Invalid Numbers List
                                </button>
                            </div> : null
                    }
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <FormGroup>
                            <ControlLabel htmlFor="message">Message</ControlLabel>
                            <FormControl
                                rows={5}
                                id="message"
                                componentClass="textarea"
                                placeholder="Message"
                                value={message}
                                onChange={this.handleMessageChange}
                            />
                        </FormGroup>
                    </div>
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <button
                            disabled={isReady}
                            className="btn btn-info"
                            onClick={this.handleNotify}
                        >{inProgress ? "Processing..." : "Send"}
                        </button>
                    </div>
                </div>
                <Modal show={inputTypeFile.isInvalidNumbersShown} onHide={this.handleInvalidNumbersModalClose}>
                    <Modal.Header closeButton={true}>Invalid Numbers List</Modal.Header>
                    <Modal.Body>
                        <Table
                            hover={true}
                            condensed={true}
                            responsive={true}
                        >
                            <thead>
                            <tr>
                                <th>Invalid Number</th>
                                <th>
                                    <button className="btn btn-info" onClick={this.handleFromCSVFileDownload}>
                                        Download CSV
                                    </button>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                fromNumbers.inValidNumbers.slice(start, end).map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{start + index + 1}</td>
                                            <td>{item}</td>
                                        </tr>
                                    )
                                })
                            }
                            </tbody>
                            <tbody>
                            <tr>
                                <td>
                                    {
                                        `Showing ${start + 1} to ${fromNumbers.inValidNumbers.length <= end ?
                                            fromNumbers.inValidNumbers.length : end}
                                            from ${fromNumbers.inValidNumbers.length} Invalid Numbers`}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-default b-t-l b-b-l"
                                        onClick={this.handleFromLeftClick}
                                        disabled={isNotPaginationLeft}
                                    ><i className="fa fa-chevron-left"/>
                                    </button>
                                    <button
                                        onClick={this.handleFromRightClick}
                                        className="btn btn-default b-t-r b-b-r"
                                        disabled={isNotPaginationRight}
                                    ><i className="fa fa-chevron-right"/>
                                    </button>
                                </td>
                            </tr>
                            </tbody>
                        </Table>
                    </Modal.Body>
                </Modal>
                <Modal show={popup.show} onHide={this.handleModalClose}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>Notify result</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table
                            hover={true}
                            condensed={true}
                            responsive={true}
                        >
                            <thead>
                            <tr>
                                <th/>
                                <th>Phone number</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>

                            {finallyResult.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.value}</td>
                                        <td>
                                            <i
                                                className={`fa ${item.isNotify ? "fa-check" : "fa-times"}`}
                                                style={{color: item.isNotify ? "green" : "red"}}
                                            />
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </Table>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}

export default PhoneAndGroups;
