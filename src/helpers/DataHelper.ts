"use strict";

import {is} from "immutable";
import * as moment from "moment";
import {AES, DecryptedMessage, enc} from "crypto-js";
import {isValidNumber, parse, isValidPhoneNumber} from "libphonenumber-js";
import {createSelectorCreator, defaultMemoize} from "reselect";

import {CRYPTO_SECRET, LEFT_PAGE, LIST, RIGHT_PAGE, SORT} from "configs/constants";

export const createSelector: any = createSelectorCreator(defaultMemoize, is);

export const types: any = {
    JSON_ENCODE: "JSON_ENCODE",
    JSON_DECODE: "JSON_DECODE",
    ENCRYPT: "ENCRYPT",
    DECRYPT: "DECRYPT",
    URL_ENCODE: "URL_ENCODE"
};

export function encrypt(data: any): string {
    return AES.encrypt(data, CRYPTO_SECRET).toString();
}

export function decrypt(data: any): string {
    const decrypted: DecryptedMessage = AES.decrypt(data.toString(), CRYPTO_SECRET);
    try {
        return decrypted.toString(enc.Utf8);
    } catch (e) {
        console.log(e);
    }
}

export function dateTimePickerRanges(): any {
    return {
        "Today": [moment(), moment()],
        "Yesterday": [moment().subtract(1, "days"), moment().subtract(1, "days")],
        "Last 7 Days": [
            moment().subtract(6, "days"),
            moment()
        ],
        "Last 30 Days": [
            moment().subtract(29, "days"),
            moment()
        ],
        "This Month": [
            moment().startOf("month"),
            moment().endOf("month")
        ],
        "Last Month": [
            moment().subtract(1, "month").startOf("month"),
            moment().subtract(1, "month").endOf("month")]
    };
}

export function monthlyDateTimePickerRanges(): any {
    return {
        "This Month": [
            moment().startOf("month"),
            moment().endOf("month")
        ],
        "Last Month": [
            moment().subtract(1, "month").startOf("month"),
            moment().subtract(1, "month").endOf("month")]
    };
}

export function pickerLabel(startDate: any, endDate: any): string {
    if (startDate === "" && endDate === "") {
        return "";
    }

    const start: string = startDate.format("DD.MM.YY");
    const end: string = endDate.format("DD.MM.YY");
    let label: string = "";
    if (start === moment().format("DD.MM.YY") && end === moment().format("DD.MM.YY")) {
        label = "Today";
    } else if (
        start === moment().subtract(1, "days").format("DD.MM.YY") &&
        end === moment().subtract(1, "days").format("DD.MM.YY")
    ) {
        label = "Yesterday";
    } else if (
        start === moment().subtract(6, "days").format("DD.MM.YY") &&
        end === moment().format("DD.MM.YY")
    ) {
        label = "Last 7 Days";
    } else if (
        start === moment().subtract(29, "days").format("DD.MM.YY") &&
        end === moment().format("DD.MM.YY")
    ) {
        label = "Last 30 Days";
    } else if (
        start === moment().startOf("month").format("DD.MM.YY") &&
        end === moment().endOf("month").format("DD.MM.YY")
    ) {
        label = "This Month";
    } else if (
        start === moment().subtract(1, "month").startOf("month").format("DD.MM.YY") &&
        end === moment().subtract(1, "month").endOf("month").format("DD.MM.YY")
    ) {
        label = "Last Month";
    } else {
        label = start + " - " + end;
    }
    return label;
}

export function gatewayValidation(): any {
    return {
        description: {
            value: null,
            message: ""
        },
        host: {
            value: null,
            message: ""
        },
        voipModuleAddress: {
            value: null,
            message: ""
        },
        dialPrefix: {
            value: null,
            message: ""
        },
        _countries: {
            value: null,
            message: ""
        },
        param1: {
            value: null,
            message: ""
        },
        param2: {
            value: null,
            message: ""
        },
        username: {
            value: null,
            message: ""
        },
        password: {
            value: null,
            message: ""
        },
        file: {
            value: null,
            message: ""
        },
        calleeCutDigitCount: {
            value: null,
            message: ""
        },
        callerDialPrefix: {
            value: null,
            message: ""
        },
        callerCutDigitCount: {
            value: null,
            message: ""
        }
    }
}

export const validateNumber: any = (phone: string): any => {
    let response: any = {phone: "", countryCode: "", isValid: false};
    if (isValidNumber(phone)) {
        const parsedNumber: any = parse(`${phone}`, {extended: true});
        response = {
            phone: `${parsedNumber.countryCallingCode + "" + parsedNumber.phone}`,
            countryCode: parsedNumber.country,
            isValid: parsedNumber.valid
        };
    }
    return response;
};

export const validateZangiNumber: any = (zangiNumber: string): boolean => {
    return /^(^(10|87))\d{8,10}$/.test(zangiNumber);
};

export const isNumeric: any = (n: any): boolean => {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

export const setPaginationRange: any = (data: any, offset: number, limit: number, length?: number): any => {
    if ((length || data && Object.keys(data).length) > 0) {
        const start: number = offset * limit + 1;
        const end: number = (length || Object.keys(data).length) <= limit ? (start + (length || Object.keys(data).length) - 1) : offset * limit;

        return {start, end};
    }
    return {start: 1, end: 1};
};

export const listSort: any = (data: any, field: number, type: string): Array<any> => {
    const sortableList: Array<any> = [];
    for (const item of data) {
        sortableList.push([item.name, item.count])
    }
    sortableList.sort((a, b) => {
        if (a[field] < b[field]) {
            return type === SORT.DESC ? -1 : 1;
        }
        if (a[field] > b[field]) {
            return type === SORT.DESC ? 1 : -1;
        }
        return 0;
    });
    const sortedList: Array<any> = [];
    for (const item of sortableList) {
        sortedList.push({
            name: item[0],
            count: item[1]
        })
    }
    return sortedList;
};

export const compare: any = (field?: string): any => {
    return (a: any, b: any) => {
        if (+a[field] < +b[field]) {
            return 1;
        }
        if (+a[field] > +b[field]) {
            return -1;
        }
        return 0;
    }

};

export const roundUp: any = (num: number, precision: number = 100): number => {
    return Math.ceil(Math.round(num * precision) / precision);
};

export const filterObject: any = (obj: any, filter: string): any => {
    return Object.keys(obj).filter(key => key !== filter).reduce((newObj, key) => {
        newObj[key] = obj[key];
        return newObj;
    }, {});
};

export const getMscDateArray: any = (start, end) => {
    const arr: any = {};
    const dt: Date = new Date(start);
    while (dt <= new Date(end)) {
        arr[new Date(dt).valueOf()] = 0;
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
};

export const getFormattedDateArray: any = (start, end) => {
    const arr: any = {};
    const dt: Date = new Date(start);
    while (dt <= new Date(end)) {
        arr[moment(new Date(dt)).format("YYYY-MM-DD")] = 0;
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
};

export const getStructuredArray: any = (data: any[]): any[] => {
    return data.filter(item => {
        return item && item !== "" && (typeof item !== "undefined");
    });
};

export const getStatisticsArray: any = (data: any[], property: string, key: string, floated: boolean = false): any => {
    const result: any = {};
    for (const item of data) {
        const name: string = moment(item[property]).format("YYYY-MM-DD");
        if (result.hasOwnProperty(name)) {
            result[name] = floated ? +((result[name] + parseFloat(item[key])).toFixed(1)) : parseInt(item[key])

        } else {
            result[name] = floated ? +parseFloat(item[key]).toFixed(1) : parseInt(item[key])
        }
    }
    return result;
};

export const removeUserData: any = (data: string[]): void => {
    for (const item of data) {
        localStorage.removeItem(item);
    }
};

export const createOption: any = (label: string): any => ({
    label,
    value: label,
});

export function pagination(c: number, m: number): any {
    const current: number = c;
    const last: number = m;
    const delta: number = 2;
    const left: number = current - delta;
    const right: number = current + delta + 1;
    const range: any[] = [];
    const rangeWithDots: any[] = [];
    let l: any = null;

    for (let i: number = 1; i <= last; i++) {
        if (i === 1 || i === last || i >= left && i < right) {
            range.push(i);
        }
    }

    for (const i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push("...");
            }
        }
        rangeWithDots.push(i);
        l = i;
    }

    return rangeWithDots;
}

export const range: any = (from, to, step = 1): any[] => {
    let i: any = from;
    const range: any[] = [];

    while (i <= to) {
        range.push(i);
        i += step;
    }

    return range;
};

export const fetchPageNumbers: any = ({totalPages, currentPage, pageNeighbours}: any): any[] => {
    const totalNumbers: number = pageNeighbours * 2 + 3;
    const totalBlocks: number = totalNumbers + 2;

    if (totalPages > totalBlocks) {
        const leftBound: number = currentPage - pageNeighbours;
        const rightBound: number = currentPage + pageNeighbours;
        const beforeLastPage: number = totalPages - 1;
        const startPage: number = leftBound > 2 ? leftBound : 2;
        const endPage: number = rightBound < beforeLastPage ? rightBound : beforeLastPage;

        let pages: any = range(startPage, endPage);

        const pagesCount: number = pages.length;
        const singleSpillOffset: number = totalNumbers - pagesCount - 1;
        const leftSpill: boolean = startPage > 2;
        const rightSpill: boolean = endPage < beforeLastPage;
        const leftSpillPage: string = LEFT_PAGE;
        const rightSpillPage: string = RIGHT_PAGE;

        if (leftSpill && !rightSpill) {
            const extraPages: any = range(startPage - singleSpillOffset, startPage - 1);
            pages = [leftSpillPage, ...extraPages, ...pages];
        } else if (!leftSpill && rightSpill) {
            const extraPages: any = range(endPage + 1, endPage + singleSpillOffset);
            pages = [...pages, ...extraPages, rightSpillPage];
        } else if (leftSpill && rightSpill) {
            pages = [leftSpillPage, ...pages, rightSpillPage];
        }

        return [1, ...pages, totalPages];
    }

    return range(1, totalPages);
};

export const isCreditCardExpire: any = (month: number, year: number) => {
    const today: Date = new Date();
    const someday: Date = new Date();
    someday.setFullYear(year, month, 1);
    return someday < today;
};

export const getCurrentOffset: any = (offset, e: any, isObject = false): number | any => {
    e.preventDefault();
    const ACTION: number = parseInt(e.currentTarget.getAttribute("data-action"));
    let currentOffset: number = offset;
    if (ACTION === LIST.ACTION.NEXT) {
        currentOffset++;
    } else if (ACTION === LIST.ACTION.PREVIOUS) {
        if (offset !== 0) {
            currentOffset--;
        }
    } else {
        currentOffset = 0;
    }
    return isObject ? {currentOffset, ACTION} : currentOffset
};

export const promiseSelectOptions: any = (callBack: any) => (value: string): Promise<any> => {
    return new Promise(resolve => resolve(callBack(value)));
};

export const getClickHandler: any = (key: any, clickHandlers: any, callback: any) => {
    // If no click handler exists for this unique identifier, create one.
    if (!Object.prototype.hasOwnProperty.call(clickHandlers, key)) {
        clickHandlers[key] = () => callback(key);
    }
    return clickHandlers[key];
};

export const replaceAll: any = (str: string, mapObj: any): string => {
    const re: any = new RegExp(Object.keys(mapObj).join("|"), "gi");
    return str.replace(re, matched => mapObj[matched.toLowerCase()]);
};

export const resetValidation: any = (data: any, state) => {
    for (const item in data) {
        if (data.hasOwnProperty(item)) {
            state.validation[item] = {
                value: null,
                message: "",
            }
        }
    }
};

export const getMetricTypeStats: any = (data: any, field: string): any => {
    const result: any = data.find(item => item.name === field) || null;
    const count: number = (result && result.timeline) ? result.timeline.map(item => item.value || 0).reduce((a, b) => {
        return a + b;
    }) : 0;
    const records: any[] = (result && result.timeline) || [];
    return {
        count,
        records
    };
};

export const testableNumbersValidate: any = (str: string): boolean => {
    const pattern: any = new RegExp("37471[0-9]{6}$", "igm");
    return pattern.test(str);
};
