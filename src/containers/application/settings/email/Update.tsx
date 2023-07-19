"use strict";

import * as React from "react";
import {AxiosResponse} from "axios";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {Form, FormGroup, HelpBlock, FormControl, ControlLabel, Button} from "react-bootstrap";

import {getTemplate, editTemplates} from "ajaxRequests/template";
import selector, {IStoreProps} from "services/selector";
import {PAGE_NAME} from "configs/constants";

interface IUpdateEmailState {
    template: {
        subject: string;
        content: string;
    };
    disabled: boolean;
    request: boolean;
    status: {
        subject: any;
        content: any;
    };
    loading: boolean;
}

interface IUpdateEmailProps extends IStoreProps {
    history: any;
    location: any;
    match: any;
}

class UpdateEmail extends React.Component<IUpdateEmailProps, IUpdateEmailState> {

    componentState: any = false;

    initRequests: any = (): void => {
        const {match: {params}} = this.props;
        const id: string = params.id;
        getTemplate(id).then(({data}: AxiosResponse) => {
            if (!data.err) {
                const newState: any = {...this.state};
                newState.template.subject = data.result[0].subject;
                newState.template.content = data.result[0].content;
                newState.loading = false;
                if (this.componentState) {
                    this.setState(newState)
                }
            } else {
                console.log("Error during getting Template")
            }
        }).catch(err => console.log(err))
    };

    constructor(props: any) {
        super(props);
        this.state = {
            template: {
                subject: "",
                content: "",
            },
            disabled: true,
            request: false,
            status: {
                subject: {
                    validation: null,
                    message: "Empty data",
                    show: false
                },
                content: {
                    validation: null,
                    message: "Empty data",
                    show: false
                }
            },
            loading: true,
        }
    }

    componentDidMount(): void {
        this.componentState = true;
        this.initRequests();
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleChange = ({currentTarget: {name, value}}: React.ChangeEvent<HTMLInputElement>) => {
        const newState: any = {...this.state};
        newState.template[name] = value;
        newState.status[name].validation = value.length > 0 ? "success" : "error";
        newState.status[name].show = !(value.length > 0);
        newState.disabled = !(newState.status.subject.validation === "success" && newState.status.content.validation === "success");
        this.setState(newState)
    };

    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const {match: {params}, history} = this.props;
        const {template: {subject, content}} = this.state;
        const id: string = params.id;
        const data: any = {subject, content};

        editTemplates(id, data).then(({data}: AxiosResponse) => {
            if (!data.err) {
                history.push("/settings");

            } else {
                console.log("Error during create Template")
            }
        })
    };

    render(): JSX.Element {
        const {disabled, status, template} = this.state;

        return (
            <div className="container-fluid no-padder">
                <div className="row m-b-md">
                    <div className="col-lg-6">
                        <span className="text-xsl text-black">{PAGE_NAME["/settings/email/update"]}</span>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-12">
                        <div className="bg-white box-shadow content-wrapper r-3x">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <Form onSubmit={this.handleSubmit}>
                                            <FormGroup validationState={status.subject.validation}>
                                                <ControlLabel htmlFor="subject">Subject</ControlLabel>
                                                <FormControl
                                                    onChange={this.handleChange}
                                                    name="subject"
                                                    type="text"
                                                    id="subject"
                                                    placeholder="Subject"
                                                    value={template.subject}
                                                />
                                                {status.subject.show && <HelpBlock>{status.subject.message}</HelpBlock>}

                                            </FormGroup>
                                            <FormGroup validationState={status.content.validation}>
                                                <ControlLabel htmlFor="content">Content</ControlLabel>
                                                <FormControl
                                                    bsClass="form-control h-300"
                                                    componentClass="textarea"
                                                    onChange={this.handleChange}
                                                    name="content"
                                                    id="content"
                                                    placeholder="Content"
                                                    value={template.content}
                                                />
                                                {status.content.show && <HelpBlock>{status.content.message}</HelpBlock>}

                                            </FormGroup>
                                            <Button disabled={disabled} type="submit" className="btn btn-info">Update
                                                template</Button>
                                            <Link className="btn btn-default m-l-xs" to="/settings">Cancel</Link>
                                        </Form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(UpdateEmail);
