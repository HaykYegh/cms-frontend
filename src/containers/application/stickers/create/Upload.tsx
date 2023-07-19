"use strict";

import * as React from "react";
import {FormGroup, ControlLabel, FormControl, HelpBlock, Button} from "react-bootstrap";

import {IMAGE_MIME_TYPE, STICKERS} from "configs/constants";
import {IStickerPackage} from "services/interface";
import {correctlyFile, showNotification} from "helpers/PageHelper";

interface IUploadProps {
    changeStep: (e: React.MouseEvent<HTMLButtonElement>) => void,
    saveUploadedIcons: (files: any) => void,
    stickerPackage: IStickerPackage
}

interface IUploadState {
    isLoaded: boolean,
    icons: {
        avatar: File,
        icon: File,
        unavailable_icon: File,
        banner: File
    },
    stickers: Array<any>,
    preview: File,
    nextStep: boolean,
}

export default class Upload extends React.Component<IUploadProps, IUploadState> {

    constructor(props: any) {
        super(props);
        this.state = {
            isLoaded: false,
            icons: {
                avatar: null,
                icon: null,
                unavailable_icon: null,
                banner: null,
            },
            stickers: null,
            preview: null,
            nextStep: false
        };
    }

    componentDidMount(): void {
        const {stickerPackage} = this.props;
        const newState: any = {...this.state};

        for (const item in stickerPackage.icons) {
            if (stickerPackage.icons.hasOwnProperty(item)) {
                newState.icons[item] = stickerPackage.icons[item];
            }
        }
        newState.stickers = stickerPackage.stickers;
        newState.preview = stickerPackage.preview;
        this.setState(newState);
    }

    handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
        event.preventDefault();
        const newState: any = {...this.state};
        const name: string = event.currentTarget.name;
        const file: File = correctlyFile(event.target.files[0], {name});

        if (file && file.size > 0 && IMAGE_MIME_TYPE.includes(file.type)) {
            if (name === "preview") {
                newState[name] = file;
            } else {
                newState.icons[name] = file;
            }
            this.setState(newState);
        } else {
            showNotification("error", {
                title: "You got an error!",
                description: "You have upload unsupported image"
            });
        }
    };

    handleStickersUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
        event.preventDefault();
        const newState: any = {...this.state};
        const stickersList: FileList = event.target.files;

        if (stickersList.length > 0) {
            const error: boolean = Object.keys(stickersList).some(item => {
                const file: File = stickersList[item];
                return (!file || !IMAGE_MIME_TYPE.includes(file.type))
            });

            if (!error) {
                newState.stickers = Object.keys(stickersList).map(item => {
                    const file: File = stickersList[item];
                    const fileExt: string = file.type.replace("image/", "");
                    const id: string = file.name.replace("." + fileExt, "");
                    const blobUrl: string = URL.createObjectURL(file);
                    return {id, file, blobUrl};
                });
                this.setState(newState);
            } else {
                showNotification("error", {
                    title: "You got an error!",
                    description: "You have upload unsupported image"
                });
            }
        }
    };

    handleStickerDelete = (event: React.MouseEvent<HTMLElement>): void => {
        event.preventDefault();
        const stickerId: string = event.currentTarget.getAttribute("data-sticker-id");
        const newState: any = {...this.state};
        newState.stickers = newState.stickers.filter(item => item.id !== stickerId);
        this.setState(newState);
    };

    handleStepChange = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {saveUploadedIcons, changeStep} = this.props;
        const {icons, stickers, preview} = this.state;
        saveUploadedIcons({icons, stickers, preview});
        changeStep(e);
    };

    render(): JSX.Element {
        const {changeStep} = this.props;
        const {icons, stickers, preview} = this.state;
        const nextStep: boolean = (
            Object.keys(icons).every(item => {
                return (icons[item] && icons[item].size > 0);
            }) &&
            stickers && stickers.length > 0 &&
            preview && preview.size > 0
        );

        return (
            <div className="container-fluid no-padder">
                <div className="row b-t b-b wrapper-md scroll-sticker" style={{height: window.innerHeight / 2}}>
                    <div className="col-lg-4">
                        {
                            Object.keys(STICKERS.UPLOAD.icons).map((item, i) => {
                                let blobUrl: string = "";
                                if (icons[item]) {
                                    blobUrl = URL.createObjectURL(icons[item]);
                                }
                                return (
                                    <FormGroup key={i}>
                                        <ControlLabel htmlFor={item} bsClass="cursor-pointer font-bold">
                                            <i className="fa fa-plus-circle m-r-xs"/> {STICKERS.UPLOAD.icons[item].title}
                                        </ControlLabel>
                                        <FormControl
                                            type="file"
                                            name={item}
                                            className="hidden"
                                            id={item}
                                            accept="image/*"
                                            onChange={this.handleFileUpload}
                                        />
                                        <HelpBlock>
                                            {
                                                blobUrl === "" ? STICKERS.UPLOAD.icons[item].info :
                                                    <img
                                                        className="img-responsive w-100 h-100 contain"
                                                        src={blobUrl}
                                                        alt={item}
                                                    />
                                            }
                                        </HelpBlock>
                                    </FormGroup>
                                )
                            })
                        }
                    </div>
                    <div className="col-lg-4">
                        <FormGroup>
                            <ControlLabel htmlFor="stickers" bsClass="cursor-pointer font-bold">
                                <i className="fa fa-plus-circle m-r-xs"/> {STICKERS.UPLOAD.stickers.title}
                            </ControlLabel>
                            <FormControl
                                type="file"
                                name="stickers"
                                className="hidden"
                                id="stickers"
                                accept="image/*"
                                multiple={true}
                                onChange={this.handleStickersUpload}
                            />
                            <HelpBlock>
                                {
                                    stickers && stickers.length > 0 ?
                                        stickers.map((item, i) => {
                                            return (
                                                <div
                                                    key={i}
                                                    className="show-image"
                                                >
                                                    <img
                                                        className="w-100 contain"
                                                        src={URL.createObjectURL(item.file)}
                                                    />
                                                    <i
                                                        className="fa fa-close text-md delete cursor-pointer"
                                                        onClick={this.handleStickerDelete}
                                                        data-sticker-id={item.id}
                                                    />
                                                </div>
                                            )
                                        }) :
                                        <div>
                                            <span>{STICKERS.UPLOAD.stickers.info}</span>
                                            <img
                                                className="img-responsive center-block"
                                                src={STICKERS.UPLOAD.stickers.imageUrl}
                                            />
                                        </div>
                                }
                            </HelpBlock>
                        </FormGroup>
                    </div>
                    <div className="col-lg-4">
                        <FormGroup>
                            <ControlLabel htmlFor="preview" bsClass="cursor-pointer font-bold">
                                <i className="fa fa-plus-circle m-r-xs"/> {STICKERS.UPLOAD.preview.title}
                            </ControlLabel>
                            <FormControl
                                type="file"
                                name="preview"
                                className="hidden"
                                id="preview"
                                accept="image/*"
                                onChange={this.handleFileUpload}
                            />
                            <HelpBlock>
                                {
                                    preview && preview.size > 0 ?
                                        <img
                                            className="img-responsive contain"
                                            src={URL.createObjectURL(preview)}
                                        /> :
                                        <div>
                                            <span>{STICKERS.UPLOAD.preview.info}</span>
                                            <img
                                                className="img-responsive center-block"
                                                src={STICKERS.UPLOAD.preview.imageUrl}
                                            />
                                        </div>
                                }
                            </HelpBlock>
                        </FormGroup>
                    </div>
                </div>
                <div className="row wrapper">
                    <div className="col-lg-4">
                        <button
                            className="btn btn-default"
                            onClick={changeStep}
                            data-tab-key={STICKERS.TABS.DESCRIPTION}
                        >Back
                        </button>
                    </div>
                    <div className="col-lg-4"/>
                    <div className="col-lg-4">
                        <button
                            disabled={!nextStep}
                            className="btn btn-info pull-right"
                            onClick={this.handleStepChange}
                            data-tab-key={STICKERS.TABS.ARRANGE}
                        >Next
                        </button>
                    </div>
                </div>
            </div>
        )
    }
};
