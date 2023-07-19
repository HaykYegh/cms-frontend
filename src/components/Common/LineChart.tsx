"use strict";

import {isEqual} from "lodash";
import * as React from "react";
import * as moment from "moment";
import * as ReactHighcharts from "react-highcharts";

import {getColumnChartConfig} from "helpers/ChartHelper";

interface ILineChartProps {
    name: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    handleRequest?: (startDate?: moment.Moment, endDate?: moment.Moment) => Promise<any>
}

interface ILineChartState {
    loading: boolean,
    response: any,
    chartReFlow: boolean,
}

class LineChart extends React.Component<ILineChartProps, ILineChartState> {

    componentState: any = false;

    constructor(props: any) {
        super(props);
        this.state = {
            loading: true,
            response: null,
            chartReFlow: true,
        }
    }

    componentDidMount(): void {

        const {startDate, endDate, handleRequest} = this.props;
        const newState: any = {...this.state};
        if (handleRequest) {
            this.componentState = true;
            handleRequest(startDate, endDate).then(result => {

                if (!result.data.err) {
                    newState.response = result.data.result;
                } else {
                    console.log("Error during getting response");
                }
                newState.loading = false;
                if (this.componentState) {
                    this.setState(newState);
                }

            }).catch(error => console.log(error));
        } else {
            newState.loading = false;
            this.setState(newState);
        }
    }

    shouldComponentUpdate(nextProps: ILineChartProps, nextState: ILineChartState): boolean {
        return !isEqual(nextProps, this.props) || !isEqual(nextState, this.state);
    }

    componentDidUpdate(prevProps: ILineChartProps, prevState: ILineChartState): void {

        const {startDate, endDate, handleRequest} = this.props;
        const newState: any = {...this.state};
        if (handleRequest && !isEqual(prevProps, this.props)) {
            this.setState({loading: true});
            this.componentState = true;
            handleRequest(startDate, endDate).then(result => {

                if (!result.data.err) {
                    newState.response = result.data.result;
                } else {
                    console.log("Error during getting response");
                }

                newState.loading = false;
                if (this.componentState) {
                    this.setState(newState);
                }
            }).catch(error => console.log(error));
        }
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    render(): JSX.Element {
        const {name} = this.props;
        const {response, loading, chartReFlow} = this.state;
        const chart: any = {
            config: {},
            empty: true
        };

        if (response) {
            const {config, empty} = getColumnChartConfig(null, {
                height: 100
            });
            chart.config = config;
            chart.empty = empty;
        }

        return (
            <div className="wrapper-lg">
                {loading ?
                    <div className="spinner">
                        <div className="double-bounce1"/>
                        <div className="double-bounce2"/>
                    </div> :
                    !chart.empty ?
                        <div className="m-b-lg text-line-chart">
                            <ReactHighcharts
                                neverReflow={chartReFlow}
                                config={chart.config}
                            />
                            <span className="block text-xl">
                                    {response && response.count ? response.count : "0"}
                                </span>
                            <span className="text-base">{name}</span>
                        </div>
                        : null
                }
            </div>
        );
    }
}

export default LineChart;
