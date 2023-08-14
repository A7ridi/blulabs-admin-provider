<div className="modal fade custom-modal visit-modal" id="myModal" role="dialog">
    <div className="modal-dialog">
        {this.state.isDuplicate && !this.state.showSuccess ?
            <div className="modal-content">
                <div className="modal-header">
                    <h4 className="modal-title duplicate-title">Duplicate Visit</h4>
                    <button type="button" id="visitModelDismiss" onClick={() => this.removeDuplicate("visitModelDismiss")} className="close" data-dismiss="modal"  >&times;</button>
                    {/* onClick={() => this.getVisits(this.props.match.params.patientid)} */}

                </div>
                <div className="moda-body">
                    <p className="mb-3">{this.state.oldVisitData.addedByName} Created a visit for this patient {this.state.userObject.data.name} , please see the visit below</p>
                    <div className="card mb-5">
                        <div className="modal-content-wrapper duplicate-visit-modal">
                            {/* {
                                                !isVisitaddLoading ?
                                                    <div id="cahpter" className="sidebar-inner chapter-wrapper chapter-header">
                                                        <div className="chapter-template-loader">
                                                            <LoadingIndicator />
                                                        </div>
                                                    </div>
                                                    : ''
                                            } */}
                            {/* {this.timeDifference(new Date().getTime(), this.state.oldVisitData.lastActionDate)} */}

                            <div className="sidebar-inner chapter-wrapper chapter-header">
                                <ul className="template-list-wrapper chapter-list duplicate-visit">
                                    <li>
                                        <div className="visit-list">
                                            {
                                                this.state.oldVisitData && this.state.oldVisitData.visitType === 'WCV' ? undefined :
                                                    <div className="chapterbutton">
                                                        {this.state["img"] === false ? (
                                                            <svg
                                                                style={{ margin: "5px" }}
                                                                width="30px"
                                                                height="30px"
                                                                viewBox="0 0 108 108"
                                                                version="1.1"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                xlink="http://www.w3.org/1999/xlink"
                                                            >
                                                                <g
                                                                    id="Page-1"
                                                                    stroke="none"
                                                                    strokeWidth="1"
                                                                    fill="none"
                                                                    fillRule="evenodd"
                                                                >
                                                                    <image
                                                                        id="icon-hospital_3x"
                                                                        x="0"
                                                                        y="-2"
                                                                        width="108"
                                                                        height="111"
                                                                        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGwAAABvCAYAAAAJ8iVjAAAABGdBTUEAALGOfPtRkwAABINJREFUeAHtnb1qVEEUx3djChUFURSUINiIPoCWNlEsrKx8gHS+gS8QX0KbNBYW1oJaCHY+QLBRRIIBBcFGMMnmf9C9SHbm7p2zc+85Z/1fGHIzM+dj/r/7Mbv3Y0cjLlSACvSnwLg/1388TyaTR1i723ccJ/5fjsfjx33mstqn87++r+PvLZTeN44BxtIWYoLGz20darSt1HDSwcd+hz7RuwwyxqGARYfhJn8Cc4OiWyIE1k0nN72GmHTkBnuAhh+5Ruf1Z5CfycZuCWwXU+BLzsEk08NHlR00XEw29lxpspX0PKaldk9gwfASGIEFUyBYutzDCCyYAsHS5R5GYMEUCJYu9zACC6ZAsHS5hxFYMAWCpcs9jMCCKRAsXe5hBBZMgWDpWl7ArCoVLiqehsNrGafbuFj6M9MWqnppgEH1myivMurfRv3rTFuo6lVsmbvIuE9wp0IpsliyD6DnvcVctFrvCagLrV3Y2FWB6UZ/tquBph9niRrVDG0IzFB8TWgC06hmaENghuJrQk9PlEdt5a7cLygfjzYo/pfPRudQcrEULl2a7CGr7yjbFbK7Ah9rKLM7FKahqWUflZsVAo/gZwvldyKI3D1bbYH/9USMadV6tUBwBKc7U8f//JUxbtWIAz+bKMJgZpklWCMiffSmgPvDFDaxOxj9E5R5T3Aeb1HpGfz8ammXJnmCcgNfYeW+LZljPkyze2CQ4QTK5QXlON/R/mTHfmbdeEg0k14XmMB0uplZEZiZ9LrABKbTzcwqwqRDHqt9jzJvligXMK9mlPyA+nkXMGWW6P4RXvfAMM1+CyFvZEA01Zi2y4fj3JT8IfwsxQVMHhIb5DFWCCwGpyZLAmukiLFCYDE4NVkSWCNFjBUCi8GpyZLAGilirBBYDE5NlgTWSBFjxf03HQUyvkNfuRcitXxNVUasWxpg+OpJrih/igihJGceEkvUctCXwBxAKEmBwErUctCXwBxAKEmBwErUctCXwBxAKEmBwErUctCXwBxAKEmBwErUctCXwBxAKEmBwErUctCXwBxAKEmBwErUctCXwBxAKEmBwErUctCXwBxAKEmBwErUctDX5RVnPNhwH9psGOvzFFexXxjnMBPeJTBkKfdmyFvRBvnl1hlVRqNjqHuTqB+qKvtolVdgU2FEuP9xkWfVkgvPYUlZ/FYSmF82ycwILCmL30rv57CUcvPeaJOyaatre4NOm12fbWEnHSlR1jDdlremLbzg44O8Ze7bwo7qO+Cko76mNh55DrPRXR2VwNTS2RgSmI3u6qgEppbOxpDAbHRXRyUwtXQ2hgRmo7s6KoGppbMxJDAb3dVRCUwtnY0hgdnoro5KYGrpbAwJzEZ3dVQCU0tnY0hgNrqroxKYWjobQwKz0V0dlcDU0tkYEpiN7uqoBKaWzsaQwGx0V0cd41av1C1VUpe9N04RTR5qWPb75GuPMckgB0zBhCZDKMBD4hAqV4xBYBXFHMIVgQ2hcsUY04ch5JfRpXDxq4DsXCsC7DlKzRmh3yHHzyw1o48/qmUewSF8n+w4kW9VSgAAAABJRU5ErkJggg=="
                                                                    ></image>
                                                                </g>
                                                            </svg>
                                                        ) : (
                                                                <span className="visit-list-icon">
                                                                    <img
                                                                        alt=""
                                                                        title={this.state.oldVisitData.location.name}
                                                                        onError={() => this.checkImage("img")}
                                                                        src={`https://storage.googleapis.com/${process.env.REACT_APP_STORAGEBUCKET}/${this.state.oldVisitData.location.id}`}
                                                                    />
                                                                </span>
                                                            )}
                                                        <div className="visit-list-content">
                                                            {

                                                                this.state.oldVisitData && this.state.oldVisitData.visitType === 'WCV' ?
                                                                    <><span className="box-title-sub">{this.state.oldVisitData && this.state.oldVisitData.visitType ? this.renderSwitch(this.state.oldVisitData.visitType) : ''}</span>                                                                    </>
                                                                    :
                                                                    this.state.oldVisitData && this.state.oldVisitData.isHospitalVisit && this.state.oldVisitData.lastAction === '' ?
                                                                        <> <span className="box-title-sub">{"Hospital visit on " + moment.unix(this.state.oldVisitData.lastActionDate).format("MM/DD/YYYY")}</span> </>
                                                                        :
                                                                        this.state.oldVisitData && this.state.oldVisitData.isOfficeVisit ?
                                                                            <> <span className="box-title-sub">{"Office visit on " + moment.unix(this.state.oldVisitData.lastActionDate).format("MM/DD/YYYY")}</span> </>
                                                                            :
                                                                            this.state.oldVisitData && this.state.oldVisitData.visitType === 'ANR' ?
                                                                                <> <span className="box-title-sub">{"Office visit on " + moment.unix(this.state.oldVisitData.lastActionDate).format("MM/DD/YYYY")}</span> </>
                                                                                :
                                                                                <><span className="box-title-sub">{this.state.oldVisitData && this.state.oldVisitData.lastAction ? this.state.oldVisitData.lastAction + " on " + moment.unix(this.state.oldVisitData.lastActionDate).format("MM/DD/YYYY") : ''}</span></>
                                                            }
                                                            <span>{this.state.oldVisitData && this.state.oldVisitData.location && this.state.oldVisitData.location.name ? this.state.oldVisitData.location.name : ''}</span>
                                                            <span className="box-title-sub">{this.state.oldVisitData && this.state.oldVisitData.department && this.state.oldVisitData.department.name ? this.state.oldVisitData.department.name : ''}</span>

                                                        </div>
                                                    </div>
                                            }
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {chapterList ?
                            <div id="cahpterDetail" className="chapter-detail">

                                <ul className="chapter-detail-list duplicate-visit-chapter">
                                    {chapterList}
                                </ul>
                            </div>
                            : ''}
                        <br />

                    </div>
                    <p>If this is a new visit and you wish to create another visit. please click on button below</p>
                </div>
                {
                    isVisitaddLoading ?
                        <div id="cahpter" className="sidebar-inner chapter-wrapper chapter-header">
                            <div className="chapter-template-loader">
                                <LoadingIndicator />
                            </div>
                        </div>
                        : ''
                }
                <div className="modal-footer mt-5 d-flex justify-content-around">
                    {/* <button type="button" className="btn btn-blue-border m-2" data-dismiss="modal" >Close</button> */}
                    <button type="button" className="btn btn-blue-border" data-dismiss="modal" onClick={() => this.removeDuplicate("visitModelDismiss")} >{i18n && i18n.buttontext && i18n.buttontext.closeText}</button>
                    <button type="button" className="btn btn-blue-block m-2" disabled={isVisitaddLoading ? true : false} onClick={() => this.saveNewVisit(this.state.createVisitType === 'isHospitalVisit' ? 'isHospitalVisit' : 'isOfficeVisit', 'allow')}>Create New Visit</button>
                    {/* <button type="button" className="btn btn-blue-block m-2" disabled={isVisitaddLoading ? true : false} onClick={() => this.saveNewVisit('isOfficeVisit')}>{i18n && i18n.buttontext && i18n.buttontext.OutPatient}</button> */}
                </div>
            </div>
            :
            <div className="modal-content">
                {!this.state.providerData ? <>
                    {!this.state.showSuccess ?
                        <React.Fragment>
                            <div className="modal-header">
                                <h4 className="modal-title">Create New Visit</h4>
                                <button type="button" id="visitModelDismiss" onClick={() => this.removeDuplicate("visitModelDismiss")} className="close" data-dismiss="modal"  >&times;</button>
                                {/* onClick={() => this.getVisits(this.props.match.params.patientid)} */}

                            </div>
                            <div className="modal-body p-0">
                                {
                                    isVisitaddLoading ?
                                        <div id="cahpter" className="sidebar-inner chapter-wrapper chapter-header">
                                            <div className="chapter-template-loader">
                                                <LoadingIndicator />
                                            </div>
                                        </div>
                                        : ''
                                }

                                <div className="row">


                                    <div className="col-sm-6">
                                        <button type="button" className="btn visit-button" disabled={isVisitaddLoading ? true : false} onClick={() => this.saveNewVisit('isOfficeVisit')}>
                                            <span className="visit-icon">
                                                <img alt="Headshot" src="/assets/images/visit-icon1.svg" />
                                            </span>
                                            {i18n && i18n.buttontext && i18n.buttontext.OutPatient}
                                        </button>
                                    </div>
                                    <div className="col-sm-6">
                                        <button type="button" className="btn visit-button" disabled={isVisitaddLoading ? true : false} onClick={() => this.saveNewVisit('isHospitalVisit')}>
                                            <span className="visit-icon">

                                                <img alt="Headshot" src="/assets/images/visit-icon2.svg" />
                                            </span>
                                            {i18n && i18n.buttontext && i18n.buttontext.InPatient}
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </React.Fragment> :


                        <React.Fragment>
                            <div className="modal-header mb-3">
                                <h4 className="modal-title">Visit created successfully!</h4>
                                <button type="button" id="successModelDismiss" onClick={() => this.removeDuplicate("successModelDismiss")} className="close" data-dismiss="modal"  >&times;</button>
                            </div>
                            <div className="modal-body p-0">
                                {
                                    isVisitaddLoading ?
                                        <div id="cahpter" className="sidebar-inner chapter-wrapper chapter-header">
                                            <div className="chapter-template-loader">
                                                <LoadingIndicator />
                                            </div>
                                        </div>
                                        : ''
                                }
                                <div className="modal-body p-0">
                                    <div className="modal-body p-0">
                                        <p className="your-request">If you would like to add additional providers to this visit Care Team please tap “Add to Care Team” below.</p>
                                        <div className="request-success">
                                            <div className="success-image">
                                                <img src="/assets/images/success-icon.svg" alt="Success" />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-6 mt-4">
                                                <button className="btn btn-blue-block w-100" disabled={isVisitaddLoading ? true : false} onClick={() => this.getProvider()}>Add to Care Team</button>
                                            </div>
                                            <div className="col-sm-6 mt-4">
                                                <button className="btn btn-blue-border w-100" disabled={isVisitaddLoading ? true : false} onClick={() => this.removeDuplicate("successModelDismiss")} >Done</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    }
                </> : ""}


                {/*  */}
                {!this.state.showSuccess && this.state.providerData ? <>
                    <div className="modal-header mb-3">
                        <h4 className="modal-title">Add to Care Team</h4>
                        <button type="button" id="visitModelDismiss" onClick={() => this.removeDuplicate("visitModelDismiss")} className="close" data-dismiss="modal"  >&times;</button>
                    </div>
                    <div className="modal-body p-0">
                        <div className="modal-body p-0">
                            <div className="modal-body p-0">
                                {
                                    isVisitaddLoading ?
                                        <div id="cahpter" className="sidebar-inner chapter-wrapper chapter-header">
                                            <div className="chapter-template-loader">
                                                <LoadingIndicator />
                                            </div>
                                        </div>
                                        : ''
                                }
                                <p className="your-request mb-3">Would you like to add other to this visit's care team?</p>
                                <div className="custom-filed">
                                    <input type="text" onChange={this.searchProvider} value={this.state.sProvider} className="custom-input grey-input" placeholder="Search" />
                                    {this.state.sProvider ? <button
                                        className="icon-close"
                                        style={{ marginRight: "10px" }}
                                        onClick={() => this.removeSearchData()}
                                    /> : ""}
                                </div>
                                <div className="search-result">
                                    <ul>
                                        {providerData ? providerData : <div class="center-text"><span><h2 class="no-result">No record found</h2></span></div>}
                                    </ul>
                                </div>
                                <div className="text-center">
                                    <button className="btn btn-blue-block" disabled={(isVisitaddLoading || _.isEmpty(selectedProvider)) ? true : false} onClick={() => this.inviteMultiple()}>Add to Care Team</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </> : ""}


            </div>



        }
    </div>
</div >
