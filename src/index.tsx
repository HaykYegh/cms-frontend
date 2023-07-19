"use strict";

import * as React from "react";
import {render} from "react-dom";
import {Provider} from "react-redux";
import {Route, BrowserRouter} from "react-router-dom";

import "font-awesome/css/font-awesome.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-placeholder/lib/reactPlaceholder.css";
import "react-toastify/dist/ReactToastify.min.css";
import "bootstrap/dist/js/bootstrap.min.js";

import "assets/css/app.css";
import "assets/css/common.css";
import "assets/css/main.css";
import "assets/css/daterangepicker.css";
import "assets/css/font.css";
import "assets/css/zangi.css";

import {getAppConfigurations} from "helpers/AppHelper";
import Layout from "containers/Layout";

const {store} = getAppConfigurations();

const layout: any = (props) => <Layout {...props}/>;
const App: any = (
    <Provider store={store}>
        <BrowserRouter>
            <Route render={layout}/>
        </BrowserRouter>
    </Provider>
);

render(App, document.getElementById("root"));
