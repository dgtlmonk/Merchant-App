import { format } from "date-fns";
import { useEffect, useState } from "react";
import Barcode from "react-barcode";

function getFormattedDate(date: string) {
  if (!date || date === "undefined") return;
  return format(new Date(date), "d MMM yyyy");
}

type Props = {
  isNotQualified: boolean;
  membership: any;
  onDone?: () => void;
};

enum CARD_VIEW {
  list = "list",
  single = "single",
  loading = "loading",
}

const Index = ({ isNotQualified, membership, onDone }: Props) => {
  const [cardView, setCardView] = useState(
    // @ts-ignore
    membership?.activeMemberships.length > 1 ? CARD_VIEW.list : CARD_VIEW.single
  );
  const [card, setCardDetail] = useState<any>(null);

  useEffect(() => {
    // @ts-ignore
    if (membership?.activeMemberships.length === 1) {
      // @ts-ignore
      setCardDetail(
        membership?.activeMemberships[membership.activeMemberships.length - 1]
      );
      setCardView(CARD_VIEW.single);
    } else {
      setCardView(CARD_VIEW.list);
    }
  }, [membership]);

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

        {cardView === CARD_VIEW.single ? (
          <div className="flex mt-4 flex-col  border justify-center items-center  bg-white shadow-md rounded-md p-2">
            <div className="flex  items-center mb-2" style={{ width: "350px" }}>
              {/* TODO: display card number based on selected membership tier */}
              {/* @ts-ignore */}
              <Barcode value={`${card?.cardNumber}`} width={3} height={130} />
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
                    {getFormattedDate(`${card?.startTime}`)}
                  </span>
                </div>
              </div>
              <div className="pr-2">
                <div
                  className="pl-2 text-gray-400"
                  style={{ fontSize: ".7rem" }}
                >
                  expire
                  <span
                    className="pl-1 font-medium text-gray-700 tracking-tighter"
                    style={{ fontSize: ".8rem" }}
                  >
                    {" "}
                    {/* @ts-ignore */}
                    {getFormattedDate(`${card?.endTime}`)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>card list</div>
        )}
      </div>

      <div className="flex flex-col px-12 w-full items-center justify-center">
        <div className="flex flex-col justify-center w-full items-center">
          {!isNotQualified ? (
            <div
              data-test="reminder-notice"
              className={`flex font-bold  px-4 py-2 border  justify-center  rounded-md bg-orange-400 text-white text-sm mt-4 `}
            >
              Remember to scan the barcode on the card
            </div>
          ) : null}

          <div className="text-5xl mt-6 flex w-full justify-center">
            {/* @ts-ignore */}
            {`${membership.fullName}`}
          </div>
          <div className="flex flex-col w-4/6 text-gray-600 mt-4 ">
            <div className="flex w-full  text-gray-400 p-2 border-b border-gray-400 text-md items-center justify-between">
              Mobile
              <span className="flex pl-2 text-xl text-gray-700 tracking-tight">
                {membership?.mobile
                  ? membership.mobile
                  : `${membership?.phones[0]?.countryCode} ${membership?.phones[0]?.number}`}
              </span>
            </div>
            <div className="flex w-full p-2  text-md text-gray-400 items-center justify-between">
              Expire
              <span className="flex pl-2 text-xl text-gray-700 tracking-tight">
                {/* @ts-ignore */}
                {getFormattedDate(`${card?.endTime}`)}
              </span>
            </div>

            {!isNotQualified ? (
              <button
                className="p-2 mt-8 border rounded-md w-full bg-blue-400 text-white font-medium"
                onClick={onDone}
              >
                Done
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
