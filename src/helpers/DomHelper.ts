"use strict";

import Highcharts from "highcharts";
import Highmaps from "highcharts/highmaps";
import noData from "highcharts/modules/no-data-to-display"

noData(Highcharts);

export function downloadFile(name: string, url: string): void {
    const a: HTMLAnchorElement = document.createElement("a");
    a.download = name;
    a.href = url;
    a.click();
}

export function toggleFullScreen(): void {
    const page: any = document;
    const pageElement: any = document.documentElement;

    if (!page.fullscreenElement && !page.mozFullScreenElement &&
        !page.webkitFullscreenElement && !page.msFullscreenElement) {
        if (pageElement.requestFullscreen) {
            pageElement.requestFullscreen();
        } else if (pageElement.msRequestFullscreen) {
            pageElement.msRequestFullscreen();
        } else if (pageElement.mozRequestFullScreen) {
            pageElement.mozRequestFullScreen();
        } else if (pageElement.webkitRequestFullscreen) {
            pageElement.webkitRequestFullscreen((Element as any).ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (page.exitFullscreen) {
            page.exitFullscreen();
        } else if (page.msExitFullscreen) {
            page.msExitFullscreen();
        } else if (page.mozCancelFullScreen) {
            page.mozCancelFullScreen();
        } else if (page.webkitExitFullscreen) {
            page.webkitExitFullscreen();
        }
    }
}

export function setChartConfig(ref: any, container: string, meta: any = {}, loading: boolean = false): void {
    const initialConfig: any = {
        chart: {
            height: meta.height || null,
        },
        title: {
            text: "",
        },
        mapNavigation: {
            enabled: true,
            enableDoubleClickZoomTo: true,
            enableMouseWheelZoom: false,
            buttonOptions: {
                verticalAlign: "bottom",
                align: "right"
            }
        },
        series: null
    };
    const config: any = loading ? initialConfig : meta.config;
    const renderChart: any = ref.Highcharts.chart(container, config);
    if (loading) {
        // Show Loading in chart
        renderChart.showLoading("<i class='fa fa-spinner fa-spin text-xl text-info'/>");
    }
}

export function setNewChartConfig(container: string, meta: any = {}, loading: boolean = false): void {
    const initialConfig: any = {
        chart: {
            height: meta.height || null,
        },
        title: {
            text: "",
        },
        mapNavigation: {
            enabled: true,
            enableDoubleClickZoomTo: true,
            enableMouseWheelZoom: false,
            buttonOptions: {
                verticalAlign: "bottom",
                align: "right"
            }
        },
        lang: {
            noData: ""
        },
        series: null
    };

    const config: any = loading ? initialConfig : meta.config;
    const renderChart: any = Highcharts.chart(container, config);

    if (loading) {
        // Show Loading in chart
        const loaderType: string = meta.type ? ` ${meta.type}-loader` : "";
        renderChart.showLoading("<div class='loader" + loaderType + "'/>");
    }
}

export function setMapChartConfig(container: string, meta: any = {}, loading: boolean = false): void {
    const initialConfig: any = {
        chart: {
            height: meta.height || null,
        },
        title: {
            text: "",
        },
        mapNavigation: {
            enabled: true,
            enableDoubleClickZoomTo: true,
            enableMouseWheelZoom: false,
            buttonOptions: {
                verticalAlign: "bottom",
                align: "right"
            }
        },
        lang: {
            noData: ""
        },
        series: null
    };

    const config: any = loading ? initialConfig : meta.config;
    const renderChart: any = Highmaps.mapChart(container, config);

    if (loading) {
        // Show Loading in chart
        const loaderType: string = meta.type ? ` ${meta.type}-loader` : "";
        renderChart.showLoading("<div class='loader" + loaderType + "'/>");
    }
}

export function createBlockArray(count: number): Array<any> {
    const arr: Array<any> = [];
    for (let i: number = 0; i < count * 4; i++) {
        arr[i] = [];
        for (let j: number = 0; j < 4; j++) {
            arr[i][j] = {
                id: "td" + (i + j),
                selected: false,
                imageSet: false,
                color: ""
            };
        }
    }
    return arr;
}

export function createBoxes(blocksCount: number): Array<any> {
    const arr: Array<any> = [];
    for (let i: number = 0; i < blocksCount; i++) {
        arr[i] = [];
        for (let j: number = i * 4; j < (i + 1) * 4; j++) {
            for (let k: number = 0; k < 4; k++) {
                arr[i].push([j, k]);
            }
        }
    }
    return arr;
}

export function findMaxMin(selectedBlocks: any[], blocksCount: number): any {
    const maxMin: any = {max: {i: -1, j: -1}, min: {i: blocksCount * 4, j: blocksCount * 4}};
    for (const block of selectedBlocks) {
        if (block.i > maxMin.max.i) {
            maxMin.max.i = block.i;
        }

        if (block.i < maxMin.min.i) {
            maxMin.min.i = block.i;
        }

        if (block.j > maxMin.max.j) {
            maxMin.max.j = block.j;
        }

        if (block.j < maxMin.min.j) {
            maxMin.min.j = block.j;
        }
    }
    return maxMin;
}

export function getPastedTextWithoutSpaces(e: any): string {
    e.preventDefault();
    let pastedText: string = "";

    if (e.clipboardData && e.clipboardData.getData) {// Standards Compliant FIRST!
        pastedText = e.clipboardData.getData("text/plain");
    } else if ((window as any).clipboardData && (window as any).clipboardData.getData) {
        // IE
        pastedText = (window as any).clipboardData.getData("Text");
    }
    return pastedText.replace(/\s/g, "");
}
