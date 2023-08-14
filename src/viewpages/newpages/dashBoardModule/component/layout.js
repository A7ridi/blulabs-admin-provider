import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import RecentUpdateCont from "../container/recentUpdateCont";
import MyPatientCont from "../container/myPatientsCont";
import ViewedPatientCont from "../container/viewedPatientsCont";
import PendingInvitesCont from "../container/pendingInvitesCont";
import TeamsCont from "../container/myTeamsCont";
import PatientMissedContent from "../container/patientMissedContentCont";
import LibraryCont from "../container/libraryMostViewedContent";
import PatientsGraph from "./widgets/patientsGraph";
import ContentGraph from "./widgets/contentGraph";
import { Responsive, WidthProvider } from "react-grid-layout";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

export default class ShowcaseLayout extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         currentBreakpoint: "lg",
         compactType: "vertical",
         mounted: false,
         layouts: { lg: props.initialLayout },
      };

      this.onBreakpointChange = this.onBreakpointChange.bind(this);
      this.onCompactTypeChange = this.onCompactTypeChange.bind(this);
      this.onLayoutChange = this.onLayoutChange.bind(this);
      this.onNewLayout = this.onNewLayout.bind(this);
   }

   componentDidMount() {
      this.setState({ mounted: true });
   }

   generateDOM = () => {
      const widgets = generateLayout(this.props.data);

      return _.map(widgets, function (l, i) {
         return (
            <div className="div-dropppable" key={i} data-grid={l}>
               <div className={`${l.data.type === "cards" && "div-inside"}`}>
                  {l.i === "recentUpdates" && (
                     <RecentUpdateCont title={l.data.subsitutions.title} actions={l.data.actions} />
                  )}
                  {l.i === "myPatients" && <MyPatientCont specs={l} />}
                  {l.i === "viewedPatients" && <ViewedPatientCont specs={l} />}
                  {l.i === "missedContent" && <PatientMissedContent title={l.data.subsitutions.title} specs={l} />}
                  {l.i === "resendInvite" && <PendingInvitesCont title={l.data.subsitutions.title} specs={l} />}
                  {l.i === "teams" && <TeamsCont title={l.data.subsitutions.title} specs={l} />}
                  {l.i === "library" && <LibraryCont title={l.data.subsitutions.title} specs={l} />}
                  {l.i === "barChart" && <PatientsGraph title={l.data.subsitutions.title} />}
                  {l.i === "lineChart" && <ContentGraph title={l.data.subsitutions.title} />}
               </div>
            </div>
         );
      });
   };

   onBreakpointChange(breakpoint) {
      this.setState({
         currentBreakpoint: breakpoint,
      });
   }

   onCompactTypeChange() {
      const { compactType: oldCompactType } = this.state;
      const compactType =
         oldCompactType === "horizontal" ? "vertical" : oldCompactType === "vertical" ? null : "horizontal";
      this.setState({ compactType });
   }

   onLayoutChange(layout, layouts) {
      this.props.onLayoutChange(layout, layouts);
   }

   onNewLayout() {
      const { data } = this.props;
      this.setState({
         layouts: { lg: generateLayout(data) },
      });
   }

   render() {
      return (
         <ResponsiveReactGridLayout
            {...this.props}
            layouts={this.state.layouts}
            onBreakpointChange={this.onBreakpointChange}
            onLayoutChange={this.onLayoutChange}
            measureBeforeMount={false}
            useCSSTransforms={this.state.mounted}
            compactType={this.state.compactType}
            preventCollision={!this.state.compactType}
         >
            {this.generateDOM()}
         </ResponsiveReactGridLayout>
      );
   }
}

ShowcaseLayout.propTypes = {
   onLayoutChange: PropTypes.func.isRequired,
};

ShowcaseLayout.defaultProps = {
   className: "layout",
   rowHeight: 30,
   onLayoutChange: function () {},
   cols: { lg: 12, md: 12, sm: 4, xs: 4, xxs: 2 },
   initialLayout: generateLayout(),
};

function generateLayout(result = []) {
   let y = 0,
      totalWidth = 0;
   var arr = [];
   result.map((r, i) => {
      let xAxis = 0,
         yAxis = 0;

      if (totalWidth + r.layout.size < 12) {
         xAxis = totalWidth;
         totalWidth = totalWidth + r.layout.size;
         yAxis = y;
      } else if (totalWidth + r.layout.size === 12) {
         xAxis = totalWidth;
         totalWidth = 0;
         yAxis = y;
         y = y + 1;
      } else if (totalWidth + r.layout.size > 12) {
         xAxis = totalWidth;
         totalWidth = 0;
         yAxis = y + 1;
         y = y + 1;
      }

      arr.push({
         x: xAxis,
         y: yAxis,
         w: r.layout.size,
         h: r.id === "recentUpdates" ? 10 : r.id === "lineChart" || r.id === "barChart" ? 13 : 12,
         i: r.id,
         data: r,
      });
   });
   return arr;
}
