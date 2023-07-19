"use strict";

import * as React from "react";
import {Link} from "react-router-dom";

import {toggleFullScreen} from "helpers/DomHelper";
import {IStoreProps} from "services/selector";
import {decrypt} from "helpers/DataHelper";

interface IAppHeaderProps extends IStoreProps {
    sidebarToggle?: (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => void,
    signOut?: (history: any) => void,
    history?: any
}

interface IAppHeaderState {
    fullScreen: boolean,
    user: any,
}

class Header extends React.Component<IAppHeaderProps, IAppHeaderState> {

    componentState: boolean = true;

    constructor(props: IAppHeaderProps) {
        super(props);
        this.state = {
            fullScreen: false,
            user: {},
        }
    }

    componentDidMount(): void {
        document.addEventListener("webkitfullscreenchange", this.handleFullScreenChange, false);
        document.addEventListener("mozfullscreenchange", this.handleFullScreenChange, false);
        document.addEventListener("fullscreenchange", this.handleFullScreenChange, false);
        document.addEventListener("msfullscreenchange", this.handleFullScreenChange, false);
        const newState: IAppHeaderState = {...this.state};
        const {history} = this.props;
        const user: any = localStorage.getItem("user");
        if (user) {
            newState.user = JSON.parse(decrypt(user));
            this.setState(newState);
        } else {
            history.push("/login");
        }

    }

    componentWillUnmount(): void {
        document.removeEventListener("webkitfullscreenchange", this.handleFullScreenChange, false);
        document.removeEventListener("mozfullscreenchange", this.handleFullScreenChange, false);
        document.removeEventListener("fullscreenchange", this.handleFullScreenChange, false);
        document.removeEventListener("msfullscreenchange", this.handleFullScreenChange, false);
    }

    handleToggleFullScreen = (event: React.MouseEvent<HTMLImageElement>): void => {
        event.preventDefault();
        const {fullScreen} = this.state;
        toggleFullScreen();
        this.setState({fullScreen: !fullScreen});
    };

    handleFullScreenChange = (event: any): any => {
        event.preventDefault();
        event.stopPropagation();
        const page: any = document;
        const {fullScreen} = this.state;

        if (!page.fullscreenElement && !page.mozFullScreenElement && !page.webkitFullscreenElement && !page.msFullscreenElement) {
            if (fullScreen) {
                this.setState({fullScreen: false});
            }
        }
    };

    render(): JSX.Element {
        const {signOut, sidebarToggle} = this.props;
        const {user} = this.state;
        return (
            <header id="header" className="navbar bg-header navbar-fixed-top" role="menu">

                <div className="app-header">
                    <div className="logo">
                        <Link to="/" className="navbar-brand text-lt">
                            {
                                process.env.APP_PREFIX === "zz" &&
                                <div>
                                    <img src={"/assets/images/logo.svg"} alt="logo"/>
                                </div>
                            }
                            {
                                process.env.APP_PREFIX === "el" &&
                                <div>
                                    <img src="/assets/images/ello-logos/ello.png" alt="logo" style={{height: 40, width: 40}}/>
                                </div>
                            }
                            <span>{`${user && user.companyName}`}</span>
                            {/*<span>Business Panel</span>*/}
                        </Link>
                    </div>
                    <div className="w-full flex-end">
                        <div>
                            <button
                                className="hamburger hamburger--spring pull-right visible-xs"
                                type="button"
                                id="hamburger"
                                onClick={sidebarToggle}
                            ><span className="hamburger-box"><span className="hamburger-inner"/></span>
                            </button>
                            <ul className="nav navbar-nav visible-sm visible-lg visible-md">
                                <li className="dropdown h-full flexible">
                                    <span
                                        className="email block hidden-sm dropdown-toggle cursor-pointer"
                                        data-toggle="dropdown"
                                    >{user && user.email}
                                    </span>
                                    <span data-toggle="dropdown" className="dropdown-toggle clear user text-xmd">
                                        <span className="caret hidden-xs"/>
                                    </span>

                                    <ul className="dropdown-menu">
                                        <li className="wrapper-sm">
                                            <span className="">{user && user.email}</span>
                                        </li>
                                        <li className="divider"/>
                                        <li>
                                            <Link to="/settings">Settings</Link>
                                        </li>
                                        <li>
                                            <a href="javascript:void(0);" onClick={signOut}>Logout</a>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </header>
        )
    }
}

export default Header;
