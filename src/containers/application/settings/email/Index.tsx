"use strict";

import * as React from "react";
import {connect} from "react-redux";
import {AxiosResponse} from "axios";
import {Link} from "react-router-dom";
import Table from "react-bootstrap/es/Table";

import {getTemplates} from "ajaxRequests/template";
import selector from "services/selector";

interface IEmailState {
    templates: Array<any>;
    loading: boolean;
}

class Email extends React.Component<undefined, IEmailState> {

    componentState: any = false;

    initRequests: any = (): void => {
        getTemplates().then(({data}: AxiosResponse) => {
            if (!data.err) {
                const newState: any = {...this.state};
                newState.templates = (data.result);
                newState.loading = false;
                if (this.componentState) {
                    this.setState(newState);
                }
            } else {
                console.log("Error during getting email templates");
            }

        }).catch(error => console.log(error));
    };

    constructor(props: any) {
        super(props);
        this.state = {
            templates: [],
            loading: true
        }

    }

    componentDidMount(): void {
        this.componentState = true;
        this.initRequests();
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    render(): JSX.Element {
        const templates: any = this.state.templates;
        return (
            <div className="row">
                {this.state.loading ? <div className="spinner">
                        <div className="double-bounce1"/>
                        <div className="double-bounce2"/>
                    </div> :
                    <div className="col-lg-12">
                        <div className="form-group">
                            <Link to="settings/email/create" className="btn btn-info btn-addon">
                                <i className="fa fa-plus"/>Add Template</Link>
                        </div>
                        <Table
                            hover={true}
                            condensed={true}
                            responsive={true}
                        >
                            <thead>
                            <tr>

                                <th>#</th>
                                <th>Subject</th>
                                <th>Content</th>
                                <th/>
                            </tr>
                            </thead>
                            <tbody>
                            {templates.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.subject}</td>
                                        <td>{item.content}</td>
                                        <td>
                                            <Link
                                                to={"/settings/email/update/" + item.template_id}
                                                className="btn btn-info btn-xs"
                                            ><i className="fa fa-pencil"/>
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </Table>
                    </div>
                }
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Email);
