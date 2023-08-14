import React, { memo } from "react";

function ShortcutsList(props) {
  return (
    <div className="shortcutsList-main-div h-100">
      <div className="text-large text-bold m-4">Shortcuts</div>
      <div>
        {props.phrasesList && props.phrasesList.length !== 0 ? (
          props.phrasesList.map((phrase, i) => {
            return (
              <div
                key={i}
                className="flex-center w-100 justify-content-between"
              >
                <div className="mx-4">
                  <div className="text-medium text-black2">
                    Dextroamphetamine
                  </div>
                  <div className="text-xsmall text-grey7">De</div>
                </div>
                <div className="mx-4">
                  <img
                    src="/assets/images/newimages/edit-shortcut.svg"
                    alt=""
                    className="mx-4"
                  />
                  <img
                    src="/assets/images/newimages/delete-shortcut.svg"
                    alt=""
                    className="mr-1"
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="w-100 flex-center text-small">
            No Shortcuts to show.
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ShortcutsList);
