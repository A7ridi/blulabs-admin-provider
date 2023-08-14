import React from "react";
import { Route, Switch } from "react-router-dom";

import BaseComponent from "../components/BaseComponent";
import { connect } from "react-redux";

const Chapter = React.lazy(() => import("../viewpages/Chapter"));

const Visits = React.lazy(() => import("../viewpages/Visits"));

const AsidebarRoutes = [
  // {
  //   path: "/patient/:patientid",
  //   exact: true,
  //   name: "Visits",
  //   componentName: Visits,
  // },
  {
    path: "/patient/:patientid/visit/:visitid",
    exact: true,
    name: "Chapter",
    componentName: Chapter,
  },
  //{ path: "/patient/:patientid/visit/:visitid/:chapterId/share/*", exact: true, name: 'Item List', componentName: MediaList },
  {
    path: "/patient/:patientid/visit/:visitid/:chapterId/*",
    exact: true,
    name: "Chapter",
    componentName: Chapter,
  },
  // { path: "/*", exact: true, name: "Patient", componentName: Patient },
];

class DefaultAsidebar extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedchaptertitle: "",
      storedObject: null,
      visitChapters: null,
    };
  }
  componentDidMount() {
    this.setState({
      storedObject: JSON.parse(this.props.data.northwelluser),
    });
  }
  static getDerivedStateFromProps(props, state) {
    return {
      storedObject: JSON.parse(props.data.northwelluser),
    };
  }
  getVisitObject(visitChapters) {
    this.setState({
      visitChapters,
    });
  }

  handleChange = (selectedchaptertitle) => {
    this.setState({ selectedchaptertitle });
  };

  render() {
    let url = window.location.pathname;
    return (
      <div
        className={url === "/document-library" ? "" : "sidebar slider-content"}
        id="sidebar"
      >
        {AsidebarRoutes && Array.isArray(AsidebarRoutes) && (
          <Switch>
            {AsidebarRoutes.map((route, idx) => {
              return (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  render={(props) => (
                    <route.componentName
                      {...props}
                      getVisitObject={this.getVisitObject.bind(this)}
                    />
                  )}
                />
              );
            })}
          </Switch>
        )}
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    data: state.auth,
    storage: state.storage,
  };
};
export default connect(mapStateToProps)(DefaultAsidebar);
