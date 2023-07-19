"use strict";

import * as Raven from "raven-js";
import {createLogger} from "redux-logger";
import {applyMiddleware, createStore, Store} from "redux";
import createSagaMiddleware, {SagaMiddleware} from "redux-saga";

import selector from "services/selector";

export default (() => {

    let thisRootReducer: any;
    let thisRootSaga: any;
    let store: Store<any>;

    function createStoreObject(rootReducer: any, rootSaga: any): Store<any> {

        let newStore: Store<any>;

        const sagaMiddleware: SagaMiddleware<any> = createSagaMiddleware({
            onError: (error) => {
                console.log(error);
                Raven.captureException(error);
            }
        });
        const applyMiddleWareArgs: Array<any> = [sagaMiddleware];

        // if (process.env && process.env.ENVIRONMENT !== "production") {
        //     const logger: any = createLogger({
        //         collapsed: false,
        //         stateTransformer: state => selector(state)
        //     });
        //     applyMiddleWareArgs.push(logger);
        //
        // }
        newStore = createStore(rootReducer, applyMiddleware.apply(null, applyMiddleWareArgs));

        sagaMiddleware.run(rootSaga);

        return newStore;
    }

    return {
        setParams: (rootReducer: any, rootSaga: any) => {
            thisRootReducer = rootReducer;
            thisRootSaga = rootSaga;
        },
        getStore: () => {
            if (!thisRootReducer || !thisRootSaga) {
                return undefined;
            }

            if (!store) {
                store = createStoreObject(thisRootReducer, thisRootSaga);
            }

            return store;
        }
    }
})();
