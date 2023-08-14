import React from "react";
import ShowcaseLayout from "./layout";
export default class ExampleLayout extends React.Component {
   constructor(props) {
      super(props);
      this.state = { layout: [] };
      this.onLayoutChange = this.onLayoutChange.bind(this);
   }

   onLayoutChange(layout) {
      this.setState({ layout: layout });
   }

   render() {
      const { data } = this.props;
      return (
         <div className="div-main-drag">
            <ShowcaseLayout data={data} onLayoutChange={this.onLayoutChange} />
         </div>
      );
   }
}
