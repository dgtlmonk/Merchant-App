import { TextField } from "@material-ui/core";
import { Loop } from "@material-ui/icons";
import { matches } from "cypress/types/lodash";

type Props = {
  cardImg: string;
  mobile: string;
  displayName: string;
  onToggleDisplayName: () => void;
  onDone: () => void;
  onConfirm: () => void;
  isToggleDisplayNameDisabled: boolean;
  matches?: any[];
};

const Index = ({
  cardImg,
  mobile,
  displayName,
  onToggleDisplayName,
  onDone,
  onConfirm,
  isToggleDisplayNameDisabled,
  matches,
}: Props) => {
  console.log("matches ", matches);
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col  justify-center  items-center">
        {matches && matches?.length === 1 ? (
          <div
            data-test="notice-confirm"
            className="flex w-full p-4 flex-col justify-center items-center"
            style={{ backgroundColor: "#ffea8a" }}
          >
            <h2>Existing member found: </h2>
            <div className="flex flex-col  items-center">
              <h1 className="text-2xl text-gray-500">{matches[0]?.fullName}</h1>
              <span className="font-light text-sm text-gray-400">
                with the same mobile number
              </span>
            </div>
          </div>
        ) : null}

        <div className="w-2/3">
          <img src={cardImg} />
        </div>

        <div className="mt-6">
          {isToggleDisplayNameDisabled ? null : (
            <span
              data-test="title-display-as"
              className="font-normal text-xs text-slate-500"
            >
              display as
            </span>
          )}
          <div className="flex flex-row items-center -mt-4">
            <div className="-mt-1 text-2xl ">{displayName}</div>

            {isToggleDisplayNameDisabled ? null : (
              <button className="h-16 w-16" onClick={onToggleDisplayName}>
                <Loop className="opacity-80 text-blue-500" />
              </button>
            )}
          </div>
        </div>
        <div>
          <div className="flex w-full justify-center items-center p-4">
            <TextField label="mobile" value={mobile} disabled />
          </div>
        </div>
        <div className="flex flex-row w-full items-center justify-center mt-8">
          <button
            className="p-2 px-4 border rounded-md  bg-slate-400 text-white mr-4"
            onClick={onDone}
          >
            Cancel
          </button>
          <button
            data-test="issue-confirm-btn"
            className="p-2 px-4 border rounded-md  bg-blue-400 text-white"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
