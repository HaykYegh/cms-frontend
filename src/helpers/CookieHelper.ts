"use strict";

export function setCookie(name: string, value: any, timeOff: any): void {
    let expires: string = "";
    if (timeOff) {
        const date: any = new Date();
        date.setTime(date.getTime() + (timeOff * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export function getCookie(name: string): any {
    const nameEQ: string = name + "=";
    const ca: Array<any> = document.cookie.split(";");
    for (let i: number = 0; i < ca.length; i++) {
        let c: any = ca[i];
        while (c.charAt(0) === " ") {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

export function eraseCookie(name: string): void {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}
