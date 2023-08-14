import React, { memo, useRef } from "react";
import AlertView from "../../../../components/newcomponents/AlertView";
import moment from "moment";
import PatientDetailsView from "../../../../components/newcomponents/patientDetailsView/PatientDetailsView";
import { calculateDateDay } from "../../../../helper/CommonFuncs";

const SeenByView = memo((props) => {
   const { isLoading, list = [] } = props;
   const seenByRef = useRef(null);
   return (
      <AlertView
         alertclass="width-seenby h-4xl-large p-4 round-border-m"
         titleText="Seen By"
         buttons={[]}
         contentView={() => (
            <div className="my-4 h-100 div-content-main-seen-by">
               {isLoading
                  ? Array(6)
                       .fill()
                       .map((o, index) => (
                          <div key={index}>
                             <div className="my-4 h-xsmall loading-shade"></div>
                          </div>
                       ))
                  : list && list?.length > 0
                  ? list?.map((obj, i) => {
                       const dateObjFormatted = moment(obj?.viewedAt).format("MM/DD/YYYY");
                       const dateObj = obj?.viewedAt;
                       const dayLabel = calculateDateDay(dateObj);
                       const currentDate = dateObjFormatted;
                       const isNew = currentDate !== seenByRef.current;
                       seenByRef.current = dateObjFormatted;
                       const color = obj?.viewer?.colorCode || window.initialColors[i % window.initialColors.length];
                       const initials = obj?.viewer?.name?.initials || false;
                       const name = obj?.viewer?.name?.fullName || "Playback provider";
                       const viewedTime = obj?.viewedAt ? moment(obj?.viewedAt).format("hh:mm a") : "";
                       return (
                          <>
                             {((i === 0 && obj?.viewedAt) || isNew) && !isLoading && (
                                <div className="date-seen-by">{dayLabel}</div>
                             )}
                             <div
                                className={`
                               d-flex align-items-center justify-content-between
                               mb-3 `}
                             >
                                <PatientDetailsView
                                   imageSrc={`${process.env.REACT_APP_PROFILE_URL}/${
                                      obj?.viewer?.id
                                   }?ver=${Math.random()}`}
                                   userBg={color}
                                   name={name}
                                   initialsApi={initials}
                                   details={[
                                      { title: obj?.viewer?.contactInformation?.email || "" },
                                      { title: obj?.viewer?.contactInformation?.mobileNumber || "" },
                                   ]}
                                />
                                <div className="timeStamp-seen-by">{viewedTime}</div>
                             </div>
                          </>
                       );
                    })
                  : !isLoading && list.length === 0 && <div className="empty-seenby-view">No views available</div>}
            </div>
         )}
         {...props}
      />
   );
});

export default SeenByView;
