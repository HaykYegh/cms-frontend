"use strict";

import * as React from "react";

import {LEFT_PAGE, RIGHT_PAGE} from "configs/constants";
import {fetchPageNumbers} from "helpers/DataHelper";

interface IPaginateProps {
    totalRecords: number,
    pageLimit: number,
    pageNeighbours: number,
    onPageChanged: (data: any) => void,
    isUpdate?: boolean
}

interface IPaginateState {
    currentPage: number
}

class Paginate extends React.Component<IPaginateProps, IPaginateState> {

    pageLimit: number = null;

    totalRecords: number = null;

    pageNeighbours: number = null;

    totalPages: number = null;

    constructor(props: IPaginateProps) {
        super(props);
        const {totalRecords = null, pageLimit = 30, pageNeighbours = 0} = props;

        this.pageLimit = typeof pageLimit === "number" ? pageLimit : 10;
        this.totalRecords = typeof totalRecords === "number" ? totalRecords : 0;
        this.pageNeighbours =
            typeof pageNeighbours === "number"
                ? Math.max(0, Math.min(pageNeighbours, 2))
                : 0;

        this.totalPages = Math.ceil(this.totalRecords / this.pageLimit);
        this.state = {
            currentPage: 1,
        };
    }

    componentDidMount(): void {
        this.handleGoToPage(1);
    }

    componentDidUpdate(prevProps: IPaginateProps, prevState: IPaginateState): void {
        if (this.props.isUpdate) {
            const {totalRecords = null, pageLimit = 10, pageNeighbours = 0} = this.props;
            this.pageLimit = typeof pageLimit === "number" ? pageLimit : 10;
            this.totalRecords = typeof totalRecords === "number" ? totalRecords : 0;
            this.pageNeighbours =
                typeof pageNeighbours === "number"
                    ? Math.max(0, Math.min(pageNeighbours, 2))
                    : 0;
            this.totalPages = Math.ceil(this.totalRecords / this.pageLimit);
            this.handleGoToPage(1);
        }
    }

    handleGoToPage = (page: number): void => {
        const {onPageChanged = f => f} = this.props;
        const currentPage: number = Math.max(0, Math.min(page, this.totalPages));
        const paginationData: any = {
            currentPage,
            totalPages: this.totalPages,
            pageLimit: this.pageLimit,
            totalRecords: this.totalRecords
        };
        this.setState({currentPage}, () => onPageChanged(paginationData));
    };

    handleClick = (page: number, e: any): void => {
        e.preventDefault();
        this.handleGoToPage(page);
    };

    handleMoveLeft = (e: any): void => {
        e.preventDefault();
        this.handleGoToPage(this.state.currentPage - this.pageNeighbours * 2 - 1);
    };

    handleMoveRight = (e: any) => {
        e.preventDefault();
        this.handleGoToPage(this.state.currentPage + this.pageNeighbours * 2 + 1);
    };

    render(): JSX.Element {
        if (!this.totalRecords) {
            return null;
        }

        if (this.totalPages === 1) {
            return null;
        }

        const {currentPage} = this.state;
        const pages: any = fetchPageNumbers({
            totalPages: this.totalPages,
            currentPage,
            pageNeighbours: this.pageNeighbours
        });

        return (
            <nav className="text-right">
                <ul className="pagination m-n">
                    {pages.map((page, index) => {
                        const handleClick: any = e => this.handleClick(page, e);
                        if (page === LEFT_PAGE) {
                            return (
                                <li key={index} className="page-item">
                                    <a
                                        className="page-link"
                                        href="#"
                                        aria-label="Previous"
                                        onClick={this.handleMoveLeft}
                                    >
                                        <i className="fa fa-chevron-left text-xs" aria-hidden="true"/>
                                        <span className="sr-only">Previous</span>
                                    </a>
                                </li>
                            );
                        }

                        if (page === RIGHT_PAGE) {
                            return (
                                <li key={index} className="page-item">
                                    <a
                                        className="page-link"
                                        href="#"
                                        aria-label="Next"
                                        onClick={this.handleMoveRight}
                                    >
                                        <i className="fa fa-chevron-right text-xs" aria-hidden="true"/>
                                        <span className="sr-only">Next</span>
                                    </a>
                                </li>
                            );
                        }

                        return (
                            <li
                                key={index}
                                className={`page-item${
                                    currentPage === page ? " active" : ""
                                    }`}
                            >
                                <a
                                    className="page-link"
                                    href="#"
                                    onClick={handleClick}
                                >
                                    {page}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        );
    }
}

export default Paginate;
