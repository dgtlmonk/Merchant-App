import { CircularProgress, TextField } from "@material-ui/core";
import { withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/material-ui";
import { format } from "date-fns";
import { Fragment, useEffect, useState } from "react";
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
  const [selectedMembershipCard, setSelectedMembeshipCard] = useState(null);
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
    return membershipCards.map((card) => {
      return (
        <div
          key="card.digitalCard.masterId"
          role="button"
          onClick={() => {
            setSelectedMembeshipCard(card);
            setViewState(VIEW.fillup);
          }}
        >
          <img src={card.digitalCard.image.front} />
        </div>
      );
    });
  }

  return (
    <div className="flex flex-col  p-4 max-w-md items-center justify-center h-full w-full">
      {viewState === VIEW.fullfilled ? (
        <div
          className="border rounded-md flex relative mt-12"
          style={{ width: "254px", minHeight: "130px" }}
        >
          <div className="flex flex-col w-full h-full items-center justify-end">
            <div className="flex w-full justify-center text-xl">S11232 </div>
            <div className="flex w-full items-center justify-between p-2">
              <div>
                <span className="text-xs mr-2">join</span>
                <span style={{ fontSize: ".9em" }}>
                  {/* @ts-ignore */}
                  {getFormattedDate(`${cardDetail?.startTime}`)}
                </span>
              </div>
              <div>
                <span className="text-xs mr-2">expire</span> {/* @ts-ignore */}
                <span style={{ fontSize: ".9em" }}>
                  {/* @ts-ignore */}
                  {getFormattedDate(`${cardDetail?.endTime}`)}
                </span>
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
            <div
              className="border rounded-md flex relative mt-12"
              style={{ width: "254px", minHeight: "130px" }}
            >
              {renderCardList()}
              {/* <span
                className="text-4xl opacity-5 absolute"
                style={{ left: "40px", top: "25px" }}
              >
                CARD SELECT
              </span> */}
            </div>
          ),
          [VIEW.fillup]: (
            <Fragment>
              <div style={{ width: "220px" }} className="mt-16">
                <img
                  src={selectedMembershipCard?.digitalCard?.image.front}
                  className="mt-12"
                />
              </div>
              {/* @ts-ignore  */}{" "}
              <Form schema={schema} onSubmit={handleSubmit}>
                <button
                  type="submit"
                  className="p-2 border rounded-md w-full bg-blue-400 text-white font-medium mb-8"
                >
                  Next
                </button>
              </Form>
            </Fragment>
          ),
          [VIEW.confirm]: (
            <div className="flex flex-col w-full items-center">
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
                  onClick={() => setViewState(VIEW.fillup)}
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
                  <span className="flex pl-2 text-xl text-gray-700">
                    +{/* @ts-ignore */}
                    {`${cardDetail?.person?.mobile?.countryCode} ${cardDetail?.person?.mobile?.number}`}
                  </span>
                </div>
                <div className="flex w-full p-2  text-md text-gray-400 items-center justify-between">
                  Expire
                  <span className="flex pl-2 text-xl text-gray-700">
                    {/* @ts-ignore */}
                    {getFormattedDate(`${cardDetail?.endTime}`)}
                  </span>
                </div>
              </div>

              <button
                className="p-2 mt-4 border rounded-md w-full bg-blue-400 text-white font-medium"
                onClick={onDone}
              >
                Done
              </button>
            </div>
          ),
        }[viewState]
      }
    </div>
  );
}

export default Index;
