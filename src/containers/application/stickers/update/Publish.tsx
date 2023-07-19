"use strict";

import * as React from "react";
import {Link} from "react-router-dom";
import {FormGroup} from "react-bootstrap";

import {STICKERS} from "configs/constants";

interface IPublishProps {
    changeStep: (e: React.MouseEvent<HTMLButtonElement>) => void,
}

class Publish extends React.Component<IPublishProps, undefined> {

    render(): JSX.Element {
        const {changeStep} = this.props;
        return (
            <div className="container-fluid no-padder">
                <div className="row b-b b-t">
                    <div className="col-lg-offset-4 col-lg-4">
                        <div className="m-b-lg m-t-lg text-center">
                            <button
                                disabled={true}
                                className="btn btn-default m-b-xs btn-sm btn-addon"
                            >Upload <i className="fa fa-upload"/>
                            </button>
                        </div>
                    </div>
                    <div className="col-lg-offset-3 col-lg-6">
                        <div className="list-group m-b-lg">
                            <li className="list-group-item flexible">
                                <span className="font-bold">Step 1</span>
                                <i className="fa fa-check text-success"/>
                            </li>
                            <li className="list-group-item flexible">
                                <span className="font-bold">Step 2</span>
                                <i className="fa fa-check text-success"/>
                            </li>
                        </div>
                    </div>
                </div>
                <div className="row wrapper">
                    <div className="col-lg-4">
                        <button
                            className="btn btn-default"
                            onClick={changeStep}
                            data-tab-key={STICKERS.TABS.CONFIGURATIONS.BASE}
                        >Back
                        </button>
                    </div>
                    <div className="col-lg-4"/>
                    <div className="col-lg-4">
                        <Link
                            className="btn btn-default f-r"
                            to="/stickers"
                        >Go to the list
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

}

export default Publish;
