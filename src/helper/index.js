export const formatDate = (date) => {
   var dcurrent_datetime = new Date(date);
   const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
   let formatted_date =
      months[dcurrent_datetime.getMonth()] + " " + dcurrent_datetime.getDate() + ", " + dcurrent_datetime.getFullYear();
   return formatted_date;
};

export const visittype = {
   CTM: " Dr. Patrick Smith +5",
   DIS: "Discharged instriction",
   MED: "Discharge Medications",
   // "PBU": "Playback Updates",
   DAP: "Diagnosis and Procedures",
   SYM: "Symptom Manager",
   MRS: "My Responsibilities",
   ANR: "Activities and Restrictions",
   WCI: "Wound Care Instructions",
   NIS: "Nutrition Instructions",
   POI: "Pre Op Instructions",
   AIN: "Additional Information",
   URV: "Your Visit",
   WCV: "Welcome to Neurosurgery",
   AAR: "Activities and Restrictions",
   POP: "Pre-op Preparation",
   INP: "In Patient",
};

export const previewfileformat = [
   "pdf",
   "mp4",
   "webm",
   "m4a",
   "mp3",
   "mov",
   "txt",
   "text",
   "xls",
   "xlsx",
   "png",
   "jpg",
   "jpeg",
   "PDF",
   "MP4",
   "WEBM",
   "M4A",
   "MP3",
   "MOV",
   "TXT",
   "TEXT",
   "XLS",
   "XLSX",
   "PNG",
   "JPG",
   "JPEG",
];

export const backgroundImage = ["png", "jpg", "jpeg"];
export const allowdVideotypes = ["mp4", "quicktime", "mov", "webm"];
export const iconVideotypes = ["video/mp4", "video/quicktime", "video/webm"];
export const attachmentTypes = [
   "text/plain",
   "text/rtf",
   "audio/x-m4a",
   "audio/x-mp3",
   "application/pdf",
   "application/docx",
   "application/document",
   "application/msword",
   "application/vnd.ms-powerpoint",
   "application/vnd.ms-excel",
   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
   "application/vnd.openxmlformats-officedocument.presentationml.presentation",
   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
export const accepttypes = [
   "jpeg",
   "jpg",
   "png",
   "pdf",
   "mp4",
   "webm",
   "m4a",
   "mp3",
   "videoMp4",
   "mov",
   "quicktime",
   "plain",
   "txt",
   "text",
   "docx",
   "doc",
   "rtf",
   "msword",
   "pptx",
   "xls",
   "xlsx",
   "application/vnd.ms-powerpoint",
   "vnd.openxmlformats-officedocument.wordprocessingml.document",
   "application/vnd.openxmlformats-officedocument.presentationml.presentation",
   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const options = [
   { value: "OutPatient", label: "OutPatient", visittype: "isOfficeVisit" },
   { value: "InPatient", label: "InPatient", visittype: "isHospitalVisit" },
];

export const mediaType = [
   "media",
   "image/png",
   "image/jpg",
   "image/svg",
   "image/jpeg",
   "audio/mp3",
   "audio/m4a",
   "audio/mpeg",
   "audio/m4p",
   "audio/wma",
   "audio/ogg",
   "audio/3gp",
   "audio/webm",
   "video/mp4",
   "video/mov",
   "video/webm",
   "video/avi",
   "video/mkv",
   "video/mpg",
   "video/mpeg",
   "video/m4p",
   "video/3gp",
   "video/m4v",
   "application/pdf",
];
