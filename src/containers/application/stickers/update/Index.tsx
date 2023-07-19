"use strict";

import * as React from "react";
import {Link} from "react-router-dom";
import {Nav, NavItem, Button} from "react-bootstrap";

import Configurations from "containers/application/stickers/update/configurations/Index";
import {PAGE_NAME, STICKER_BLOCK_COUNT, STICKERS} from "configs/constants";
import Description from "containers/application/stickers/update/Description";
import Arrange from "containers/application/stickers/update/Arrange";
import Publish from "containers/application/stickers/update/Publish";
import Upload from "containers/application/stickers/update/Upload";
import {IStickerPackage} from "services/interface";
import {ToastContainer} from "react-toastify";

interface IUpdateState {
    steps: any,
    active: any,
    stickerPackage: IStickerPackage,
}

interface IUpdateProps {
    match: any,
}

class Update extends React.Component<IUpdateProps, IUpdateState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        const {match: {params: {id}}} = props;
        this.state = {
            steps: [
                {
                    key: STICKERS.TABS.DESCRIPTION,
                    component: Description,
                    title: "Description",
                    status: "complete",
                    className: ""
                },
                {
                    key: STICKERS.TABS.UPLOAD,
                    component: Upload,
                    title: "Upload",
                    disabled: false,
                    status: "complete",
                    className: ""
                },
                {
                    key: STICKERS.TABS.ARRANGE,
                    component: Arrange,
                    title: "Arrange",
                    disabled: true,
                    status: "complete",
                    className: ""
                },
                {
                    key: STICKERS.TABS.CONFIGURATIONS.BASE,
                    component: Configurations,
                    title: "Configurations",
                    disabled: true,
                    status: "complete",
                    className: ""

                },
                {
                    key: STICKERS.TABS.PUBLISH,
                    component: Publish,
                    title: "Publish",
                    disabled: true,
                    status: "complete",
                    className: ""

                }
            ],
            active: {
                key: STICKERS.TABS.DESCRIPTION,
                component: Description,
            },
            stickerPackage: {
                packageId: parseInt(id),
                preview: null,
                isLoaded: false,
                packageNumber: null,
                icons: {
                    avatar: null,
                    icon: null,
                    unavailable_icon: null,
                    banner: null,
                },
                stickers: null,
                seatedStickers: {},
                blocksCount: STICKER_BLOCK_COUNT.DEFAULT,
            },
        };
    }

    componentWillMount(): void {
        document.title = PAGE_NAME["/stickers/update"];
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleSaveUploadedIcons = (files: any, loaded: boolean = false): void => {
        const newState: IUpdateState = {...this.state};
        if (files) {
            newState.stickerPackage.icons = files.icons;
            newState.stickerPackage.preview = files.preview;
            newState.stickerPackage.stickers = files.stickers;
        }
        if (loaded) {
            newState.stickerPackage.isLoaded = loaded;
        }
        this.setState(newState);
    };

    handleSetSeatedStickers = (data: any): void => {
        const newState: IUpdateState = {...this.state};
        newState.stickerPackage.seatedStickers = data;
        this.setState(newState);
    };

    handleStepChange = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const tabKey: number = parseInt(e.currentTarget.getAttribute("data-tab-key"));
        const newState: IUpdateState = {...this.state};
        const newTab: any = newState.steps.find(tab => tab.key === tabKey);

        newState.active = {
            key: newTab.key,
            component: newTab.component,
        };

        this.setState(newState);
    };

    handleBlocksCountChange = (count: number): void => {
        const newState: IUpdateState = {...this.state};
        newState.stickerPackage.blocksCount = count;
        this.setState(newState);
    };

    handleSetPackageNumber = (packageNumber: number): void => {
        const newState: IUpdateState = {...this.state};
        newState.stickerPackage.packageNumber = packageNumber;
        this.setState(newState);
    };

    render(): JSX.Element {
        const {steps, active, stickerPackage} = this.state;

        return (
            <div className="box-shadow r-3x bg-white">
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl padder-t-3">{PAGE_NAME["/stickers/update"]}</span>
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
                                saveUploadedIcons: this.handleSaveUploadedIcons,
                                changeBlockCount: this.handleBlocksCountChange,
                                setStickers: this.handleSetSeatedStickers,
                                setPackageNumber: this.handleSetPackageNumber,
                                stickerPackage,
                            })}
                        </div>
                    </div>
                </div>
            </div>

        )
    }
}

export default Update;
