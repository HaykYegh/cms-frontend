"use strict";

import * as React from "react";
import {connect} from "react-redux";

import {getUser} from "ajaxRequests/users";
import selector, {IStoreProps} from "services/selector";
import UserAttempts from "components/Common/UserAttempts";
import Devices from "containers/application/users/view/Devices";
import User from "containers/application/users/view/UserInformation";
import {ToastContainer} from "react-toastify";
import DIDNumber from "containers/application/users/view/DIDNumber";
// import DIDNumber from "containers/application/users/view/DIDNumber";

interface IIndexState {
    user: any;
    isLoading: boolean
}

interface IIndexProps extends IStoreProps {
    match: any;
    history: any;
    userProfile: any;
}

class UserView extends React.Component<IIndexProps, IIndexState> {

    constructor(props: IIndexProps) {
        super(props);
        this.state = {
            user: null,
            isLoading: true
        }
    }

    componentDidMount(): void {
        const {match, history} = this.props;
        const newState: IIndexState = {...this.state};
        document.title = `User - ${match.params.id !== "" ? match.params.id : ""}`;
        if (!!match.params.id) {
            getUser(match.params.id).then(({data}) => {
                if (!data.err) {
                    newState.user = data.result;
                    this.setState(newState);
                } else {
                    history.push("/users");
                }
            }).catch(e => console.log(e));
        } else {
            history.push("/users")
        }
    }

    render(): JSX.Element {
        const {user} = this.state;
        const {currencies, history, match, userProfile} = this.props;
        return (
            <div>
                <ToastContainer/>
                {user && <User userProfile={userProfile} user={user} currencies={currencies} history={history}/>}
                {/* DID NUMBERS OPENED FOR JALA*/}
                {user && <DIDNumber userProfile={userProfile} match={match} history={history}/>}
                {user && <Devices user={user}/>}
                {user && !userProfile.readonly && <UserAttempts username={user.username} isVerified={true} isEmail={!!user.email} email={user.email || ""}/>}
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(UserView);
