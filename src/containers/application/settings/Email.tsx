"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import {connect} from "react-redux";
import Modal from "react-bootstrap/es/Modal";
import Table from "react-bootstrap/es/Table";
import Button from "react-bootstrap/es/Button";

import {getTemplates, editTemplates, setTemplates} from "ajaxRequests/template";
import selector from "services/selector";

interface IEmailState {
    attributes: any;
    title: string;
    massage: string;
    params: {};
    templateId: string;
    showModal: boolean;
    type: string;
}

class Email extends React.Component<undefined, IEmailState> {

    constructor(props: any) {
        super(props);
        this.state = {
            attributes: [],
            title: "",
            massage: "",
            params: {},
            templateId: "",
            showModal: false,
            type: "add"
        }

    }

    closeModal = (): any => {
        const newState: any = {...this.state};
        newState.showModal = false;
        this.setState(newState);
    };

    openModal = (): any => {
        const newState: any = {...this.state};
        newState.showModal = true;
        newState.type = "add";
        this.setState(newState);
    };

    handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.name === "title") {
            this.setState({title: event.target.value});
        }
    };

    handleModelChange = (model: any) => {
        this.setState({
            massage: model
        });
    };

    handleClickEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const data: any = {subject: this.state.title, content: this.state.massage, params: this.state.params};

        editTemplates(this.state.templateId, data).then(({data}: AxiosResponse) => {
            if (!data.err) {
                const newState: any = {...this.state};
                newState.attributes = this.state.attributes.map((item) => {
                    if (item.templateId.toString() === this.state.templateId) {
                        item.subject = this.state.title;
                        item.content = this.state.massage;
                    }
                    return item;
                });
                newState.showModal = false;
                this.setState(newState);

            } else {
                alert("Error during getting attributes")
            }

        })
    };

    handleClickSet = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const data: any = {subject: this.state.title, content: this.state.massage, params: this.state.params};

        setTemplates(data).then(({data}: AxiosResponse) => {
            if (!data.err) {
                const newState: any = {...this.state};
                newState.attributes = this.state.attributes;
                newState.attributes.push({
                    templateId: data.result[0].templateId,
                    subject: this.state.title,
                    content: this.state.massage
                });
                newState.showModal = false;
                this.setState(newState);

            } else {
                alert("Error during getting attributes")
            }

        })
    };

    handleEdit = (event: any) => {
        const items: any = this.state.attributes.filter((item) => item.templateId.toString() === event.target.value)[0];
        this.setState({
            templateId: event.target.value,
            title: items.subject,
            massage: items.content,
            params: items.params,
            type: "edit",
            showModal: true
        });
    };

    componentDidMount(): void {
        getTemplates().then(({data}: AxiosResponse) => {
            if (!data.err) {
                const newState: any = {...this.state};
                newState.attributes = (data.result);
                this.setState(newState);
            } else {
                alert("Error during getting attributes")
            }

        })
    }

    render(): JSX.Element {
        const items: any = this.state.attributes;
        const rowItems: any = items.map((item) => {
            return (
                <tr key={item.templateId}>
                    <td>{item.subject}</td>
                    <td>{item.content}</td>
                    <td>{JSON.stringify(item.params)}</td>
                    <td>
                        <button className="btn btn-danger btn-xs" onClick={this.handleEdit} value={item.templateId}>
                            <i className="icon-pencil icons"/>
                        </button>
                    </td>
                </tr>
            )
        });
        return (
            <div className={"row"}>
                <div className={"col-lg-8"}>
                    <div className="form-group">
                        <Button bsStyle="info" bsSize="large" onClick={this.openModal}>Add Template </Button>
                    </div>
                    <Table
                        hover={true}
                        condensed={true}
                        responsive={true}
                    >
                        <thead>
                        <tr>
                            <th>title</th>
                            <th>text</th>
                            <th>params</th>
                            <th>edit</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rowItems}
                        </tbody>
                    </Table>
                </div>
                <Modal show={this.state.showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>&nbsp;</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        {this.state.type !== "add" ?
                            <form className="wrapper-md">
                                <div className="row">
                                    <div className={"form-group"}>
                                        <label htmlFor="title">title</label>
                                        <input
                                            name="title"
                                            className="form-control"
                                            type="text"
                                            onChange={this.handleInputChange}
                                            value={this.state.title ? this.state.title : ""}
                                        />
                                    </div>
                                    <div className={"form-group"}>
                                        <label htmlFor="content">content</label>
                                    </div>
                                    <Button
                                        className="btn btn-info btn-lg btn-block"
                                        onClick={this.handleClickEdit}
                                    >save
                                    </Button>
                                </div>
                            </form> : <form className="wrapper-md">
                                <div className="row">
                                    <div className={"form-group"}>
                                        <label htmlFor="title">title</label>
                                        <input
                                            name="title"
                                            className="form-control"
                                            type="text"
                                            onChange={this.handleInputChange}
                                        />
                                    </div>
                                    <div className={"form-group"}>
                                        <label htmlFor="content">content</label>

                                        <textarea className="form-control" onChange={this.handleModelChange}/>
                                    </div>
                                    <div className={"form-group"}>
                                        {/* <label htmlFor="params">params</label> */}
                                        {/* <textarea name="params" readOnly={true} className="form-control" onChange={this.handleInputChange} /> */}
                                    </div>
                                    <Button
                                        className="btn btn-info btn-lg btn-block"
                                        onClick={this.handleClickSet}
                                    >create
                                    </Button>
                                </div>
                            </form>
                        }

                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Email);
