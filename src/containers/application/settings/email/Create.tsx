"use strict";
import * as React from "react";
import {AxiosResponse} from "axios";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {Form, FormGroup, HelpBlock, FormControl, ControlLabel, Button} from "react-bootstrap";

import selector, {IStoreProps} from "services/selector";
import {setTemplates} from "ajaxRequests/template";
import {PAGE_NAME} from "configs/constants";

interface ICreateEmailState {
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
}

interface ICreateEmailProps extends IStoreProps {
    history: any
}

class CreateEmail extends React.Component<ICreateEmailProps, ICreateEmailState> {

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
                    message: 'Property "subject" is required',
                    show: false
                },
                content: {
                    validation: null,
                    message: 'Property "content" is required',
                    show: false
                }
            }
        }
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

        const data: any = {subject: this.state.template.subject, content: this.state.template.content};
        this.setState({request: true});

        setTemplates(data).then(({data}: AxiosResponse) => {
            const {history} = this.props;
            if (!data.err) {
                history.push("/settings");

            } else {
                console.log("Error during create Template");
                this.setState({request: false});
            }
        }).catch(error => console.log(error));
    };

    render(): JSX.Element {
        const {disabled, request, status} = this.state;
        return (
            <div className="container-fluid no-padder">
                <div className="row m-b-md">
                    <div className="col-lg-6">
                        <span className="text-xsl text-black">{PAGE_NAME["/settings/email/create"]}</span>
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
                                                />
                                                {status.subject.show && <HelpBlock>{status.subject.message}</HelpBlock>}
                                            </FormGroup>
                                            <FormGroup validationState={status.content.validation}>
                                                <ControlLabel htmlFor="content">Content</ControlLabel>
                                                <FormControl
                                                    componentClass="textarea"
                                                    bsClass="form-control h-300"
                                                    onChange={this.handleChange}
                                                    name="content"
                                                    type="text"
                                                    id="content"
                                                    placeholder="Content"
                                                />
                                                {status.content.show && <HelpBlock>{status.content.message}</HelpBlock>}
                                            </FormGroup>

                                            <Button
                                                disabled={disabled || request}
                                                type="submit"
                                                className="btn btn-info"
                                            >
                                                Create template
                                            </Button>
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateEmail);
