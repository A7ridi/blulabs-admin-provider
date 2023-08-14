import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import BaseComponent from "../components/BaseComponent";
import Apimanager from "../Apimanager/index";
// import LoadingIndicator from "../common/LoadingIndicator";
// import LoadingContent from "../common/LoadingContent";
import moment from "moment";
//import Select from 'react-select';
import _ from "lodash";
import UserProfile from "./UserProfile";
import * as i18n from "../I18n/en.json";
import * as chapterIcons from "../common/chapterIcons";

import $ from "jquery";
import axios from "axios";
import { store } from "../redux/store";
import * as actions from "../redux/actions/auth.action";
import { visittype, options } from "../helper";

var pagination = { pagenumber: 1, itemperpage: 10 };

var selectedProvider = {};

var controller = new AbortController();
var signal = controller.signal;

class Visits extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            visitsData: [],
            isloading: true,
            storedObject: null,
            userObject: {
                data: "",
                isHaveImage: true,
            },
            selectedvisittitle: "",
            displayColorPicker: false,
            colorScheme: "#1E7EA4",
            addNewVisitModal: false,
            patientvisitsOptions: options,
            isVisitaddLoading: false,
            newVisit: false,
            isDuplicate: false,
            oldVisitData: "",
            createVisitType: "",
            showSuccess: false,
            providerData: null,
            oldProviderData: null,
            newVisitID: null,
            newEnterpricesID: null,
            sProvider: "",
            selectedProviderData: null,
            imageErrorGet: true,
        };
    }

    componentDidMount() {
        if (
            this.props &&
            this.props.storage &&
            this.props.storage.storageLoaded &&
            this.props.data &&
            this.props.data.northwelluser &&
            this.props.data.northwelluser != null
        ) {
            if (
                this.props &&
                this.props.match &&
                this.props.match.params &&
                this.props.match.params.patientid
            ) {
                this.setState({
                    storedObject: JSON.parse(this.props.data.northwelluser),
                });
                this.setState({
                    userObject: {
                        data:
                            this.props &&
                                this.props.location &&
                                this.props.location.state &&
                                this.props.location.state.patientObj
                                ? this.props.location.state.patientObj
                                : "",
                        isHaveImage: true,
                    },
                });
                this.getVisits(this.props.match.params.patientid);
            }
        }
        //ReactDOM.findDOMNode(this.refs.visit_scroll).addEventListener('scroll', this.handleScrollToElement);
    }

    // componentWillReceiveProps(props) {
    //     console.log('props', props.data.northwelluser)
    // }

    handleScrollToElement = (event) => {
        let element = event.target;
        if (element.scrollTop + element.offsetHeight >= element.scrollHeight) {
            //console.log('dffsdf');
            //this.loadmore();
        }
    };

    loadmore = () => {
        pagination.pagenumber++;
        // pagination.itemperpage = 10;
        this.setState({}, () => this.getVisits(this.props.match.params.patientid));
    };

    getVisits(userObject_id, type = null) {
        if (type === "new") {
            this.setState({
                newVisit: true,
                isloading: true,
            });
        } else {
            this.setState({
                isloading: true,
            });
        }
        Apimanager.getVisits(
            userObject_id,
            pagination,
            (success) => {
                let update = 1;
                if (success && success.data && success.data.data) {
                    let vData = success.data.data;
                    if (vData.length === 1 && vData[0].visitType === "WCV") {
                        update = 2;
                    }
                }

                this.setState({
                    visitsData:
                        success && success.data && success.data.data && update === 1
                            ? success.data.data
                            : [],
                    isloading: false,
                });
            },
            (error) => {
                if (error && error.status === 404) {
                    this.setState({
                        visitsData: [],
                        isloading: false,
                    });
                } else if (error && error.status === 500) {
                    //this.ErrorAlertbar(error.messages, "error")
                    this.setState({
                        isloading: false,
                    });
                }
            }
        );
    }
    renderSwitch(param) {
        switch (param) {
            case "CTM":
                return visittype.CTM;
            case "WCV":
                return visittype.WCV;
            case "DIS":
                return visittype.DIS;
            case "ANR":
                return visittype.ANR;
            case "MED":
                return visittype.MED;
            case "PBU":
                return visittype.PBU;
            case "DAP":
                return visittype.DAP;
            case "SYM":
                return visittype.SYM;
            case "MRS":
                return visittype.MRS;
            // case "ANR": return visittype.ANR;
            case "WCI":
                return visittype.WCI;
            case "NIS":
                return visittype.NIS;
            case "POP":
                return visittype.POP;
            case "AIN":
                return visittype.AIN;
            case "URV":
                return visittype.URV;
            case "AAR":
                return visittype.AAR;
            case "INP":
                return visittype.INP;
            default:
                return null;
        }
    }

    visitSearch(visitObj, searchtext) {
        this.props.history.push(
            `/patient/${this.props.match.params.patientid}/visit/${visitObj.id}`,
            {
                searchtext: searchtext,
                patientObj: this.state.userObject.data,
                enterpriseId: visitObj.enterpriseId,
            }
        );
    }
    validate() {
        const { patientvisitsOptions } = this.state;
        var isVisitTypeSelect = _.filter(patientvisitsOptions, (object) => {
            return object && object.isSelected;
        });
        return isVisitTypeSelect.length ? true : false;
    }
    saveNewVisit = (patientType, duplicate = null) => {
        const { colorScheme } = this.state;

        this.setState({ isVisitaddLoading: true });
        var data = {
            department: { name: "NEUROSURGERY", id: "DmqLLpnAUJ1PhuVWLSgl" },
            location: { id: "Y0SBHD21JSvymJNSGvhq", name: "Lenox Hill Hospital" },
            familyMembers: [],
            colorScheme: colorScheme,
            userId: this.props.match.params.patientid,
            lastAction: "",
            encounterNo: 23311,
            isOfficeVisit: patientType === "isOfficeVisit" ? true : false,
            isHospitalVisit: patientType === "isHospitalVisit" ? true : false,
            checkDuplicate: true,
            overwrite: duplicate ? true : false,
        };

        Apimanager.newVisit(
            data,
            (success) => {
                if (
                    success.data &&
                    success.data.settings &&
                    success.data.settings.status === 1
                ) {
                    //document.getElementById('visitModelDismiss').click();

                    this.setState({
                        isVisitaddLoading: false,
                        oldVisitData: "",
                        showSuccess: true,
                        newVisitID: success.data.data[0].id,
                        newEnterpricesID: success.data.data[0].enterpriseId,
                    });
                    this.getVisits(this.props.match.params.patientid, "new");
                } else if (
                    success.data &&
                    success.data.settings &&
                    success.data.settings.status === 2
                ) {
                    this.setState({
                        isVisitaddLoading: false,
                        isDuplicate: true,
                        oldVisitData: success.data.data[0],
                        createVisitType: patientType,
                        showSuccess: false,
                    });
                }
            },
            (error) => {
                this.setState({ isVisitaddLoading: false });
                if (error && error.status !== 401) {
                    this.ErrorAlertbar(
                        "Something went wrong while creating visit, Please try again later.",
                        () => this.formClear()
                    );
                }
            }
        );
    };
    handleChange = (selectedvisittitle) => {
        const { patientvisitsOptions } = this.state;
        patientvisitsOptions.map((object) => {
            return (object.isSelected = false);
        });
        selectedvisittitle.isSelected = true;
        this.setState({
            selectedvisittitle,
            patientvisitsOptions: this.state.patientvisitsOptions,
        });
    };
    formClear() {
        const { patientvisitsOptions } = this.state;
        _.map(patientvisitsOptions, (object) => (object.isSelected = false));
        this.setState({
            patientvisitsOptions: patientvisitsOptions,
            selectedvisittitle: null,
        });
    }
    handleerror(callback) {
        callback.isHaveImage = false;
        this.setState({ userObject: this.state.userObject });
    }

    timeDifference = (timestamp1, timestamp2) => {
        var diff = (timestamp1 - timestamp2) / 1000;
        diff /= 60 * 60;
        return Math.abs(Math.round(diff));

        //return daysDifference;
    };

    renderIcon(param, colorScheme) {
        switch (param.type) {
            case "CTM":
                return <img alt="Headshot" src="/assets/images/Headshot.png" />;
            case "WCV":
                return <chapterIcons.WCV fill={colorScheme} />;
            case "DIS":
                return <chapterIcons.DIS fill={colorScheme} />;
            case "ANR":
                return <chapterIcons.ANR fill={colorScheme} />;
            case "MED":
                return <chapterIcons.MED fill={colorScheme} />;
            case "PBU":
                return <chapterIcons.PBU fill={colorScheme} />;
            case "DAP":
                return <chapterIcons.DAP fill={colorScheme} />;
            case "SYM":
                return <chapterIcons.SYM fill={colorScheme} />;
            case "SMR":
                return <chapterIcons.SYM fill={colorScheme} />;
            case "MRS":
                return <chapterIcons.MRS fill={colorScheme} />;
            case "DAU":
                return <chapterIcons.SYM fill={colorScheme} />;
            case "WCI":
                return <chapterIcons.WCI fill={colorScheme} />;
            case "NIS":
                return <chapterIcons.NIS fill={colorScheme} />;
            case "POP":
                return <chapterIcons.POP fill={colorScheme} />;
            case "POS":
                return <chapterIcons.POP fill={colorScheme} />;
            case "POI":
                return <chapterIcons.POP fill={colorScheme} />;
            case "AIN":
                return <chapterIcons.AIN fill={colorScheme} />;
            case "URV":
                return <chapterIcons.PBU fill={colorScheme} />;
            case "AAR":
                return <chapterIcons.AAR fill={colorScheme} />;
            case "DOC":
                return <chapterIcons.DOC fill={colorScheme} />;
            default:
                return null; //<chapterIcons.AAR fill={colorScheme} />;
        }
    }

    removeDuplicate = (id) => {
        document.getElementById(id).click();

        // this.setState({
        //     isDuplicate: false,
        //     createVisitType: '',
        //     oldVisitData: ''
        // })

        this.setState({
            isVisitaddLoading: false,
            //newVisit: false,
            isDuplicate: false,
            oldVisitData: "",
            createVisitType: "",
            showSuccess: false,
            providerData: null,
            oldProviderData: null,
            //newVisitID: null,
            newEnterpricesID: null,
            sProvider: "",
            selectedProviderData: null,
        });

        selectedProvider = {};
    };

    getProvider = () => {
        this.setState({ isVisitaddLoading: true });

        Apimanager.recentProvider(
            (success) => {
                if (
                    success.data &&
                    success.data.settings &&
                    success.data.settings.status === 1
                ) {
                    this.setState({
                        providerData: success.data.data.recentProviders,
                        showSuccess: false,
                        isDuplicate: false,
                        oldProviderData: success.data.data.recentProviders,
                        isVisitaddLoading: false,
                    });
                } else if (
                    success.data &&
                    success.data.settings &&
                    success.data.settings.status === 0
                ) {
                    this.ErrorAlertbar(success.data.settings.messages, "error");
                }
            },
            (error) => {
                this.setState({ isVisitaddLoading: false });
                if (error && error.status !== 401) {
                    this.ErrorAlertbar(
                        "Something went wrong while creating visit, Please try again later.",
                        () => this.formClear()
                    );
                }
            }
        );
    };

    searchProvider = (e) => {
        try {
            let { storedObject } = this.state;
            let searchtext = e.target.value;
            this.setState({
                sProvider: searchtext,
            });

            if (searchtext && searchtext.length > 2) {
                var auth = `Bearer ${storedObject.user.stsTokenManager.accessToken}`;
                if (!storedObject) {
                    return;
                }
                this.setState({
                    isVisitaddLoading: true,
                });

                var queryparams = {
                    searchTerm: searchtext,
                };

                controller.abort();
                controller = new AbortController();
                signal = controller.signal;

                var endpoint =
                    `${process.env.REACT_APP_URL}/user/v2/searchprovider/${this.state.newEnterpricesID}?` +
                    $.param({
                        key: `${process.env.REACT_APP_FIREBASEAPIKEY}`,
                        searchTerm: encodeURIComponent(queryparams.searchTerm.trim()),
                    });

                fetch(endpoint, {
                    method: "get",
                    signal: signal,
                    headers: new Headers({
                        Authorization: auth,
                        "Content-Type": "application/text",
                        //Accept: "application/json",
                    }),

                    // body: "A=1&B=2",
                })
                    .then(function (response) {
                        if (response.status === 401) {
                            throw response.status;
                        } else {
                            return response.json();
                        }
                    })
                    .then((success) => {
                        if (success.settings.status === 1) {
                            if (success.data && success.data.provider) {
                                this.setState({
                                    providerData: success.data.provider,
                                    isVisitaddLoading: false,
                                });
                            } else {
                                this.setState({
                                    providerData: "No record found",
                                    isVisitaddLoading: false,
                                });
                            }
                        } else {
                            this.setState({
                                isVisitaddLoading: false,
                            });
                        }
                    })
                    .catch((error) => {
                        if (error && error === 401) {
                            var redux_store = store.getState();
                            var northwelluser_store =
                                redux_store &&
                                redux_store.auth &&
                                redux_store.auth.northwelluser &&
                                JSON.parse(redux_store.auth.northwelluser);
                            var refreshToken =
                                northwelluser_store.user.stsTokenManager.refreshToken;
                            var bodyFormData = {
                                grant_type: "refresh_token",
                                refresh_token: refreshToken,
                            };

                            axios({
                                method: "post",
                                url: `https://securetoken.googleapis.com/v1/token?key=${process.env.REACT_APP_FIREBASEAPIKEY}`,
                                data: bodyFormData,
                                config: { headers: { "Content-Type": "multipart/form-data" } },
                            })
                                .then((response) => {
                                    var stsTokenManager = {
                                        apiKey: process.env.REACT_APP_FIREBASEAPIKEY,
                                        refreshToken: response.data.refresh_token,
                                        accessToken: response.data.access_token,
                                        expirationTime: response.data.expires_in,
                                    };
                                    northwelluser_store.user.stsTokenManager = stsTokenManager;
                                    store.dispatch(
                                        actions.savenorthwelluserobj(
                                            JSON.stringify(northwelluser_store)
                                        )
                                    );
                                    auth = `Bearer ${stsTokenManager.accessToken}`;
                                    fetch(endpoint, {
                                        method: "get",
                                        signal: signal,
                                        headers: new Headers({
                                            Authorization: auth,

                                            "Content-Type": "application/text",

                                            //Accept: "application/json",
                                        }),

                                        // body: "A=1&B=2",
                                    })
                                        .then((response) => response.json())
                                        .then((success) => {
                                            if (
                                                success.settings &&
                                                success.settings.status === 1 &&
                                                success.data.data &&
                                                success.data.data.provider
                                            ) {
                                                this.setState({
                                                    providerData: success.data.data.provider,
                                                    isVisitaddLoading: false,
                                                });
                                            } else {
                                                this.setState({
                                                    isVisitaddLoading: false,
                                                });
                                            }
                                        });
                                })
                                .catch((err) => {
                                    sessionStorage.clear();
                                    localStorage.clear();
                                    store.dispatch(actions.logout());
                                    window.location.replace("/login");
                                });
                        }
                        //         this.setState({ isloading: false });
                    });
            } else {
                this.setState((prevState) => ({
                    providerData: prevState.oldProviderData,
                }));
            }
        } catch (err) {
            console.error(err.message);
        }
    };

    selectProvider = (object) => {
        if (selectedProvider[object.userId]) {
            delete selectedProvider[object.userId];
        } else {
            selectedProvider[object.userId] = {
                initials: object.initials,
                email: object.email,
                userId: object.userId,
                slug: object.slug,
                visitId: this.state.newVisitID,
            };
        }

        let getData = this.state.oldProviderData.find((list) => {
            return list.email === object.email;
        });

        var result = Object.keys(selectedProvider).map(function (key) {
            return selectedProvider[key];
        });

        if (getData) {
            let oldD = this.state.oldProviderData;
            oldD.push(object);
            this.setState({
                oldProviderData: oldD,
            });
        }

        this.setState({
            isloading: false,
            selectedProviderData: result,
        });
    };

    removeSearchData = () => {
        controller.abort();
        controller = new AbortController();
        signal = controller.signal;
        this.setState((prevState) => ({
            providerData: prevState.oldProviderData,
            sProvider: "",
        }));
    };

    inviteMultiple = () => {
        this.setState({
            isVisitaddLoading: true,
        });

        let queryParam = {
            patientId: this.props.match.params.patientid,
            type: "provider",
            users: this.state.selectedProviderData,
        };
        Apimanager.inviteMultiple(
            queryParam,
            (success) => {
                if (
                    success.data &&
                    success.data.settings &&
                    success.data.settings.status === 1
                ) {
                    this.removeDuplicate("visitModelDismiss");
                    this.sweetAlertbar("Provider successfully added to care team ");
                } else if (
                    success.data &&
                    success.data.settings &&
                    success.data.settings.status === 0
                ) {
                    this.ErrorAlertbar(success.data.settings.messages, "error");
                }
            },
            (error) => {
                this.setState({ isVisitaddLoading: false });
                if (error && error.status !== 401) {
                    this.ErrorAlertbar(
                        "Something went wrong while searching the provider, Please try again later.",
                        () => this.formClear()
                    );
                }
            }
        );
    };

    checkImage = (id) => {
        this.setState({
            [id]: false,
        });
    };

    render() {
        const { visitsData, isloading, userObject, isVisitaddLoading } = this.state;
        let searchText =
            this.props &&
                this.props.location &&
                this.props.location.state &&
                this.props.location.state.searchtext
                ? this.props.location.state.searchtext
                : "";

        if (!searchText) {
            searchText =
                this.props &&
                    this.props.location &&
                    this.props.location.state &&
                    this.props.location.state.searchText
                    ? this.props.location.state.searchText
                    : "";
        }
        let chapterList = "";
        if (this.state.oldVisitData) {
            chapterList = this.state.oldVisitData.chapters.map((object, index) => {
                return (
                    <li key={index}>
                        <div className="detail-icon-diagnosis">
                            <span className="list-icon">
                                {this.renderIcon(object, this.state.oldVisitData.colorScheme)}
                            </span>
                            <div className="label">
                                <span className="detail-name">
                                    {object && object.title ? object.title : ""}
                                </span>
                                <br />
                                <span className="date">
                                    {moment.unix(object.lastUpdate).format("MM/DD/YYYY")}
                                </span>
                            </div>
                        </div>
                    </li>
                );
            });
        }

        let providerData = "";
        if (
            this.state.providerData &&
            this.state.providerData !== "No record found"
        ) {
            providerData = this.state.providerData.map((object, index) => {
                return (
                    <li
                        key={object.userId}
                        className={
                            selectedProvider && selectedProvider[object.userId]
                                ? "selected"
                                : ""
                        }
                    >
                        <div className="user-icon">
                            {object.image ? (
                                <img src={object.image} title={object.value} alt="" />
                            ) : (
                                    object.initials
                                )}
                        </div>
                        <div className="user-content">
                            <div className="user-left">
                                <div className="usr-name">{object.value}</div>
                                <div className="user-adderess">
                                    {object.playback_department}
                                </div>
                            </div>
                            <div
                                className="user-check"
                                onClick={() => this.selectProvider(object)}
                            ></div>
                        </div>
                    </li>
                );
            });




            return (
                <>
                    <div id="cahpter" className="sidebar-inner chapter-wrapper chapter-header">

                        <div className="chapter-template">
                            {
                                userObject && userObject !== null && <UserProfile userObject={userObject} searchText={searchText} handleerror={this.handleerror.bind(this)}
                                    {...this.props}
                                />
                            }
                        </div>


                    </div >



                </>
            )
        }
    }
}

const NewChapter = (props) => {
    return (
        <div className="btn-chapter">
            <button className="btn btn-blue-block" data-toggle="modal" data-target="#myModal">Create Visit</button>
        </div>

    );
}


const mapStateToProps = (state) => {
    return {
        data: state.auth,
        storage: state.storage,
    };
};

export default withRouter(connect(mapStateToProps)(Visits));