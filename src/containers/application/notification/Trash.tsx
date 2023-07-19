"use strict";

import * as React from "react";

interface ITrashProps {
}

interface ITrashState {
}

class Trash extends React.Component<ITrashProps, ITrashState> {
    render(): JSX.Element {
        return (
            <div>
                Trash
            </div>
        )
    }
}

export default Trash;
