"use strict";

import * as React from "react";
import Select from "react-select";
import {connect} from "react-redux";
import {isEqual, isArray} from "lodash";
import {ToastContainer} from "react-toastify";
import {Form, FormGroup, ControlLabel, FormControl, HelpBlock, Checkbox} from "react-bootstrap";

import {IStoreProps, default as selector} from "services/selector";
import {addCountry, deleteCountry, getCountries} from "ajaxRequests/sticker";
import {ISelect, IVALIDATION} from "services/interface";
import {showNotification} from "helpers/PageHelper";
import {isNumeric} from "helpers/DataHelper";
import Table from "react-bootstrap/es/Table";

interface ICountriesState {
    countries: any[],
    checked: boolean,
    stickerCountries: any[],
    validation: {
        country: {
            id: IVALIDATION,
        },
    },
    _country: any,
    excludedCountries: any,
    isChanged: boolean,
}

interface ICountriesProps extends IStoreProps {
    configChange: (name: string, data: any) => void,
    configurations: any,
    packageId: number,
}

class Countries extends React.Component<ICountriesProps, ICountriesState> {

    componentState: boolean = true;

    constructor(props: ICountriesProps) {
        super(props);
        this.state = {
            countries: [],
            checked: false,
            _country: {
                list: "",
            },
            validation: {
                country: {
                    id: {
                        value: null,
                        message: "",
                    }
                }
            },
            stickerCountries: [],
            excludedCountries: [],
            isChanged: false,
        }
    }

    componentDidMount(): void {
        const {configurations, countries} = this.props;
        this.setState({
            countries,
            stickerCountries: configurations.countries,
        });

    }

    componentDidUpdate(prevProps: ICountriesProps, prevState: ICountriesState): void {
        const {stickerCountries, isChanged} = this.state;
        if (isChanged && !isEqual(prevState.stickerCountries, stickerCountries)) {
            const {configChange} = this.props;
            configChange("countries", stickerCountries);
        }
    }

    componentWillUnmount(): void {
        this.componentState = false;
    }

    handleCountryChange = (value: ISelect): void => {
        const newState: any = {...this.state};
        newState._country.list = value;
        newState.validation.country.id.value = value ? "success" : "error";
        newState.validation.country.id.message = value ? "" : "This field is required";
        this.setState(newState);
    };

    handleCountryInputChange = ({currentTarget: {value, name}}: React.ChangeEvent<HTMLInputElement>): void => {
        if (isNumeric(value) || value === "") {
            // Todo
            const newState: any = {...this.state};
            newState.validation.country[name].value = value === "" ? "error" : "success";
            newState.validation.country[name].message = value === "" ? "This field is required" : "";
            newState._country[name] = value;
            this.setState(newState);
        }
    };

    handleAddCountry = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        const {_country, countries, checked, stickerCountries, excludedCountries} = this.state;
        const {packageId} = this.props;
        const newState: any = {...this.state};
        const stickerCountry: any = _country.list;

        let regionCodes: string[] = null;
        let isDuplicate: boolean = false;

        if (checked) {
            regionCodes = stickerCountry.map(item => item.region_code);
        } else {
            isDuplicate = stickerCountries.some(country => {
                return country.region_code === stickerCountry.region_code;
            });

            if (!isDuplicate) {
                regionCodes = [stickerCountry.region_code];
            }
        }

        addCountry(packageId, {region_codes: regionCodes}).then(response => {
            if (!response.data.err) {
                if (checked) {
                    if (countries.length === stickerCountry.length) {
                        newState.stickerCountries = stickerCountry;
                    } else {
                        newState.stickerCountries = stickerCountries.slice();
                        for (const item in stickerCountry) {
                            if (stickerCountry.hasOwnProperty(item)) {
                                newState.stickerCountries.push(stickerCountry[item]);
                            }
                        }
                    }
                } else {
                    if (!isDuplicate) {
                        newState.stickerCountries = stickerCountries.slice();
                        newState.stickerCountries.push(stickerCountry);
                        newState._country.list = "";
                    }
                }
                newState.validation.country.id.value = checked ? "success" : null;
                newState.isChanged = true;
                if (this.componentState) {
                    this.setState(newState);
                }
            } else {
                this.componentState && showNotification("error", {
                    title: "You got an error!",
                    description: "Your changes is not saved for unknown reason",
                    timer: 3000,
                    hideProgress: true
                });
            }
        }).catch(error => console.log(error));
    };

    handleDeleteCountry = (e: React.MouseEvent<HTMLTableDataCellElement>): void => {
        e.preventDefault();
        const {stickerCountries, checked, _country} = this.state;
        const {packageId} = this.props;
        const newState: any = {...this.state};
        const countryId: number = parseInt(e.currentTarget.id);

        deleteCountry(packageId, countryId).then(response => {
            if (!response.data.err) {
                newState.stickerCountries = checked ? [] : stickerCountries.filter(item => item.country_id !== countryId);

                newState._country = {
                    list: checked ? _country.list : "",
                };
                newState.isChanged = true;

                newState.validation.country.id.value = checked ? "success" : null;
                if (this.componentState) {
                    this.setState(newState);
                }
            } else {
                this.componentState && showNotification("error", {
                    title: "You got an error!",
                    description: "Your changes is not saved for unknown reason",
                    timer: 3000,
                    hideProgress: true
                });
            }
        }).catch(error => console.log(error));
    };

    handleSelectAllCountries = ({currentTarget: {checked}}: React.ChangeEvent<HTMLInputElement>): void => {
        const {countries} = this.state;
        const newState: any = {...this.state};

        newState.stickerCountries = [];
        newState.excludedCountries = "";
        newState._country = {list: checked ? countries : ""};

        for (const item in newState.validation.country) {
            if (newState.validation.country.hasOwnProperty(item)) {
                newState.validation.country[item].value = null;
                newState.validation.country[item].message = "";
            }
        }
        newState.validation.country.id.value = checked ? "success" : null;
        newState.checked = checked;

        this.setState(newState);
    };

    handleExcludeCountries = (value: ISelect): void => {
        const newState: any = {...this.state};
        const {countries} = this.state;
        const selection: any = value;
        const excludedCountriesIds: number[] = selection.map(item => item.country_id);

        newState.excludedCountries = selection;
        newState._country.list = countries.filter(item => !excludedCountriesIds.includes(item.country_id));
        this.setState(newState);
    };

    render(): JSX.Element {
        const {stickerCountries, countries, _country, checked, excludedCountries, validation: {country}} = this.state;
        return (
            <div className="m-t-lg">
                <div className="row">
                    <div className="col-lg-offset-2 col-lg-8">
                        <form className="m-b-lg">
                            {/*<FormGroup>*/}
                            {/*<Checkbox*/}
                            {/*name="allCountries"*/}
                            {/*onChange={this.handleSelectAllCountries}*/}
                            {/*checked={checked}*/}
                            {/*bsClass="checkbox m-n cursor-pointer"*/}
                            {/*>Select all countries*/}
                            {/*</Checkbox>*/}
                            {/*</FormGroup>*/}
                            {
                                checked ?
                                    <FormGroup validationState={null}>
                                        <Select
                                            isDisabled={false}
                                            isMulti={true}
                                            closeMenuOnSelect={false}
                                            name="excludedCountries"
                                            onChange={this.handleExcludeCountries}
                                            value={excludedCountries}
                                            options={countries}
                                            placeholder="Exclude country"
                                        />
                                    </FormGroup> :
                                    <FormGroup validationState={country.id.value}>
                                        <Select
                                            isDisabled={false}
                                            name="countries"
                                            onChange={this.handleCountryChange}
                                            value={_country.list}
                                            options={countries}
                                            placeholder="Choose country"
                                        />
                                    </FormGroup>
                            }
                            <div className="form-group m-b-none">
                                <button
                                    disabled={_country.list === ""}
                                    className="btn btn-default btn-addon"
                                    onClick={this.handleAddCountry}
                                ><i className="fa fa-globe"/>Add Country
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="col-lg-offset-2 col-lg-8">
                        {
                            stickerCountries.length > 0 &&
                            <Table
                                hover={true}
                                condensed={true}
                                responsive={true}
                            >
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Country</th>
                                    <th/>
                                </tr>
                                </thead>
                                <tbody>

                                {
                                    checked ?
                                        <tr>
                                            <td>1</td>
                                            <td>World Wide</td>
                                            <td
                                                onClick={this.handleDeleteCountry}
                                                id="0"
                                            ><i className="fa fa-times text-danger wrapper-xs cursor-pointer f-r"/>
                                            </td>
                                        </tr> :
                                        stickerCountries.map((country, i) => {
                                            return (
                                                <tr key={i}>
                                                    <td>{i + 1}</td>
                                                    <td>{country.label}</td>
                                                    <td
                                                        onClick={this.handleDeleteCountry}
                                                        id={country.country_id}
                                                    >
                                                        <i className="fa text-danger fa-times wrapper-xs cursor-pointer f-r"/>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                }

                                </tbody>
                            </Table>
                        }

                    </div>
                </div>
                <ToastContainer/>
            </div>
        );
    }
}

const mapStateToProps: any = state => selector(state);

const mapDispatchToProps: any = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Countries);
