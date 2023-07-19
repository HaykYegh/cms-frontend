"use strict";

import * as React from "react";
import {Link} from "react-router-dom";

import {LEFT_PANEL_NAVIGATION, LOGGED_ROUTER_REDIRECT, PAGE_NAME} from "configs/constants";
import {ROUTER_CONFIG} from "configs/routerConfig";

// import { ReactComponent as Channel } from "../src/assets/images/channel.svg";

interface ILeftMenuProps {
    pathname: string,
    signOut: (history: any) => void;
    setRef: (ref: any) => void
}

interface ILeftMenuState {
    routes: string[]
}

export default class LeftMenu extends React.Component<ILeftMenuProps, ILeftMenuState> {

    get leftMenuItems(): any {
        let {pathname} = this.props;
        if (pathname === "/") {
            pathname = LOGGED_ROUTER_REDIRECT
        }
        const leftMenuItems: any = [];
        let index: number = 1;
        for (const item in LEFT_PANEL_NAVIGATION) {
            if (LEFT_PANEL_NAVIGATION.hasOwnProperty(item)) {
                const value: string = LEFT_PANEL_NAVIGATION[item];
                const itemClass: string = value.replace("/", "");
                if (ROUTER_CONFIG[item]) {
                    leftMenuItems.push(
                        <li
                            key={item}
                            className={`${itemClass}${pathname.includes(value) ? " active" : ""}`}
                        >
                            <Link to={value}>
                                {itemClass === "payments"
                                  ? <img
                                    style={{
                                    width: "18px",
                                    height: "18px",
                                    marginLeft: "0px",
                                }}
                                    src="assets/images/icons/payments.svg"
                                  /> : <span className={`icon-${itemClass}`}/>}
                                <span>{PAGE_NAME[value]}</span>
                            </Link>
                        </li>
                    );
                    index++;
                }
            }
        }
        return leftMenuItems;
    }

    constructor(props: ILeftMenuProps) {
        super(props);
        const routes: string[] = Object.keys(PAGE_NAME).map(item => item);
        this.state = {
            routes
        }
    }

    shouldComponentUpdate(nextProps: ILeftMenuProps, nextState: ILeftMenuState): boolean {
        return nextProps.pathname !== this.props.pathname;
    }

    componentWillMount(): void {
        const {pathname} = this.props;
        const {routes} = this.state;
        if (!routes.includes(pathname)) {
            return;
        }
    }

    componentDidUpdate(prevProps: ILeftMenuProps, prevState: ILeftMenuState): void {
        if (window.innerWidth < 768) {
            const burgerMenu: any = document.getElementById("hamburger");
            if (burgerMenu.classList.toString().includes("is-active")) {
                burgerMenu.classList.toggle("is-active");
                document.getElementById("app").classList.toggle("app-toggle");
            }
        }
    }

    render(): JSX.Element {
        const {setRef} = this.props;

        return (
            <aside id="aside" className="app-aside bg-aside" ref={setRef}>
                <div className="aside-wrap">
                    <div className="navi-wrap">
                        <nav id="left-menu" className="navi clearfix">
                            <ul className="nav">
                                {this.leftMenuItems}
                            </ul>
                        </nav>
                    </div>
                </div>
            </aside>
        );
    }
}
