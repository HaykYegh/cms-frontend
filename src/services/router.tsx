"use strict";

import * as React from "react";
import Loadable from "react-loadable";
import {Route, Redirect, Switch} from "react-router-dom";

import {ACCESS_HEADERS, LOGGED_ROUTER_REDIRECT} from "configs/constants";
import {eraseCookie, getCookie} from "helpers/CookieHelper";
import {ROUTER_CONFIG} from "configs/routerConfig";
import {removeUserData} from "helpers/DataHelper";
import Loading from "components/Common/Loading";

const virtualRouter: any = {
    root: {
        path: "/",
        auth: false
    },
    login: {
        path: "/login",
        component: Loadable({
            loader: () => import("containers/authentication/Login"),
            loading: () => <Loading initial={true}/>
        }),
        auth: false
    },
    statistics: {
        path: "/statistics",
        component: Loadable({
            loader: () => import("containers/application/stats/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    stickers: {
        path: "/stickers",
        component: Loadable({
            loader: () => import("containers/application/stickers/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    createSticker: {
        path: "/stickers/create",
        component: Loadable({
            loader: () => import("containers/application/stickers/create/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    updateSticker: {
        path: "/stickers/:id",
        component: Loadable({
            loader: () => import("containers/application/stickers/update/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    settings: {
        path: "/settings",
        component: Loadable({
            loader: () => import("containers/application/settings/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    createEmail: {
        path: "/settings/email/create",
        component: Loadable({
            loader: () => import("containers/application/settings/email/Create"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    updateEmail: {
        path: "/settings/email/update/:id",
        component: Loadable({
            loader: () => import("containers/application/settings/email/Update"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    users: {
        path: "/users",
        component: Loadable({
            loader: () => import("containers/application/users/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    usersWidthNickname: {
        path: "/users",
        component: Loadable({
            loader: () => import("containers/application/usersWidthNickname/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    // notVerifiedUsers: {
    //     path: "/not-verified-users",
    //     component: Loadable({
    //         loader: () => import("containers/application/users/NotVerified"),
    //         loading: Loading
    //     }),
    //     auth: true,
    // },
    user: {
        path: "/users/:id",
        component: Loadable({
            loader: () => import("containers/application/users/view"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    userWidthNickname: {
        path: "/users/:id",
        component: Loadable({
            loader: () => import("containers/application/usersWidthNickname/view"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    gateways: {
        path: "/gateways",
        component: Loadable({
            loader: () => import("containers/application/gateways/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    createGateway: {
        path: "/gateways/create",
        component: Loadable({
            loader: () => import("containers/application/gateways/Create"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    editGateway: {
        path: "/gateways/:id",
        component: Loadable({
            loader: () => import("containers/application/gateways/Update"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    notify: {
        path: "/notify",
        component: Loadable({
            loader: () => import("containers/application/notification/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    notifyWidthNickname: {
        path: "/notify",
        component: Loadable({
            loader: () => import("containers/application/notificationWidthNickname/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    network: {
        path: "/network",
        component: Loadable({
            loader: () => import("containers/application/network/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    updateNetwork: {
        path: "/network/:id",
        component: Loadable({
            loader: () => import("containers/application/network/update/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    channel: {
        path: "/channel",
        component: Loadable({
            loader: () => import("containers/application/channel/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    updateChannel: {
        path: "/channel/:id",
        component: Loadable({
            loader: () => import("containers/application/channel/update/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    billing: {
        path: "/billing",
        component: Loadable({
            loader: () => import("containers/application/billing/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    createCreditCard: {
        path: "/payment/create",
        component: Loadable({
            loader: () => import("containers/application/billing/methods/Create"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    managePayment: {
        path: "/manage-payment",
        component: Loadable({
            loader: () => import("containers/application/managePayment/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    updateManagePayment: {
        path: "/manage-billing/:id",
        component: Loadable({
            loader: () => import("containers/application/managePayment/tierGroups/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    sales: {
        path: "/sales",
        component: Loadable({
            loader: () => import("containers/application/sales/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    salesWithNickname: {
        path: "/sales",
        component: Loadable({
            loader: () => import("containers/application/salesWithNickname/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    payments: {
        path: "/payments",
        component: Loadable({
            loader: () => import("containers/application/payments/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    paymentsWithNickname: {
        path: "/payments",
        component: Loadable({
            loader: () => import("containers/application/paymentsWithNickname/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    callPackage: {
        path: "/call-package",
        component: Loadable({
            loader: () => import("containers/application/callPackage/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    createCallPackage: {
        path: "/call-package/create",
        component: Loadable({
            loader: () => import("containers/application/callPackage/Create"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    updateCallPackage: {
        path: "/call-package/:id",
        component: Loadable({
            loader: () => import("containers/application/callPackage/Update"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    callingCards: {
        path: "/calling-cards",
        component: Loadable({
            loader: () => import("containers/application/callingCards/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    calls: {
        path: "/calls",
        component: Loadable({
            loader: () => import("containers/application/calls/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    chatBots: {
        path: "/chat-bots",
        component: Loadable({
            loader: () => import("containers/application/chatBots/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    createChatBot: {
        path: "/chat-bots/create",
        component: Loadable({
            loader: () => import("containers/application/chatBots/Create"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    updateChatBot: {
        path: "/chat-bots/:id",
        component: Loadable({
            loader: () => import("containers/application/chatBots/Update"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    customers: {
        path: "/customers",
        component: Loadable({
            loader: () => import("containers/application/customers/Index"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    providers: {
        path: "/providers",
        component: Loadable({
            loader: () => import("containers/application/providers"),
            loading: () => <Loading contentLoading={true}/>
        }),
        auth: true
    },
    requestResetPassword: {
        path: "/request-reset-password",
        component: Loadable({
            loader: () => import("containers/authentication/RequestResetPassword"),
            loading: () => <Loading initial={true}/>
        }),
        auth: false
    },
    resetPassword: {
        path: "/reset-password/:id",
        component: Loadable({
            loader: () => import("containers/authentication/ResetPassword"),
            loading: () => <Loading initial={true}/>
        }),
        auth: false
    },
    signUp: {
        path: "/sign-up",
        component: Loadable({
            loader: () => import("containers/authentication/SignUp"),
            loading: () => <Loading initial={true}/>
        }),
        auth: false
    },
    init: {
        path: "*",
        auth: false
    },
};

const loggedIn: any = (): boolean => {
    let isLogged: boolean = true;
    const cookie: string = getCookie(ACCESS_HEADERS);
    const user: string = localStorage.getItem("user");
    if (!cookie || !user) {
        eraseCookie(ACCESS_HEADERS);
        removeUserData(["user", "userAttributes"]);
        isLogged = false;
    }
    return isLogged;
};

const isLoggedIn: any = (component: any, props?: any): any => {
    if (!loggedIn()) {
        return <Redirect to="/login"/>;
    } else {
        return React.createElement(component, props);
    }
};

const publicPages: any = (component: any, props?: any): any => {
    if (loggedIn()) {
        return <Redirect to={LOGGED_ROUTER_REDIRECT}/>;
    } else if (component) {
        return React.createElement(component, props);
    } else {
        return <Redirect to="/login"/>;
    }
};

const routerInstance: any = [];
for (const item in virtualRouter) {
    if (virtualRouter.hasOwnProperty(item)) {
        const path: string = virtualRouter[item].path;
        const auth: any = virtualRouter[item].auth;
        const component: any = virtualRouter[item].component || null;
        const handleRender: any = (props: any): void => {
            return auth ? isLoggedIn.call(null, component, props) : publicPages.call(null, component, props);
        };
        if (ROUTER_CONFIG[item]) {
            routerInstance.push(
                <Route
                    exact={true}
                    key={item}
                    path={path}
                    render={handleRender}
                />
            )
        }
    }
}

export default (): JSX.Element => {
    return (
        <Switch>
            {routerInstance}
        </Switch>
    )
};
