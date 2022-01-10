import { Fragment } from "react";

type Props = {
  onActivate?: () => void;
};

export default ({ onActivate }: Props) => (
  <div
    className="flex flex-col w-full h-full items-center justify-center"
    style={{ backgroundColor: "#FCDD98" }}
  >
    <div className="flex flex-col items-center justify-center bg-white p-12 rounded-xl shadow-md">
      <div className="w-14 -mt-20 mb-4 ">
        <img src="perkd_logo.png" loading="lazy" alt="Perkd Logo" />
      </div>
      <h1 className="font-semibold text-2xl tracking-wide text-gray-600">
        Perkd Merchant&trade; App
      </h1>
      {onActivate ? (
        <Fragment>
          <span className="mt-4 text-gray-600">
            Please confirm you want to use app on this device
          </span>
          <span className="text-gray-400 mt-2">
            This link can only be used once
          </span>
          <div className="flex flex-row w-full p-2 justify-center items-center">
            <button
              className="px-2  h-12 py-1 mr-4 border rounded-md w-full bg-slate-400 text-white font-medium"
              onClick={() => window.location.assign("https://perkd.me")}
            >
              Cancel
            </button>
            <button
              data-test="activate-btn"
              className="px-2 py-1 h-12  border rounded-md w-full bg-blue-400 text-white font-medium"
              onClick={onActivate}
            >
              Activate
            </button>
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <span className="mt-4  tracking-wide text-gray-700 font-medium">
            This activation link is no longer valid
          </span>
          <span className="text-gray-400 mt-2">
            Please contact customer service.
          </span>
        </Fragment>
      )}
    </div>
  </div>
);
