"use strict";

import * as React from "react";
import {isEqual} from "lodash";
import ReactPlaceholder from "react-placeholder/lib/ReactPlaceholder";
import Modal from "react-bootstrap/es/Modal";
import UserAttempts from "components/Common/UserAttempts";
import OnlineUsers from "containers/application/stats/OnlineUsers";

interface IBoxBlockProps {
    size?: string,
    color?: string,
    active?: string,
    label?: string,
    value?: string | number,
    name?: string,
    image?: string,
    suffix?: string,
    dataType?: string,
    startDate?: string,
    endDate?: string,
    link?: string,
    linkToCallBack?: any,
    platformId?: number | string,
    handleClick?: (e: React.MouseEvent<HTMLDivElement>) => void,
    handleRequest?: (startDate?: string, endDate?: string, platformId?: number | string) => Promise<any>
}

interface IBoxBlockState {
    fetchData: boolean,
    response: any,
    isOnlineUsersModalShown: boolean;
}

class BoxBlock extends React.Component<any, IBoxBlockState> {

    componentState: any = true;

    constructor(props: any) {
        super(props);
        this.state = {
            fetchData: true,
            response: "0",
            isOnlineUsersModalShown: false
        }
    }

    componentDidMount(): void {
        const {handleRequest, startDate, endDate, platformId} = this.props;
        const newState: any = {...this.state};
        if (handleRequest) {
            handleRequest(startDate, endDate, platformId).then(result => {
                if (!result.data.err) {
                    newState.response = result.data.result.count || result.data.result;
                    newState.fetchData = false;
                } else {
                    console.log("Error during getting response");
                }

                if (this.componentState) {
                    this.setState(newState);
                }

            }).catch(error => console.log(error));
        } else {
            newState.fetchData = false;
            if (this.componentState) {
                this.setState(newState);
            }
        }
    }

    componentDidUpdate(prevProps: IBoxBlockProps): void {
        const {handleRequest, startDate, endDate, platformId} = this.props;
        const newState: any = {...this.state};
        if (!isEqual(prevProps.startDate, startDate) || !isEqual(prevProps.endDate, endDate)) {
            if (handleRequest) {
                handleRequest(startDate, endDate, platformId).then(result => {
                    if (!result.data.err) {
                        newState.response = result.data.result.count || result.data.result;
                        // newState.fetchData = false;
                    } else {
                        console.log("Error during getting response");
                    }

                    if (this.componentState) {
                        this.setState(newState);
                    }

                }).catch(error => console.log(error));
            }
        }
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleClick = (e: React.MouseEvent<HTMLElement>): void => {
        const {linkToCallBack} = this.props;
        const link: string = e.currentTarget.getAttribute("data-link");
        const name: string = e.currentTarget.getAttribute("data-name");

        if (link) {
            linkToCallBack.push(link);
        } else if (name === "online_users") {
            this.setState({isOnlineUsersModalShown: true})
        }
    };

    handleModalClose = () => {
        this.setState({isOnlineUsersModalShown: false});
    };

    render(): JSX.Element {

        const {size, dataType, label, suffix, name, value, link} = this.props;
        const {fetchData, response, isOnlineUsersModalShown} = this.state;
        return (
            <div className={size}>
                <div
                    className="box block-shadow r-4x cursor-pointer"
                    onClick={this.handleClick}
                    data-box-type={dataType}
                    data-link={link}
                    data-name={name}
                >{
                    // fetchData ?
                    //     <ReactPlaceholder
                    //         color="#e3e9f3"
                    //         style={{height: 82, borderRadius: "10px", marginTop: 0}}
                    //         ready={false}
                    //         showLoadingAnimation={true}
                    //         type="textRow"
                    //     >&nbsp;
                    //     </ReactPlaceholder>
                    //     :
                    <div className="flexible">
                        <div className="padder-l-md">
                                <span className="block text-xl">
                                    {value || response}
                                </span>
                            <span className="text-capitalize">{label}</span>
                            {
                                suffix &&
                                <span className="text-sm text-base font-thin"> ({suffix})</span>
                            }
                        </div>
                        <i className={`icon-box-${name}`}/>
                    </div>
                }
                </div>

                {<Modal show={isOnlineUsersModalShown} onHide={this.handleModalClose}>
                    <OnlineUsers count={value}/>
                </Modal>}
            </div>
        );
    }
}

export default BoxBlock;
