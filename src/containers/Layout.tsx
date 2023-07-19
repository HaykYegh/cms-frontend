"use strict";

import * as React from "react";
import {connect} from "react-redux";
import isEqual from "lodash/isEqual";

import {attemptGetUserProfile, attemptSignOut} from "modules/user/UserActions";
import {getStaticData} from "modules/application/ApplicationActions";
import selector, {IStoreProps} from "services/selector";
import {ACCESS_HEADERS} from "configs/constants";
import {getCookie} from "helpers/CookieHelper";
import LeftMenu from "components/LeftMenu";
import {appRouter} from "services/index";
import Header from "components/Header";

interface ILayoutProps extends IStoreProps {
    signOut?: (data: { history: any }) => void,
    getStaticData?: () => void,
    getUserProfile?: () => void,
    location: any,
    history: any,
}

class Layout extends React.Component<ILayoutProps, any> {

    leftPanelRef: any;

    shadowRef: any;

    componentWillMount(): void {
        const cookie: string = getCookie(ACCESS_HEADERS);
        if (cookie) {
            // get and set countries, languages, platform, message send methods to store
            this.props.getStaticData();
            this.props.getUserProfile();
        }
    }

    componentDidUpdate(prevProps: ILayoutProps, prevState: any): void {
        const {location: {pathname}, successMessage} = this.props;
        const cookie: string = getCookie(ACCESS_HEADERS);
        if (!isEqual(prevProps.successMessage, successMessage) && cookie) {
            // get and set counties, languages, platform, message send methods to store
            this.props.getStaticData();
            this.props.getUserProfile();
        }

        if (!isEqual(prevProps.location.pathname, pathname)) {
            if (this.leftPanelRef && this.leftPanelRef.classList.contains("left-panel-toggle") && this.shadowRef.classList.contains("shadow-box")) {
                this.leftPanelRef.classList.toggle("left-panel-toggle");
                this.shadowRef.classList.toggle("shadow-box");
            }
        }
    }

    handleSidebarToggle = (): void => {
        document.getElementById("hamburger").classList.toggle("is-active");
        document.getElementById("app").classList.toggle("app-toggle");
        this.leftPanelRef.classList.toggle("left-panel-toggle");
        this.shadowRef.classList.toggle("shadow-box");
    };

    handleOutSideClick = (event: any) => {
        if (this.leftPanelRef && !event.target.contains(this.leftPanelRef)) {
            this.handleSidebarToggle();
        }
    };

    handleSignOut = (): void => {
        const {history, signOut} = this.props;
        signOut({history});
    };

    handleSetLeftPanelRef = (ref: any) => {
        this.leftPanelRef = ref;
    };

    handleSetShadowRef = (ref: any): void => {
        this.shadowRef = ref;
    };

    render(): JSX.Element {
        const routes: any = appRouter();
        const {location: {pathname}} = this.props;
        const cookie: string = getCookie(ACCESS_HEADERS);

        return (
            <div className={`app${cookie ? "" : " authorization"}`} id="app">
                <div id="shadow-box" className="" ref={this.handleSetShadowRef} onClick={this.handleOutSideClick}/>
                {cookie && <Header
                    signOut={this.handleSignOut}
                    sidebarToggle={this.handleSidebarToggle}
                />
                }
                {
                    cookie &&
                    <LeftMenu
                        signOut={this.handleSignOut}
                        pathname={pathname}
                        setRef={this.handleSetLeftPanelRef}
                    />
                }
                {
                    !cookie ? routes : <div id="content" className="app-content" role="main">
                        <div className="app-content-body">
                            <div className="wrapper-lg">
                                {routes}
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = dispatch => ({
    signOut: ({history}: any) => dispatch(attemptSignOut({history})),
    getStaticData: () => dispatch(getStaticData()),
    getUserProfile: () => dispatch(attemptGetUserProfile())
});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
