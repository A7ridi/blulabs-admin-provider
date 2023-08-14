import React, { Component, memo } from "react";
import InputMask from "react-input-mask";
import Select from "react-select";
import StatusView from "../StatusView/StatusView";
import "./AddDetailsView.css";

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
  } = props;
  let icon = type === "text" ? "password-show.png" : "password-hide.png";

  let Inputfield = () => {
    if (type === "mobile") {
      return (
        <InputMask mask="+1 (999) 999-9999" value={value} onChange={onChange}>
          {(inputProps) => (
            <input
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
          className="select login-input"
          value={{ id: "1", label: "Department" }}
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
        {showVisibilityIcon ? (
          <img
            id="password-visibility-image"
            src={`/assets/images/${icon}`}
            alt=""
          />
        ) : null}
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

class AddDetailsView extends Component {
  constructor(props) {
    super(props);
    let nObj = { ...obj, ...props.providerDetails };
    this.state = {
      showPassword: false,
      showConfPassword: false,
      deplist: props.departmentList,
      errors: obj,
      ...nObj,
      //   email: props.defaultDetails?.user?.email || "",
    };
    if (props.message) {
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }
  }

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

  render() {
    return (
      <div className="AddDetailsView">
        <div className="login-content" id="content-box">
          <img src="/assets/images/logo-new.svg" alt="" />
          <div className="login-box">
            <h1 id="title-heading">Add your details</h1>
            {this.props.message ? (
              <StatusView
                message={this.props.message}
                type={this.props.messageType}
                showCloseButton={false}
              />
            ) : null}
            <div id="profile-pic-div">
              {this.state.profilePic ? (
                <div
                  className="clear-image"
                  onClick={() => this.imageChanged()}
                >
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
                  value={this.state.fname}
                  title="First Name"
                  placeholder="Enter your first name"
                  onChange={(e) => this.setState({ fname: e.target.value })}
                  status={this.state.errors.fname}
                />
                <Field
                  value={this.state.lname}
                  title="Last Name"
                  placeholder="Enter your last name"
                  onChange={(e) => this.setState({ lname: e.target.value })}
                  status={this.state.errors.lname}
                />
              </div>
              <div className="flex-div">
                <Field
                  value={this.state.title}
                  title="Title"
                  placeholder="Enter your title"
                  onChange={(e) => this.setState({ title: e.target.value })}
                  status={this.state.errors.title}
                />
                <Field
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
                  value={this.state.degree}
                  title="Degree"
                  placeholder="Enter your degree"
                  onChange={(e) => this.setState({ degree: e.target.value })}
                  status={this.state.errors.degree}
                />
              </div>
              <div className="flex-div">
                <Field
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
                  value={this.state.address1}
                  title="Office Address"
                  placeholder="Address Line 1"
                  onChange={(e) => this.setState({ address1: e.target.value })}
                  status={this.state.errors.address}
                />
                <Field
                  value={this.state.address2}
                  title=""
                  placeholder="Address Line 2"
                  onChange={(e) => this.setState({ address2: e.target.value })}
                />
                <Field
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
                  value={this.state.city}
                  title=""
                  placeholder="City/State"
                  onChange={(e) => this.setState({ city: e.target.value })}
                  status={this.state.errors.city}
                />
              </div>
            </div>
            <button
              className="save-button btn btn-blue-block"
              onClick={() => {
                let detobj = validateDetails(this.state);
                this.setState({ errors: detobj.errorObj });
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
                  };
                  this.props.saveTapped(requestParams, this.state.profilePic);
                }
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default memo(AddDetailsView);
