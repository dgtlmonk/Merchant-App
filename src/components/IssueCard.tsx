import { CircularProgress, TextField } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/material-ui";
import { format } from "date-fns";
import { Fragment, useEffect, useState } from "react";
import Barcode from "react-barcode";
import { FormProps } from "react-jsonschema-form";
import { client } from "../helpers/api-client";
import { schema } from "../types";

const Form = withTheme(Theme);

// console.log("import.meta.env.VITE_API_KEY ", import.meta.env.VITE_API_KEY);
// console.log("import.meta.env.VITE_API_HOST ", import.meta.env.VITE_API_HOST);

function getFormattedDate(date: string) {
  if (!date || date === "undefined") return;
  return format(new Date(date), "d MMM yyyy");
}

type Props = {
  onDone: () => void;
};

function Index({ onDone }: Props) {
  enum VIEW {
    fillup = "fillup",
    card_select = "card_select",
    confirm = "confirm",
    fullfilled = "fullfilled",
  }
  const host = import.meta.env.VITE_API_HOST;
  const [viewState, setViewState] = useState<VIEW>(VIEW.card_select);
  const [membershipCards, setMembershipCards] = useState([]);
  const [selectedMembershipCard, setSelectedMembeshipCard] =
    useState<any>(null);
  const [isLoadingCards, setIsLoadingCards] = useState<boolean>(true);
  const [displayName, setDisplayName] = useState<string>("");
  const [toggleDisplayName, setToggleDisplayName] = useState<boolean>(false);

  const [cardDetail, setCardDetail] = useState(null);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    client
      .get(`${host}/programs`, {
        headers: {
          "x-api-key": `${import.meta.env.VITE_API_KEY}`,
        },
      })
      .then((res: any[]) => {
        if (res.length) {
          const [p] = res;
          let cardList = [];
          const tierList: [] = p?.tierList;

          if (!tierList.length) {
            console.warn("No Cards available!");
          } else {
            // @ts-ignore
            cardList = tierList.filter((tier) => tier?.enableIssuance === true);

            console.log(" card list ", cardList);

            setMembershipCards(cardList);
          }
        }
      })
      .finally(() => setIsLoadingCards(false));
  }, []);

  let payload = {
    membershipId: "5d12e1a1e4a5c53fdd6fe352",
    placeId: "5d1b019745828f10b6c5eed1",
  };

  useEffect(() => {
    if (data) {
      setDisplayName(`${data?.name?.givenName} ${data?.name?.familyName}`);
    }
  }, [data]);

  useEffect(() => {
    if (!toggleDisplayName) {
      setDisplayName(`${data?.name?.givenName} ${data?.name?.familyName}`);
    } else {
      setDisplayName(`${data?.name?.familyName} ${data?.name?.givenName}`);
    }
  }, [toggleDisplayName]);

  const handleSubmit = ({ formData }: FormProps<any>) => {
    const { name, mobile } = formData;

    payload = {
      ...payload,
      ...name,
      mobile,
    };

    setData(formData);
    setViewState(VIEW.confirm);
  };

  const handleConfirmSubmit = () => {
    client
      .post(`${host}/cards/issue`, {
        headers: {
          "x-api-key": `${import.meta.env.VITE_API_KEY}`,
        },
        body: JSON.stringify(payload),
      })
      .then((res) => {
        setViewState(VIEW.fullfilled);
        setCardDetail(res);
      });
  };

  function renderCardList() {
    // TODO: react memo ?
    return membershipCards.map((card: any) => {
      return (
        <div
          className="rounded-md flex relative mt-8"
          style={{ width: "220px", minHeight: "130px" }}
          key={card?.digitalCard?.masterId}
          role="button"
          onClick={() => {
            setSelectedMembeshipCard(card);
            setViewState(VIEW.fillup);
          }}
        >
          <img src={card.digitalCard.image.front} className="w-full h-full" />
        </div>
      );
    });
  }

  function handleDone() {
    setViewState(VIEW.card_select);
  }

  return (
    <div className="flex flex-col w-full h-full items-center">
      <div className="sticky top-0 w-full z-20 bg-white mb-2">
        <div className="flex flex-row justify-center items-center relative w-full h-16">
          <button className="absolute top-0 left-0 h-16 w-16">
            <ArrowBack className="opacity-50" />
          </button>
          <div className="p-4">Issue Card</div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center  w-full z-10">
        {viewState === VIEW.fullfilled ? (
          <div className="flex flex-col max-w-sm  justify-center w-full items-center">
            <div className="flex flex-col justify-center align-center  bg-white shadow-md rounded-md w-2/3 ">
              <div className="px-2">
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
                  <div
                    className="pl-2 text-gray-400"
                    style={{ fontSize: ".7rem" }}
                  >
                    exprire
                    <span
                      className="pl-1 font-medium text-gray-700 tracking-tighter"
                      style={{ fontSize: ".8rem" }}
                    >
                      {/* @ts-ignore */}
                      {getFormattedDate(`${cardDetail?.endTime}`)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {
          {
            [VIEW.card_select]: isLoadingCards ? (
              <CircularProgress size="2rem" />
            ) : (
              <Fragment>{renderCardList()}</Fragment>
            ),
            [VIEW.fillup]: (
              <Fragment>
                <div className="flex flex-col max-w-sm  justify-center w-full items-center">
                  <div className="w-2/3">
                    <img
                      src={selectedMembershipCard?.digitalCard?.image.front}
                      className="mt-12"
                    />
                  </div>
                  {/* @ts-ignore  */}{" "}
                  <Form
                    schema={schema}
                    onSubmit={handleSubmit}
                    className="px-8"
                  >
                    <button
                      type="submit"
                      className="p-2 border rounded-md w-full bg-blue-400 text-white font-medium mb-8"
                    >
                      Next
                    </button>
                  </Form>
                </div>
              </Fragment>
            ),
            [VIEW.confirm]: (
              <div className="flex flex-col w-full max-w-md items-center">
                <div className="w-2/3">
                  <img
                    src={selectedMembershipCard?.digitalCard?.image.front}
                    className="mt-12"
                  />
                </div>

                <div className="mt-6">
                  <span className="font-normal text-xs text-slate-500">
                    display as
                  </span>
                  <div className="flex flex-row items-center">
                    <div className="-mt-1 text-2xl ">{displayName}</div>
                    <span
                      role="button"
                      onClick={() => setToggleDisplayName(!toggleDisplayName)}
                      className="border py-2 px-3 rounded-md ml-4"
                    >
                      {`<->`}{" "}
                    </span>
                  </div>
                </div>
                <div className="flex justify-center mt-6 w-full">
                  {/* @ts-ignore */}
                  <TextField defaultValue={data?.mobile} label="mobile" />
                </div>
                <div className="flex flex-row w-full items-center justify-center mt-8">
                  <button
                    className="p-2 px-4 border rounded-md  bg-slate-400 text-white mr-4"
                    onClick={() => setViewState(VIEW.card_select)}
                  >
                    Cancel
                  </button>
                  <button
                    className="p-2 px-4 border rounded-md  bg-blue-400 text-white"
                    onClick={handleConfirmSubmit}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            ),
            [VIEW.fullfilled]: (
              <div className="flex flex-col">
                <div className="flex w-full px-4 py-2 border  rounded-md bg-orange-400 text-white text-sm mt-4">
                  Remember to scan the barcode on the card
                </div>
                <div className="text-5xl mt-6 flex w-full justify-center">
                  {/* @ts-ignore */}
                  {`${cardDetail?.person?.fullName}`}
                </div>
                <div className="flex flex-col w-full  text-gray-600 mt-4">
                  <div className="flex w-full  text-gray-400 p-2 border-b border-gray-400 text-md items-center justify-between">
                    Mobile
                    <span className="flex pl-2 text-xl text-gray-700 tracking-tight">
                      +{/* @ts-ignore */}
                      {`${cardDetail?.person?.mobile?.countryCode} ${cardDetail?.person?.mobile?.number}`}
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

                <button
                  className="p-2 mt-4 border rounded-md w-full bg-blue-400 text-white font-medium"
                  onClick={handleDone}
                >
                  Done
                </button>
              </div>
            ),
          }[viewState]
        }
      </div>
    </div>
  );
}

export default Index;
