"use strict";

import * as React from "react";
import Modal from "react-bootstrap/es/Modal";
import Button from "react-bootstrap/es/Button";

interface IPopupProps {
    show: boolean,
    hideModal: () => void,
    confirmAction: (e: React.MouseEvent<HTMLButtonElement>) => void,
    message: {
        title: string,
        apply: string,
        cancel: string,
        info: string,
    },
}

export default function Popup(props: IPopupProps): JSX.Element {
    const {message: {title, apply, cancel, info}, hideModal, confirmAction, show} = props;

    if (!show) {
        return null;
    }

    return (
        <Modal
            show={show}
            onHide={hideModal}
            bsSize="sm"
            style={{display: "flex", alignItems: "center"}}
        >
            <Modal.Header closeButton={true}>
                <span className="text-xlg">{title}</span>
            </Modal.Header>
            <Modal.Body>
                <span className="text-md">{info}</span>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={hideModal}>{cancel}</Button>
                <Button
                    onClick={confirmAction}
                    bsStyle="info"
                >{apply}
                </Button>
            </Modal.Footer>
        </Modal>
    )
};
