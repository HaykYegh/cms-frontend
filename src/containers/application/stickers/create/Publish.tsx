"use strict";

import * as React from "react";
import {ToastContainer} from "react-toastify";
import {Link} from "react-router-dom";
import {FormGroup} from "react-bootstrap";

import {buildStickerPackage, publishStickerPackage} from "ajaxRequests/sticker";
import {showNotification} from "helpers/PageHelper";
import {IStickerPackage} from "services/interface";
import {STICKERS} from "configs/constants";

interface IPublishState {
    build: boolean,
    loading: boolean,
    finish: boolean,
}

interface IPublishProps {
    changeStep: (e: React.MouseEvent<HTMLButtonElement>) => void,
    stickerPackage: IStickerPackage
}

class Publish extends React.Component<IPublishProps, IPublishState> {

    componentState: boolean = true;

    constructor(props: IPublishProps) {
        super(props);
        this.state = {
            build: false,
            loading: false,
            finish: false,
        }
    }

    handleUploadSticker = (): void => {
        const {stickerPackage: {packageId}} = this.props;
        const newState: any = {...this.state};
        const toastId: number = showNotification("info", {
            title: "Publishing...",
            description: "",
        });

        newState.loading = true;
        this.setState(newState);

        buildStickerPackage(packageId).then(buildResponse => {
            if (!buildResponse.data.err) {

                if (this.componentState) {
                    newState.build = true;
                    this.setState(newState);
                }
                setTimeout(() => {
                    publishStickerPackage(packageId).then(response => {
                        if (!response.data.err) {
                            showNotification("success", {
                                title: "Success!",
                                description: "Your package is successfully publish",
                                id: toastId
                            });
                            if (this.componentState) {
                                newState.finish = true;
                                this.setState(newState);
                            }
                        } else {
                            showNotification("error", {
                                title: "You got an error!",
                                description: "Error when publish sticker"
                            });
                        }
                    }).catch(error => console.log(error));
                }, 4000);

            } else {
                showNotification("error", {
                    title: "You got an error!",
                    description: "Error when building sticker",
                    id: toastId
                });
            }
        }).catch(error => console.log(error));

    };

    render(): JSX.Element {
        const {changeStep} = this.props;
        const {loading, finish, build} = this.state;
        return (
            <div className="container-fluid no-padder">
                <div className="row b-b b-t">
                    <div className="col-lg-offset-4 col-lg-4">
                        <div className="m-b-lg m-t-lg text-center">
                            <button
                                disabled={loading}
                                className="btn btn-default m-b-xs btn-sm btn-addon"
                                onClick={this.handleUploadSticker}
                            >Upload <i className="fa fa-upload"/>
                            </button>
                        </div>
                    </div>
                    <div className="col-lg-offset-3 col-lg-6">
                        <div className="list-group m-b-lg">
                            <li className={`list-group-item flexible ${loading ? "" : "disabled"}`}>
                                <span className="font-bold">Step 1</span>
                                <span>{!loading ? "Build" : build ? "" : "Building ..."}</span>
                                {!loading ? <i/> : build ? <i className="fa fa-check text-success"/> :
                                    <i className="fa fa-spinner fa-spin"/>}
                            </li>
                            <li className={`list-group-item flexible ${(loading && build) ? "" : "disabled"}`}>
                                <span className="font-bold">Step 2</span>
                                <span>{!(loading && build) ? "Publish" : finish ? "" : "Publishing ..."}</span>
                                {!(loading && build) ? <i/> : finish ? <i className="fa fa-check text-success"/> :
                                    <i className="fa fa-spinner fa-spin"/>}
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
                        {
                            finish &&
                            <Link
                                className="btn btn-default f-r"
                                to="/stickers"
                            >Go to the list
                            </Link>
                        }
                    </div>
                </div>
                <ToastContainer/>
            </div>
        )
    }

}

export default Publish;
