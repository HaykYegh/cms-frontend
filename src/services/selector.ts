"use strict";

import ApplicationSelector, {IApplicationModuleProps} from "modules/application/ApplicationSelector";
import SocketSelector, {ISocketModuleProps} from "modules/socket/SocketSelector";
import UserSelector, {IUserModuleProps} from "modules/user/UserSelector";

export interface IStoreProps extends IUserModuleProps, IApplicationModuleProps, ISocketModuleProps {
}

export default (state): any => {
    return {
        ...UserSelector(state),
        ...ApplicationSelector(state),
        ...SocketSelector(state),
    }
};
