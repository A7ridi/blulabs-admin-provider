import React from "react";
//import LoadingIndicator from '../common/LoadingIndicator';
import LoadingContent from "../common/LoadingContent";
import BaseComponent from "../components/BaseComponent";
import Apimanager from "../Apimanager/index";

import swal from "sweetalert";


//import { PDF } from '../common/contentIcon'

function reverseString(str) {
    if (str) {
        return str.split("").join("");
    } else {
        return ''
    }
}

class CateTeamList extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {

            iscareloading: true,
            careTeamList: [],
            selectContentID: null,
            chapterType: "",
            MRNNumber: "",
            encounterID: ""
        };
    }

    componentDidUpdate() {
        if (this.props.callCareAPI) {
            this.careTeam(this.props.match.params.patientid)
            this.props.stopCallingAPI()
        }

    }

    componentDidMount() {

        if (this.props && this.props.match) {

            this.setState({
                chapterType: this.props.location.state.shearedparams.type
            })

            this.careTeam(this.props.match.params.patientid)
        }
    }

    careTeam = (id) => {
        this.setState({
            listLoading: true
        })

        let queryparams = { userId: id, visitId: this.props.match.params.visitid };


        Apimanager.careTeam(queryparams, (success) => {
            if (
                success &&
                success.status === 200 &&
                success.data &&
                success.data.data
            ) {
                this.setState({
                    careTeamList: success.data.data,
                    iscareloading: false,
                    careTeamMessage: 'message'

                })
            }
        }, (error) => {
            this.setState({

                iscareloading: false,
                careTeamMessage: 'message'

            })
        })
    }

    showDescription = (object) => {
        this.setState({
            selectContentID: object.id,
        });
        this.props.showContentDescriptions(object);
        this.props.hideMediaText(object);
    };


    deleteCareTeam = (id) => {

        this.setState({
            iscareloading: true,
            [id]: undefined
        })

        let apiParam = {
            id: id,
            visitId: this.props.match.params.visitid,
            careTeamId: id,
            userId: this.props.match.params.patientid
        }

        Apimanager.deleteCareTeamMember(
            apiParam,
            (success) => {
                this.sweetAlertbar(success.data.settings.message);
                this.careTeam(this.props.match.params.patientid)
            },
            (error) => {
                if (error && error.status === 500) {
                    this.ErrorAlertbar(error.data.settings.message)
                    this.setState({
                        iscareloading: false
                    })
                }
            }
        )
    }

    openList = (id) => {
        if (this.state[id] && this.state[id] === "option-list open") {
            this.setState({
                [id]: "option-list"
            })
        } else {
            this.setState({
                [id]: "option-list open"
            })
        }

        this.state.careTeamList.map((list) => {
            if (list.data.id !== id && this.state[list.data.id]) {
                this.state[list.data.id] = undefined
            }
            return null
        })
    }

    render() {
        const { iscareloading } = this.state;


        let sharingListNew = ''
        if (this.state.careTeamList && this.state.careTeamList.length > 0) {
            sharingListNew = this.state.careTeamList.map((list) => {

                let onlyName = ""
                let careName = ''
                if (list.data.name) {
                    onlyName = list.data.name.split(",");
                    careName = onlyName[0];
                } else {
                    onlyName[0] = list.data.email
                    careName = list.data.email
                }


                return (
                    <li index={list.data.id}>
                        <div className="user-icon">{reverseString((careName && careName.match(/\b(\w)/g).join('')))}</div>
                        <div className="user-content" onClick={() => this.openList(list.data.id)}>
                            <div className="user-left">
                                <div className="usr-name">{list.data.name}</div>
                                <div className="user-adderess">{list.data.speciality}</div>
                                <div className="user-adderess">{list.data.email}</div>
                            </div>
                            {/* <div className="user-check" onClick={() => this.selectSharingTeam(list.data)}></div> */}
                        </div>


                        {
                            (list.data.email || (!list.data.isFullAccess && list.data.type !== "external" && list.data.type !== "personal")) ?
                                <><span className="option-list-toggle" onClick={() => this.openList(list.data.id)}></span>
                                    <ul className={this.state[list.data.id] ? this.state[list.data.id] : "option-list"} id={list.data.id}>

                                        {list.data.email ? <li>
                                            <a href={"mailto:" + list.data.email}> Send Email</a>
                                        </li> : ""}

                                        {(list.data.isFullAccess || list.data.type === "external" || list.data.type === "personal") ? "" :
                                            <li onClick={() =>
                                                swal({
                                                    title: list.data.name,
                                                    text: "Are you sure you want to remove this member?",
                                                    buttons: true,
                                                    dangerMode: true,
                                                }).then((willDelete) => {
                                                    if (willDelete) {
                                                        this.deleteCareTeam(list.data.id);
                                                    }
                                                })
                                            }>
                                                <span

                                                >Remove</span>
                                            </li>
                                        }

                                    </ul></> : ""


                        }


                    </li>
                )
            })
        }



        return (
            <>
                <div className="sidebar-fixed-search sidebar-fixed-date chapter-header content-list">
                    <div id="cahpterDetail" className="chapter-detail care-team-result">

                        {iscareloading ? (

                            <div
                                id="cahpter"
                                className="sidebar-inner chapter-wrapper chapter-header content-list"
                            >
                                <div className="chapter-template">
                                    <LoadingContent />
                                </div>
                            </div>
                        ) : (
                                <>

                                    <ul className="chapter-detail-list height-100" >

                                        {sharingListNew ? sharingListNew : this.state.careTeamMessage ? <h2 className="no-result" style={{ fontSize: "14px" }}>No member in the team</h2> : ""}
                                    </ul >


                                </>
                            )}
                    </div>
                </div>
            </>
        );
    }
}

export default CateTeamList;
