"use strict";

import * as React from "react";
import {Link} from "react-router-dom";
import {Nav, NavItem, Button} from "react-bootstrap";

import Configurations from "containers/application/stickers/create/configurations/Index";
import Description from "containers/application/stickers/create/Description";
import Arrange from "containers/application/stickers/create/Arrange";
import Publish from "containers/application/stickers/create/Publish";
import Upload from "containers/application/stickers/create/Upload";
import {PAGE_NAME, STICKER_BLOCK_COUNT, STICKERS} from "configs/constants";
import {IStickerPackage} from "services/interface";
import {ToastContainer} from "react-toastify";

interface ICreateState {
    steps: any,
    active: any,
    stickerPackage: IStickerPackage,
}

class Create extends React.Component<undefined, ICreateState> {

    componentState: any;

    constructor(props: any) {
        super(props);
        this.state = {
            steps: [
                {
                    key: STICKERS.TABS.DESCRIPTION,
                    component: Description,
                    title: "Description",
                    status: "active",
                    className: ""
                },
                {
                    key: STICKERS.TABS.UPLOAD,
                    component: Upload,
                    title: "Upload",
                    disabled: false,
                    status: "disabled",
                    className: ""
                },
                {
                    key: STICKERS.TABS.ARRANGE,
                    component: Arrange,
                    title: "Arrange",
                    disabled: true,
                    status: "disabled",
                    className: ""
                },
                {
                    key: STICKERS.TABS.CONFIGURATIONS.BASE,
                    component: Configurations,
                    title: "Configurations",
                    disabled: true,
                    status: "disabled",
                    className: ""

                },
                {
                    key: STICKERS.TABS.PUBLISH,
                    component: Publish,
                    title: "Publish",
                    disabled: true,
                    status: "disabled",
                    className: ""

                }
            ],
            active: {
                key: STICKERS.TABS.DESCRIPTION,
                component: Description,
                status: "active"
            },
            stickerPackage: {
                packageId: null,
                packageNumber: null,
                icons: {
                    avatar: null,
                    icon: null,
                    unavailable_icon: null,
                    banner: null,
                },
                preview: null,
                stickers: null,
                seatedStickers: {},
                blocksCount: STICKER_BLOCK_COUNT.DEFAULT,
            },
        };
    }

    componentWillMount(): void {
        document.title = PAGE_NAME["/stickers/create"];
    }

    handleSaveUploadedIcons = (files: any): void => {
        const newState: ICreateState = {...this.state};
        newState.stickerPackage.icons = files.icons;
        newState.stickerPackage.preview = files.preview;
        newState.stickerPackage.stickers = files.stickers;
        this.setState(newState);
    };

    handleCreatePackage = (data: any): void => {
        const newState: ICreateState = {...this.state};
        newState.stickerPackage.packageId = data.package_id;
        newState.stickerPackage.packageNumber = data.package_number;
        this.setState(newState);
    };

    handleSetSeatedStickers = (data: any): void => {
        const newState: ICreateState = {...this.state};
        newState.stickerPackage.seatedStickers = data;
        this.setState(newState);
    };

    handleBlocksCountChange = (count: number): void => {
        const newState: ICreateState = {...this.state};
        newState.stickerPackage.blocksCount = count;
        this.setState(newState);
    };

    handleStepChange = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const tabKey: number = parseInt(e.currentTarget.getAttribute("data-tab-key"));
        const newState: ICreateState = {...this.state};

        newState.steps.map(step => {
            if (step.key < tabKey) {
                step.status = "complete";
            } else if (step.key === tabKey) {
                step.status = "active";
            } else {
                step.status = "disabled";
            }
        });

        const newTab: any = newState.steps.find(tab => tab.key === tabKey);

        newState.active = {
            key: newTab.key,
            component: newTab.component,
        };

        this.setState(newState);
    };

    render(): JSX.Element {
        const {steps, active, stickerPackage}: any = this.state;

        return (
            <div className="box-shadow r-3x bg-white">
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl padder-t-3">{PAGE_NAME["/stickers/create"]}</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <div className="text-right">
                                    <Link to="/stickers" className="btn btn-default">
                                        Cancel
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr/>

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row bs-wizard">
                            {
                                steps.map((step, i) => {
                                    return (
                                        <div
                                            key={step.key}
                                            className={`${i === 0 ? "col-lg-offset-1 col-md-offset-1 col-sm-offset-1 col-xs-offset-1" : ""}
                                            col-lg-2 col-md-2 col-sm-2 col-xs-2 bs-wizard-step ${step.status}`}
                                        >
                                            <div className="progress">
                                                <div className="progress-bar"/>
                                            </div>
                                            <a href="#" className="bs-wizard-dot">
                                                <span>{step.key}</span>
                                            </a>
                                            <div className="bs-wizard-info text-center">{step.title}</div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            {React.createElement(active.component, {
                                changeStep: this.handleStepChange,
                                createPackage: this.handleCreatePackage,
                                saveUploadedIcons: this.handleSaveUploadedIcons,
                                setStickers: this.handleSetSeatedStickers,
                                changeBlockCount: this.handleBlocksCountChange,
                                stickerPackage,
                            }, null)}
                        </div>
                    </div>
                </div>
            </div>

        )
    }
}

export default Create;
