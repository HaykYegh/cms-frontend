"use strict";

import * as React from "react";

interface IMoreActionsProps {
    children: any,
    isAbsolute?: boolean,
    isDropup?: boolean
}

export default function MoreActions(props: IMoreActionsProps): JSX.Element {
    const {isAbsolute, isDropup} = props;
    const stopEvents: any = (e: any): void => {
        e.stopPropagation();
    };
    return (
        <div className={`${isDropup ? "dropup-absolute" : isAbsolute ? "dropdown-absolute" : "dropdown"} more-actions text-right`}>
            <button className="btn btn-default dropdown-toggle" data-toggle="dropdown" onClick={stopEvents}>
                <span className="icon-more"/>
            </button>
            <ul className="dropdown-menu">
                {props.children}
            </ul>
        </div>
    )
}
