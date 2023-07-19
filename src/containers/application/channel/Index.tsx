import * as React from "react";
import {AxiosResponse} from "axios";
import * as moment from "moment";
import {Link} from "react-router-dom";
import Table from "react-bootstrap/es/Table";
import {ToastContainer} from "react-toastify";
import {getChannels, deleteChannel} from "ajaxRequests/channel";
import {PAGE_NAME} from "configs/constants";
import {dateTimePickerRanges, getCurrentOffset, pickerLabel} from "helpers/DataHelper";
import MoreActions from "components/Common/MoreActions";
import Pagination from "components/Common/Pagination";
import {selectMenuStyles, showNotification} from "helpers/PageHelper";
import Loading from "components/Common/Loading";
import {IVALIDATION} from "services/interface";
import Popup from "components/Common/Popup";
import FormGroup from "react-bootstrap/es/FormGroup";
import ControlLabel from "react-bootstrap/es/ControlLabel";
import FormControl from "react-bootstrap/es/FormControl";
import * as DatetimeRangePicker from "library/react-bootstrap-datetimerangepicker/lib/index";
import Select from "react-select";

interface IIndexState {
    loading: boolean,
    channels: {
        count: any,
        list: any[]
    },
    offset: number,
    limit: number,
    request: {
        reset: {
            isDisabled: boolean,
            isProcessing: boolean
        },
        search: {
            isChanged: boolean,
            isDisabled: boolean,
            isProcessing: boolean
        },
        remove: {
            processing: boolean
        },
        create: {
            processing: boolean,
            disabled: boolean,
        },
        pagination: boolean,
        fetchCount: boolean,
        isLoading: boolean
    },
    popup: {
        remove: {
            show: boolean
            message: any
        },
        create: {
            show: boolean,
            processing: false,
            disabled: true
        },
    },
    validation: {
        nickname: IVALIDATION,
        description: IVALIDATION,
        label: IVALIDATION
    },
    ranges: any,
    initialFilters: any,
    roomName: string
}

class Index extends React.Component<any, IIndexState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            loading: true,
            channels: {
                count: "",
                list: []
            },
            offset: 0,
            limit: 20,
            request: {
                reset: {
                    isDisabled: true,
                    isProcessing: false
                },
                search: {
                    isChanged: false,
                    isDisabled: true,
                    isProcessing: false
                },
                remove: {
                    processing: false
                },
                create: {
                    processing: false,
                    disabled: true
                },
                pagination: false,
                fetchCount: true,
                isLoading: false
            },
            popup: {
                remove: {
                    show: false,
                    message: {},
                },
                create: {
                    show: false,
                    processing: false,
                    disabled: true
                }
            },
            validation: {
                nickname: {
                    value: null,
                    message: ""
                },
                description: {
                    value: null,
                    message: ""
                },
                label: {
                    value: null,
                    message: ""
                }
            },
            ranges: dateTimePickerRanges(),
            initialFilters: {
                registration: {
                    startDate: "",
                    endDate: "",
                },
                name: "",
                paid: {
                    selected: {value: "all", label: "All"},
                    options: [
                        {value: "all", label: "All"},
                        {value: "paid", label: "Paid"},
                        {value: "free", label: "Free"},
                    ]
                },
            },
            roomName: null,
        }

    }

    componentDidMount(): void {
        document.title = PAGE_NAME["/channel"];
        const {offset} = this.state;
        const newState: IIndexState = {...this.state};
        this.initRequests(offset, newState);
    }

    initRequests = (offset: number, state: IIndexState, isPaging: boolean = false): void => {
        const {limit, loading} = state;

        let startDate: any;
        let endDate: any;
        if (state.initialFilters.registration.startDate === "") {
            startDate = null;
        } else {
            const startDateArr: any = state.initialFilters.registration.startDate.format("YYYY-MM-DD HH:mm:ss").split(" ");
            const startDateArr1: any = startDateArr[0].split("-");
            const startDateArr2: any = startDateArr[1].split(":")
            startDate = new Date(
              startDateArr1[0], startDateArr1[1] - 1, startDateArr1[2], parseInt(startDateArr2[0]), parseInt(startDateArr2[1]), parseInt(startDateArr2[2])).getTime();
            console.log(startDate, 1598472000000)
        }
        if (state.initialFilters.registration.endDate === "") {
            endDate = null
        } else {
            const endDateArr: any = state.initialFilters.registration.endDate.format("YYYY-MM-DD HH:mm:ss").split(" ");
            const endDateArr1: any = endDateArr[0].split("-");
            const endDateArr2: any = endDateArr[1].split(":")
            endDate = new Date(endDateArr1[0], endDateArr1[1] - 1, endDateArr1[2], parseInt(endDateArr2[0]), parseInt(endDateArr2[1]), parseInt(endDateArr2[2])).getTime();
        }
        const channelName: string = state.initialFilters.name.toLowerCase();
        let paid: boolean;
        if (state.initialFilters.paid.selected.value === "paid") {
            paid = true;
        } else if (state.initialFilters.paid.selected.value === "free") {
            paid = false;
        }
        getChannels({offset, limit, startDate, endDate, channelName, paid}).then(({data}: AxiosResponse) => {
            console.log(data, "data1234")
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            state.request.search.isProcessing = false;
            state.request.reset.isProcessing = false;
            state.request.isLoading = false;
            state.request.fetchCount = false;
            state.channels.list = data.result.channelList || [];
            if (data.result.count !== undefined) {
                state.channels.count = data.result.count;
            }

            if (loading) {
                state.loading = false;
            }
            if (isPaging) {
                state.request.pagination = false;
                state.offset = offset;
            }
            this.componentState && this.setState(state);
        }).catch(e => {
            console.log(e);
            if (loading) {
                state.loading = false;
            }
            if (isPaging) {
                state.request.pagination = false;
            }
            if (this.componentState) {
                this.setState(state);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot get payments' tier groups",
                    timer: 3000
                });
            }
        })
    };

    handleListChange = (e: React.MouseEvent<HTMLButtonElement>): void => {
        const {offset} = this.state;
        const newState: IIndexState = {...this.state};
        const currentOffset: number = getCurrentOffset(offset, e);
        newState.request.pagination = true;
        this.setState(newState);
        this.initRequests(currentOffset, newState, true);
    };

    handleRemoveModalOpen = (e: React.MouseEvent<HTMLButtonElement>, roomName: string): void => {
        e.stopPropagation();
        const newState: IIndexState = {...this.state};
        newState.popup.remove.show = true;
        newState.popup.remove.message = {
            info: "Are you sure you want to delete?",
            apply: "Apply",
            cancel: "Cancel",
        };
        newState.roomName = roomName;
        this.setState(newState);
    };

    handleRemoveModalClose = (): void => {
        const newState: IIndexState = {...this.state};
        newState.popup.remove.show = false;
        newState.popup.remove.message = {};
        newState.roomName = null;
        this.setState(newState);
    };

    handleEditNetwork = (roomName: number): void => {
        if (roomName) {
            try {
                const {history} = this.props;
                history.push(`/channel/${roomName}`)
            } catch (e) {
                console.log(e);
            }
        }
    };

    handleNetworkDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const {channels, roomName} = this.state;
        const newState: IIndexState = {...this.state};
        newState.request.remove.processing = true;
        newState.popup.remove.show = false;
        newState.roomName = null;
        this.setState(newState);
        const toastId: number = showNotification("info", {
            title: "Deleting...",
            description: "",
        });

        deleteChannel(roomName).then(({data}: AxiosResponse) => {
            if (data.err) {
                throw new Error(JSON.stringify(data));
            }
            newState.channels.list = channels.list.filter(item => item.roomName !== roomName);
            newState.request.remove.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("success", {
                    title: "Success!",
                    description: "Channel successfully deleted",
                    id: toastId
                });
            }
        }).catch(e => {
            console.log(e);
            newState.request.remove.processing = false;
            if (this.componentState) {
                this.setState(newState);
                showNotification("error", {
                    title: "You've got an error!",
                    description: "Cannot delete Channel for unknown reason",
                    id: toastId
                });
            }
        })
    };

    handleChannelNameChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>): void => {
        const newState: IIndexState = {...this.state};
        newState.initialFilters.name = value;
        this.setState(newState);
    }

    handleCreatedApply = (e: React.MouseEvent<HTMLInputElement>, picker: any) => {
        e.preventDefault();
        const newState: IIndexState = {...this.state};
        newState.initialFilters.registration.startDate = picker.startDate;
        newState.initialFilters.registration.endDate = picker.endDate;
        this.setState(newState);
    }

    handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
    }

    handleReset = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const newState: IIndexState = {...this.state};
        newState.initialFilters = {
            registration: {
                startDate: "",
                endDate: "",
            },
            name: "",
            paid: {
                selected: {value: "all", label: "All"},
                options: [
                    {value: "all", label: "All"},
                    {value: "paid", label: "Paid"},
                    {value: "free", label: "Free"},
                ]
            },
        }

        newState.request.isLoading = true;
        newState.request.fetchCount = true;
        newState.request.reset.isDisabled = true;
        newState.request.reset.isProcessing = true;
        this.setState(newState);
        this.initRequests(0, newState, false);
    }

    handleSearch = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const newState: IIndexState = {...this.state};
        newState.request.reset.isDisabled = false;
        newState.request.search.isProcessing = true;
        newState.request.isLoading = true;
        newState.request.fetchCount = true;
        newState.offset = 0;
        this.setState(newState);
        this.initRequests(newState.offset, newState, true);
    }

    handlePaidChange = (selectedOption: any): void => {
        const newState: IIndexState = {...this.state};
        newState.initialFilters.paid.selected = selectedOption;
        this.setState(newState);
    }

    render(): JSX.Element {
        const {channels, loading, offset, limit, request: {pagination, fetchCount, reset, search, isLoading}, popup, ranges, initialFilters} = this.state;

        return (
            <div className="box-shadow r-3x bg-white">
                <ToastContainer/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <span className="text-xsl padder-t-3">{PAGE_NAME["/channel"]}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <hr/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">

                            {/*Phone number*/}
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="phone-number">Channel Subject / Nickname</ControlLabel>
                                    <FormControl
                                      name="phone-number"
                                      id="phone-number"
                                      onChange={this.handleChannelNameChange}
                                      value={initialFilters.name}
                                      placeholder="Channel Subject / Nickname"
                                      autoComplete={"new-password"}
                                    />
                                </FormGroup>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="registration">Created date</ControlLabel>
                                    <DatetimeRangePicker
                                      name="date"
                                      onApply={this.handleCreatedApply}
                                      ranges={ranges}
                                      applyClass="btn-info"
                                    >
                                        <div className="input-group">
                                            <input
                                              className="form-control"
                                              id="registration"
                                              name="registration"
                                              value={pickerLabel(initialFilters.registration.startDate, initialFilters.registration.endDate)}
                                              onChange={this.handlePickerChange}
                                            />
                                            <span className="input-group-btn">
                                                <button className="btn btn-default default date-range-toggle">
                                                <i className="fa fa-calendar"/>
                                                </button>
                                            </span>
                                        </div>
                                    </DatetimeRangePicker>
                                </FormGroup>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                                <FormGroup>
                                    <ControlLabel htmlFor="paid-type">All/ Paid/ Free</ControlLabel>
                                    <Select
                                        name="paid-free"
                                        value={initialFilters.paid.selected}
                                        options={initialFilters.paid.options}
                                        styles={selectMenuStyles}
                                        onChange={this.handlePaidChange}
                                        placeholder="Paid/Free"
                                        closeMenuOnSelect={true}
                                    />
                                </FormGroup>
                            </div>
                        </div>
                    </div>
                </div>
                <hr/>
                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-4">
                                        <span className="block text-xl padder-t-8">
                                            {(isLoading || fetchCount) ? <Loading isSmall={true}/> : channels.count}
                                        </span>
                                <span className="block">Number of users</span>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-6 col-xs-8 text-right padder-t-16">
                                {/*<DropdownButton title="Add filter" id="add-filter">{addFilter}</DropdownButton>*/}
                                <button
                                  className="btn btn-default m-l-sm"
                                  disabled={reset.isDisabled || reset.isProcessing}
                                  onClick={this.handleReset}
                                >Reset{reset.isProcessing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                </button>
                                <button
                                  className="btn btn-info m-l-sm"
                                  disabled={search.isProcessing || loading}
                                  onClick={this.handleSearch}
                                >Search{search.isProcessing && <i className="fa fa-spinner fa-spin m-l-xs"/>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {loading ? <Loading/> :
                    <Table
                        hover={true}
                        condensed={true}
                        responsive={true}
                    >
                        <thead>
                            <tr>
                                <th/>
                                <th>Channel Subject</th>
                                <th>Unique Name</th>
                                <th>Created Date</th>
                                <th/>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            channels.list.length === 0 &&
                            <tr>
                                <td colSpan={4}>No result</td>
                            </tr>
                        }

                        {channels.list.map((channel, index) => {
                            const N: number = offset * limit + index + 1;
                            const deleteChannel: any = (e: React.MouseEvent<HTMLButtonElement>) => this.handleRemoveModalOpen(e, channel.roomName);
                            const editNetwork: any = () => this.handleEditNetwork(channel.roomName);
                            return (
                                <tr key={N} className="cursor-pointer" onClick={editNetwork}>
                                    <td>{N}</td>
                                    <td>{channel.subject}</td>
                                    <td>{channel.nickname}</td>
                                    <td>{moment(channel.createdAt).format("MMMM Do YYYY")}</td>
                                    <td>
                                        <MoreActions
                                            isDropup={(index === channels.list.length - 1) && channels.list.length !== 1}
                                            isAbsolute={true}
                                        >
                                            <li>
                                                <Link
                                                    to={`/channel/${channel.roomName}`}
                                                >
                                                    Edit
                                                </Link>
                                            </li>
                                            <li>
                                                <a href="javascript:void(0);" onClick={deleteChannel}>
                                                    Delete
                                                </a>
                                            </li>
                                        </MoreActions>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </Table>}

                <div className="content-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            {
                                !loading && channels.count > limit &&
                                <div>
                                    <div className="col-lg-6 col-md-6 col-xs-6 col-sm-6">
                                        <span className="text-xs">{`Showing ${limit} of ${channels.count}`}</span>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                        <Pagination
                                            offset={offset}
                                            limit={limit}
                                            callback={this.handleListChange}
                                            length={channels.list.length}
                                            disabled={pagination}
                                        />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <Popup
                    show={popup.remove.show}
                    message={popup.remove.message}
                    hideModal={this.handleRemoveModalClose}
                    confirmAction={this.handleNetworkDelete}
                />
            </div>
        );
    }
}

export default Index;
