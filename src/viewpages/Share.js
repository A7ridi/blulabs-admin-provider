import React from "react";
import { withRouter } from "react-router";
import { Line } from "rc-progress";
import _ from "lodash";
import BaseComponent from "../components/BaseComponent";
import Apimanager from "../Apimanager";
import LoadingIndicator from "../common/LoadingIndicator";
import * as i18n from "../I18n/en.json";
import MediaList from "../viewpages/MediaList";
import CateTeamList from "../viewpages/CareTeamList";
import ReactAudioPlayer from "react-audio-player";

/* eslint-disable no-unused-vars */
import ScreenRecording from '../layout/ScreenRecording'
import $ from "jquery";
import axios from "axios"
import { store } from "../redux/store";
import * as actions from "../redux/actions/auth.action";
import GoogleMap from './GoogleMap'
import moment from 'moment'
import swal from "sweetalert";
import swal1 from '@sweetalert/with-react'
import { previewfileformat, backgroundImage, allowdVideotypes, iconVideotypes, attachmentTypes, accepttypes } from '../helper'

window.addEventListener('keydown', function (e) { if (e.keyIdentifier === 'U+000A' || e.keyIdentifier === 'Enter' || e.keyCode === 13) { if (e.target.nodeName === 'INPUT' && e.target.type === 'text') { e.preventDefault(); return false; } } }, true);


var initState = {
  isUploading: false,
  image: null,
  title: "",
  description: "",
  isForDoctor: false,
  binaryPath: null,
  percentageUploaded: 0,
  isloading: false,
  isuploadmedia: false,
  changeScreenLoading: false,
  showOverlay: false,
  contentDescriptions: "",
  medaiPath: "",
  mediaType: "",
  contentTitle: "",
  userData: "",
  visitEnterpriceID: '',
  mediaButtonType: "media",
  recordStart: false,
  searchProviderValue: "",
  searchProviderList: "",
  providerDetails: "",
  providerAddress: "",
  providerData: "",
  callCareAPI: false,
  libraryList: "",
  comingFromLib: false
};


var shearedparams = "";


function reverseString(str) {
  if (str) {
    return str.split("").join("");
  } else {
    return ''
  }
}



var controller = new AbortController();
var signal = controller.signal;

class Share extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = initState;
    this.shearedparams =
      props &&
      props.location &&
      props.location.state &&
      props.location.state.shearedparams;
  }

  getRecordedBlob = (blob) => {

    if (blob) {


      let reader = new FileReader();

      let fileData = new File([blob], "Screen-Recording.webm")

      reader.onloadend = (e) => {
        let newSelectedAttachment = {};
        newSelectedAttachment.attachmentUrl = URL.createObjectURL(blob);
        newSelectedAttachment.file = fileData;
        //newSelectedAttachment.blobData = blob;
        if (this.state.image === null) {
          this.setState({
            image: newSelectedAttachment,
            title: "Screen-Recording"
          });
        }
      };
      reader.readAsDataURL(fileData);

    }

  }

  componentDidMount() {
    if (
      this.props.contentDescription &&
      this.props.location.state.viewChange !== "yes"
    ) {
      this.showContentDescriptions(this.props.contentDescription);
    } else {
      this.props.showMediaText();
    }

    this.getLibraryList();
  }

  static getDerivedStateFromProps(props, state) {
    shearedparams =
      props &&
      props.location &&
      props.location.state &&
      props.location.state.shearedparams;

    return {
      storedObject: JSON.parse(props.storedObject.northwelluser),
      userData: JSON.parse(props.storedObject.userCredentials),

    };
  }
  getmimetype = (args) => {
    switch (args.filetype) {
      case "pdf":
        return "application/pdf";
      case "jpeg":
        return "image/jpeg";
      case "jpg":
        return "image/jpg";
      case "mp4":
        return "video/mp4";
      case "webm":
        return "video/webm";
      case "mov":
        return "video/quicktime";
      case "m4a":
        return "audio/m4a";
      case "mp3":
        return "audio/mp3";
      case "mpeg":
        return "audio/mpeg";
      case "text":
        return "text/plain";
      case "png":
        return "image/png";
      case "txt":
        return "text/plain";
      case "doc":
        return "application/msword";
      case "ppt":
        return "application/vnd.ms-powerpoint";
      case "rtf":
        return "text/rtf";
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case "pptx":
        return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      case "xls":
        return "application/vnd.ms-powerpoint";
      case "xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      default:
        return "image/jpeg";
    }
  };



  handleChange = (event) => {
    this.setState({ image: null });
    if (event.target.files && event.target.files[0]) {
      let fName = event.target.files[0].name.split(".")



      let reader = new FileReader();
      let file =
        event && event.target && event.target.files
          ? event.target.files[0]
          : null;
      reader.onloadend = (e) => {
        let newSelectedAttachment = {};
        newSelectedAttachment.attachmentUrl = URL.createObjectURL(file);
        newSelectedAttachment.file = file;
        newSelectedAttachment.blobData = e.target.result;
        this.setState({
          image: newSelectedAttachment,
          title: fName[0]
        });
      };

      reader.readAsDataURL(file);

    }
  };
  clearall = (e) => {
    e.preventDefault();
    this.setState({
      isUploading: false,
      image: null,
      title: "",
      description: "",
      isForDoctor: false,
      binaryPath: null,
      percentageUploaded: 0,
      isloading: false,
      isuploadmedia: false,
      changeScreenLoading: false,
      showOverlay: false,
      contentDescriptions: "",
      medaiPath: "",
      mediaType: "",
      contentTitle: "",
      userData: "",
      visitEnterpriceID: '',
      recordStart: false,
      providerDetails: "",
      providerAddress: "",
      providerData: "",
      searchProviderValue: "",
      searchProviderList: "",
      providerSlug: "",
      comingFromLib: false
    });

    //this.props.history.push(`/patient/${this.props.match.params.patientid}/visit/${this.props.match.params.visitid}`, { searchText: this.props.location.state.shearedparams.visitUser.name, patientObj: this.props.location.state.shearedparams.visitUser })
  };
  /**
   * Add chapter media create signed url
   * @argument image :object
   * @argument title: string
   * @argument binaryPath: binary string
   * @argument isForDoctor: boolean
   */
  addchapterMedia = async (e) => {
    e.preventDefault();
    const { location } = this.props;
    const { image, title, binaryPath, isForDoctor, description } = this.state;
    var existing =
      location &&
      location.state &&
      location.state.shearedparams &&
      location.state.shearedparams.media &&
      _.map(location.state.shearedparams.media, (object) => {
        return object.type;
      });
    var type =
      image && image.file && image.file.type && image.file.type.split("/");
    var filename =
      image && image.file && image.file.name && image.file.name.split(".");
    var isuploadmedia =
      this.props.match.params && (this.state.mediaButtonType === "media" || this.state.mediaButtonType === "record");

    if (isuploadmedia && !image) {
      this.notify(i18n && i18n.share && i18n.share.validchaptererrormsg);
      return;
    } else if (
      isuploadmedia &&
      type[0] === "video" &&
      !allowdVideotypes.includes(_.last(filename).toLowerCase())
    ) {
      this.notify(i18n && i18n.share && i18n.share.validmediaerrmsg);
      return;
    } else if (
      isuploadmedia &&
      !accepttypes.includes(_.last(filename).toLowerCase())
    ) {
      this.notify(i18n && i18n.share && i18n.share.validdocumenterrmsg);
      return;
    } else if (!title) {
      this.notify(i18n && i18n.share && i18n.share.titlenameerrmsg);
      return;
    } else if (!isuploadmedia && !description) {
      this.notify(i18n && i18n.share && i18n.share.textdesc);
      return;
    }
    this.setState({
      isloading: true,
    });
    var requestparams = {
      visitId: this.props.match.params.visitid,
      chapterId: this.props.match.params.chapterId,
    };
    var requestpayload = {
      type: filename
        ? this.getmimetype({ filetype: _.last(filename).toLowerCase() })
        : "text", // image && image.file && image.file.type || `application/${_.last(filename).toLowerCase()}`,
      title: title,
      isDoctorsOnly: isForDoctor,
      isConvert: this.state.mediaButtonType === "record" ? true : false
    };
    if (image) {
      requestpayload.location = image.file.name;
    } else if (!isuploadmedia && description) {
      //requestpayload.location = title;
      requestpayload.description = description;
    }
    if (
      !isuploadmedia &&
      !(
        shearedparams.type.toString() === "DOC" ||
        shearedparams.type.toString() === "DAU"
      )
    ) {
      // var argumentparams = {
      //     description: description
      // }
      // return
      this.addUpdateItem(requestpayload);
      return;
    } else {
      //requestpayload.location = title;
    }

    Apimanager.chapterMedia(
      requestparams,
      requestpayload,
      (success) => {
        if (!isuploadmedia) {
          this.setState(initState, () => this.props.changestep(2));
          return;
        }
        var uploadpayload = {
          binaryPath: binaryPath,
          imageObject: image.file,
          token: {},
          successResponse: success.data.data,
        };
        var argumentParams = {
          title: title,
          location:
            success &&
            success.data &&
            success.data.data &&
            success.data.data.items &&
            success.data.data.items.location,
          type: "media"
        };

        shearedparams.type.toString() === "DIS" && image.file.type === "application/pdf" && !existing.includes("application/pdf") &&
          this.addUpdateItem(argumentParams);
        isuploadmedia && image && this.setState({ isUploading: !this.state.isUploading }, () =>

          this.uploadmedia(uploadpayload)
        );
      },
      (error) => {
        if (error && error.status === 422) {
          this.notify(i18n && i18n.share && i18n.share.validchaptererrormsg);
          this.setState({
            isloading: !this.state.isloading,
          });
        }
        //error && error.status === 500 && this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
      }
    );
  };
  /**
   * using signed url store media to google storage bucket
   * fileObjectcontains signed path with storage bucket
   * @argument fileObject
   */
  uploadmedia = async (fileObject) => {
    var params = fileObject.imageObject;
    fileObject.token["Content-Type"] = "application/octet-stream";
    Apimanager.uploadmedia(
      fileObject.successResponse.signedUrl,
      params,
      (success) => {

        this.props.changestep(2);
      },
      (error) => {

        if (error && error.status === 500) {
          this.setState(initState, () =>
            this.notify(
              i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg
            )
          );
        }
      },
      (uploadmedia) => {


        let FileProgress = Math.floor(
          (uploadmedia / fileObject.imageObject.size) * 100
        );
        if (FileProgress === 100) {
          document.getElementById("redirectmsg").innerHTML =
            i18n.share.fileprocessing;
        }
        this.setState({ percentageUploaded: FileProgress });
      }
    );
  };
  /**
   * Add pdf item if file is pdf and visit type is discharge instruction
   *
   */
  addUpdateItem = (args) => {

    let params = {
      title: args && args.title,
      subTitle: args && args.description ? args.description : "No description",
      icon: "images.jpg",
    };

    if (args && args.type && args && args.location) {
      params = {
        title: args && args.title,
        subTitle: args && args.description ? args.description : "No description",
        icon: "images.jpg",
        type: args && args.type,
        location: args && args.location,

      };
    }

    var isuploadmedia =
      this.props.match.params && this.state.mediaButtonType === "media";
    var requestparams = {
      visitId: this.props.match.params.visitid,
      chapterId: this.props.match.params.chapterId,
    };

    Apimanager.addUpdateItem(
      requestparams,
      params,
      (success) => {
        if (isuploadmedia) {
          this.props.location.state.shearedparams.media.push({
            type: "application/pdf",
            description: "",
          });
        } else {
          this.setState(initState, () => this.props.changestep(2));
        }
      },
      (error) => {
        this.setState({
          isloading: false,
        });
        if (error && error.status === 500) {
          this.setState(initState, () => {
            this.notify(
              (error && error.message) ||
              (error &&
                error.data &&
                error.data.settings &&
                error.data.settings.message)
            );
            return;
          });
        }
        if (error && error.status === 403) {
          this.setState(initState, () => {
            this.notify(
              (error && error.message) ||
              (error &&
                error.data &&
                error.data.settings &&
                error.data.settings.message)
            );
            return;
          });
        }
      }
    );
  };
  showPreview = (image) => {

    var filename =
      image && image.file && image.file.name && image.file.name.split(".");
    //let pUrl =URL.createObjectURL(image)
    (filename &&
      previewfileformat.includes(_.last(filename)) &&
      window.open(image.attachmentUrl, "_blank")) ||
      this.notify(i18n && i18n.share && i18n.share.previewnotsupport);
  };
  changesharemedia = () => {
    const { isuploadmedia, changeScreenLoading } = this.state;
    this.setState({
      isuploadmedia: !isuploadmedia,
      changeScreenLoading: !changeScreenLoading,
    });
  };

  descriptionValue = (event) => {
    this.setState({ description: event.target.value });
  };


  showContentDescriptions = (object) => {

    if (object.fileType === 'text' || object.fileType === undefined || object.type === "text" || object.type === "item") {
      let ApiParam = {
        visitId: this.props.match.params.visitid,
        eventName: 'itemViewed',
        chapterId: object.chapterId,
        itemId: object.id,
      }

      Apimanager.activityLogs(
        ApiParam,
        (success) => {

        },
        (error) => {
          if (error && error.status === 500) {
            return;
          }
        }
      );
    }

    if (object.location && object.type !== "text") {
      let location = object.location.replace(".", "/");
      let split = object.location.split(".")

      let requestparams = {
        location: object.id,
      };
      let params = {
        operationType: "read",
      };

      Apimanager.getMediaURL(
        requestparams,
        params,
        (success) => {
          if (
            success &&
            success.data &&
            success.data.data &&
            success.data.data.signedUrl
          ) {
            if ((split[1].toLowerCase() === "pdf") || object.type.includes("application")

            ) {

              this.setState({
                showOverlay: true,
                contentDescriptions: split[1] === "pdf" || object.type === "application/pdf"
                  ? ""
                  : "This file will be downloaded",
                medaiPath: success.data.data.signedUrl,
                mediaType: "else",
                contentTitle: object.title,
              });

            } else {

              this.setState({
                showOverlay: true,
                contentDescriptions: object.type === "text/plain" ? "This file will be downloaded" : "",
                medaiPath: success.data.data.signedUrl,
                mediaType: object.type,
                contentTitle: object.title,
              });


              if (object.type === "text/plain") {
                var req = new XMLHttpRequest();
                req.overrideMimeType("application/json");
                req.open('GET', success.data.data.signedUrl, true);
                req.onload = function () {
                  //var jsonResponse = JSON.parse(req.responseText);
                  const element = document.createElement("a");
                  const file = new Blob([req.responseText], { type: 'text/plain' });
                  element.href = URL.createObjectURL(file);
                  element.download = object.fileName;
                  document.body.appendChild(element); // Required for this to work in FireFox
                  element.click();

                };
                req.send(null);
              }

            }
          }
        },
        (error) => {
          if (error && error.status === 500) {

            return;
          }
        }
      );
    } else {
      this.setState({
        showOverlay: true,
        contentDescriptions: object.description ? object.description : object.subTitle,
        medaiPath: "",
        mediaType: "",
        contentTitle: object.title,
      });
    }
  };

  closeContentDescription = () => {
    this.setState({
      showOverlay: false,
    });
    this.props.showMediaText();
  };

  changeScreen = (type) => {

    var nAgt = navigator.userAgent;

    if (type === "record") {
      if ((nAgt.indexOf("Chrome")) !== -1) {
        this.setState({
          mediaButtonType: type,
          title: "",
          description: "",
          image: null,
          recordStart: false
        })

        this.props.history.push(`/patient/${this.props.match.params.patientid}/visit/${this.props.match.params.visitid}/${this.props.location.state.shearedparams.id}/share/${type}`, { shearedparams: this.props.location.state.shearedparams, enterpriseId: this.props.location.state.enterpriseId })
      } else {

        swal1(<div>
          <p>
            Your browser doesn't support screen recording.
          </p>
          <p>
            Screen recording is supported on Chrome <a href='https://www.google.com/chrome/' target='_blank' rel="noopener noreferrer">Click here</a> to download Chrome

            </p>
        </div>)
      }
    } else {
      this.setState({
        mediaButtonType: type,
        title: "",
        description: "",
        image: null,
        recordStart: false
      })

      this.props.history.push(`/patient/${this.props.match.params.patientid}/visit/${this.props.match.params.visitid}/${this.props.location.state.shearedparams.id}/share/${type}`, { shearedparams: this.props.location.state.shearedparams, enterpriseId: this.props.location.state.enterpriseId })
    }


  }

  startRecod = (flag) => {
    this.setState({
      recordStart: flag
    })
  }

  // searchProvider = (event) => {
  //   this.setState({ searchProviderValue: event.target.value });

  //   if (event.target.value) {
  //     let ApiParam = {
  //       searchTerm: event.target.value,
  //       enterpriceId: this.state.userData.user.enterpriseId
  //     }
  //     Apimanager.searchProvider(
  //       ApiParam,
  //       (success) => {
  //         this.setState({
  //           searchProviderList: success.data && success.data.data ? success.data.data.provider : ""
  //         })
  //       },
  //       (error) => {
  //         if (error && error.status === 500) {
  //           return;
  //         }
  //       }
  //     );
  //   }



  // };

  searchProvider = (e) => {
    try {

      let { storedObject } = this.state;
      let searchtext = e.target.value;

      this.setState({ searchProviderValue: e.target.value, providerData: "", providerDetails: "" });

      if (searchtext && searchtext.length > 2) {
        var auth = `Bearer ${storedObject.user.stsTokenManager.accessToken}`;
        if (!storedObject) {
          return;
        }
        this.setState({
          isloading: true
        });

        var queryparams = {
          searchTerm: searchtext,
        };

        controller.abort();
        controller = new AbortController();
        signal = controller.signal;

        var endpoint =
          `${process.env.REACT_APP_URL}/user/v2/searchprovider/${this.state.userData.user.enterpriseId}?` +
          $.param({
            key: `${process.env.REACT_APP_FIREBASEAPIKEY}`,
            searchTerm: encodeURIComponent(queryparams.searchTerm.trim())
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
        }).then(function (response) {
          if (response.status === 401) {
            throw response.status
          } else {
            return response.json()
          }
        }).then((success) => {


          this.setState({
            searchProviderList: success.data && success.data.provider ? success.data.provider : "",
            isloading: false
          })
        }).catch((error) => {
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
                  actions.savenorthwelluserobj(JSON.stringify(northwelluser_store))
                );
                //var auth = `Bearer ${stsTokenManager.accessToken}`;
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
                  .then((new_response) => new_response.json())
                  .then((success) => {

                    this.setState({
                      searchProviderList: success.data && success.data.data ? success.data.data.provider : "",
                      isloading: false
                    })
                  })

              })
              .catch((new_error) => {
                sessionStorage.clear();
                localStorage.clear();
                store.dispatch(actions.logout());
                window.location.replace("/login");
              });
          }
          //         this.setState({ isloading: false });

        });
      } else {
        this.setState({
          searchProviderList: "",
          isloading: false
        })
      }



    } catch (err) {
      console.error(err.message);
    }
  }

  selectProvider = (object) => {

    this.setState({
      searchProviderValue: object.value,
      searchProviderList: "",
      providerSlug: object.slug,
      isloading: true
    })

    let ApiParam = {
      userId: object.email,
      enterpriceId: this.state.userData.user.enterpriseId
    }
    Apimanager.getProviderDetails(
      ApiParam,
      (success) => {
        if (success.data && success.data.data && success.data.data.locations && success.data.data.locations.all && success.data.data.locations.all[0]) {
          let gParam = {
            address: success.data.data.locations.all[0].streetAddress + ' ' + success.data.data.locations.all[0].city + ' ' + success.data.data.locations.all[0].zip
          }

          this.setState({
            providerData: success.data.data,
            isloading: false

          })

          Apimanager.getLatLong(
            gParam,
            (new_success) => {
              if (new_success.data && new_success.data.results && new_success.data.results[0] && new_success.data.results[0].geometry && new_success.data.results[0].geometry.location)

                this.setState({
                  providerDetails: new_success.data.results[0].geometry.location,
                  providerAddress: gParam.address
                })

            },
            (error) => {
              if (error && error.status === 500) {
                return;
              }
            }
          )
        }

      },
      (error) => {
        if (error && error.status === 500) {
          return;
        }
      }
    );
  }

  addToPatientCareTeam = () => {

    let apiParam = {
      isAddToCareTeam: true,
      userId: this.props.match.params.patientid,
      slug: this.state.providerSlug,
      type: "provider",
      email: this.state.providerData.email,
      visitId: this.props.match.params.visitid,
    }

    this.setState({
      isloading: true
    })

    Apimanager.inviteuser(
      apiParam,
      (success) => {

        this.sweetAlertbar("Provider added care team successfully.");
        this.setState({
          providerDetails: "",
          providerAddress: "",
          providerData: "",
          searchProviderValue: "",
          searchProviderList: "",
          providerSlug: "",
          callCareAPI: true,
          isloading: false
        })
      },
      (error) => {
        if (error && error.status === 500) {
          return;
        }
      }
    )
  }

  stopCallingAPI = () => {
    this.setState({
      callCareAPI: false
    })
  }

  getLibraryList = () => {
    Apimanager.getLibraryList(
      {},
      (success) => {
        this.setState({
          libraryList: success.data ? success.data : ""
        })
      },
      (error) => {
        if (error && error.status === 500) {
          return;
        }
      }
    )
  }

  shareLibrary = (lib, openNewTab = false) => {

    this.setState({
      isloading: true
    })

    let requestparams = {
      location: lib.location,
    };
    let params = {
      operationType: "read",
    };

    Apimanager.getMediaURL(
      requestparams,
      params,
      (success) => {
        if (
          success &&
          success.data &&
          success.data.data &&
          success.data.data.signedUrl
        ) {

          if (openNewTab) {
            this.setState({
              isloading: false
            })
            window.open(success.data.data.signedUrl)
          } else {
            let newSelectedAttachment = {};
            newSelectedAttachment.attachmentUrl = success.data.data.signedUrl;
            newSelectedAttachment.file = lib;
            newSelectedAttachment.file.name = lib.location;

            this.setState({
              isloading: false,
              mediaButtonType: "media",
              image: newSelectedAttachment,
              title: lib.title,
              comingFromLib: true
            });
          }



        }
      }, (error) => {
        if (error && (error.status === 422 || error.status === 500)) {
          this.ErrorAlertbar(error.data.data.settings.message);
          this.setState({
            isloading: false,
          });
        }

      }
    )

  };


  addLibraryToPatient = (e) => {
    e.preventDefault();

    this.setState({
      isloading: true
    })

    const { image, title, isForDoctor } = this.state;

    var requestparams = {
      visitId: this.props.match.params.visitid,
      chapterId: this.props.match.params.chapterId,
    };
    var requestpayload = {
      isDoctorsOnly: isForDoctor,
      location: image.file.location,
      chapterId: this.props.match.params.chapterId,
      isDocumentLibrary: true,
      title: title,
      type: image.file.type,
      visitId: this.props.match.params.visitid
    };

    Apimanager.chapterMedia(
      requestparams,
      requestpayload,
      (success) => {
        this.props.changestep(2);


      },
      (error) => {
        if (error && (error.status === 422 || error.status === 500)) {
          this.ErrorAlertbar(error.data.data.settings.message);
          this.setState({
            isloading: false,
          });
        }

      }
    );

  }


  render() {

    const {
      image,
      title,
      isForDoctor,
      percentageUploaded,
      isloading,
      description,
      searchProviderValue,
      providerDetails,
      providerAddress
    } = this.state;
    let bgImage = image && image.blobData ? "image.blobData " : "";
    let bgStyle =
      image &&
        image.file &&
        image.file.name &&
        backgroundImage.includes(image.file.name.split(".").pop())
        ? true
        : false;


    let visitEID = "" //this.state.visitEnterpriceID
    let loginUserEID = '';
    // if (this.state.userData) {
    //   loginUserEID = this.state.userData.user.enterpriseId
    // }


    let chapterType = ""
    if (shearedparams) {
      chapterType = shearedparams.type
    }

    let divClass = ""

    let displayContent = <MediaList {...this.props} callCareAPI={this.state.callCareAPI} stopCallingAPI={this.stopCallingAPI} showContentDescriptions={this.showContentDescriptions} />

    if (chapterType === "CTM") {
      displayContent = <CateTeamList {...this.props} callCareAPI={this.state.callCareAPI} stopCallingAPI={this.stopCallingAPI} />
      divClass = "invite-user-page template-page media-box search-provider-box";
    } else if ((this.state.showOverlay || this.props.showMedia === false)) {
      divClass = "invite-user-page template-page";
    } else if (this.state.mediaButtonType === "library") {
      divClass = "invite-user-page template-page media-box library-list-box";
    } else {
      divClass = "invite-user-page template-page media-box";
    }

    let sharingList = "";



    if (this.state.searchProviderList && this.state.searchProviderList.length > 0) {
      sharingList = this.state.searchProviderList.map((list, index) => {
        let onlyName = list.value.split(",");

        return (
          <li index={index} onClick={() => this.selectProvider(list)}>
            <div className="user-icon">{reverseString((onlyName[0] && onlyName[0].match(/\b(\w)/g).join('')))}</div>
            <div className="user-content">
              <div className="user-left">
                <div className="usr-name">{list.value}</div>
                <div className="user-adderess">{list.playback_department}</div>
              </div>
              {/* <div className="user-check" onClick={() => this.selectSharingTeam(list.data)}></div> */}
            </div>
          </li>
        )
      })
    }

    let pSpeciality = ""
    if (this.state.providerData && this.state.providerData.specialties.actively_practicing && this.state.providerData.specialties.actively_practicing[0]) {
      pSpeciality = this.state.providerData.specialties.actively_practicing[0];
    }

    let pHospital = ""

    if (this.state.providerData && this.state.providerData.hospital_affiliations && this.state.providerData.hospital_affiliations.active[0]) {
      pHospital = this.state.providerData.hospital_affiliations.active[0];
    }

    let pHosSpe = pSpeciality + ", " + pHospital;

    let libList = "";

    if (this.state.libraryList && this.state.libraryList.length > 0) {
      libList = this.state.libraryList.map((list, index) => {



        return (
          <li key={index}>
            <div className="user-content">
              <div className="user-left lib-listing-left">
                <div className="libr-div" onClick={() => this.shareLibrary(list, true)}>
                  <div className="usr-name">{list.title}</div>
                  <div className="user-adderess">{list.addedByName}</div>
                  <div className="user-adderess">{moment.unix(list.createdAt).format("MM/DD/YYYY")}</div>

                </div>
                <div className="share-btn-lib"
                  onClick={() =>
                    swal({
                      title: list.title,
                      text: "Are you sure you want share this file?",
                      buttons: true,
                      dangerMode: false,
                    }).then((willDelete) => {
                      if (willDelete) {
                        this.shareLibrary(list)
                      }
                    })
                  }
                >
                  <button className="btn btn-blue-block">share</button>
                </div>
              </div>

            </div>

          </li>
        )
      })


    }


    return (
      <>
        {displayContent}
        <div className={divClass}>
          {(isloading === true) && (visitEID === loginUserEID) && <LoadingIndicator />}
          {this.state.showOverlay || this.props.showMedia === false ? (
            <div className="overlay">
              <div className="popup-content">
                <div className="popup-header with-close-icon">
                  <h3 style={{ fontSize: "25px" }}>
                    {this.state.contentTitle}
                  </h3>
                  <br></br>
                  <span
                    onClick={() => this.closeContentDescription()}
                    className="material-icons"
                  >
                    close
                  </span>
                </div>
                <div className="popup-body">
                  {this.state.contentDescriptions ? (
                    <div className="content-wrap">
                      {this.state.contentDescriptions}
                    </div>
                  ) : (
                      ""
                    )}
                  {this.state.mediaType.includes("video") ? (
                    <video
                      controls
                      className="play-record-video"
                      src={this.state.medaiPath}
                    ></video>
                  ) : (
                      ""
                    )}
                  {this.state.mediaType.includes("audio") ? (
                    <ReactAudioPlayer src={this.state.medaiPath} controls />
                  ) : (
                      ""
                    )}

                  {this.state.mediaType.includes("else") ? (
                    this.state.contentDescriptions ? (
                      <embed
                        style={{ height: "0", width: "0" }}
                        src={this.state.medaiPath}
                      />
                    ) : (
                        <iframe
                          title={this.state.contentTitle}
                          src={this.state.medaiPath}
                          width="100%"
                          height="100%"
                        ></iframe>
                      )
                  ) : (
                      ""
                    )}

                  {this.state.mediaType.includes("image") ? (
                    <img
                      alt=""
                      src={this.state.medaiPath}
                      width="auto"
                      height="auto"
                    />
                  ) : (
                      ""
                    )}
                </div>
                {/* <div className="popup-footer">
                    <div className="btnbox">
                        <button type="button" className="btn btn-blue-border close-btn" >Close</button>
                    </div>
                </div> */}
              </div>


            </div>
          ) :
            (chapterType !== "CTM") ? (
              <>
                <div className="share-btns share-centered">
                  <div className={"share-btn " + (this.state.mediaButtonType === "media" ? "active" : "")} onClick={() => this.changeScreen('media')} id="media">
                    <button className="media-btn">Media</button>
                  </div>
                  <div className={"share-btn " + (this.state.mediaButtonType === "text" ? "active" : "")} onClick={() => this.changeScreen('text')} id="text">
                    <button className="text-btn">Message</button>
                  </div>
                  <div className={"share-btn " + (this.state.mediaButtonType === "record" ? "active" : "")} onClick={() => this.changeScreen('record')} id="record">
                    <button className="text-btn">Screen Record</button>
                  </div>
                  <div className={"share-btn " + (this.state.mediaButtonType === "library" ? "active" : "")} onClick={() => this.changeScreen('library')} id="record">
                    <button className="text-btn">Library</button>
                  </div>

                </div>
                <form action="">
                  {(this.state.mediaButtonType === "media" || this.state.mediaButtonType === "record") && (
                    <div className={this.state.recordStart ? "file-input-white" : "file-input"}>
                      {this.state.mediaButtonType === "media" ?
                        <input
                          type="file"
                          onChange={this.handleChange}
                          accept="/*"
                        /> : ""
                      }


                      {/* {this.state.comingFromLib ? "" : ""} */}

                      {image && image.file && image.file.name ? (
                        bgStyle ? (
                          <div
                            className="imagewrap"

                          >
                            {image.file.type &&
                              attachmentTypes.includes(image.file.type) ? (
                                previewfileformat.includes(
                                  image.file.name.split(".").pop()
                                ) ? (
                                    <img
                                      alt="attechment"
                                      id="target"
                                      src="/assets/images/icon-attechment.svg"
                                      onClick={() => this.showPreview(image)}
                                    />

                                  ) : (
                                    ""
                                  )
                              ) : image.file.type &&
                                iconVideotypes.includes(image.file.type) ? (
                                  previewfileformat.includes(
                                    image.file.name.split(".").pop()
                                  ) ? (
                                      // <img
                                      //   alt="mp4"
                                      //   id="target"
                                      //   src="/assets/images/icon-mp4.svg"
                                      //   onClick={() => this.showPreview(image)}
                                      // />
                                      <video className="recorded-video" controls src={image.attachmentUrl}></video>
                                      // <></>
                                    ) : (
                                      ""
                                    )
                                ) : image.file.type ? (
                                  previewfileformat.includes(
                                    image.file.name.split(".").pop()
                                  ) ? (
                                      <img
                                        alt="images"
                                        id="target"
                                        src="/assets/images/icon-images.svg"
                                        onClick={() => this.showPreview(image)}
                                      />
                                    ) : (
                                      ""
                                    )
                                ) : previewfileformat.includes(
                                  image.file.name.split(".").pop()
                                ) ? (
                                      <img
                                        alt="attechment"
                                        id="target"
                                        src="/assets/images/icon-attechment.svg"
                                        onClick={() => this.showPreview(image)}
                                      />
                                    ) : (
                                      ""
                                    )}
                          </div>
                        ) : (
                            <div className={this.state.mediaButtonType === "record" ? "imagewrap-record" : "imagewrap"}>

                              {image.file.type &&
                                attachmentTypes.includes(image.file.type) ? (
                                  previewfileformat.includes(
                                    image.file.name.split(".").pop()
                                  ) ? (
                                      <img
                                        alt="attechment"
                                        id="target"
                                        src="/assets/images/icon-attechment.svg"
                                        onClick={() => this.showPreview(image)}
                                      />
                                    ) : (
                                      // <img
                                      //   alt="attechment"
                                      //   id="target"
                                      //   src="/assets/images/icon-attechment.svg"
                                      //   onClick={() => this.showPreview(image)}
                                      // />
                                      ""
                                    )
                                ) : image.file.type &&
                                  iconVideotypes.includes(image.file.type) ? (
                                    previewfileformat.includes(
                                      image.file.name.split(".").pop()
                                    ) ? (

                                        this.state.mediaButtonType === "record" ?
                                          <video className="recorded-video" controls src={image.attachmentUrl}></video>
                                          :
                                          <img
                                            alt="attechment"
                                            id="target"
                                            src="/assets/images/icon-mp4.svg"
                                            onClick={() => this.showPreview(image)}
                                          />
                                      ) : (
                                        ""
                                      )
                                  ) : image.file.type ? (
                                    previewfileformat.includes(
                                      image.file.name.split(".").pop()
                                    ) ? (
                                        <img
                                          alt="images"
                                          id="target"
                                          src="/assets/images/icon-images.svg"
                                          data-toggle="modal"
                                          data-target="#myfile"
                                        />
                                      ) : (
                                        ""
                                      )
                                  ) : previewfileformat.includes(
                                    image.file.name.split(".").pop()
                                  ) ? (
                                        this.state.mediaButtonType === "record" ?
                                          <video className="recorded-video" controls src={image.attachmentUrl}></video>
                                          :
                                          <img
                                            alt="attechment"
                                            id="target"
                                            src="/assets/images/icon-attechment.svg"
                                            onClick={() => this.showPreview(image)}
                                          />
                                      ) : (
                                        ""
                                      )}
                            </div>
                          )
                      ) : (
                          <div className="dropzone-placeholder screen-record">
                            {this.state.mediaButtonType === "record" ?
                              <>
                                <span>
                                  {this.state.recordStart ? <>
                                    <img
                                      src="/assets/images/start_recording.gif"
                                      alt="Screen Record"
                                      style={{ width: "45px", marginLeft: "260px" }}
                                    />
                                    <span>
                                      {i18n && i18n.share && i18n.share.screenrecordingstarted}
                                    </span></> : <>
                                      <img
                                        src="/assets/images/desktop.svg"
                                        alt="Screen Record"
                                      />
                                      <span>
                                        {i18n && i18n.share && i18n.share.screenplaceholder}
                                      </span></>
                                  }


                                </span>
                                <div className="text-center mt-50"><ScreenRecording startRecod={this.startRecod} downloadBlob={this.getRecordedBlob} /></div></>
                              : <span>
                                <img
                                  src="/assets/images/cloud.svg"
                                  alt="Cloud Upload"
                                  className=""
                                />
                                <span>
                                  {i18n && i18n.share && i18n.share.fileplaceholder}
                                </span>
                              </span>}

                          </div>
                        )}
                    </div>
                  )}

                  {this.state.isUploading && (
                    <>
                      <Line
                        percent={percentageUploaded}
                        strokeWidth="1"
                        strokeColor="#009ADF"
                        trailColor="#D9D9D9"
                        gapDegree={0}
                        gapPosition="right"
                      />{" "}
                      <p>{`${percentageUploaded}% completed`}</p>
                    </>
                  )}

                  {isloading && (
                    <p
                      style={{ fontSize: 20, textAlign: "center" }}
                      id="redirectmsg"
                    >
                      {" "}
                    </p>
                  )}
                  {this.state.mediaButtonType !== "library" && (
                    <div className="form-inner">


                      <div className="floating-form">
                        <div className="floating-label clear-input">
                          <input
                            className="theme-input"
                            placeholder={(this.state.mediaButtonType === "media" || this.state.mediaButtonType === "record")
                              ? i18n && i18n.share && i18n.share.titlelabel
                              : i18n && i18n.share && i18n.share.texttitle}
                            type="text"
                            name="title"
                            value={title}
                            onChange={this.handleTextChange}
                            maxLength="40"
                          />

                        </div>
                      </div>
                      {this.state.mediaButtonType === "text" && (
                        <div className="floating-form">
                          <div className="floating-label clear-input">
                            <textarea
                              className="theme-textarea"
                              placeholder={i18n && i18n.share && i18n.share.textdesc}
                              type="text"
                              value={description}
                              name="description"
                              cols={40}
                              rows="5"
                              onChange={this.descriptionValue}
                            // ref={ref => this.multilineTextarea = ref}
                            ></textarea>

                          </div>
                        </div>
                      )}

                      {
                        shearedparams && shearedparams.type.toString() !== "DOC" && (
                          <div className="d-flex justify-content-between align-items-center">
                            <label className="switch-title">
                              {i18n && i18n.share && i18n.share.doctorlabel}
                            </label>
                            <div className="onoffswitch">
                              <input
                                type="checkbox"
                                name="onoffswitch"
                                className="onoffswitch-checkbox"
                                checked={isForDoctor}
                                id="myonoffswitch"
                                onChange={() =>
                                  this.setState({ isForDoctor: !isForDoctor })
                                }
                              />
                              <label
                                className="onoffswitch-label"
                                htmlFor="myonoffswitch"
                              >
                                <span className="onoffswitch-inner"></span>
                                <span className="onoffswitch-switch"></span>
                              </label>
                            </div>
                          </div>
                        )
                      }

                      <div className="general-btns-group">
                        <button
                          onClick={this.clearall}
                          className="btn btn-blue-border"
                          disabled={isloading ? true : false}
                        >
                          {i18n && i18n.buttontext && i18n.buttontext.canceltext}
                        </button>
                        {(this.state.mediaButtonType === "media" || this.state.mediaButtonType === "record") ?
                          <button
                            onClick={this.state.comingFromLib ? (e) => this.addLibraryToPatient(e) : this.addchapterMedia}
                            disabled={!isloading && (image && title) ? false : true}
                            className="btn btn-blue-block"
                          >
                            {i18n && i18n.buttontext && i18n.buttontext.uploadtext}
                          </button> : <button
                            onClick={this.addchapterMedia}
                            disabled={isloading || title ? false : true}
                            className="btn btn-blue-block"
                          >
                            {i18n && i18n.buttontext && i18n.buttontext.uploadtext}
                          </button>}

                      </div>
                    </div>
                  )}
                </form>
              </>
            ) : <>



                <form action="" className="care-team-form">
                  <h2>Add Provider</h2>
                  <div className="form-inner">

                    <div className="floating-form">
                      <div className="floating-label clear-input">
                        <label> Search Provider </label>
                        <input
                          className="theme-input"
                          placeholder="Speciality, doctor name"
                          type="text"
                          name="title"
                          value={searchProviderValue}
                          onChange={this.searchProvider}
                          maxLength="40"
                          autocomplete="off"
                        />

                      </div>
                    </div></div>
                  {displayContent}
                </form>

                {this.state.providerData ?
                  <div className="chapter-header content-list search-result-provider">
                    <div id="cahpterDetail" className="chapter-detail care-team-result ">
                      <ul>
                        <li>
                          <div className="user-icon">{reverseString((this.state.providerData.firstname.match(/\b(\w)/g).join('')))}</div>
                          <div className="user-content">
                            <div className="user-left">
                              <div className="usr-name">{this.state.providerData.fullname}</div>
                              <div className="user-adderess">

                                {pHosSpe}</div>
                            </div>
                            {/* <div className="user-check" onClick={() => this.selectSharingTeam(list.data)}></div> */}
                          </div>
                        </li>
                      </ul>
                    </div></div> : ""
                }

                {providerDetails && providerDetails.lat ?
                  <GoogleMap providerAddress={providerAddress} providerDetails={providerDetails} /> : ""
                }
                {this.state.providerData ?
                  <div className="general-btns-group" style={{ marginTop: "325px" }}>

                    <button
                      onClick={this.clearall}
                      className="btn btn-blue-border"
                      disabled={isloading ? true : false}
                    >
                      {i18n && i18n.buttontext && i18n.buttontext.canceltext}
                    </button>
                    <button
                      onClick={this.addToPatientCareTeam}
                      className="btn btn-blue-block"
                      disabled={isloading ? true : false}
                    >
                      Add to care team
                  </button>
                  </div> : ""
                }

                {sharingList ? <div className="chapter-header content-list search-result-provider">
                  <div id="cahpterDetail" className="chapter-detail care-team-result">

                    <ul className="chapter-detail-list" >
                      {sharingList}
                    </ul >



                  </div>
                </div> : ""}


              </>
          }

          {this.state.mediaButtonType === 'library' ?
            <div className="chapter-header content-list search-result-provider">
              <div id="cahpterDetail" className="chapter-detail care-team-result">

                <ul className="chapter-detail-list" >
                  {libList ? libList : this.state.showOverlay ? "" : <h2 className="no-result">No record found</h2>}
                </ul>
              </div>
            </div> : ""
          }

          <div className="modal fade custom-modal" id="myfile" role="dialog">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">
                    {i18n && i18n.share && i18n.share.modalfilelabel}
                  </h4>
                  <button type="button" className="close" data-dismiss="modal">
                    &times;
                  </button>
                </div>
                <div className="modal-content-wrapper">
                  {image && image.blobData && (
                    <img alt="images" id="target" src={image.blobData} />
                  )}



                </div>
                {image && image.file && image.file.name && (
                  <h2 className="text-center">
                    <span>{image.file.name}</span>
                  </h2>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
export default withRouter(Share);