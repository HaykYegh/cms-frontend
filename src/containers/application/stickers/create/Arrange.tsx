"use strict";

import * as React from "react";
import {Radio} from "react-bootstrap";
import {ToastContainer} from "react-toastify";

import {STICKER_BLOCK_COUNT, STICKERS} from "configs/constants";
import {createBlockArray, createBoxes, findMaxMin} from "helpers/DomHelper";
import {IStickerPackage} from "services/interface";
import {correctlyFile, showNotification} from "helpers/PageHelper";
import {uploadIcons} from "ajaxRequests/sticker";
import Table from "react-bootstrap/es/Table";

interface IArrangeStickersProps {
    changeStep: (e: React.MouseEvent<HTMLButtonElement>) => void,
    setStickers: (data: any) => void,
    changeBlockCount: (count: number) => void,
    stickerPackage: IStickerPackage
}

interface IArrangeStickersState {
    blocksCount: number,
    blocks: Array<any>,
    selectedSticker: any,
    seatedStickers: any,
    seatedStickerNumber: number,
    selectedBlocks: Array<any>,
    previewBlobUrl: string,
    complete: boolean,
    loading: boolean,
    nextStep: boolean,
}

class ArrangeStickers extends React.Component<IArrangeStickersProps, IArrangeStickersState> {

    height: number = 50;

    width: number = 93;

    componentState: boolean = true;

    constructor(props: IArrangeStickersProps) {
        super(props);
        this.state = {
            blocksCount: STICKER_BLOCK_COUNT.DEFAULT,
            selectedSticker: null,
            seatedStickers: {},
            seatedStickerNumber: 1000,
            selectedBlocks: [],
            previewBlobUrl: "",
            complete: false,
            blocks: [],
            loading: false,
            nextStep: false,
        };
    }

    componentDidMount(): void {
        const {stickerPackage: {preview, seatedStickers, blocksCount, stickers}} = this.props;
        const {seatedStickerNumber} = this.state;
        const newState: any = {...this.state};
        const blocks: any = createBlockArray(blocksCount);

        for (const item in seatedStickers) {
            if (seatedStickers.hasOwnProperty(item)) {
                for (let i: number = seatedStickers[item].maxMin.min.i; i < seatedStickers[item].maxMin.max.i + 1; i++) {
                    for (let j: number = seatedStickers[item].maxMin.min.j; j < seatedStickers[item].maxMin.max.j + 1; j++) {
                        blocks[i][j].imageSet = true;
                        blocks[i][j].color = "black";
                    }
                }
            }
        }

        newState.previewBlobUrl = URL.createObjectURL(preview);
        newState.seatedStickers = seatedStickers;
        newState.blocks = blocks;
        newState.blocksCount = blocksCount;
        if (seatedStickers && Object.keys(seatedStickers).length > 0) {
            newState.seatedStickerNumber = seatedStickerNumber + Object.keys(seatedStickers).length;
        }
        newState.nextStep = (newState.seatedStickers && stickers &&
            Object.keys(newState.seatedStickers).length === stickers.length
        );
        this.setState(newState);
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleBlockCountChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>) => {
        const nextBlockCount: number = parseInt(value);
        const {changeBlockCount} = this.props;
        if (nextBlockCount >= 2 && nextBlockCount % 2 === 0) {
            const blocks: Array<any> = createBlockArray(nextBlockCount);
            this.setState({
                blocksCount: nextBlockCount,
                seatedStickers: {},
                seatedStickerNumber: 1000,
                blocks,
                complete: false,
            });
            changeBlockCount(nextBlockCount);
        }
    };

    handleSelectSticker = ({currentTarget: {id}}: React.MouseEvent<HTMLImageElement>): void => {
        const {selectedSticker} = this.state;
        const {stickerPackage: {stickers}} = this.props;
        if (!selectedSticker || selectedSticker.id !== id) {
            const newState: IArrangeStickersState = {...this.state};
            newState.selectedSticker = stickers.find(item => item.id === id);
            this.setState(newState);
        } else {
            this.setState({selectedSticker: null});
        }
    };

    handleSelectBlock = (i: number, j: number) => {
        const {selectedSticker, blocks, selectedBlocks} = this.state;

        if (!selectedSticker) {
            return;
        }

        if (blocks[i][j].imageSet) {
            return;
        }

        const removing: boolean = blocks[i][j].color === "green";

        const newState: any = {...this.state};

        if (removing) {
            newState.blocks[i][j].color = "";
            newState.blocks[i][j].selected = false;
            newState.selectedBlocks = selectedBlocks.filter(block => block.i !== i && block.j !== j);
        } else {
            newState.blocks[i][j].color = "green";
            newState.blocks[i][j].selected = true;
            newState.selectedBlocks.push({i, j});
        }

        this.setState(newState);
    };

    handleSetSticker = () => {
        const newState: any = {...this.state};
        const {stickerPackage: {packageNumber, stickers}, setStickers} = this.props;
        const {selectedSticker, selectedBlocks, blocksCount, seatedStickerNumber} = this.state;
        const maxMin: any = findMaxMin(selectedBlocks, blocksCount);
        const seatedStickerName: string = `${packageNumber}_${seatedStickerNumber}`;
        const file: File = correctlyFile(selectedSticker.file, {name: seatedStickerName});

        newState.seatedStickers[seatedStickerName] = {
            styles: {
                marginTop: (maxMin.min.i * this.height) + "px",
                marginLeft: (maxMin.min.j * this.width) + "px",
                height: ((maxMin.max.i - maxMin.min.i + 1) * this.height) + "px",
                width: ((maxMin.max.j - maxMin.min.j + 1) * this.width) + "px",
            },
            blobUrl: URL.createObjectURL(selectedSticker.file),
            file,
            id: selectedSticker.id,
            maxMin
        };

        newState.selectedSticker = null;
        newState.seatedStickerNumber += 1;

        for (const block of newState.blocks) {
            for (const miniBlock of block) {
                miniBlock.selected = false;
                if (miniBlock.color !== "black") {
                    miniBlock.color = "";
                }
            }
        }
        newState.selectedBlocks = [];

        for (let i: number = maxMin.min.i; i < maxMin.max.i + 1; i++) {
            for (let j: number = maxMin.min.j; j < maxMin.max.j + 1; j++) {
                newState.blocks[i][j].imageSet = true;
                newState.blocks[i][j].color = "black";
            }
        }
        newState.nextStep = (newState.seatedStickers && stickers &&
            Object.keys(newState.seatedStickers).length === stickers.length
        );
        setStickers(newState.seatedStickers);
        this.setState(newState);
    };

    handleResetSticker = () => {
        const newState: any = {...this.state};
        const {setStickers, stickerPackage: {packageNumber}} = this.props;
        const {selectedSticker, seatedStickers, seatedStickerNumber} = this.state;
        const newSeatedStickers: any = {};
        const resetStickerKey: string = Object.keys(seatedStickers).find(key => seatedStickers[key].id.toString() === selectedSticker.id).toString();
        const maxMin: any = seatedStickers[resetStickerKey].maxMin;

        for (let i: number = maxMin.min.i; i < maxMin.max.i + 1; i++) {
            for (let j: number = maxMin.min.j; j < maxMin.max.j + 1; j++) {
                newState.blocks[i][j].imageSet = false;
            }
        }

        let stickerNumber: number = seatedStickerNumber - Object.keys(seatedStickers).length;
        for (const item in seatedStickers) {
            if (seatedStickers.hasOwnProperty(item) && (seatedStickers[item].id.toString() !== selectedSticker.id.toString())) {
                newSeatedStickers[`${packageNumber}_${stickerNumber}`] = seatedStickers[item];
                stickerNumber++;
            }
        }

        for (let i: number = maxMin.min.i; i < maxMin.max.i + 1; i++) {
            for (let j: number = maxMin.min.j; j < maxMin.max.j + 1; j++) {
                newState.blocks[i][j].imageSet = false;
                newState.blocks[i][j].color = "";
            }
        }

        newState.seatedStickers = newSeatedStickers;
        newState.seatedStickerNumber = stickerNumber;
        newState.complete = false;
        setStickers(newState.seatedStickers);
        this.setState(newState);
    };

    handleCreateTxtFiles = (data: any, blocksCount: number): any => {
        const boxes: any = createBoxes(blocksCount);
        const files: Array<any> = [];

        for (let i: number = 0; i < blocksCount; i++) {
            const textContent: any = [];

            for (const item in data) {
                if (data.hasOwnProperty(item)) {
                    let includesMin: boolean = false;
                    let includesMax: boolean = false;
                    boxes[i].map(box => {
                        if (box.includes(data[item].maxMin.min.j) && box.includes(data[item].maxMin.min.i)) {
                            includesMin = true;
                        }

                        if (box.includes(data[item].maxMin.max.j) && box.includes(data[item].maxMin.max.i)) {
                            includesMax = true;
                        }
                    });

                    if (includesMin && includesMax) {
                        textContent.push({
                            xCount: (Math.abs(data[item].maxMin.min.j - data[item].maxMin.max.j) + 1).toString(),
                            yCount: (Math.abs(data[item].maxMin.min.i - data[item].maxMin.max.i) + 1).toString(),
                            startX: data[item].maxMin.min.j.toString(),
                            startY: data[item].maxMin.min.i.toString(),
                            name: item.toString()
                        });
                    }
                }
            }

            files.push({[`box${i + 1}.txt`]: textContent});
        }

        return files;
    };

    handleSeatedStickersSave = (e: React.MouseEvent<HTMLButtonElement>): any => {
        e.preventDefault();
        const {seatedStickers, blocksCount, loading} = this.state;
        if (loading) {
            return;
        }
        const newState: any = {...this.state};
        newState.loading = true;
        this.setState(newState);

        const arrangedStickers: any = {};
        for (const item in seatedStickers) {
            if (seatedStickers.hasOwnProperty(item)) {
                arrangedStickers[item] = {
                    file: seatedStickers[item].file,
                    maxMin: seatedStickers[item].maxMin
                };
            }
        }

        if (arrangedStickers && Object.keys(arrangedStickers).length > 0) {
            const {stickerPackage: {icons, preview, packageId}} = this.props;
            const packageIcons: FormData = new FormData();

            for (const item in arrangedStickers) {
                if (arrangedStickers.hasOwnProperty(item)) {
                    packageIcons.append(item, arrangedStickers[item].file);
                }
            }
            const boxConfig: string = JSON.stringify(this.handleCreateTxtFiles(seatedStickers, blocksCount));

            packageIcons.append("avatar", icons.avatar);
            packageIcons.append("icon", icons.icon);
            packageIcons.append("banner", icons.banner);
            packageIcons.append("unavailable_icon", icons.unavailable_icon);
            packageIcons.append("preview", preview);
            packageIcons.append("config", boxConfig);

            const toastId: number = showNotification("info", {
                title: "Processing...",
                description: "",
            });
            uploadIcons(packageId, packageIcons).then(response => {
                if (!response.data.err && this.componentState) {
                    this.setState({complete: true, loading: false});
                    showNotification("success", {
                        title: "Success!",
                        description: "Your changes is saved",
                        id: toastId
                    });
                } else {
                    showNotification("error", {
                        title: "You got an error!",
                        description: "Your changes is not saved for unknown reason",
                        id: toastId
                    });
                }
            }).catch(error => console.log(error));
        } else {
            showNotification("error", {
                title: "You got an error!",
                description: "Your must be set all stickers"
            });
        }
    };

    get numberOfBoxes(): any {
        const {blocksCount} = this.state;
        const rows: Array<JSX.Element> = [];
        for (let i: number = 0; i < STICKER_BLOCK_COUNT.LIMIT; i += 2) {
            rows.push(
                <Radio
                    inline={true}
                    key={i}
                    name="blockCount"
                    checked={i + 2 === blocksCount}
                    value={i + 2}
                    onChange={this.handleBlockCountChange}
                > {i + 2}
                </Radio>
            );
        }
        return rows;
    };

    get table(): any {
        const {blocks} = this.state;
        return blocks && blocks.map((block, i) => (
            <tr key={i} style={i % 4 === 0 && i !== 0 ? {borderTop: "3px solid black"} : {}}>
                {block.map((tdData, j) => {
                    const select: any = () => this.handleSelectBlock(i, j);
                    return <td
                        style={{height: "50px", backgroundColor: tdData.color}}
                        onClick={select}
                        key={tdData.id}
                    />;
                })}
            </tr>
        ))
    }

    get stickerIsSet(): boolean {
        const {seatedStickers, selectedSticker} = this.state;
        return selectedSticker && Object.keys(seatedStickers).some(item => seatedStickers[item].id === selectedSticker.id);
    };

    get showSetSticker(): boolean {
        const {blocks, blocksCount, selectedBlocks} = this.state;
        const maxMin: any = findMaxMin(selectedBlocks, blocksCount);
        let allow: boolean = true;

        if (maxMin.max.i === -1 || maxMin.max.j === -1 || maxMin.min.i === blocksCount * 4 || maxMin.min.j === blocksCount * 4) {
            return false;
        }

        for (let i: number = maxMin.min.i; i < maxMin.max.i + 1; i++) {
            for (let j: number = maxMin.min.j; j < maxMin.max.j + 1; j++) {
                if (!blocks[i][j].selected) {
                    allow = false;
                }
            }
        }

        return allow;
    }

    get showSeatedStickers(): any {
        const {seatedStickers} = this.state;
        const images: any = [];
        for (const item in seatedStickers) {
            if (seatedStickers.hasOwnProperty(item)) {
                images.push((
                    <div key={item} style={{...seatedStickers[item].styles, position: "absolute", zIndex: 10}}>
                        <div
                            style={{
                                backgroundImage: `url(${seatedStickers[item].blobUrl})`,
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "center",
                                backgroundSize: "contain",
                                marginLeft: "5%",
                                marginTop: "5%",
                                height: "90%",
                                width: "90%"
                            }}
                        />
                    </div>
                ));
            }
        }
        return images;
    }

    render(): JSX.Element {
        const {changeStep, stickerPackage: {stickers}} = this.props;
        const {selectedSticker, previewBlobUrl, complete, nextStep, loading} = this.state;

        return (
            <div className="container-fluid no-padder">
                <div className="row b-t b-b wrapper-md scroll-sticker" style={{height: window.innerHeight / 2 }}>

                    <div className="col-lg-12">
                        <p className="text-center font-bold text-base m-b-lg">(1) Choose a Sticker, (2) Select the
                            sticker cells on the
                            Preview grid, (3) Press “Set Sticker”
                        </p>
                    </div>
                    {/*Block Count*/}
                    <div className="col-lg-12">
                        <div className="form-group text-center">
                            <label htmlFor="block-count" className="font-bold m-r">Number of Boxes</label>
                            {this.numberOfBoxes}
                        </div>
                    </div>
                    {/*Stickers*/}
                    <div className="col-lg-6">
                        {
                            stickers.map((sticker, i) => {
                                return (
                                    <img
                                        key={i}
                                        id={sticker.id}
                                        onClick={this.handleSelectSticker}
                                        className={`h-100 w-100 contain cursor-pointer
                                            ${selectedSticker && sticker.id === selectedSticker.id ? "img-thumbnail" : "sticker"}`
                                        }
                                        src={sticker.blobUrl}
                                    />
                                )
                            })

                        }
                    </div>
                    {/*Set Sticker table*/}
                    <div className="col-lg-6">
                        {this.showSeatedStickers}
                        <Table
                            hover={true}
                            condensed={true}
                            responsive={true}
                            style={{width: "376px"}}
                        >
                            <tbody
                                style={{
                                    backgroundImage: `url(${previewBlobUrl})`,
                                    backgroundSize: "cover",
                                    backgroundRepeat: "no-repeat"
                                }}
                            >
                            {this.table}
                            </tbody>
                        </Table>
                    </div>
                </div>
                <div className="row wrapper">
                    <div className="col-lg-4">
                        <button
                            className="btn btn-default"
                            onClick={changeStep}
                            data-tab-key={STICKERS.TABS.UPLOAD}
                        >Back
                        </button>
                    </div>
                    <div className="col-lg-4 text-center">
                        {this.stickerIsSet ?
                            <button
                                className="btn btn-danger btn-block"
                                onClick={this.handleResetSticker}
                            >Reset
                            </button> :
                            this.showSetSticker ?
                                <button
                                    className="btn btn-info btn-block"
                                    onClick={this.handleSetSticker}
                                >Set sticker
                                </button> :
                                <span className="text-info">
                                    {selectedSticker ? "(2) Select Sticker Cells" : "(1) Choose a Sticker"}
                                </span>
                        }
                    </div>
                    <div className="col-lg-4">
                        <button
                            className="btn btn-info pull-right"
                            data-tab-key={STICKERS.TABS.CONFIGURATIONS.BASE}
                            disabled={!complete}
                            onClick={changeStep}
                        >Next
                        </button>
                        <button
                            className="btn btn-default pull-right m-r-sm"
                            onClick={this.handleSeatedStickersSave}
                            disabled={!nextStep || complete}
                        >Save
                            {loading ?
                                <i className="fa fa-spinner fa-spin m-l-xs"/>
                                : complete ? <i className="fa fa-check m-l-xs"/> : null}
                        </button>
                    </div>
                </div>
                <ToastContainer/>
            </div>
        )
    }
}

export default ArrangeStickers;
