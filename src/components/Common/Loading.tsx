"use strict";

import * as React from "react";

interface ILoginProps {
    initial?: boolean,
    contentLoading?: boolean,
    isSmall?: boolean
}

export default function Loading(props: ILoginProps): JSX.Element {
    const {initial = false, contentLoading = false, isSmall = false}: ILoginProps = props;
    const loaderClassName: string = initial ?
        "initial-loader" : contentLoading ?
            "page-loader" : isSmall ? "small-loader" : "";
    return (
        <div className={`${loaderClassName} loader`}/>
    )
}
