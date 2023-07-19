"use strict";

import {isEqual} from "lodash";
import * as React from "react";
import * as moment from "moment";
import * as numeral from "numeral";
import * as ReactHighcharts from "react-highcharts";

import {STACKED_CHART_HEIGHT, VARIABLES} from "configs/constants";
import {getStackedChartConfig} from "helpers/ChartHelper";
import {setChartConfig} from "helpers/DomHelper";

interface IStackedChartProps {
    name: string,
    link?: string,
    seriesName: string | string[],
    prefix: string,
    seriesData?: any,
    startDate?: moment.Moment,
    endDate?: moment.Moment,
    loading?: boolean
}

interface IStackedChartState {
    count: any
}

class StackedChart extends React.Component<IStackedChartProps, IStackedChartState> {

    chartRef: any = null;

    constructor(props: IStackedChartProps) {
        super(props);
        this.state = {
            count: 0
        }
    }

    handleSetRef = (ref: any): void => {
        this.chartRef = ref;
    };

    componentDidMount(): void {
        this.handleSetStat();
    }

    componentDidUpdate(prevProps: IStackedChartProps, prevState: IStackedChartState): void {
        if (!isEqual(prevProps, this.props)) {
            this.handleSetStat();
        }
    }

    handleSetStat: any = (): void => {
        const {name, seriesName, startDate, endDate, seriesData, loading} = this.props;
        if (loading) {
            setChartConfig(this.chartRef, name, {height: STACKED_CHART_HEIGHT}, true);
        } else {
            const newState: IStackedChartState = {...this.state};
            if (Array.isArray(seriesData)) {
                const count: number[] = [];
                for (const item of seriesData) {
                    let total: any = 0;
                    for (const property in item) {
                        if (item.hasOwnProperty(property)) {
                            total += item[property];
                        }
                    }
                    total = (total * 100) % 100 === 0 ? parseInt(total) : numeral(total).format("0.0");
                    count.push(total);
                }
                newState.count = count.reverse().join("/");
            } else {
                let count: any = 0;
                for (const item in seriesData) {
                    if (seriesData.hasOwnProperty(item)) {
                        count += seriesData[item];
                    }
                }
                newState.count = (count * 100) % 100 === 0 ? parseInt(count) : numeral(count).format("0.0");
            }

            const {config} = getStackedChartConfig(seriesData, {
                height: STACKED_CHART_HEIGHT,
                seriesName,
                startDate,
                endDate,
                duration: name === VARIABLES.FREE_CALLS_DURATION
            });
            setChartConfig(this.chartRef, name, {config});
            this.setState(newState);
        }
    };

    render(): JSX.Element {
        const {count} = this.state;
        const {prefix, link, seriesName, name} = this.props;
        return (
            <div className="">
                <div id={name}>
                    <ReactHighcharts config={{}} ref={this.handleSetRef}/>
                </div>
                <div className="padder-l-lg text-line-chart">
                    <span className="block text-xl">{prefix} {count}</span>
                    {link ?
                        <a
                            className="text-base text-info"
                            href={link}
                        >{Array.isArray(seriesName) ? `${seriesName[1]} / ${seriesName[0]}` : seriesName}
                        </a> :
                        <span className="text-base">
                            {Array.isArray(seriesName) ? `${seriesName[1]} / ${seriesName[0]}` : seriesName}
                        </span>
                    }
                </div>
            </div>
        );
    }

}

export default StackedChart;
