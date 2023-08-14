import React, { Component, Suspense } from "react";
import "./Home.css";
import { ReactComponent as HomeSvg } from "../../../images/leftbar-icons/pb-home-icon.svg";
import { ReactComponent as PatientSvg } from "../../../images/leftbar-icons/patient-icon.svg";
import { ReactComponent as LibrarySvg } from "../../../images/leftbar-icons/new-library-icon.svg";
import { ReactComponent as TeamSvg } from "../../../images/leftbar-icons/Group.svg";
import activeProvider from "../../../images/leftbar-icons/inActiveProviders.svg";
import newIconProviderListing from "../../../images/leftbar-icons/inActiveProviderListing.svg";
import { Switch, Route, withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as dasboardActions from "../../../redux/actions/dashboard.action";
import { logout, getToken } from "../../../Apimanager/Networking";
import NotificationView from "../../../components/newcomponents/NotificationView/NotificationView";
import ModalPopup from "../../../components/newcomponents/ModalPopup";
import * as firebase from "firebase";
import Tooltip from "../../../common/tooltip";
import teamContainer from "../teamModule/container/teamContainer";
import NorthwellSamlLogin from "../../NorthwellSamlLogin";
import ViewDashboardCont from "../dashBoardModule/container/dashBoardCont";
import ActivatePatientCont from "../activatePatientModule/container/activatePatientContainer";
import { pendoIds } from "../../../Constants/pendoComponentIds/pendoConstants";
import * as actions from "../../../redux/actions/auth.action";
import * as profileActions from "../../../redux/actions/profile.action";
import ProvAboutModal from "../profile/content-section/ProvAboutModal";
import { setSelectedTeam } from "../../../redux/actions/teamList.action";
import Navbar from "./Navbar";
import ContentViewerCont from "../contentViewerModule/container/contentViewerCont";
import ReferralDetailsView from "../../../components/newcomponents/ReferralDetailsView/ReferralDetailsView";

const ResetPasswordContainer = React.lazy(() => import("../resetPasswordModule/container/resetPasswordCont"));
const Profile = React.lazy(() => import("../profile/Profile"));
const Dashboard = React.lazy(() => import("../dashboard/Dashboard"));
const Library = React.lazy(() => import("../library/Library"));
const SearchPageCont = React.lazy(() => import("../searchModule/container/SearchPageCont"));
const EditProfile = React.lazy(() => import("../EditProfile/EditProfile"));
const NotificationSettingsCont = React.lazy(() =>
   import("../NotificationSettingsModule/container/NotificationSettingsContainer")
);
const ProviderListingCont = React.lazy(() => import("../providerListingModule/containers/providerListingContainer"));

class Home extends Component {
   constructor(props) {
      super(props);
      this.state = {
         hospitals: [],
         activePage: window.location.pathname,
         storedObject: null,
         storage: null,
         showNotificationView: false,
         notif: null,
         showReferralFlag: false,
         libFiles: [],
         libfilesToUpload: [],
         libfilesUploading: false,
         showProgress: false,
         showHelp: false,
         provPicPath: "",
         provName: "",
         enterpriseDetails: "",
         createdContent: [],
      };
      this.accessToken = React.createRef(null);
      let $this = this;
      firebase.auth().onAuthStateChanged(async function (user) {
         if (!user) {
            logout();
         } else {
            $this.accessToken.current = await getToken();
         }
      });
   }

   static getDerivedStateFromProps(props, state) {
      let notif = props.history.location.state?.notif;
      let st = { ...state };
      st.activePage = window.location.pathname;
      if (notif && !notif?.type?.includes("care")) {
         st.notif = notif;
      }
      return { ...st };
   }
   navigateTo(path) {
      this.props.history.push(path);
      let activePage = "/";
      if (path.includes("patient")) {
         activePage = "/patient";
      }
      if (path.includes("library")) {
         activePage = "/library";
      }
      if (path.includes("team")) {
         activePage = "/team";
      }
      this.setState({ activePage: activePage });
   }

   toggleNotificationView = () => {
      this.setState({ showNotificationView: true });
      this.props.setNotificationCount({ notificationCount: 0 });
   };

   render() {
      const { userCredentials, featureFlags, aboutModal, setAboutModal, toggleContent, showContent } = this.props;
      const isLoggedOut = userCredentials === null || userCredentials === undefined;
      const componentToRender = false ? (
         <ViewDashboardCont />
      ) : (
         <Dashboard showReferral={this.state.showReferralFlag} {...this.props} />
      );
      const showProviderListing = featureFlags?.NewProviderListing || false;
      const showNotificationsSettings = featureFlags?.graphqlNotification || false;
      const showContentGlobal = showContent !== null;
      return (
         <div id="Home" className="w-100 h-100 d-flex flex-column overflow-hidden">
            {window.location.pathname !== "/details" && !isLoggedOut && (
               <Navbar
                  navigateTo={(val) => {
                     this.navigateTo(val);
                  }}
                  activePage={this.state.activePage}
                  className="bg-white w-100"
                  setNotification={() => this.toggleNotificationView()}
                  hospitals={this.state.hospitals}
                  {...this.props}
               />
            )}
            <div className="d-flex align-items-start  overflow-hidden ">
               {window.location.pathname !== "/details" && !isLoggedOut && (
                  <section id="sidebar">
                     <br />
                     <div
                        id={pendoIds.navHomeTab}
                        className={`sidebar-option text-grey7 ${this.state.activePage === "/" ? "selected" : ""}`}
                        onClick={() => this.navigateTo("/")}
                     >
                        <Tooltip text={"Home"} home>
                           <HomeSvg className="sidebar-icon text-grey7" />
                        </Tooltip>
                     </div>
                     <div
                        id={pendoIds.navPatientTab}
                        className={`sidebar-option text-grey7 ${
                           this.state.activePage.includes("/patient") ? "selected" : ""
                        }`}
                        onClick={() => this.navigateTo("/patient")}
                     >
                        <Tooltip text={"Patients"} home>
                           <PatientSvg className="sidebar-icon" />
                        </Tooltip>
                     </div>

                     {this.props.userCredentials.user?.role?.includes("admin") && (
                        <div
                           id={pendoIds.navLibraryTab}
                           className={`sidebar-option text-grey7 ${
                              this.state.activePage.includes("/library") ? "selected" : ""
                           }`}
                           onClick={() => this.navigateTo("/library")}
                        >
                           <Tooltip text={"Library"} home>
                              <LibrarySvg className="sidebar-icon" />
                           </Tooltip>
                        </div>
                     )}

                     <div
                        id={pendoIds.navTeamTab}
                        className={`sidebar-option text-grey7 ${
                           this.state.activePage.includes("/team") ? "selected" : ""
                        }`}
                        onClick={() => {
                           this.navigateTo("/team");
                           this.props.setSelectedTeam(null);
                        }}
                     >
                        <Tooltip text={"Team"} home>
                           <TeamSvg className="sidebar-icon" />
                        </Tooltip>
                     </div>
                     {showProviderListing && (
                        <div
                           id={pendoIds.navProviderTab}
                           className={`sidebar-option text-grey7 ${
                              this.state.activePage.includes("/providers") ? "selected" : ""
                           }`}
                           onClick={() => this.navigateTo("/providers")}
                        >
                           <Tooltip text={"Providers"} home>
                              {this.state.activePage.includes("/providers") ? (
                                 <img src={activeProvider} alt="active-provider" />
                              ) : (
                                 <img src={newIconProviderListing} alt="inactive-provider" />
                              )}
                           </Tooltip>
                        </div>
                     )}
                  </section>
               )}

               <section
                  id="pages-section"
                  style={{ width: "70%", height: "91.3vh" }}
                  className="flex-column flex-grow-1 justify-content-start "
               >
                  <Suspense fallback={<div />}>
                     <Switch>
                        <Route
                           key="1"
                           exact
                           path="/"
                           render={(props) => (!isLoggedOut ? componentToRender : <NorthwellSamlLogin />)}
                        />
                        <Route key="2" path="/patient/:id?" component={Profile} />
                        {(process.env.NODE_ENV === "development" || process.env.NODE_ENV === "staging") && (
                           <Route key="8" exact path="/new-dashboard" component={ViewDashboardCont} />
                        )}
                        <Route key="9" exact path="/activate-patient" component={ActivatePatientCont} />
                        {showProviderListing && (
                           <Route key="10" exact path="/providers" component={ProviderListingCont} />
                        )}
                        <Route key="3" path="/library/:id?" render={(props) => <Library {...props} />} />
                        <Route key="4" exact path="/search" component={SearchPageCont} />
                        <Route key="5" exact path="/edit-profile" render={(props) => <EditProfile />} />
                        <Route key="6" exact path="/change-password" component={ResetPasswordContainer} />
                        <Route key="7" path="/team/:id?" component={teamContainer} />
                        {showNotificationsSettings && (
                           <Route key="8" exact path="/notification-settings" component={NotificationSettingsCont} />
                        )}
                     </Switch>
                  </Suspense>
               </section>
            </div>
            {this.state.showNotificationView ? (
               <ModalPopup
                  className="bg-transparent"
                  id="notification-view-modal"
                  onModalTapped={() => {
                     this.setState({
                        showNotificationView: false,
                     });
                  }}
               >
                  <NotificationView
                     closeNotifView={() => {
                        this.setState({ showNotificationView: false });
                     }}
                  />
               </ModalPopup>
            ) : null}
            {showContentGlobal && (
               <ModalPopup
                  id="media-view-modal"
                  onModalTapped={() => {
                     toggleContent(null);
                  }}
               >
                  {showContent?.contentId === "referral" ? (
                     <ReferralDetailsView referralDetails={showContent?.patientId} />
                  ) : (
                     <ContentViewerCont contentId={showContent?.contentId} patientId={showContent?.patientId} />
                  )}
               </ModalPopup>
            )}

            {aboutModal ? (
               <ModalPopup id="enter-action-button" onModalTapped={() => setAboutModal()}>
                  <ProvAboutModal onClose={() => setAboutModal()} />
               </ModalPopup>
            ) : null}
         </div>
      );
   }
}

const mapStateToProps = (state) => {
   return {
      notificationCount: state.dashboardStates.notificationCount,
      userCredentials: state.auth.userCredentials,
      fbUser: state.auth.northwelluser?.user,
      featureFlags: state.launchdarkly.ldFeatureFlags,
      aboutModal: state.patientProfile?.showProviderAboutModal,
      loggedInProviderDetails: state.auth?.loggedInProviderDetails,
      showContent: state.dashboardStates?.showContent,
   };
};
const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         setNotificationCount: dasboardActions.setNotificationCount,
         setEnterPriseDetails: dasboardActions.setEnterPriseDetails,
         savenorthwelluserobj: actions.savenorthwelluserobj,
         saveusercredentials: actions.saveusercredentials,
         setAboutModal: profileActions.setProviderAboutModal,
         setSelectedTeam: setSelectedTeam,
         toggleContent: dasboardActions.toggleContent,
      },
      dispatch
   );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));
