import Apimanager from "../../Apimanager/index";

export let isValidMobileNumber = (number = "") => {
  let match = number.match(
    "^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$"
  );
  return match !== null;
};

export let isValidEmail = (email = "") => {
  let email_regex = /^[ ]*([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})[ ]*$/i;
  return email_regex.test(email.toLowerCase());
};

export function phoneEmailValidation(phone = "", email = "") {
  let object = {
    finalStatus: false,
  };
  if (
    (isValidMobileNumber(phone) && email === "") ||
    (isValidEmail(email) && phone === "") ||
    (isValidMobileNumber(phone) && isValidEmail(email))
  ) {
    object.finalStatus = true;
    object["emailMessage"] = "";
    object["phoneMessage"] = "";
    return object;
  } else if (
    (!isValidMobileNumber(phone) && !isValidEmail(email)) ||
    (isValidMobileNumber(phone) && !isValidEmail(email)) ||
    (!isValidMobileNumber(phone) && isValidEmail(email))
  ) {
    object.finalStatus = false;
    if (!isValidMobileNumber(phone) && !isValidEmail(email)) {
      object["emailMessage"] = "Please enter a valid email id";
      object["phoneMessage"] = "Please enter a valid mobile number";
    } else if (isValidMobileNumber(phone) && !isValidEmail(email)) {
      object["emailMessage"] = "Please enter a valid email id";
    } else if (!isValidMobileNumber(phone) && isValidEmail(email)) {
      object["phoneMessage"] = "Please enter a valid mobile number";
    }
    return object;
  }
  return object;
}

export function checkValidation(object = null) {
  let newObject = { ...object };
  if (newObject === null) {
    return false;
  }
  let isValidPhoneEmail = phoneEmailValidation(
    newObject.phone,
    newObject.email
  );
  let obj = {
    isfname: newObject.fname.length > 1,
    islname: newObject.lname.length > 1,
    validPhoneEmail: isValidPhoneEmail.finalStatus,
    isdob: newObject.dob !== "",
  };

  if (obj.isfname && obj.islname && obj.validPhoneEmail && obj.isdob) {
    obj["allValid"] = true;
  } else {
    obj["allValid"] = false;
  }
  let date = new Date(newObject.dob);
  obj["fnameMessage"] = obj.isfname
    ? ""
    : "First name should have at least 2 characters";
  obj["lnameMessage"] = obj.islname
    ? ""
    : "Last name should have at least 2 characters";
  obj["dobMessage"] = date.getTime()
    ? ""
    : "Please select a valid date of birth";

  let finalObject = { ...obj, ...isValidPhoneEmail };
  return finalObject;
}

export function sendInvite(
  bodyparams,
  uploadsuccess = () => {},
  failure = () => {}
) {
  Apimanager.inviteuser(
    bodyparams,
    (success) => {
      uploadsuccess(success);
    },
    (error) => {
      failure(error);
      console.log(JSON.stringify(error, null, 4));
    }
  );
}

// export function getDepartmentList(id, fetched) {
//   Apimanager.getDepartmentListing(
//     {
//       id: id,
//     },
//     (success) => {
//       if (success && success.status === 200 && success.data) {
//         fetched(success.data);
//       }
//     },
//     (error) => {
//       if (error && error.status === 500) {
//         if (error.data && error.data.settings && error.data.settings.message) {
//           return;
//         }
//       }
//     }
//   );
// }

export function getTagList(fetched) {
  Apimanager.getTagList(
    {},
    (success) => {
      if (success && success.status === 200 && success.data) {
        fetched(success.data);
      }
    },
    (error) => {
      if (error && error.status === 500) {
        if (error.data && error.data.settings && error.data.settings.message) {
          return;
        }
      }
      return;
    }
  );
}

export function getDoctorList(enterpriseId, hospitalName, department, fetched) {
  let params = {
    enterpriseId: enterpriseId,
    hospitalName: hospitalName,
    departmentName: department,
  };

  Apimanager.getDoctorList(
    params,
    (success) => {
      if (
        success &&
        success.status === 200 &&
        success.data &&
        success.data.data
      ) {
        fetched(success.data.data.list);
      }
    },
    (error) => {
      if (error && error.status === 500) {
        if (error.data && error.data.settings && error.data.settings.message) {
          return;
        }
      }
    }
  );
}

export function getHospitalList(enterpriseId, fetched) {
  let queryparams = {
    enterpriseId: enterpriseId,
    page: "",
    pageSize: "",
  };

  Apimanager.getHospitalListing(
    queryparams,
    (success) => {
      if (
        success &&
        success.status === 200 &&
        success.data &&
        success.data.data
      ) {
        fetched(success.data.data);
      }
    },
    (error) => {
      return;
    }
  );
}

export function formatPhoneNumber(number = "") {
  let value1 = number.replace(/[^\d]/g, "");
  if (value1.length > 10) {
    value1 = value1.slice(0, -1);
  }
  let value2 = value1.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");

  return { formatted: value2, nformatted: value1 }; //value2 || "";
}

export function checkForAlphabets(value = "") {
  let result = value.match(/^[a-z ,.'-]+$/i);
  return result === null ? value.slice(0, -1) : result[0];
}

export function getDepartmentList(id, fetched) {
  let params = {
    id: id,
  };
  Apimanager.getDepartmentListing(
    params,
    (success) => {
      if (success && success.data) {
        fetched(success.data);
      }
    },
    (error) => {
      return;
    }
  );
}

export function compare_to_sort(a, b, sortKey) {
  let fa = a[sortKey].toLowerCase();
  let fb = b[sortKey].toLowerCase();

  if (fa < fb) {
    return -1;
  }
  if (fa > fb) {
    return 1;
  }
  return 0;
}
