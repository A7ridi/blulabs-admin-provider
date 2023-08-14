import React, { Component, Suspense } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Header from "./Header";
import { connect } from "react-redux";
import LoadingIndicator from "../common/LoadingIndicator";
//import DefaultAsidebar from "./DefaultAsidebar";
import * as i18n from "../I18n/en.json";
import routes from "../route";
import ModalPopup from "../components/ModalPopup/ModalPopup";
import * as dashboardActions from "../redux/actions/dashboard.action";
import { bindActionCreators } from "redux";
import Socket from "../helper/Websocket";

window.socket = new Socket();
class DefaultLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebar: true,
      storedObject: null,
      storage: null,
      getnavigationmore: null,
      showMedia: true,
      contentDescription: null,
    };
  }
  static getDerivedStateFromProps(props, state) {
    return {
      storedObject: props.data,
      storage: props.storage,
    };
  }
  headerupdate = (callback = null) => {
    this.setState({}, () => {
      this.setState({
        getnavigationmore: callback,
      });
    });
  };

  hideMediaText = (object = null) => {
    this.setState({
      showMedia: false,
      contentDescription: object,
    });
  };

  showMediaText = () => {
    this.setState({
      showMedia: true,
      contentDescription: "",
    });
  };

  closeModalPopup = (status) => {
    if (status === false) {
      this.props.setShowMediaPopup({ showMediaPopup: false });
    }
  };

  loading = () => (
    <div className="animated fadeIn pt-3 text-center">
      {i18n && i18n.loadingtext}
    </div>
  );
  render() {
    const { storedObject, storage } = this.state;
    if (!storedObject) {
      return (
        <div className="login-loader">
          <LoadingIndicator />
        </div>
      );
    }

    let location = "";

    if (
      this.props &&
      this.props.location &&
      this.props.location.pathname === "/video-call"
    ) {
      location = "no";
    }

    return (
      <div className="d-flex">
        {location ? (
          ""
        ) : (
          <Header
            storedObject={storedObject}
            showMedia={this.state.showMedia}
            storage={storage}
            getnavigationmore={this.state.getnavigationmore}
          />
        )}
        <Suspense fallback={this.loading()}>
          <Route
            path="/"
            name="Home"
            // render={(props) => location ? ("") : this.props.location.pathname === "/" || this.props.location.pathname === "/patient-list" || this.props.location.pathname === "/invitepatient" ? ("") : ""}
            render={(props) => ""}
          />
          {routes && Array.isArray(routes) && (
            <Switch>
              {routes.map((route, idx) => {
                return (
                  <Route
                    key={idx}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    render={(props) => (
                      <route.component
                        storedObject={storedObject}
                        storage={storage}
                        {...props}
                        headerupdate={this.headerupdate}
                        hideMediaText={this.hideMediaText}
                        showMediaText={this.showMediaText}
                        showMedia={this.state.showMedia}
                        contentDescription={this.state.contentDescription}
                      />
                    )}
                  />
                );
              })}
            </Switch>
          )}
        </Suspense>
        {this.props.showMediaPopup ? (
          <ModalPopup closeModalPopup={this.closeModalPopup} />
        ) : null}
      </div>
    );
  }
}

// export default DefaultLayout;
const mapStateToProps = (state) => {
  return {
    data: state.auth,
    storage: state.storage,
    showMediaPopup: state.dashboardStates.showMediaPopup,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      setShowMediaPopup: dashboardActions.setShowMediaPopup,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DefaultLayout);
