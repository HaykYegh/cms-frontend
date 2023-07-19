"use strict";

import * as React from "react";

interface IIndexState {
}

class Index extends React.Component<any, IIndexState> {

    constructor(props: any) {
        super(props);
        this.state = {}

    }

    render(): JSX.Element {
        return (
            <div>History</div>
        );
    }
}

export default Index;
