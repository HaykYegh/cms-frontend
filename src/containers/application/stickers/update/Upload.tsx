"use strict";

import * as React from "react";
import {isEqual} from "lodash";
import {ToastContainer} from "react-toastify";
import {FormGroup, ControlLabel, FormControl, HelpBlock, Button} from "react-bootstrap";

import {correctlyFile, showNotification} from "helpers/PageHelper";
import {IMAGE_MIME_TYPE, STICKERS} from "configs/constants";
import {getUploadedIcons} from "ajaxRequests/sticker";
import {IStickerPackage} from "services/interface";

interface IUploadProps {
    changeStep: (e: React.MouseEvent<HTMLButtonElement>) => void,
    saveUploadedIcons: (files: any, loaded: boolean) => void,
    stickerPackage: IStickerPackage,
}

interface IUploadState {
    icons: {
        avatar: File,
        icon: File,
        unavailable_icon: File,
        banner: File
    },
    stickers: Array<any>,
    preview: File,
    nextStep: boolean,
    loading: boolean,
}

export default class Upload extends React.Component<IUploadProps, IUploadState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            icons: {
                avatar: null,
                icon: null,
                unavailable_icon: null,
                banner: null,
            },
            stickers: [],
            preview: null,
            nextStep: false,
            loading: true,
        };
    }

    componentDidMount(): void {
        const {stickerPackage, saveUploadedIcons} = this.props;
        const newState: IUploadState = {...this.state};

        if (stickerPackage.isLoaded) {
            for (const item in stickerPackage.icons) {
                if (stickerPackage.icons.hasOwnProperty(item)) {
                    newState.icons[item] = stickerPackage.icons[item];
                }
            }
            newState.stickers = stickerPackage.stickers;
            newState.preview = stickerPackage.preview;
            newState.loading = false;
            this.setState(newState);
        } else {
            (async () => {
                try {
                    const uploadedIcons: any = await getUploadedIcons(stickerPackage.packageId);

                    if (!uploadedIcons.data.err) {
                        const iconsKeys: string[] = Object.keys(STICKERS.UPLOAD.icons).map(item => item);
                        const icons: any[] = uploadedIcons.data.result;

                        for (const icon of icons) {
                            const iconType: string = icon.file.replace(/\.png$/, "");
                            const getFile: any = await fetch(icon.url);
                            if (iconType === "preview") {
                                newState.preview = await getFile.blob();
                            } else if (iconsKeys.includes(iconType)) {
                                newState.icons[iconType] = await getFile.blob();
                            } else {
                                const file: Blob = await getFile.blob();
                                const blobUrl: string = URL.createObjectURL(file);
                                newState.stickers.push({id: icon.file, file, blobUrl});
                            }
                        }
                        saveUploadedIcons({
                            icons: newState.icons,
                            stickers: newState.stickers,
                            preview: newState.preview
                        }, true);

                    } else {
                        this.componentState && showNotification("error", {
                            title: "You got an error!",
                            description: "Error during getting package icons and stickers",
                            hideProgress: true,
                            timer: 3000
                        });
                    }

                    newState.loading = false;
                    if (this.componentState) {
                        this.setState(newState);
                    }
                } catch (e) {
                    this.componentState && showNotification("error", {
                        title: "You got an error!",
                        description: "Error during getting package icons and stickers",
                        hideProgress: true,
                        timer: 3000
                    });
                }
            })();
        }

    }

    componentDidUpdate(prevProps: IUploadProps, prevState: IUploadState): void {
        const {icons, stickers, preview} = this.state;

        if (!isEqual(prevState.icons, icons) || !isEqual(prevState.stickers, stickers) || !isEqual(prevState.preview, preview)) {
            const {saveUploadedIcons} = this.props;
            saveUploadedIcons({icons, stickers, preview}, true);
        }

    }

    handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const newState: any = {...this.state};

        const name: string = e.currentTarget.name;
        const file: File = correctlyFile(e.target.files[0], {name});

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
                description: "You have upload unsupported image",
                hideProgress: true,
                timer: 3000
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
                this.componentState && showNotification("error", {
                    title: "You got an error!",
                    description: "You have upload unsupported image",
                    hideProgress: true,
                    timer: 3000
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

    componentWillUnmount(): void {
        this.componentState = false;
    }

    render(): JSX.Element {
        const {changeStep} = this.props;
        const {icons, stickers, preview, loading} = this.state;
        const nextStep: boolean = (
            Object.keys(icons).every(item => {
                return (icons[item] && icons[item].size > 0);
            }) &&
            stickers && stickers.length > 0 &&
            preview && preview.size > 0
        );

        return (
            <div className="container-fluid no-padder">
                {
                    loading ?
                        <div className="row b-t b-b wrapper-md scroll-sticker" >
                            <div className="col-lg-12" style={{height: "400px"}}>
                                <div className="spinner" style={{top: "45%"}}>
                                    <div className="double-bounce1"/>
                                    <div className="double-bounce2"/>
                                </div>
                            </div>
                        </div> :
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
                }
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
                            className="btn btn-info pull-right"
                            onClick={changeStep}
                            data-tab-key={STICKERS.TABS.ARRANGE}
                            disabled={!nextStep}
                        >Next
                        </button>
                    </div>
                </div>
                <ToastContainer/>
            </div>
        )
    }
};
