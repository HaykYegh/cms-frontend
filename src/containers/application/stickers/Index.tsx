"use strict";

import * as React from "react";
import {connect} from "react-redux";
import format from "date-fns/format";
import {Link} from "react-router-dom";
import Table from "react-bootstrap/es/Table";
import {ToastContainer} from "react-toastify";

import {deleteStickerPackage, getStickers} from "ajaxRequests/sticker";
import MoreActions from "components/Common/MoreActions";
import Pagination from "components/Common/Pagination";
import {getCurrentOffset} from "helpers/DataHelper";
import {showNotification} from "helpers/PageHelper";
import Loading from "components/Common/Loading";
import {PAGE_NAME} from "configs/constants";
import Popup from "components/Common/Popup";
import selector, {IStoreProps} from "services/selector";

interface IIndexState {
    isLoading: boolean,
    popup: {
        isShown: boolean,
        message: any,
    };
    stickers: any,
    offset: number,
    limit: number,
    request: {
        isDeleted: boolean,
        isPaging: boolean
    },
    stickerPackageId: number,
}

interface IIndexProps extends IStoreProps {
    userProfile?: any,
    history?: any
}

class Index extends React.Component<IIndexProps, IIndexState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            stickerPackageId: null,
            isLoading: true,
            stickers: null,
            offset: 0,
            limit: 50,
            popup: {
                isShown: false,
                message: {},
            },
            request: {
                isDeleted: false,
                isPaging: false
            }
        }
    }

    componentWillMount(): void {
        document.title = PAGE_NAME["/stickers"];
    }

    componentDidMount(): void {
        const {offset} = this.state;
        getStickers(offset).then(stickers => {
            const newState: any = {...this.state};

            if (!stickers.data.err) {
                newState.stickers = stickers.data.result;
            } else {
                console.log("Error during getting stickers");
            }

            newState.isLoading = false;

            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(error => console.log(error));
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleListChange = (e: React.MouseEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const {offset} = this.state;
        const newState: any = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);

        newState.request.isPaging = true;
        this.setState(newState);

        getStickers(currentOffset).then(stickers => {
            if (!stickers.data.err) {
                newState.stickers = stickers.data.result;
            } else {
                console.log("Error during getting stickers");
            }
            newState.offset = currentOffset;
            newState.request.isPaging = false;
            newState.isLoading = false;
            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(error => console.log(error));
    };

    handleStickerEdit = (packageId: number): void => {
        const {userProfile} = this.props;
        if (userProfile.readonly) {
            return
        }
        const {history} = this.props;
        history && history.push(`/stickers/${packageId}`);
    };

    handleStickerPackageDelete = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const {request, stickerPackageId} = this.state;
        const newState: any = {...this.state};
        const toastId: number = showNotification("info", {
            title: "Processing...",
            description: "",
        });

        if (!request.isDeleted) {
            newState.request.isDeleted = true;
            newState.popup.isShown = false;
            this.setState(newState);
            deleteStickerPackage(stickerPackageId).then(response => {
                if (!response.data.err) {
                    showNotification("success", {
                        title: "Success!",
                        description: "This sticker package was deleted",
                        id: toastId
                    });
                    newState.stickers = newState.stickers.filter(item => item.package_id !== stickerPackageId);
                } else {
                    showNotification("error", {
                        title: "You got an error!",
                        description: "This sticker package is not deleted",
                        id: toastId
                    });
                }
                newState.request.isDeleted = false;
                newState.stickerPackageId = null;
                if (this.componentState) {
                    this.setState(newState);
                }
            }).catch(error => console.log(error));
        }
    };

    handleModalOpen = (e: React.MouseEvent<HTMLElement>, packageId: number): void => {
        e.stopPropagation();
        const newState: IIndexState = {...this.state};
        newState.popup.isShown = true;
        newState.popup.message = {
            info: "Are you sure delete?",
            apply: "Apply",
            cancel: "Cancel",
        };
        newState.stickerPackageId = packageId;
        this.setState(newState);
    };

    handleModalClose = (): void => {
        const newState: IIndexState = {...this.state};
        newState.popup.isShown = false;
        newState.stickerPackageId = null;
        this.setState(newState);
    };

    render(): JSX.Element {
        const {isLoading, popup, stickers, offset, limit, request: {isPaging}} = this.state;
        const {userProfile} = this.props

        return (
            <div className="box-shadow r-3x bg-white">
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl padder-t-3">{PAGE_NAME["/stickers"]}</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                {!userProfile.readonly && <div className="text-right">
                                    <Link
                                        to={"/stickers/create"}
                                        className="btn btn-default btn-addon"
                                    ><i className="fa fa-plus"/>Create Sticker Pack
                                    </Link>
                                </div>}
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading ? <Loading/> :
                    <Table
                        hover={true}
                        condensed={true}
                        responsive={true}
                    >
                        <thead>
                        <tr>
                            <th/>
                            <th>Name</th>
                            <th>Note</th>
                            <th>Created on</th>
                            <th>Status</th>
                            <th>Order</th>
                            {!userProfile.readonly && <th/>}
                        </tr>
                        </thead>
                        <tbody>
                        {
                            stickers && stickers.length === 0 &&
                            <tr>
                                <td colSpan={7}>No results</td>
                            </tr>
                        }
                        {
                            stickers && stickers.map((item, index) => {
                                    const N: number = offset * limit + index + 1;
                                    const editSticker: any = () => this.handleStickerEdit(item.package_id);
                                    const deleteSticker: any = (e: React.MouseEvent<HTMLElement>) => this.handleModalOpen(e, item.package_id);
                                    return (
                                        <tr key={N} className="cursor-pointer" onClick={editSticker}>
                                            <td>{N}</td>
                                            <td>{item.label}</td>
                                            <td>{item.note}</td>
                                            <td>{format(new Date(item.created_at), "DD MMM YYYY hh:mm A")}</td>
                                            <td>{item.status}</td>
                                            <td>{item.order_number}</td>
                                            {!userProfile.readonly && <td>
                                                <MoreActions
                                                    isDropup={(index === stickers.length - 1) && stickers.length !== 1}
                                                    isAbsolute={true}
                                                >
                                                    <li>
                                                        <Link
                                                            to={`/stickers/${item.package_id}`}
                                                        >Edit
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0);" onClick={deleteSticker}>
                                                            Delete
                                                        </a>
                                                    </li>
                                                </MoreActions>
                                            </td>}
                                        </tr>
                                    )
                                }
                            )}
                        </tbody>
                    </Table>}

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            {
                                !isLoading && stickers && stickers.length > 0 &&
                                <div>
                                    <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6">
                                        <span className="text-xs hidden">{`Showing 1 to ${limit} of ${stickers.count} entries`}</span>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                        <Pagination
                                            offset={offset}
                                            limit={limit}
                                            callback={this.handleListChange}
                                            data={stickers}
                                            disabled={isPaging}
                                        />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>

                <Popup
                    show={popup.isShown}
                    message={popup.message}
                    hideModal={this.handleModalClose}
                    confirmAction={this.handleStickerPackageDelete}
                />
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Index);
