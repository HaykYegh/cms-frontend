"use strict";

import {geoMap} from "configs/geoConfig";

export function getMapConfig(data: Array<any>, meta?: any): any {

    const metaConfig: any = {
        title: "",
        height: null,
        name: "",
        seriesName: ""
    };
    let seriesData: Array<any> = [];

    if (meta) {
        for (const item in meta) {
            if (meta.hasOwnProperty(item)) {
                metaConfig[item] = meta[item];
            }
        }
    }

    if (data && data.length > 0) {
        seriesData = data.map(item => {
            return {
                code: item.regionCode || item.sort_name,
                name: item.countryName,
                value: item.total || item.registered_users_count || 0
            }
        });
    }

    return {
        config: {
            chart: {
                type: "map",
                // height: metaConfig.height
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
            xAxis: {
                visible: false,
            },
            yAxis: {
                visible: false,
            },
            colorAxis: {
                minColor: "#D8F1FD",
                maxColor: "#2BB8F8"
            },
            legend: {
                enabled: false,
                layout: "vertical",
                align: "left",
                verticalAlign: "bottom"
            },
            series: [{
                data: seriesData,
                mapData: geoMap,
                joinBy: ["iso-a2", "code"],
                name: "Users in country",
                states: {
                    hover: {
                        color: "#919191"
                    }
                },
                tooltip: {
                    valueSuffix: " users"
                },
            }]
        },
        empty: seriesData.length === 0
    }
}
