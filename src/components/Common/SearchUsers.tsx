"use strict";

import * as React from "react";
import {Link} from "react-router-dom";
import {Table, FormControl} from "react-bootstrap";
import "react-placeholder/lib/reactPlaceholder.css";

import {getSearchedUsers} from "ajaxRequests/users";

interface ISearchUsersProps {
    showMore: boolean,
    keyUp: (event: React.KeyboardEvent<HTMLInputElement>, searchedUsers: any) => void
}

interface ISearchUsersState {
    searchedUsers: Array<any>,
    pattern: string,
    offset: number,
    showMoreEnabled: boolean,
}

export default class SearchUsers extends React.Component<ISearchUsersProps, ISearchUsersState> {

    componentState: boolean = true;

    constructor(props: any) {
        super(props);
        this.state = {
            pattern: "",
            searchedUsers: null,
            offset: 0,
            showMoreEnabled: false,
        };
    };

    handleSearchKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const {searchedUsers} = this.state;
        if (event.keyCode === 13 && searchedUsers) {
            const {keyUp} = this.props;
            keyUp(event, searchedUsers);
        }
    };

    handleSearchChange = ({currentTarget: {value}}: React.ChangeEvent<HTMLInputElement>): void => {

        const newState: any = {...this.state};
        if (value.length > 3) {
            getSearchedUsers(value).then(response => {
                if (!response.data.err) {
                    newState.searchedUsers = response.data.result;
                    if (newState.searchedUsers.length >= 10) {
                        newState.showMoreEnabled = true;
                    }
                } else {
                    console.log("Error during getting users");
                }
                newState.pattern = value;
                // newState.offset = offset + 1;
                if (this.componentState) {
                    this.setState(newState);
                }

            }).catch(err => console.log(err));
        } else {
            newState.offset = 0;
            newState.searchedUsers = null;
            this.setState(newState);
        }
    };

    handleShowMore = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        const {pattern, searchedUsers, offset} = this.state;
        const newState: any = {...this.state};
        getSearchedUsers(pattern, offset + 1).then(response => {
            if (!response.data.err) {
                if (response.data.result.length < 10) {
                    newState.showMoreEnabled = false;
                    newState.offset = 0;
                }
                newState.searchedUsers = [...searchedUsers, ...response.data.result];
                newState.offset = offset + 1;
            } else {
                console.log("Error during getting users");
            }
            if (this.componentState) {
                this.setState(newState);
            }
        }).catch(err => console.log(err));
    };

    render(): JSX.Element {
        const {showMore} = this.props;
        const {searchedUsers, showMoreEnabled} = this.state;
        return (
            <div className="dropdown">
                <FormControl
                    autoComplete="off"
                    data-toggle="dropdown"
                    className="dropdown-toggle"
                    onChange={this.handleSearchChange}
                    onKeyUp={this.handleSearchKeyUp}
                    name="phone"
                    placeholder="Search by phone or email"
                />
                {
                    searchedUsers && <ul id="users" className="dropdown-menu search-user-menu">
                        {
                            searchedUsers.length === 0 &&
                            <li className="wrapper-xs">No result</li>
                        }
                        {
                            searchedUsers.map(user =>
                                <li key={user.userId}>
                                    <Link
                                        to={`/users/${user.userId}`}
                                    ><i className="fa fa-user pr-10" aria-hidden="true"/>
                                        <span className="m-l-sm">{user.email ? user.email : user.username}</span>
                                        <span className="f-r">{user.country}</span>
                                    </Link>
                                </li>
                            )}
                        {
                            showMoreEnabled && showMore &&
                            <button
                                onClick={this.handleShowMore}
                                className="btn btn-link"
                            >Show more
                            </button>
                        }
                    </ul>
                }

            </div>
        )
    }

}
