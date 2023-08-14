import React, { useEffect, useState } from "react";
import * as firebase from "firebase/app";
import "firebase/firestore";
import LoadingContent from "../common/LoadingContent";

const ShortcutList = (props) => {
  return (
    <div className="col-md-4 col-lg-6 col-xl-2 col-sm-2">
      <div className="sidebar-phrases right-sidebar-background">
        <div className="max-500-phrases">
          {/* {this.state.isloading ? <LoadingContent /> : ""} */}
          <label className="custom-filed1-phrases label right-label">
            <b>Shortcuts List</b>
          </label>
          <div className="custom-filed2-phrases scrollbar-phrases">
            {props.phrasesList && props.phrasesList.length !== 0 ? (
              props.phrasesList.map((phrase, i) => {
                return (
                  <div key={i} className="row-spacing">
                    <div className=".custom-filed22-phrases">
                      <div style={{ display: "flex" }}>
                        <div className="element-margins">{phrase.shortcut}</div>
                        <div style={{ flex: "1" }}></div>

                        <button
                          className="button-input-phrases"
                          onClick={() => props.handleEdit(phrase)}
                        >
                          <svg
                            width="16"
                            height="14"
                            viewBox="0 0 16 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M0 11.0622V13.8805H3.125L12.3417 5.56846L9.21666 2.75018L0 11.0622ZM14.7583 3.38899C15.0833 3.09589 15.0833 2.62242 14.7583 2.32932L12.8083 0.570717C12.4833 0.277616 11.9583 0.277616 11.6333 0.570717L10.1083 1.94604L13.2333 4.76431L14.7583 3.38899Z"
                              fill="#979797"
                            />
                          </svg>
                        </button>

                        <button
                          className="button-input-phrases"
                          onClick={() => props.handleDelete(i)}
                        >
                          <svg
                            width="15"
                            height="17"
                            viewBox="0 0 15 17"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.5 14.4296C1.5 15.4216 2.4 16.2332 3.5 16.2332H11.5C12.6 16.2332 13.5 15.4216 13.5 14.4296V3.60739H1.5V14.4296ZM3.5 5.41108H11.5V14.4296H3.5V5.41108ZM11 0.901847L10 0H5L4 0.901847H0.5V2.70554H14.5V0.901847H11Z"
                              fill="#A0A0A0"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div>No Shortcuts to show.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortcutList;
