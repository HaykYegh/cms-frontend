"use strict";

import * as numeral from "numeral";
import subDays from "date-fns/sub_days"
import startOfMonth from "date-fns/start_of_month"

import {getMscDateArray, getFormattedDateArray} from "helpers/DataHelper";
import {CHART_COLORS} from "configs/constants";

export function getPieChartConfig(data: any, meta?: any): any {

    if (!data) {
        return;
    }

    const seriesData: any[] = data.map((item, i) => {
        if (i === 0) {
            return {
                name: item.name,
                y: parseInt(item.value),
                sliced: true,
                selected: true,
                color: meta.colors ? meta.colors[i] : CHART_COLORS[i],
            }
        }
        return {
            name: item.name,
            y: parseInt(item.value),
            color: meta.colors ? meta.colors[i] : CHART_COLORS[i],
        }
    });

    let noDataText: any = null;

    return {
        config: {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                backgroundColor: "rgba(255, 255, 255, 0.0)",
                height: meta.height || null,
            },
            title: {
                text: meta.title || ""
            },
            lang: {
                noData: "No data to show"
            },
            legend: {
                enabled: meta.enabled,
                // layout: "horizontal",
                // alignColumns: true,
                // align: "right",
                // verticalAlign: "middle",
                // floating: false,
                // itemMarginBottom: 20,
                itemStyle: {
                    lineHeight: "14px",
                    fontWeight: "normal"
                },
                // labelFormatter(): string {
                //     return `<span>${this.y} (${this.percentage.toFixed(2)}%)</span><br><span>${this.name}</span>`;
                // }
            },
            tooltip: {
                formatter(): string {
                    return `<span style="color: ${this.color}" class="dot">\u25CF </span><span> ${this.point.name}: ${this.y}</span></span>`
                },
                style: {
                    fontSize: "14px",
                },
                borderRadius: 20,
                borderColor: "#CBCFD6",
                backgroundColor: "#FFF",
                shadow: false
            },
            plotOptions: {
                pie: {
                    point: {
                        events: {
                            legendItemClick(e: any): any {
                                const chart: any = this.series.chart;
                                const points: any = this.series.points;
                                let visibilityFlag: boolean = true;
                                let noDataTextBBox: any = null;

                                e.preventDefault();
                                this.setVisible(!this.visible);

                                for (let i: number = 0; i < points.length; i++) {
                                    if (points[i].visible) {
                                        visibilityFlag = false;
                                    }
                                }

                                if (visibilityFlag) {
                                    noDataText = chart.renderer.text("No data to display", 100, 100)
                                        .css({
                                            color: "#9E9E9E",
                                            fontSize: "20px"
                                        })
                                        .add();
                                    noDataTextBBox = noDataText.getBBox();
                                    noDataText.attr({
                                        x: chart.plotLeft + (chart.plotWidth * 0.5) - (noDataTextBBox.width * 0.5),
                                        y: chart.plotTop + (chart.plotHeight * 0.5) - (noDataTextBBox.height * 0.5)
                                    });
                                } else {
                                    noDataText = noDataText ? noDataText.destroy() : null;
                                }
                            }
                        },
                    },
                    allowPointSelect: true,
                    cursor: "pointer",
                    center: [null, null],
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },

            colors: CHART_COLORS,
            series: [{
                name: "count",
                type: "pie",
                colorByPoint: true,
                showInLegend: true,
                innerSize: meta.innerSize,
                data: seriesData
            }],
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        plotOptions: {
                            pie: {
                                center: [null, null],
                            }
                        },
                        legend: {
                            align: "center",
                            verticalAlign: "bottom",
                            layout: "horizontal",
                        }
                    }
                }]
            }
        },
    }
}

export function getSplineChartConfig(chartData: any, meta?: any): any {
    const metaConfig: any = {
        title: "",
        height: null,
        startDate: subDays(new Date(), 6),
        endDate: new Date(),
        interval: 24 * 3600 * 1000,
        name: "",
    };

    if (meta) {
        Object.keys(meta).map((value) => {
            if (metaConfig.hasOwnProperty(value)) {
                metaConfig[value] = meta[value];
            }
        })
    }
    const seriesData: Array<any> = [];
    const dateArr: any = getMscDateArray(metaConfig.startDate, metaConfig.endDate);

    Object.keys(chartData).map(property => {
        const value: any = chartData[property];
        const data: Array<number> = [];
        const chartValues: any = {};

        Object.keys(value).map(item => {
            const date: number = new Date(value[item].create_date).getTime();
            chartValues[date] = parseInt(value[item].count);
        });
        const result: any = {...dateArr, ...chartValues};
        Object.keys(result).map(item => {
            data.push(result[item]);
        });

        const pointStart: number = (new Date(metaConfig.startDate)).getTime();
        seriesData.push({
            name: property,
            pointInterval: metaConfig.interval,
            pointStart,
            data,
        });
    });

    return {
        config: {
            chart: {
                height: metaConfig.height,
                type: "areaspline",
            },
            title: {
                text: metaConfig.title,
            },
            xAxis: {
                tickmarkPlacement: "on",
                labels: {
                    align: "center",
                    rotation: 0,
                    format: "{value:%e}"
                },
                gridLineWidth: 2,
                tickInterval: metaConfig.interval,
            },
            yAxis: {
                visible: false,
            },
            plotOptions: {
                spline: {
                    marker: {
                        fillColor: "#2BB8F8",
                        lineWidth: 2,
                        lineColor: "#2BB8F8",
                        states: {
                            hover: {
                                fillColor: "#2BB8F8",
                                lineColor: "#2BB8F8",
                                lineWidth: 2,

                            },

                        }
                    }
                }
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                headerFormat: "<div><p>{point.key:%e %b, %Y}</p><br/><br/>",
                pointFormat: "<p>{series.name} - <b>{point.y}</b></p><br/>",
                footerFormat: "</div>",
                style: {
                    fontSize: "12px",
                },
                borderRadius: 20,
                borderColor: "#CBCFD6",
                backgroundColor: "#FFF",
                shadow: false
            },
            series: seriesData
        },
        empty: seriesData.length === 0
    }
}

export function getAreaSplineConfig(chartData: any, meta?: any): any {
    const metaConfig: any = {
        title: "",
        height: null,
        startDate: subDays(new Date(), 6),
        endDate: new Date(),
        interval: 24 * 3600 * 1000,
        name: "",
    };

    if (meta) {
        for (const item in meta) {
            if (meta.hasOwnProperty(item)) {
                metaConfig[item] = meta[item];
            }
        }
    }

    const seriesData: any[] = [];
    const dateArr: any = getMscDateArray(metaConfig.startDate, metaConfig.endDate);

    for (const property in chartData) {
        if (chartData.hasOwnProperty(property)) {
            const value: any = chartData[property];
            const data: number[] = [];
            const chartValues: any = {};

            for (const item of value) {
                const date: number = new Date(item.createdAt).getTime();
                chartValues[date] = parseInt(item.value);
            }

            const result: any = {...dateArr, ...chartValues};

            for (const item in result) {
                if (result.hasOwnProperty(item)) {
                    data.push(result[item]);
                }
            }

            const pointStart: number = (new Date(metaConfig.startDate)).getTime();
            seriesData.push({
                name: property,
                pointInterval: metaConfig.interval,
                pointStart,
                data,
                showInLegend: Object.keys(chartData).length > 1
            });
        }
    }

    return {
        config: {
            chart: {
                height: metaConfig.height,
                type: "areaspline",
            },
            title: {
                text: metaConfig.title,
            },
            xAxis: {
                tickmarkPlacement: "on",
                labels: {
                    align: "center",
                    rotation: 0,
                    format: "{value:%e}"
                },
                gridLineWidth: 2,
                tickInterval: metaConfig.interval,
            },
            yAxis: {
                visible: false,
            },
            plotOptions: {
                spline: {
                    marker: {
                        fillColor: "#2BB8F8",
                        lineWidth: 2,
                        lineColor: "#2BB8F8",
                        states: {
                            hover: {
                                fillColor: "#2BB8F8",
                                lineColor: "#2BB8F8",
                                lineWidth: 2,

                            },

                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                }
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                headerFormat: "<div><p>{point.key:%e %b, %Y}</p><br/><br/>",
                pointFormat: "<p>{series.name} - <b>{point.y}</b></p><br/>",
                footerFormat: "</div>",
                style: {
                    fontSize: "12px",
                },
                borderRadius: 20,
                borderColor: "#CBCFD6",
                backgroundColor: "#FFF",
                shadow: false
            },
            series: seriesData
        },
        empty: seriesData.length === 0
    }
}

export function dualAxesChartConfig(chartData: any, meta?: any): any {
    const metaConfig: any = {
        title: "",
        height: null,
        startDate: subDays(new Date(), 6),
        endDate: new Date(),
        interval: 24 * 3600 * 1000,
        name: "",
    };

    if (meta) {
        for (const item in meta) {
            if (meta.hasOwnProperty(item)) {
                metaConfig[item] = meta[item];
            }
        }
    }

    const seriesData: any[] = [];
    const dateArr: any = getMscDateArray(metaConfig.startDate, metaConfig.endDate);
    const pointStart: number = (new Date(metaConfig.startDate)).getTime();

    let i: number = 0;
    for (const property in chartData) {
        if (chartData.hasOwnProperty(property)) {
            const value: any = chartData[property];
            const data: number[] = [];
            const chartValues: any = {};

            for (const item of value) {
                if (item.value && item.createdAt) {
                    const date: number = new Date(item.createdAt).getTime();
                    chartValues[date] = parseInt(item.value);
                }
            }

            const result: any = {...dateArr, ...chartValues};

            for (const item in result) {
                if (result.hasOwnProperty(item)) {
                    data.push(result[item]);
                }
            }

            seriesData.push({
                name: property,
                type: i === 0 ? "areaspline" : "spline",
                yAxis: i === 0 ? 1 : 0,
                pointInterval: metaConfig.interval,
                pointStart,
                data,
                showInLegend: Object.keys(chartData).length > 1
            });
            i++;
        }
    }

    return {
        config: {
            chart: {
                height: metaConfig.height,
            },
            title: {
                text: metaConfig.title,
            },
            xAxis: {
                tickmarkPlacement: "on",
                labels: {
                    align: "center",
                    rotation: 0,
                    format: "{value:%e}"
                },
                gridLineWidth: 2,
                tickInterval: metaConfig.interval,
            },
            yAxis: [{ // Primary yAxis
                labels: {
                    enabled: false,
                },
                title: {
                    text: "",
                }
            }, { // Secondary yAxis
                title: {
                    text: "",
                },
                labels: {
                    enabled: false,
                },
                opposite: true
            }],
            plotOptions: {
                spline: {
                    marker: {
                        fillColor: "#2BB8F8",
                        lineWidth: 2,
                        lineColor: "#2BB8F8",
                        states: {
                            hover: {
                                fillColor: "#2BB8F8",
                                lineColor: "#2BB8F8",
                                lineWidth: 2,

                            },

                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                },
                areaspline: {
                    marker: {
                        fillColor: "#2BB8F8",
                        lineWidth: 2,
                        lineColor: "#2BB8F8",
                        states: {
                            hover: {
                                fillColor: "#2BB8F8",
                                lineColor: "#2BB8F8",
                                lineWidth: 2,

                            },

                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                },
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                headerFormat: "<div><p>{point.key:%e %b, %Y}</p><br/><br/>",
                pointFormat: "<p>{series.name} - <b>{point.y}</b></p><br/>",
                footerFormat: "</div>",
                style: {
                    fontSize: "12px",
                },
                borderRadius: 20,
                borderColor: "#CBCFD6",
                backgroundColor: "#FFF",
                shadow: false
            },
            series: seriesData
        },
        empty: seriesData.length === 0
    }
}

export function getColumnChartConfig(chartData: any, meta?: any): any {

    // if (!data) {
    //     return {
    //         config: {},
    //         empty: true
    //     };
    // }

    const metaConfig: any = {
        title: "",
        height: (9 / 16 * 100) + "%",
    };

    if (meta) {
        Object.keys(meta).map((value) => {
            if (metaConfig.hasOwnProperty(value)) {
                metaConfig[value] = meta[value];
            }
        })
    }

    const data: any = [
        {
            data: [15, 24, 13, 9, 34, 18, 16, 38, 59, 70, 56,
                78, 83, 94, 115, 123, 117, 98, 121, 80, 71,
                135, 123, 107, 95, 67, 27, 146, 69, 80, 31]
        }
    ];
    return {
        config: {
            chart: {
                type: "column",
                height: metaConfig.height,
            },
            title: {
                text: metaConfig.title,
            },
            xAxis: {
                allowDecimals: false,
                type: "datetime",
                tickInterval: 24 * 3600 * 1000,
                labels: {
                    enabled: true,
                    rotation: 0,
                    style: {
                        fontSize: "13px",
                        fontFamily: "Verdana, sans-serif"
                    },
                    format: "{value:%d}"
                },
                visible: false
            },
            yAxis: {
                labels: {
                    enabled: true,

                },
                visible: false
            },
            plotOptions: {
                series: {
                    pointStart: startOfMonth(new Date()),
                    pointInterval: 24 * 3600 * 1000,
                    pointWidth: 10,
                    color: "#2BB8F8"
                }
            },
            legend: {
                enabled: false
            },
            tooltip: {
                pointFormat: "Activity: <b>{point.y}</b>",
                enabled: true
            },
            series: data
        },
        empty: data.length === 0
    }

}

export function getStackedChartConfig(chartData: any, meta?: any): any {

    const metaConfig: any = {
        title: "",
        height: null,
        name: "",
        seriesName: "",
        startDate: subDays(new Date(), 30),
        endDate: new Date(),
        interval: 24 * 3600 * 1000,
        duration: false
    };

    if (meta) {
        for (const item in meta) {
            if (meta.hasOwnProperty(item) && metaConfig.hasOwnProperty(item)) {
                metaConfig[item] = meta[item];
            }
        }
    }

    const dateArr: any = getFormattedDateArray(metaConfig.startDate, metaConfig.endDate);

    let seriesData: any = [];
    if (Array.isArray(chartData)) {
        for (const [item, value] of chartData.entries()) {
            const chartValues: number[] = [];
            const mergedChartData: any = {...dateArr, ...value};
            for (const property in mergedChartData) {
                if (mergedChartData.hasOwnProperty(property)) {
                    chartValues.push(mergedChartData[property]);
                }
            }

            seriesData.push({
                showInLegend: false,
                name: metaConfig.seriesName[item],
                data: chartValues
            });
        }

    } else {
        const chartValues: number[] = [];
        const mergedChartData: any = {...dateArr, ...chartData};
        for (const property in mergedChartData) {
            if (mergedChartData.hasOwnProperty(property)) {
                chartValues.push(mergedChartData[property]);
            }
        }
        seriesData = [
            {
                showInLegend: false,
                name: metaConfig.seriesName,
                data: chartValues
            }
        ];
    }

    const year: number = metaConfig.startDate.year();
    const month: number = metaConfig.startDate.month();
    const date: number = metaConfig.startDate.date();

    return {
        config: {
            chart: {
                type: "column",
                height: metaConfig.height,
                width: null
            },
            title: {
                text: metaConfig.title,
            },
            xAxis: {
                visible: true,
                // type: "datetime",
                // dateTimeLabelFormats: {
                //     day: "%e"
                // },
                // lineWidth: 2,
                labels: {
                    enabled: false,
                },
            },
            yAxis: {
                // labels: {
                //     enabled: false,
                // },
                // title: {
                //     text: "Count"
                // },
                // lineWidth: 2,
                visible: false
            },
            legend: {
                enabled: false,
            },
            mapNavigation: {
                enabled: true,
                enableDoubleClickZoomTo: true
            },
            tooltip: {
                headerFormat: "<b>{point.x:%e %B}</b><br/>",

                // pointFormatter(): string {
                //     return metaConfig.duration ? `hour:min:sec: <b>${numeral(this.y).format("00:00:00")}</b>` :
                //         `<span style="color: ${this.color}" class="dot">\u25CF </span><span> Count: ${this.y}</span></span>`
                // },
                pointFormatter(): string {
                    return metaConfig.duration ?
                        `${this.series.name}: <b>${numeral(this.y * 60).format("00:00:00")}</b> (hour:min:sec)
                            <br/>Total: <b>${numeral(this.stackTotal * 60).format("00:00:00")}</b> (hour:min:sec)` :
                        `${this.series.name}: ${this.y}<br/>Total: ${this.stackTotal}`
                },
                borderRadius: 20,
                borderColor: "#CBCFD6",
                backgroundColor: "#FFF",
                shadow: false
            },
            plotOptions: {
                column: {
                    stacking: "normal",
                },
                series: {
                    // pointWidth: 10,
                    cursor: "pointer",
                    pointStart: Date.UTC(year, month, date),
                    pointInterval: 24 * 3600 * 1000,
                }
            },
            colors: seriesData.length > 1 ? ["#7ED7FF", "#2BB8F8"] : ["#2BB8F8"],
            series: seriesData
        },
        empty: seriesData.length === 0
    }
}

export function getStackedAreaChartConfig(chartData: any, meta?: any): any {

    const metaConfig: any = {
        title: "",
        height: null,
        name: "",
        seriesName: "",
        startDate: subDays(new Date(), 30),
        endDate: new Date(),
        interval: 24 * 3600 * 1000,
        duration: false
    };

    if (meta) {
        for (const item in meta) {
            if (meta.hasOwnProperty(item) && metaConfig.hasOwnProperty(item)) {
                metaConfig[item] = meta[item];
            }
        }
    }
    const seriesData: any[] = [];
    const pointStart: number = (new Date(metaConfig.startDate)).getTime();
    const dateArr: any = getMscDateArray(metaConfig.startDate, metaConfig.endDate);

    for (const property in chartData) {
        if (chartData.hasOwnProperty(property)) {
            const value: any = chartData[property];
            const data: number[] = [];
            const chartValues: any = {};

            for (const item of value) {
                if (item.value && item.createdAt) {
                    const date: number = new Date(item.createdAt).getTime();
                    chartValues[date] = parseInt(item.value);
                }
            }

            const result: any = {...dateArr, ...chartValues};

            for (const item in result) {
                if (result.hasOwnProperty(item)) {
                    data.push(result[item]);
                }
            }

            seriesData.push({
                name: property,
                pointInterval: metaConfig.interval,
                pointStart,
                data,
                showInLegend: Object.keys(chartData).length > 1
            });
        }
    }

    return {
        config: {
            chart: {
                type: "area",
                height: metaConfig.height,
            },
            title: {
                text: metaConfig.title,
            },
            xAxis: {
                title: {
                    enabled: false,
                },
                tickmarkPlacement: "on",
                labels: {
                    align: "center",
                    rotation: 0,
                    format: "{value:%e}"
                },
                tickInterval: metaConfig.interval,
            },
            yAxis: {
                visible: false
            },
            legend: {
                enabled: true
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                headerFormat: "<div><p>{point.key:%e %b, %Y}</p><br/><br/>",
                pointFormat: "<p>{series.name} - <b>{point.y}</b></p><br/>",
                footerFormat: "<p>Total - <b>{point.total}</b></p></div>",
                style: {
                    fontSize: "12px",
                },
                borderRadius: 20,
                borderColor: "#CBCFD6",
                backgroundColor: "#FFF",
                shadow: false
            },
            plotOptions: {
                area: {
                    stacking: "normal",
                    lineColor: "#858585",
                    lineWidth: 1,
                    marker: {
                        lineWidth: 1,
                        lineColor: "#858585"
                    }
                }
            },
            colors: seriesData.length > 1 ? ["#7CB5EC", "#D4F0FD"] : ["#7CB5EC"],
            series: seriesData
        },
        empty: seriesData.length === 0
    }
}
