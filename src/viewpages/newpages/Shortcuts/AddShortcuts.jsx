import React, { memo } from "react";

function AddShortcuts() {
  return (
    <div className="bg-white h-3xl w-50 flex-center">
      <div className="">
        <div className="text-grey5 text-large">Create Shortcuts</div>
        <div>
          <div>
            <div className="my-2 text-small text-grey5">Shortcut</div>
            <input
              type="text"
              placeholder="OMW"
              className="default-text-input w-xlarge1 h-xsmall p-3"
            />
          </div>
          <div>
            <div className="my-2 text-small text-grey5">Phrase</div>
            <textarea
              className="default-text-input w-xlarge1 h-2xl p-3"
              type="text"
              placeholder="On my way....."
              //   onChange={(e) => this.handlePhraseChange(e)}
            />
          </div>
          <div className="w-100 flex-center my-4">
            <button className="btn-default w-large h-small round-border-s text-small">
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default memo(AddShortcuts);
