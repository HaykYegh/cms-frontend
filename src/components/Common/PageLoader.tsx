"use strict";

import * as React from "react";
import {Table} from "react-bootstrap";
import ReactPlaceholder from "react-placeholder";
import {PLACEHOLDER_SHIMMER_LIMIT} from "configs/constants";

interface IPageLoaderProps {
    showBtn?: boolean,
    className?: string,
    limit?: number,
    float?: boolean,
}

export default function PageLoader({showBtn = true, float = true, className = "", limit = PLACEHOLDER_SHIMMER_LIMIT}: IPageLoaderProps): JSX.Element {
    const createPlaceholder: any = () => {
        const textRow: Array<any> = [];
        for (let i: number = 0; i < limit; i++) {

            // textRow.push(
            //     <ReactPlaceholder
            //         color="#e3e9f3"
            //         key={i}
            //         style={{height: 34, margin: "0 0 3px 0"}}
            //         ready={false}
            //         showLoadingAnimation={true}
            //         type="textRow"
            //     >&nbsp;
            //     </ReactPlaceholder>)
        }
        return textRow
    };
    return (
        <div className={`${float ? "col-lg-12 col-md-12 col-sm-12 col-xs-12 " : ""}${className}`}>
            {/*{*/}
            {/*    showBtn && <ReactPlaceholder*/}
            {/*        ready={false}*/}
            {/*        color="#e3e9f3"*/}
            {/*        showLoadingAnimation={true}*/}
            {/*        type="rect"*/}
            {/*        style={{width: 150, height: 34, marginBottom: "30px"}}*/}
            {/*    >&nbsp;*/}
            {/*    </ReactPlaceholder>*/}
            {/*}*/}

            {createPlaceholder()}
        </div>
    )
}
