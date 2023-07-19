"use strict";

import * as React from "react";
import {Slide, toast} from "react-toastify";

export const correctlyFile: any = (file: File, config: any): File => {
    // const fileName: string = file.name.split(".")[0]; // Todo
    const {name} = config;
    const newFile: any = new FormData();
    newFile.append("file", file, `${name}.png`);
    file = newFile.get("file");
    return file;
};

export const showNotification: any = (type: any, config: any): number => {
    const {title, description, id, timer = false} = config;
    const Msg: any = ({title, description}) => (
        <div>
            <span className="block text-md font-bold">{title}</span>
            <span className="block">{description}</span>
        </div>
    );
    let toastId: number = null;

    if (id) {
        toast.update(id, {
            render: <Msg title={title} description={description}/>,
            transition: Slide,
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 3000,
            closeOnClick: true,
            draggable: true,
            hideProgressBar: true,
            className: `toast-container toast-container-${type}`,
            bodyClassName: "toast-body",
            type
        })
    } else {
        toastId = toast(<Msg title={title} description={description}/>, {
            transition: Slide,
            position: toast.POSITION.TOP_RIGHT,
            autoClose: timer,
            closeOnClick: true,
            draggable: true,
            hideProgressBar: true,
            className: `toast-container toast-container-${type}`,
            bodyClassName: "toast-body",
            type
        });
    }

    return toastId;
};

// Use in single select box
export const selectMenuStyles: any = {
    menu: styles => ({...styles, zIndex: 999}),
    container: styles => ({...styles, minHeight: "34px"}),
    valueContainer: styles => ({...styles, minHeight: "34px", padding: "0 8px"}),
    placeholder: styles => ({...styles, top: "46%"}),
    input: styles => ({...styles, paddingTop: "0"}),
    indicatorsContainer: styles => ({...styles, minHeight: "34px"}),
    dropdownIndicator: styles => ({...styles, padding: "7px"}),
    control: styles => {
        styles["&:hover"].borderColor = "#d2dcee";
        return {
            ...styles,
            minHeight: "34px",
            height: "34px",
            border: "1px solid #d2dcee",
            transition: "box-shadow 150ms ease",
            boxShadow: "0 1px 3px 0 #e5e5e5",
        }
    }
};

// Use in multiple select box
export const multiSelectMenuStyles: any = {
    menu: styles => ({...styles, zIndex: 999}),
    container: styles => ({...styles, minHeight: "34px"}),
    valueContainer: styles => ({...styles, minHeight: "34px"}),
    control: styles => {
        styles["&:hover"].borderColor = "#d2dcee";
        return {
            ...styles,
            minHeight: "34px",
            border: "1px solid #d2dcee",
            transition: "box-shadow 150ms ease",
            boxShadow: "0 1px 3px 0 #e5e5e5",
        }
    }
};
