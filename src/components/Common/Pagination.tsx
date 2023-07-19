"use strict";

import * as React from "react";
import Button from "react-bootstrap/es/Button";

import {setPaginationRange} from "helpers/DataHelper";
import {LIST} from "configs/constants";

interface IPaginationProps {
    offset: number,
    limit: number,
    data?: any,
    length?: number,
    count?: number,
    disabled?: boolean,
    callback: (e: React.MouseEvent<HTMLButtonElement>) => void,
}

export default function Pagination(props: IPaginationProps): JSX.Element {
    const {offset, limit, callback, data, length, count, disabled = false} = props;
    const {start, end} = setPaginationRange(data, offset, limit, length);
    return (
        <ul className="list-inline text-right">
            {
                offset !== 0 &&
                <li>
                    <Button
                        data-action={LIST.ACTION.RESET}
                        onClick={callback}
                        disabled={disabled}
                    ><i className="fa fa-step-backward"/>
                    </Button>
                </li>
            }
            <li><span>{start + "-" + end}</span></li>
            <li>
                <Button
                    disabled={offset === 0 || disabled}
                    data-action={LIST.ACTION.PREVIOUS}
                    bsClass="btn btn-default b-t-l b-b-l"
                    onClick={callback}
                ><i className="fa fa-chevron-left"/>
                </Button>
            </li>
            <li>
                <Button
                    disabled={(length || (data && Object.keys(data).length)) < limit || disabled || ((offset + 1) * limit === count || ((offset + 1) * limit > count))}
                    data-action={LIST.ACTION.NEXT}
                    bsClass="btn btn-default b-t-r b-b-r"
                    onClick={callback}
                ><i className="fa fa-chevron-right"/>
                </Button>
            </li>
        </ul>
    );
}
