import React from "react";
import Avatar from "../../../../components/newcomponents/avatar/Avatar";

const GroupImage = ({ members = [], index = 0 }) => {
   const length = members?.length;
   const concatMembers = length > 3 ? members?.slice(0, 2) : members;
   const bgColor = window.initialColors[index % window.initialColors.length];
   const thirdMemberCC = length > 3 ? members[2].colorCode : bgColor;
   return (
      <div>
         {concatMembers?.map((member, i) => {
            const initials = member?.name?.initials || false;
            const color = member?.colorCode || bgColor;
            const className =
               length === 2
                  ? "dual-image"
                  : length === 3
                  ? "triple-image"
                  : length > 3
                  ? "multiple-image"
                  : "single-image";
            return (
               <div className={`${className}-${i}`} key={i}>
                  <Avatar
                     initialsApi={initials}
                     src={`${process.env.REACT_APP_PROFILE_URL}/${member?.id}`}
                     className="flex-shrink-0 avatar-initials"
                     bgColor={color}
                     radius={32}
                  />
               </div>
            );
         })}
         {length > 3 && (
            <div className="multiple-image-2">
               <Avatar
                  initialsApi={"+"}
                  className="flex-shrink-0 avatar-initials"
                  bgColor={thirdMemberCC}
                  radius={32}
               />
            </div>
         )}
         {length === 0 && (
            <div className="demo-image-0">
               <Avatar initialsApi={"NM"} className="flex-shrink-0 avatar-initials" bgColor={bgColor} radius={32} />
            </div>
         )}
      </div>
   );
};

export default GroupImage;
