import React from "react";

// const InviteuserNew = React.lazy(() => import("./viewpages/InviteuserNew"));
// const Profile = React.lazy(() => import('./viewpages/Profile'));
// const Metric = React.lazy(() => import('./viewpages/Metric'));
const ShareLayout = React.lazy(() => import("./viewpages/ShareLayout"));
const DashboardPage = React.lazy(() => import("./viewpages/DashboardPage"));
const PatientList = React.lazy(() => import("./viewpages/PatientList"));
const Template = React.lazy(() => import("./viewpages/Template"));
const VideoChat = React.lazy(() => import("./viewpages/VideoChat"));
const DocLib = React.lazy(() => import("./viewpages/documentLibrabry/index"));
const Phrases = React.lazy(() => import("./viewpages/Phrases"));
const AddDetailsPage = React.lazy(() => import("./viewpages/AddDetailsPage"));

/*
Array of path and View pages
*/
const route = [
  //  { path: '/metric', exact: true, name: 'Metric', component: Metric },
  { path: "/video-call", exact: true, name: "Template", component: VideoChat },
  {
    path: "/document-library",
    exact: true,
    name: "Template",
    component: DocLib,
  },
  {
    path: "/phrases",
    exact: true,
    name: "phrases",
    component: Phrases,
  },
  // {
  //   path: "/settings",
  //   exact: true,
  //   name: "Template",
  //   component: ettings,
  // },
  // {
  //   path: "/invitepatient",
  //   exact: true,
  //   name: "Template",
  //   component: InviteuserNew,
  // },
  {
    path: "/patient-list",
    exact: true,
    name: "Template",
    component: PatientList,
  },
  { path: "/templates", exact: true, name: "Template", component: Template },
  // { path: '/profile', exact: true, name: 'Template', component: Profile },
  {
    path: "/patient/:patientid",
    exact: true,
    name: "DashboardPage",
    component: DashboardPage,
  },
  {
    path: "/patient/:patientid/visit/:visitid/",
    exact: true,
    name: "DashboardPage",
    component: DashboardPage,
  },
  {
    path: "/patient/:patientid/visit/:visitid/:chapterId/share/:mediatype/",
    exact: false,
    name: "Item",
    component: ShareLayout,
  },
  {
    path: "/patient/:patientid/visit/:visitid/:chapterId/share/*",
    exact: false,
    name: "Item",
    component: ShareLayout,
  },
  {
    path: "/details",
    exact: true,
    name: "AddDetailsPage",
    component: AddDetailsPage,
  },
  { path: "/*", exact: true, name: "DashboardPage", component: DashboardPage },
];
export default route;
