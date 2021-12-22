import { CircularProgress } from "@material-ui/core";
import { ArrowBack, ArrowRightTwoTone, Loop } from "@material-ui/icons";
import { withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/material-ui";
import { format } from "date-fns";
import { Fragment, useEffect, useRef, useState } from "react";
import Barcode from "react-barcode";
import { FormProps } from "react-jsonschema-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import { client } from "../helpers/api-client";
import { schema, uiSchema } from "../types";

type Props = {
  onDone: () => void;
};

const Form = withTheme(Theme);
const widgets = {
  PhoneWidget: PhoneInput,
};

// console.log("import.meta.env.VITE_API_KEY ", import.meta.env.VITE_API_KEY);
// console.log("import.meta.env.VITE_API_HOST ", import.meta.env.VITE_API_HOST);

function getFormattedDate(date: string) {
  if (!date || date === "undefined") return;
  return format(new Date(date), "d MMM yyyy");
}

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

  const formDataRef = useRef<any>();

  const PhoneInputJSX = (
    <div className="flex w-full justify-center items-center p-4">
      {/* TODO: pass country from header or url */}
      <PhoneInput
        country={"sg"}
        enableSearch
        specialLabel="mobile"
        inputProps={{
          name: "mobile",
        }}
        value={formDataRef?.current?.mobile}
        onChange={(phone) => {
          formDataRef.current = {
            ...formDataRef.current.value,
            mobile: phone,
          };
        }}
      />
    </div>
  );

  function getPreviousView() {
    if (viewState === VIEW.card_select) return;
  }

  function handleFormChange(e) {
    formDataRef.current = e.formData;
  }

  function handlePreviousView() {
    if (viewState === VIEW.confirm) {
      setViewState(VIEW.fillup);
      return;
    }

    if (viewState === VIEW.fillup) {
      setViewState(VIEW.card_select);
      return;
    }
  }

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

  const handleSubmit = (
    { formData }: FormProps<any>,
    e: React.FormEvent<HTMLFormElement>
  ) => {
    const { name } = formData;

    if (!formDataRef?.current?.mobile) {
      if (data?.mobile) {
        formDataRef.current = {
          ...formDataRef.current.value,
          mobile: data.mobile,
        };
      } else {
        e.target["mobile"].focus();
        return;
      }
    }

    payload = {
      ...payload,
      // @ts-ignore
      name,
      mobile: formDataRef?.current?.mobile,
    };

    setData(payload);
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
    return membershipCards.map((card: any, i: number) => {
      return (
        <div
          className={`rounded-md flex relative ${i > 0 ? "mt-8" : ""}`}
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
    formDataRef.current = null;
    setData(null);
    setViewState(VIEW.card_select);
  }

  return (
    <div className="flex flex-col w-full h-full items-center">
      <div
        className="module__header sticky top-0 w-full z-20 mb-2"
        style={{ backgroundColor: "#f8f8ff" }}
      >
        <div className="flex flex-row justify-center items-center relative w-full h-16">
          <button
            className={`absolute top-0 left-0 h-16 w-16 ${
              viewState === VIEW.fullfilled ? "hidden" : "visible"
            }`}
            onClick={handlePreviousView}
          >
            <ArrowBack className="opacity-50" />
          </button>
          <div className="p-4">Issue Card</div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center  w-full h-full z-10">
        {viewState === VIEW.fullfilled ? (
          <div className="flex flex-col max-w-sm  justify-center w-full  items-center">
            <div className="flex flex-col  border justify-center align-center  bg-white shadow-md rounded-md w-2/3 ">
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
                    expire
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
              <div>
                <div className="flex flex-row w-full">
                  <button
                    className="h-16 justify-around flex border items-center
                    p-2 rounded-md w-full text-gray-700 mb-8
                    "
                    onClick={() => setToggleDisplayName(!toggleDisplayName)}
                  >
                    {" "}
                    Existing Member
                    <ArrowRightTwoTone className="opacity-70 text-gray-400" />
                  </button>
                </div>
                {renderCardList()}
              </div>
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
                    key="cardIssueForm"
                    schema={schema}
                    uiSchema={uiSchema}
                    onChange={handleFormChange}
                    onSubmit={handleSubmit}
                    formData={data}
                    widgets={widgets}
                    className="px-8"
                  >
                    {/* {PhoneInputJSX} */}
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
                  <img src={selectedMembershipCard?.digitalCard?.image.front} />
                </div>

                <div className="mt-6">
                  <span className="font-normal text-xs text-slate-500">
                    display as
                  </span>
                  <div className="flex flex-row items-center -mt-2">
                    <div className="-mt-1 text-2xl ">{displayName}</div>
                    <button
                      className="h-16 w-16"
                      onClick={() => setToggleDisplayName(!toggleDisplayName)}
                    >
                      <Loop className="opacity-80 text-blue-500" />
                    </button>
                  </div>
                </div>
                <div>
                  <div className="flex w-full justify-center items-center p-4 hidden">
                    {/* TODO: pass country from header or url */}
                    <PhoneInput
                      country={"sg"}
                      enableSearch
                      specialLabel="mobile"
                      inputProps={{
                        name: "mobile",
                      }}
                      value={formDataRef?.current?.mobile}
                      onChange={(phone) => {
                        formDataRef.current = {
                          ...formDataRef?.current?.value,
                          mobile: phone,
                        };
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-row w-full items-center justify-center mt-8">
                  <button
                    className="p-2 px-4 border rounded-md  bg-slate-400 text-white mr-4"
                    onClick={handleDone}
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
