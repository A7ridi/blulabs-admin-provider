import React from "react";
import { checkEmpty, formatPhoneNumber } from "../../../../helper/CommonFuncs";
import PatientDetailsView from "../../../../components/newcomponents/patientDetailsView/PatientDetailsView";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";
import EmptyStateComp from "../../EmptyStateComp";
import NoFamily from "../../../../images/empty-states/no-family.svg";
import * as i18n from "../../../../I18n/en.json";
import edits from "../../../../images/profileSection/edit.svg";
import option from "../../../../images/profileSection/option.svg";
import deleteIcon from "../../../../images/profileSection/delete.svg";

export const tableHeaderStyle = {
   border: "1px solid #ced4da",
   borderRight: "none",
   borderLeft: "none",
   background: "rgba(224, 224, 224, 0.2)",
   height: 44,
   display: "flex",
   alignItems: "center",
   justifyContent: "start",
   paddingLeft: 10,
};

export const tableHeaderStyleEx = {
   border: "1px solid #ced4da",
   borderRight: "none",
   borderLeft: "none",
   background: "rgba(224, 224, 224, 0.2)",
   height: 44,
   paddingTop: 10,
};

export const FamilyFriendsTable = (props) => {
   const { posts, isLoading, removeTapped, setShowFamFriendsModal, edit } = props;
   const noFamilyMembers = i18n?.emptyState?.noFamilyMembers;
   const noFamilyMembersDesc = i18n?.emptyState?.noFamilyMembersDesc;
   const addMembersBtn = i18n?.emptyState?.addMembersBtn;
   if (isLoading)
      return (
         <table className={`w-100 bg-white h-100`}>
            <tbody>
               {Array(10)
                  .fill()
                  .map((o, index) => (
                     <tr key={index} className="loading-shade">
                        <td>
                           <div className="loading-shade demo-view w-100 h-medium loading-table-row" />
                        </td>
                     </tr>
                  ))}
            </tbody>
         </table>
      );
   else if (posts.length === 0)
      return (
         <EmptyStateComp
            src={NoFamily}
            familyFriends
            headerText={noFamilyMembers}
            description={noFamilyMembersDesc}
            btnText={addMembersBtn}
            className="margin-viewd-screen"
            onClick={() => setShowFamFriendsModal(true)}
         />
      );
   else
      return (
         <table className="w-100" style={{ maxWidth: "98.1%", marginLeft: "11px" }}>
            <thead className="text-small">
               <tr>
                  <th>
                     <div
                        className="pl-4 table-head-custom"
                        style={{
                           ...tableHeaderStyle,
                           borderTopLeftRadius: "8px",
                           borderLeft: "1px solid #ced4da",
                        }}
                     >
                        Name
                     </div>
                  </th>
                  <th>
                     <div className="table-head-custom" style={tableHeaderStyleEx}>
                        Contact info
                     </div>
                  </th>

                  <th>
                     <div className=" table-head-custom" style={tableHeaderStyleEx}>
                        Relationship
                     </div>
                  </th>
                  <th>
                     <div
                        className=" table-head-custom"
                        style={{
                           ...tableHeaderStyle,
                           borderRight: "1px solid #ced4da",
                           borderTopRightRadius: "8px",
                        }}
                     >
                        Action
                     </div>
                  </th>
               </tr>
            </thead>
            <tbody>
               {posts.map((obj, i) => {
                  const name = obj?.careMember?.name?.fullName || "Member";
                  const mobileNo = obj?.careMember?.contactInformation?.mobileNumber;
                  const email = obj?.careMember?.contactInformation?.email;
                  const color = obj?.careMember?.colorCode || window.initialColors[i % window.initialColors.length];
                  return (
                     <tr key={obj?.id || i} className={`hover-default ${isLoading ? " loading-shade" : ""}`}>
                        <td className="p-0 pl-4">
                           <PatientDetailsView
                              imageRad={32}
                              imageSrc={`${process.env.REACT_APP_PROFILE_URL}/${
                                 obj?.careMember?.id
                              }?ver=${Math.random()}`}
                              className="pointer text-truncate"
                              userBg={color}
                              familyFriends
                              initialsApi={obj?.initials || false}
                              name={name}
                           />
                        </td>

                        <td title={obj?.lastUpdate} className="pointer text-truncate ">
                           <div className="table-title-custom">
                              {mobileNo && <div className="mobile-no-family">{formatPhoneNumber(mobileNo)}</div>}
                              {email ? checkEmpty(email) : ""}
                           </div>
                        </td>
                        <td className="p-4">
                           <div className="care-relationship table-title-custom">{checkEmpty(obj?.relationship)}</div>
                        </td>

                        <td className="p-4 ">
                           <div id={pendoIds.btnRemoveFamilyFriend} className="removeButton pointer">
                              <div class="dropdown">
                                 <button
                                    // class="btn btn-secondary dropdown-toggle"
                                    type="button"
                                    id="dropdownMenuButton"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                 >
                                    <img src={option} alt="option" />
                                 </button>
                                 <div
                                    className="dropdown-menu dropdown-custom-rel"
                                    aria-labelledby="dropdownMenuButton"
                                 >
                                    <div
                                       onClick={() => edit(obj)}
                                       className="dropdown-item dropDown-custom hover-default"
                                    >
                                       <img src={edits} alt="edit" />
                                       <div className="pl-5 pr-5">Edit</div>
                                    </div>
                                    <div
                                       onClick={() => removeTapped(obj)}
                                       className="dropdown-item dropDown-custom hover-default"
                                    >
                                       <img src={deleteIcon} alt="edit" />
                                       <div className="pl-5 pr-5">Delete</div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
      );
};
