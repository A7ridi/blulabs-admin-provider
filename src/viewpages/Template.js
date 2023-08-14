import React from 'react';
import BaseComponent from '../components/BaseComponent'
import * as i18n from '../I18n/en.json'
import Apimanager from '../Apimanager/index';
import CKEditor from 'ckeditor4-react';
//import _ from 'lodash'
import LoadingIndicator from '../common/LoadingIndicator';


class Template extends BaseComponent {
    constructor() {
        super()
        this.state = {
            isloading: false,
            contentData: '',
            contentKey: '',
            contentIndex: 0,
            currentTempData: '',
            textChecked: 'active',
            emailchecked: '',
            templaType: "text"
        }
    }

    componentDidMount() {
        this.getTemplateData('text');
    }

    getTemplateData = (template_type) => {
        let paramsData = {
            type: template_type
        }

        Apimanager.getTemplate(paramsData, success => {
            if (success.data && success.data.settings && success.data.settings.status === 1) {
                if (success.data && success.data.data && success.data.data[0]) {
                    this.setState({
                        contentData: success.data.data,
                        contentKey: success.data.data[0].key,
                        currentTempData: success.data.data[0].content,
                        isloading: false,
                        templaType: template_type
                    })
                }
            }
        }, error => {
            if (error && error.status !== 401) {
                this.ErrorAlertbar("Something went wrong, Please try again later.")
            }
        })
    }

    getCKData = (e) => {
        //console.log(e.editor.getData(), 'ffgf')

        this.setState({
            currentTempData: e.editor.getData()
        })


    }

    showDescription = (key, index) => {
        this.setState({
            contentKey: key,
            contentIndex: index
        })


    }

    updateTemplateType = (e) => {
        e.preventDefault();
        this.setState({
            isloading: true
        })
        let paramsData = {
            type: this.state.templaType,
            content: this.state.currentTempData,
            templateId: this.state.contentKey
        }
        Apimanager.putTemplate(paramsData, success => {
            if (success.data && success.data.settings && success.data.settings.status === 1) {
                this.setState({
                    isloading: false
                })
                this.sweetAlertbar(success.data.settings.message)
                this.getTemplateData(this.state.templaType);

            }


        }, error => {
            if (error && error.status !== 401) {
                this.ErrorAlertbar("Something went wrong, Please try again later.", () => this.formClear())
            }
        })
    }

    getTemplate = (template_type) => {
        if (this.state.templaType === template_type) {
            return
        }
        this.getTemplateData(template_type);
        var textTemp = ''
        var emailTemp = ''
        if (template_type === "text") {
            textTemp = 'active'

        } else {
            emailTemp = "active"
        }
        this.setState((prevState) => {
            return { textChecked: textTemp, emailchecked: emailTemp, isloading: true, contentIndex: 0 }
        })
    }

    render() {
        let { isloading } = this.state
        let invitationType = '';

        if (this.state.contentData) {
            invitationType = this.state.contentData.map((list, index) => {
                // let cKey = ''
                // if (list.key === "inviteByPatient") {
                //     cKey = "Invite by patient"
                // } else if (list.key === "invitePatientbyAdmin") {
                //     cKey = "Invite patient by admin"
                // } else if (list.key === "inviteText") {
                //     cKey = "Invite text"
                // } else if (ist.key === "AddProviderEmail") {
                //     cKey = "Add Provider email"
                // } else if (ist.key === "AddProviderEmail") {
                //     cKey = "Add Provider email"
                // } else if (ist.key === "AddProviderEmail") {
                //     cKey = "Add Provider email"
                // }

                return (
                    <li key={index} onClick={() => this.showDescription(list.key, index)} className={this.state.contentIndex === index ? "active" : ''}>
                        <div className="detail-icon-diagnosis no-arrow" >
                            <span className="list-icon" >

                            </span>
                            <div className="label">
                                <span className="detail-name">{list.key}</span>
                            </div>
                        </div>
                    </li>
                )
            })
        }

        return (
            <div className="page-body-wrapper patient-list-wrap template-list-info">

                <div className="sidebar-fixed-search sidebar-fixed-date chapter-header">
                    <div id="cahpterDetail" className="chapter-detail chapter-detail-list">
                        <ul className="chapter-detail-list chapter-detail-list-template" style={{ height: '100%' }}>
                            {invitationType}
                        </ul>
                    </div>
                </div>

                <div className="invite-user-page template-page inviter-user-info">
                    {/* <div className="template-radio-div"> <span ><input id="template_text" type="radio" checked={this.state.textChecked} onClick={() => this.getTemplate('text')} readOnly={true} name="template_type" value="text" />
                        <label style={{ cursor: "pointer", marginRight: "25px" }} htmlFor="template_text">Text</label>
                        <input id="template_email" type="radio" checked={this.state.emailchecked} onClick={() => this.getTemplate('email')} readOnly={true} name="template_type" value="email" />
                        <label style={{ cursor: "pointer" }} htmlFor="template_email">Email</label>
                    </span>  </div> */}
                    <div className="template-button share-centered">
                        <div className={"share-btn " + this.state.textChecked} id="media">
                            <button className="media-btn" onClick={() => this.getTemplate('text')}>Text</button>
                        </div>
                        <div className={"share-btn text " + this.state.emailchecked} id="text">
                            <button className="text-btn" onClick={() => this.getTemplate('email')}>Email</button>
                        </div>
                    </div>
                    <form onSubmit="event.preventDefault();">
                        <div>
                            <div className="floating-form">
                                <div className="floating-label clear-input">
                                    <input className="theme-input" type="text" readOnly={true} name="title" value={this.state.contentKey} maxLength="40" />
                                    {/* <label className="theme-label">{i18n && i18n.share && i18n.share.texttitle}</label> */}
                                </div>
                            </div>
                            {isloading === true && <LoadingIndicator />}
                            <div className="ck-editor">
                                <div className="floating-label clear-input">
                                    <CKEditor disabled={true} width="500px" data={this.state.contentData && this.state.contentData[this.state.contentIndex].content ? this.state.contentData[this.state.contentIndex].content : ''} onChange={(e) => this.getCKData(e)} />
                                    {/* <textarea className="theme-textarea" placeholder=" " type="text" name='description' cols={80} rows="15" onChange={this.descriptionValue}
                                    ></textarea> */}

                                    {/* <label className="theme-label">{i18n && i18n.share && i18n.share.textdesc}</label> */}
                                </div>
                            </div>

                            <div className="general-btns-group general-btns-full">
                                {/* <button onClick={this.clearall} className="btn btn-blue-border" disabled={isloading ? true : false}>{i18n && i18n.buttontext && i18n.buttontext.canceltext}</button> */}
                                {this.state.contentKey === "inviteText" ? "" : <button onClick={(e) => this.updateTemplateType(e)} disabled={!isloading && this.state.contentData ? false : true} className="btn btn-blue-block">{i18n && i18n.buttontext && i18n.buttontext.update}</button>}
                            </div>
                        </div>

                    </form>
                </div>
            </div>

        );
    }
}

export default Template;