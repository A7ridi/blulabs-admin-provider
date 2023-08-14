import React from "react";
import Share from "./Share";
import MediauploadSuccess from "./MediauploadSuccess";
import LoadingIndicator from "../common/LoadingIndicator";

class ShareLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stepCont: 1,
      isloading: true,
    };
  }
  componentDidMount() {
    this.props.headerupdate(this.props);
    this.setState({ isloading: true });
    setTimeout(() => this.setState({ isloading: false }), 1000);
    this.changeStep(1);
  }

  componentWillReceiveProps(props) {
    if (props.match.params.chapterId !== this.props.match.params.chapterId) {
      this.setState({ isloading: true });
      setTimeout(() => {
        this.setState({ isloading: false }, () => {
          //props.headerupdate(props)
        });
      }, 1000);

      props.headerupdate(props);
    }

    this.changeStep(1);
  }
  changeStep = (callback) => {
    this.setState({ stepCont: callback });
  };

  render() {
    const { stepCont, isloading } = this.state;
    const { location, storedObject } = this.props;
    let uploadType = "";

    if (location && location.pathname.includes("media")) {
      uploadType = "media";
    } else if (location && location.pathname.includes("text")) {
      uploadType = "text";
    }

    let visitEID = "";
    if (location && location.state && location.state.enterpriseId) {
      visitEID = location.state.enterpriseId;
    }

    let loginUserEID = "";
    if (storedObject) {
      loginUserEID = JSON.parse(storedObject.userCredentials);
    }

    return (
      <div className="page-body-wrapper with-sharebtn withcontent-list">
        {isloading ? (
          <div id="cahpter" style={{ paddingTop: 10, paddingBottom: 10 }}>
            <div className="chapter-template discharg-wrapper">
              <LoadingIndicator />
            </div>
          </div>
        ) : location &&
          location.state &&
          location.state.shearedparams &&
          location.state.shearedparams.title &&
          location.state.shearedparams.visitUser &&
          location.state.shearedparams.visitUser.name &&
          this.props.showMedia &&
          visitEID === loginUserEID ? (
          <center>
            <p className="temp-title">
              {location.state.shearedparams.visitUser.name} -{" "}
              {location.state.shearedparams.title} - {uploadType}
            </p>
          </center>
        ) : (
          ""
        )}
        {stepCont === 1 && !isloading && (
          <Share
            {...this.props}
            current={stepCont}
            changestep={this.changeStep}
          />
        )}
        {stepCont === 2 && (
          <MediauploadSuccess changestep={this.changeStep} {...this.props} />
        )}
      </div>
    );
  }
}
export default ShareLayout;
