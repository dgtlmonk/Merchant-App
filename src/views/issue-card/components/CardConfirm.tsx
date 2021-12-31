import { format } from "date-fns";
import Barcode from "react-barcode";

function getFormattedDate(date: string) {
  if (!date || date === "undefined") return;
  return format(new Date(date), "d MMM yyyy");
}

type Props = {
  isNotQualified: boolean;
  cardDetail: any;
  onDone?: () => void;
};

const Index = ({ isNotQualified, cardDetail, onDone }: Props) => {
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col  justify-center  items-center">
        <div
          data-test="notice-already-issued"
          className={`flex w-full p-4 flex-col justify-center items-center ${
            isNotQualified ? "visible" : "hidden"
          }`}
          style={{ backgroundColor: "#ffea8a" }}
        >
          Card already issued to this customer. Ask customer to login Perkd.
        </div>
        <div className="flex mt-4 flex-col  border justify-center align-center  bg-white shadow-md rounded-md">
          <div className="px-2">
            {/* TODO: display card number based on selected membership tier */}
            {/* @ts-ignore */}
            <Barcode value={`${cardDetail?.cardNumber}`} />
          </div>
          <div className="flex w-full border-t py-1 justify-between">
            <div className="pl-2">
              <div className=" text-gray-400" style={{ fontSize: ".7rem" }}>
                join
                <span
                  className="pl-1 font-medium text-gray-700 tracking-tighter"
                  style={{ fontSize: ".8rem" }}
                >
                  {/* @ts-ignore */}
                  {getFormattedDate(`${cardDetail?.startTime}`)}
                </span>
              </div>
            </div>
            <div className="pr-2">
              <div className="pl-2 text-gray-400" style={{ fontSize: ".7rem" }}>
                expire
                <span
                  className="pl-1 font-medium text-gray-700 tracking-tighter"
                  style={{ fontSize: ".8rem" }}
                >
                  {" "}
                  {/* @ts-ignore */}
                  {getFormattedDate(`${cardDetail?.endTime}`)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col px-12 w-full items-center justify-center">
        <div className="flex flex-col justify-center w-full items-center">
          {!isNotQualified ? (
            <div
              className={`flex font-bold  px-4 py-2 border  justify-center  rounded-md bg-orange-400 text-white text-sm mt-4 `}
            >
              Remember to scan the barcode on the card
            </div>
          ) : null}

          <div className="text-5xl mt-6 flex w-full justify-center">
            {/* @ts-ignore */}
            {`${cardDetail?.person?.fullName}`}
          </div>
          <div className="flex flex-col w-4/6 text-gray-600 mt-4 ">
            <div className="flex w-full  text-gray-400 p-2 border-b border-gray-400 text-md items-center justify-between">
              Mobile
              <span className="flex pl-2 text-xl text-gray-700 tracking-tight">
                +{/* @ts-ignore */}
                {`${cardDetail?.person?.phones[0]?.countryCode} ${cardDetail?.person?.phones[0]?.number}`}
              </span>
            </div>
            <div className="flex w-full p-2  text-md text-gray-400 items-center justify-between">
              Expire
              <span className="flex pl-2 text-xl text-gray-700 tracking-tight">
                {/* @ts-ignore */}
                {getFormattedDate(`${cardDetail?.endTime}`)}
              </span>
            </div>
          </div>

          {!isNotQualified ? (
            <button
              className="p-2 mt-4 border rounded-md w-full bg-blue-400 text-white font-medium"
              onClick={onDone}
            >
              Done
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Index;