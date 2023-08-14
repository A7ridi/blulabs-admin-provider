import React, { Component, memo } from "react";
import InputMask from "react-input-mask";
import Select from "react-select";
import StatusView from "../components/StatusView/StatusView"; //"../StatusView/StatusView";
import "../components/AddDetailsView/AddDetailsView.css"; //"./AddDetailsView.css";
import Apimanager from "../Apimanager/index";
import * as resetmodel from "./viewModels/reset-password-vm";
import * as firebase from "firebase/app";
import * as actions from "../redux/actions/auth.action";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import LoadingIndicator from "../common/LoadingIndicator";
import { pendoIds } from "../Constants/pendoComponentIds/pendoConstants";

let numberRegex = /^[0-9]*$/i;
// let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

let Field = memo((props) => {
   const {
      title = "Title",
      placeholder = "Placeholder",
      type = "text",
      showVisibilityIcon = false,
      classname = "",
      onChange,
      value = "",
      status = "",
      maxlength = "",
      options = [],
      disabled = false,
      controlId,
   } = props;
   let icon = type === "text" ? "password-show.png" : "password-hide.png";

   let Inputfield = () => {
      if (type === "mobile") {
         return (
            <InputMask mask="+1 (999) 999-9999" value={value} onChange={onChange}>
               {(inputProps) => (
                  <input
                     id={controlId}
                     className="login-input"
                     placeholder="e.g. +1 (212) 212-1212"
                     {...inputProps}
                     type="text"
                  />
               )}
            </InputMask>
         );
      } else if (type === "select") {
         return (
            <Select
               id={controlId}
               className="select login-input"
               // value={{ id: "1", label: "Department" }}
               name="hf-department"
               value={value}
               options={options}
               onChange={onChange}
               placeholder="Select Department Name"
            />
         );
      } else {
         return (
            <input
               id={controlId}
               className="login-input"
               type={type}
               value={value}
               onChange={onChange}
               placeholder={placeholder}
               maxLength={maxlength}
               disabled={disabled}
            />
         );
      }
   };

   return (
      <div className="Field" style={{ display: "flex", flexDirection: "column" }}>
         <label>{title}</label>
         <div id="password-form-group" className={`form-group ${classname}`}>
            {Inputfield()}
            {showVisibilityIcon ? <img id="password-visibility-image" src={`/assets/images/${icon}`} alt="" /> : null}
         </div>
         <label className="status-label">{status}</label>
      </div>
   );
});

let obj = {
   profilePic: null,
   initials: "",
   fname: "",
   lname: "",
   title: "",
   businessPhone: "",
   degree: "",
   department: null,
   address1: "",
   address2: "",
   postalCode: "",
   city: "",
};

function validateDetails(values) {
   let errors = { ...obj };
   let status = true;
   if (values.fname.length < 2) {
      errors.fname = "First name requires minimum 2 characters";
      status = false;
   }
   if (values.lname.length < 2) {
      errors.lname = "Last name requires minimum 2 characters";
      status = false;
   }
   if (values.title.length === 0) {
      errors.title = "Please enter a title";
      status = false;
   }
   if (values.businessPhone.length < 11) {
      errors.businessPhone = "Please enter a valid business phone number";
      status = false;
   }
   if (values.degree.length === 0) {
      errors.degree = "Please enter degree";
      status = false;
   }
   if (values.department === null) {
      errors.department = "Please enter department";
      status = false;
   }
   if (values.address1.length === 0) {
      errors.address = "Please enter address";
      status = false;
   }
   if (values.postalCode.length !== 5) {
      errors.postalCode = "Please enter postal code";
      status = false;
   }
   if (values.city.length === 0) {
      errors.city = "Please enter city name";
      status = false;
   }

   return { status: status, errorObj: errors };
}

class AddDetailsPage extends Component {
   constructor(props) {
      super(props);
      let nObj = { ...obj };
      this.state = {
         showPassword: false,
         showConfPassword: false,
         deplist: [],
         isloading: false,
         message: null,
         errors: obj,
         ...nObj,
      };

      this.user = this.props.userCredentials?.user;
   }

   componentDidMount() {
      let isDetEnabled = sessionStorage.getItem("enableDetailsPage") || false;
      isDetEnabled ? this.getDepartments() : this.props.history.push("/");
   }

   getDepartments() {
      let params = {
         id: this.user?.hospitalId,
      };
      Apimanager.getDepartmentListing(
         params,
         (success) => {
            let nameComps = this.user.name.split(",");
            let fullname = nameComps[0].split(" ");
            let dep = success?.data?.find((obj) => obj.id === this.props.userCredentials.user?.departmentId);
            let department = dep ? { label: dep.name, value: dep.id } : null;
            let deplist = success?.data?.map((obj) => ({
               label: obj.name,
               value: obj.id,
            }));
            this.setState(
               {
                  department: department,
                  deplist: deplist,
                  fname: fullname[0].trim(),
                  lname: fullname[fullname.length - 1].trim(),
                  // degree: nameComps[nameComps.length - 1].trim(),
                  initials: this.user.initials,
               },
               () => {
                  localStorage.removeItem("persist:root");
               }
            );
         },
         (error) => {}
      );
   }

   storeDataRedux = (firebaseUser, data, param = true) => {
      if (param) {
         this.props.savenorthwelluserobj(firebaseUser);
      }

      this.props.saveusercredentials(data);
   };

   imageChanged = (e) => {
      if (e && e.target.files && e.target.files[0]) {
         let reader = new FileReader();
         let file = e.target.files[0];
         let url = URL.createObjectURL(file);
         reader.onload = (fileres) => {
            this.setState({
               profilePic: {
                  file: file,
                  path: url,
               },
            });
         };
         reader.readAsDataURL(e.target.files[0]);
      } else {
         this.setState({ profilePic: null });
      }
   };

   updateTextData = (params) => {
      let fbuser = firebase.auth().currentUser;
      let queryparams = {
         email: fbuser.email,
         firebaseId: fbuser.uid,
      };

      firebase
         .auth()
         .currentUser.updateProfile({
            displayName: params.firstname + " " + params.lastname,
         })
         .then((success) => {
            Apimanager.updateProviderProfile(
               params,
               (success) => {
                  resetmodel.validateProvider(queryparams, (cObj) => {
                     this.storeDataRedux(
                        { user: JSON.parse(JSON.stringify(firebase.auth().currentUser)) },
                        cObj,
                        false
                     );
                     window.history.replaceState(null, null, "/");
                     sessionStorage.removeItem("enableMobAuth");
                     sessionStorage.removeItem("enableDetailsPage");

                     localStorage.setItem("login", "yes");
                     this.props.history.push("/");
                     resetmodel.updateUserDevice(cObj, (success) => {});
                  });
               },
               (error) => {
                  this.setState(
                     {
                        isloading: false,
                        message: {
                           message: error?.message || "Something went wrong",
                           type: "error",
                        },
                     },
                     () => this.scrollToTop()
                  );
               }
            );
         })
         .catch((error) => {
            this.setState(
               {
                  isloading: false,
                  message: {
                     message: error.message,
                     type: "error",
                  },
               },
               () => this.scrollToTop()
            );
         });
   };

   scrollToTop() {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
   }

   saveTapped() {
      let detobj = validateDetails(this.state);
      if (detobj.status) {
         let requestParams = {
            firstname: this.state.fname.trim(),
            lastname: this.state.lname.trim(),
            degree: this.state.degree.trim(),
            title: this.state.title.trim(),
            businessPhone: this.state.businessPhone.trim(),
            department: this.state.department?.label?.trim(),
            officeAddress: this.state.address1.trim(),
            officeAddress2: this.state.address2.trim(),
            officeCity: this.state.city.trim(),
            officeZip: this.state.postalCode.trim(),
            mobileNo: localStorage.getItem("mobileNumber"),
         };
         this.setState({ isloading: true });
         if (this.state.profilePic !== null) {
            Apimanager.updateProfilePic(
               {
                  id: this.user.id,
                  operationType: "write",
                  data: this.state.profilePic.file,
               },
               (data) => this.updateTextData(requestParams),
               (err) => {
                  this.setState(
                     {
                        isloading: false,
                        message: {
                           message: err.message,
                           type: "error",
                        },
                     },
                     () => this.scrollToTop()
                  );
               }
            );
         } else {
            this.updateTextData(requestParams);
         }
      } else {
         this.setState({ errors: detobj.errorObj });
      }
   }

   render() {
      return (
         <div className="AddDetailsView">
            <div className="login-content" id="content-box">
               <img src="/assets/images/logo-new.svg" alt="" />
               <div className="login-box">
                  <h1 id="title-heading">Add your details</h1>
                  {this.state.message ? (
                     <StatusView
                        message={this.state.message.message}
                        type={this.state.message.type}
                        showCloseButton={false}
                     />
                  ) : null}
                  <div id="profile-pic-div">
                     {this.state.profilePic ? (
                        <div className="clear-image" onClick={() => this.imageChanged()}>
                           &times;
                        </div>
                     ) : null}
                     <div className="text-div">{this.state.initials}</div>
                     <div
                        className="selected-image-div"
                        placeholder=""
                        style={{
                           backgroundImage: `url(${this.state.profilePic?.path})`,
                        }}
                     />
                     <input
                        id={pendoIds.inputFileUploadControl}
                        type="file"
                        accept="image/*"
                        onChange={this.imageChanged}
                     />
                     <div className="cam-icon">
                        <img src="./assets/images/camera-icon-white.svg" />
                     </div>
                  </div>

                  <div className="fields-div">
                     <div className="flex-div">
                        <Field
                           controlId={pendoIds.inputFieldProviderFirstName}
                           value={this.state.fname}
                           title="First Name"
                           placeholder="Enter your first name"
                           onChange={(e) => this.setState({ fname: e.target.value })}
                           status={this.state.errors.fname}
                        />
                        <Field
                           controlId={pendoIds.inputFieldProviderLastName}
                           value={this.state.lname}
                           title="Last Name"
                           placeholder="Enter your last name"
                           onChange={(e) => this.setState({ lname: e.target.value })}
                           status={this.state.errors.lname}
                        />
                     </div>
                     <div className="flex-div">
                        <Field
                           controlId={pendoIds.inputFieldProviderTitle}
                           value={this.state.title}
                           title="Title"
                           placeholder="Enter your title"
                           onChange={(e) => this.setState({ title: e.target.value })}
                           status={this.state.errors.title}
                        />
                        <Field
                           controlId={pendoIds.inputFieldProviderBusinessPhone}
                           value={this.state.businessPhone}
                           title="Business No."
                           placeholder="Enter your Business No."
                           type="mobile"
                           onChange={(e) =>
                              this.setState({
                                 businessPhone: e.target.value.replace(/[^0-9]/g, ""),
                              })
                           }
                           status={this.state.errors.businessPhone}
                        />
                     </div>
                     <div className="flex-div">
                        <Field
                           controlId={pendoIds.inputFieldProviderDegree}
                           value={this.state.degree}
                           title="Degree"
                           placeholder="Enter your degree"
                           onChange={(e) => this.setState({ degree: e.target.value })}
                           status={this.state.errors.degree}
                        />
                     </div>
                     <div className="flex-div">
                        <Field
                           controlId={pendoIds.inputFieldProviderDepartment}
                           value={this.state.department}
                           options={this.state.deplist}
                           title="Department"
                           placeholder="Enter your department"
                           type="select"
                           classname="department-select"
                           onChange={(e) => this.setState({ department: e })}
                           status={this.state.errors.department}
                        />
                     </div>
                     <div className="flex-div">
                        <Field
                           controlId={pendoIds.inputFieldProviderOfficeAddress1}
                           value={this.state.address1}
                           title="Office Address"
                           placeholder="Address Line 1"
                           onChange={(e) => this.setState({ address1: e.target.value })}
                           status={this.state.errors.address}
                        />
                        <Field
                           controlId={pendoIds.inputFieldProviderOfficeAddress2}
                           value={this.state.address2}
                           title=""
                           placeholder="Address Line 2"
                           onChange={(e) => this.setState({ address2: e.target.value })}
                        />
                        <Field
                           controlId={pendoIds.inputFieldProviderPostalCode}
                           value={this.state.postalCode}
                           title=""
                           placeholder="Postal Code"
                           onChange={(e) => {
                              if (numberRegex.test(e.target.value)) {
                                 this.setState({
                                    postalCode: e.target.value.substring(0, 5),
                                 });
                              }
                           }}
                           status={this.state.errors.postalCode}
                           maxLength="5"
                        />
                        <Field
                           controlId={pendoIds.inputFieldProviderCityState}
                           value={this.state.city}
                           title=""
                           placeholder="City/State"
                           onChange={(e) => this.setState({ city: e.target.value })}
                           status={this.state.errors.city}
                        />
                     </div>
                  </div>
                  {this.state.isloading ? (
                     <LoadingIndicator />
                  ) : (
                     <button
                        id={pendoIds.btnSaveProviderDetails}
                        className="save-button btn btn-blue-block"
                        onClick={() => this.saveTapped()}
                     >
                        Save
                     </button>
                  )}
               </div>
            </div>
         </div>
      );
   }
}

const mapStateToProps = (state) => {
   return {
      userCredentials: state.auth.userCredentials,
   };
};

const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         savenorthwelluserobj: actions.savenorthwelluserobj,
         saveusercredentials: actions.saveusercredentials,
      },
      dispatch
   );
};

export default connect(mapStateToProps, mapDispatchToProps)(memo(AddDetailsPage));
