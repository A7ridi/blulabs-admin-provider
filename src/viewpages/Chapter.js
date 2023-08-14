import React from 'react';
import * as chapterIcons from '../common/chapterIcons'
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Apimanager from '../Apimanager/index';
//import LoadingIndicator from '../common/LoadingIndicator';
import LoadingContent from '../common/LoadingContent'
import BaseComponent from '../components/BaseComponent'
import _ from 'lodash';
import * as i18n from '../I18n/en.json'
import moment from 'moment'
import UserProfile from './UserProfile'

class Chapter extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            storedObject: null,
            isloading: true,
            visitChapters: [],
            uservisitObject: {
                data: '',
                isHaveImage: true
            },
            selectedchaptertitle: '',
            officeChapterId: ''
        }
    }
    handleChange = selectedchaptertitle => {
        this.setState({ selectedchaptertitle });
    };

    componentDidMount() {

        if (this.props && this.props.storage && this.props.storage.storageLoaded && this.props.data && this.props.data.northwelluser && this.props.data.northwelluser != null) {
            if (this.props && this.props.match && this.props.match.params && this.props.match.params.visitid) {

                // this.setState({
                //     storedObject: JSON.parse(this.props.data.northwelluser),
                //     userCredentials: JSON.parse(this.props.data.userCredentials)
                // }, () => { this.getUserInfo() })
                // this.setState({
                //     uservisitObject: this.props && this.props.location && this.props.location.state && this.props.location.state.uservisitObject ? this.props.location.state.uservisitObject : '',
                //     isHaveImage: true
                // })
                this.setState({
                    uservisitObject: {
                        data: this.props && this.props.location && this.props.location.state && this.props.location.state.patientObj ? this.props.location.state.patientObj : '',
                        isHaveImage: true
                    }
                }, () => this.visitSearch(this.props.match.params.visitid))
            }
        }
    }
    visitSearch(visisObjectId) {
        this.setState({ isloading: true })
        Apimanager.visitSearch(visisObjectId, success => {
            //console.log("success.data.data", success.data.data)
            if (success && success.data && success.data.data) {
                this.setState({
                    isloading: false,
                    visitChapters: success.data.data,
                }, () => {
                    if (this.props.location.pathname.indexOf('share') >= 0) {
                        const { visitChapters } = this.state;
                        _.map(visitChapters, (visit) => {
                            if (visit && visit.chapters && Array.isArray(visit.chapters) && visit.chapters.length) {
                                let chapExist = _.filter(visit.chapters, (chapter) => {
                                    return _.isEqual(chapter.id, this.props.match.params.chapterId);
                                });
                                //  && _.first(chapExist).type !== 'CTM'
                                if (chapExist.length) {
                                    this.shareMedia(_.first(chapExist));
                                }
                            }
                        });
                    }
                })
            }
        }, error => {
            this.setState({
                isloading: false,
                visitChapters: [],
            })

            if (error && error.status === 500) {
                //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
                return
            }

            if (error && error.status === 404) {
                // this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
                return
            }
        })
    }
    renderIcon(param, colorScheme) {
        switch (param.type) {
            case "CTM": return <chapterIcons.CTM fill={colorScheme} />;
            case "WCV": return <chapterIcons.WCV fill={colorScheme} />;
            case "DIS": return <chapterIcons.DIS fill={colorScheme} />;
            case "ANR": return <chapterIcons.ANR fill={colorScheme} />;
            case "MED": return <chapterIcons.MED fill={colorScheme} />;
            case "PBU": return <chapterIcons.PBU fill={colorScheme} />;
            case "DAP": return <chapterIcons.DAP fill={colorScheme} />;
            case "SYM": return <chapterIcons.SYM fill={colorScheme} />;
            case "SMR": return <chapterIcons.SYM fill={colorScheme} />;
            case "MRS": return <chapterIcons.MRS fill={colorScheme} />;
            case "DAU": return <chapterIcons.SYM fill={colorScheme} />;
            case "WCI": return <chapterIcons.WCI fill={colorScheme} />;
            case "NIS": return <chapterIcons.NIS fill={colorScheme} />;
            case "POP": return <chapterIcons.POP fill={colorScheme} />;
            case "POS": return <chapterIcons.POP fill={colorScheme} />;
            case "POI": return <chapterIcons.POP fill={colorScheme} />;
            case "AIN": return <chapterIcons.AIN fill={colorScheme} />;
            case "URV": return <chapterIcons.PBU fill={colorScheme} />;
            case "AAR": return <chapterIcons.AAR fill={colorScheme} />;
            case "DOC": return <chapterIcons.DOC fill={colorScheme} />;

            case "SHU": return <chapterIcons.SHU fill={colorScheme} />;
            case "PPC": return <chapterIcons.PPC fill={colorScheme} />;
            case "PPE": return <chapterIcons.PPE fill={colorScheme} />;
            case "BRF": return <chapterIcons.BRF fill={colorScheme} />;
            case "PBW": return <chapterIcons.PBW fill={colorScheme} />;
            case "PDI": return <chapterIcons.PDI fill={colorScheme} />;
            default: return null //<chapterIcons.AAR fill={colorScheme} />;
        }
    }
    shareMedia = (shareMediaobject, searchText) => {
        const { visitChapters, uservisitObject } = this.state;


        // let queryparam = {
        //     visitId: visitChapters[0].id,
        //     chapterId: shareMediaobject.id
        // }

        // Apimanager.getChapterMedia(queryparam, success => {
        //     console.log('success', success)
        //     if (success && success.status && success.status === 200) {

        //     }

        // }, error => {
        //     if (error && error.status === 500) {
        //         this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
        //         return
        //     }
        // })


        if (this.state.officeChapterId === shareMediaobject.id) {
            return;
        }

        //let searchText = this.props && this.props.location && this.props.location.state && this.props.location.state.searchtext ? this.props.location.state.searchtext : ''

        //console.log(this.props, shareMediaobject);

        var chapters = visitChapters && Array.isArray(visitChapters) && visitChapters.length && visitChapters[0] && visitChapters[0].chapters ? visitChapters[0].chapters : []
        _.map(chapters, (object) => object.isHoveractive = false)
        shareMediaobject.isHoveractive = true;
        shareMediaobject.visitUser = uservisitObject.data;

        this.setState({ visitChapters: this.state.visitChapters, officeChapterId: shareMediaobject.id }, this.props.history.push(`/patient/${this.props.match.params.patientid}/visit/${this.props.match.params.visitid}/${shareMediaobject.id}/share/media`, {
            shearedparams: shareMediaobject, patientObj: this.state.uservisitObject.data,
            searchText: searchText, viewChange: 'yes', enterpriseId: this.props.location.state.enterpriseId
        }))
        //this.setState({ visitChapters: this.state.visitChapters, officeChapterId: shareMediaobject.id }, this.props.history.push(`/patient/${this.props.match.params.patientid}/visit/${this.props.match.params.visitid}/${shareMediaobject.id}/items`, { shearedparams: shareMediaobject }))


    }
    activateChapter = (activateChapterObject) => {

        activateChapterObject.isClicked = true;

        // this.setState({ visitChapters: this.state.visitChapters })
        // return
        // if (!activateChapterObject.isClicked) {
        // return
        // }
        var requestparams = {
            visitId: this.props.match.params.visitid,
            chapterId: activateChapterObject.id
        };
        Apimanager.activateChapter(requestparams, success => {
            activateChapterObject.isActive = true;
            this.setState({
                visitChapters: this.state.visitChapters,
                // isloading: true
            })
            // }, () => this.visitSearch(this.props.match.params.visitid))
        }, error => {
            if (error && error.status === "500") {
                this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
                return
            }
            if (error.status) {
                this.ErrorAlertbar("Error while activate chapter.")
            }
        })
    }

    renderChappters(searchText) {
        const { visitChapters, isloading } = this.state;
        return visitChapters && Array.isArray(visitChapters) && visitChapters.length && visitChapters[0].chapters ?
            visitChapters[0] && visitChapters[0].chapters.map((object, index) => {

                return (
                    <span key={index}>{
                        //  object.type !== 'CTM' &&
                        <li className={object.isHoveractive ? "active" : ''} onClick={() => this.shareMedia(object, searchText)}>
                            {/* care team is no need to show in admin panel 23 rd october call  */}
                            <div className="detail-icon-diagnosis" >
                                <span className="list-icon">
                                    {this.renderIcon(object, "#0063e8")}
                                </span>
                                <div className="label" style={object.isActive ? undefined : { width: 150 }}>
                                    <span className="detail-name">{object && object.title ? object.title : ''}</span><br />
                                    <span className="date">{moment.unix(object.lastUpdate).format("MM/DD/YYYY")}</span>
                                </div>
                                {/* {
                                    object.isActive && object.type.toString() !== 'DOC' && <NewChapter
                                        activateChapter={this.activateChapter.bind(this)}
                                        chapterObj={object} />
                                } */}
                                {/* {
                                    (!(object.type.toString() === "DOC") && !object.isActive) && <NewChapter
                                        activateChapter={this.activateChapter.bind(this, object)}
                                        chapterObj={object} />
                                } */}
                            </div>
                        </li>
                    }
                    </span>
                )
            })
            : !isloading && !visitChapters.length && <h2 className="no-result">{i18n.chapter && i18n.chapter.nochaptererror}</h2>
    }
    handleerror(callback) {
        callback.isHaveImage = false;
        this.setState({ uservisitObject: this.state.uservisitObject })
    }

    render() {
        const { isloading, uservisitObject } = this.state;

        let searchText = this.props && this.props.location && this.props.location.state && this.props.location.state.searchtext ? this.props.location.state.searchtext : ''


        return (
            <div className="sidebar-fixed-search sidebar-fixed-date chapter-header">
                <div id="cahpterDetail" className="chapter-detail">
                    <div className="chapter-template">
                        {
                            uservisitObject && uservisitObject !== null && <UserProfile userObject={uservisitObject} searchText={searchText} handleerror={this.handleerror.bind(this)} {...this.props} />
                        }
                    </div>
                    {isloading ? <div id="cahpter" className="sidebar-inner chapter-wrapper chapter-header">
                        <div className="chapter-template margin-top90">
                            <LoadingContent />
                        </div>
                    </div> : ''}
                    <ul className="chapter-detail-list" style={{ height: '100%' }}>
                        {this.renderChappters(searchText)}
                    </ul>
                </div>
            </div>
        )
    }
}
// const NewChapter = (props) => {

//     return (
//         <button
//             onClick={() => props.activateChapter(props.chapterObj)}
//             className="btn btn-blue-block btn-sm ml-4 py-0"
//             data-toggle="modal"
//             disabled={props.chapterObj.isClicked}
//         >{i18n && i18n.chapter && i18n.chapter.activatebutton}</button>
//     )
// }
const mapStateToProps = (state) => {
    return {
        data: state.auth,
        storage: state.storage,
    }
}
export default withRouter(connect(mapStateToProps)(Chapter));