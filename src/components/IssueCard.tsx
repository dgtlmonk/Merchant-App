import { CircularProgress, TextField } from "@material-ui/core";
import { ArrowBack, Loop } from "@material-ui/icons";
import { withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/material-ui";
import { format } from "date-fns";
import { Fragment, useEffect, useRef, useState } from "react";
import Barcode from "react-barcode";
import { MdPersonSearch } from "react-icons/md";
import { FormProps } from "react-jsonschema-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import { client } from "../helpers/api-client";
import { schema, uiSchema } from "../types";

enum MATCH_STATUS {
  found = "found",
  no_result = "no_result",
  searching = "searching",
  idle = "idle",
}

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
    search = "search",
  }
  const host = import.meta.env.VITE_API_HOST;
  const [viewState, setViewState] = useState<VIEW>(VIEW.search);
  const [membershipCards, setMembershipCards] = useState([]);
  const [selectedMembershipCard, setSelectedMembeshipCard] =
    useState<any>(null);
  const [isLoadingCards, setIsLoadingCards] = useState<boolean>(true);
  const [matchStatus, setMatchStatus] = useState<MATCH_STATUS>(
    MATCH_STATUS.idle
  );
  const [displayName, setDisplayName] = useState<string>("");
  const [toggleDisplayName, setToggleDisplayName] = useState<boolean>(false);
  const [cardDetail, setCardDetail] = useState(null);
  const [data, setData] = useState<any>({});
  const [matchData, setMatchData] = useState<any>({});

  const formDataRef = useRef<any>();
  const familyNameRef = useRef<any>();
  const givenNameRef = useRef<any>();
  const birthDateRef = useRef<any>();
  const mobileRef = useRef<any>();

  function handleFormChange(e) {
    formDataRef.current = e.formData;
  }

  function handlePreviousView() {
    if (viewState === VIEW.confirm) {
      setViewState(VIEW.fillup);
      return;
    }

    if (viewState === VIEW.search) {
      setViewState(VIEW.card_select);
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
          className={`rounded-md flex w-full ${i > 0 ? "mt-8" : ""}`}
          style={{ minHeight: "130px" }}
          key={card?.digitalCard?.masterId}
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

  function handleDone() {
    formDataRef.current = null;
    setData(null);
    setViewState(VIEW.card_select);
  }

  function handleMatchPerson() {
    const payload = {
      giveName: givenNameRef.current.value,
      familyName: familyNameRef.current.value,
      mobile: mobileRef.current.value,
    };

    setMatchStatus(MATCH_STATUS.searching);

    client
      .post(`${host}/memberships/match`, {
        headers: {
          "x-api-key": `${import.meta.env.VITE_API_KEY}`,
        },
        body: JSON.stringify(payload),
      })
      .then((res: any[]) => {
        if (res.length) {
          setMatchStatus(MATCH_STATUS.found);
          setMatchData(res[0]);
        } else {
          setMatchStatus(MATCH_STATUS.no_result);
        }
      });
  }

  return (
    <Fragment>
      <div
        className="grid grid-cols-1 grid-rows-6 gap-0 overflow-hidden"
        style={{
          height: "100vh",
          width: "100vw",
          gridTemplateRows: "4rem 1fr",
        }}
      >
        <div
          className="module__header col-span-1 row-start-1 z-20"
          style={{ backgroundColor: "#f8f8ff" }}
        >
          <div className="flex flex-row justify-center items-center relative w-full h-16 border">
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

        <div className="overflow-y-scroll flex justify-center ">
          {
            {
              [VIEW.card_select]: isLoadingCards ? (
                <div className="flex h-full items-center">
                  <CircularProgress size="2rem" />
                </div>
              ) : (
                <div className="flex flex-col mt-4">
                  <div className="flex flex-row w-full p-8">
                    <button
                      className="h-16 justify-around flex border items-center
                    p-2 rounded-md w-full text-gray-700 
                    "
                      onClick={() => {
                        setViewState(VIEW.search);
                        setMatchStatus(MATCH_STATUS.idle);
                      }}
                    >
                      {" "}
                      Existing Member
                      <MdPersonSearch className="opacity-70 text-gray-800 w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex  justify-center px-8">
                    {renderCardList()}
                  </div>
                </div>
              ),

              [VIEW.search]: (
                <div
                  className={`flex flex-col  h-full  w-full ${
                    matchStatus !== MATCH_STATUS.idle
                      ? "justify-start"
                      : "justify-center"
                  }`}
                >
                  <div
                    className={`flex pt-4 flex-col justify-center items-center ${
                      matchStatus === MATCH_STATUS.idle ? "hidden" : "visible"
                    }`}
                    style={{ backgroundColor: "#ffea8a" }}
                  >
                    <h2>Existing member found: </h2>
                    <div className="flex flex-col  items-center">
                      <h1 className="text-2xl text-gray-500">
                        {matchData.person?.fullName}
                      </h1>
                      <span className="font-light text-sm text-gray-400">
                        with the same mobile number
                      </span>
                    </div>
                    <div className="flex flex-col  border justify-center align-center  bg-white shadow-md rounded-md mt-4">
                      <div className="px-2">
                        {/* @ts-ignore */}
                        <Barcode value={`${matchData?.cardNumber}`} />
                      </div>
                    </div>

                    <div className="mt-4 mb-4 flex flex-col items-center">
                      <h2>Is this the same person?</h2>
                      <div className="flex flex-row w-full p-2 justify-around ">
                        <button className="px-2 py-1 mr-2 border rounded-md w-full bg-blue-400 text-white font-medium">
                          Yes
                        </button>

                        <button className="px-2 py-1 border rounded-md w-full bg-slate-400 text-white font-medium ">
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center  items-center px-4 mt-4">
                    <TextField
                      style={{ marginBottom: "1rem" }}
                      className="w-4/6"
                      label="family name"
                      inputRef={familyNameRef}
                    />
                    <TextField
                      style={{ marginBottom: "1rem" }}
                      className="w-4/6 mb-4"
                      label="given name"
                      inputRef={givenNameRef}
                    />
                    <TextField
                      style={{ marginBottom: "1rem" }}
                      className="w-4/6"
                      label="birth date"
                      inputRef={birthDateRef}
                    />
                    <TextField
                      className="w-4/6"
                      label="mobile"
                      inputRef={mobileRef}
                    />
                  </div>
                  <div className="flex w-full mt-8 px-8">
                    <span
                      className={`w-full flex justify-center ${
                        matchStatus === MATCH_STATUS.searching
                          ? "visible"
                          : "hidden"
                      }`}
                    >
                      <CircularProgress size="2rem" />
                    </span>
                    <button
                      className={`p-2 border w-full rounded-md bg-blue-400 text-white font-medium
                      ${
                        matchStatus !== MATCH_STATUS.searching
                          ? "visible"
                          : "hidden"
                      }
                      
                      `}
                      onClick={handleMatchPerson}
                    >
                      Search
                    </button>
                  </div>
                </div>
              ),
              [VIEW.fillup]: (
                <Fragment>
                  <div className="flex flex-col mt-8">
                    <div className="flex flex-col max-w-sm  justify-center  items-center">
                      <div className="w-4/6">
                        <img
                          src={selectedMembershipCard?.digitalCard?.image.front}
                        />
                      </div>

                      <div className="w-4/6 flex px-12 justify-center">
                        {/* @ts-ignore */}
                        <Form
                          key="cardIssueForm"
                          schema={schema}
                          uiSchema={uiSchema}
                          onChange={handleFormChange}
                          onSubmit={handleSubmit}
                          formData={data}
                          widgets={widgets}
                        >
                          <div className="flex w-full justify-center items-center mb-4">
                            {/* TODO: pass country from header or url */}
                            <PhoneInput
                              country={"sg"}
                              enableSearch
                              specialLabel="mobile"
                              inputStyle={{ width: "auto" }}
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

                          <button
                            type="submit"
                            className="p-2 border rounded-md w-full bg-blue-400 text-white font-medium mb-8"
                          >
                            Next
                          </button>
                        </Form>
                      </div>
                    </div>
                  </div>
                </Fragment>
              ),
              [VIEW.confirm]: (
                <div className="flex flex-col w-full max-w-md items-center mt-8">
                  <div className="w-2/3">
                    <img
                      src={selectedMembershipCard?.digitalCard?.image.front}
                    />
                  </div>

                  <div className="mt-6">
                    <span className="font-normal text-xs text-slate-500">
                      display as
                    </span>

                    <div className="flex flex-row items-center -mt-4">
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
                    <div className="flex w-full justify-center items-center p-4">
                      {/* TODO: pass country from header or url */}
                      <PhoneInput
                        country={"sg"}
                        enableSearch
                        specialLabel="mobile"
                        inputStyle={{ width: "auto" }}
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
                <div className="flex flex-col mt-8">
                  <div className="flex flex-col  justify-center w-full  items-center">
                    <div className="flex flex-col  border justify-center align-center  bg-white shadow-md rounded-md">
                      <div className="px-2">
                        {/* @ts-ignore */}
                        <Barcode value={`${cardDetail?.cardNumber}`} />
                      </div>
                      <div className="flex w-full border-t py-1 justify-between">
                        <div className="pl-2">
                          <div
                            className=" text-gray-400"
                            style={{ fontSize: ".7rem" }}
                          >
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
    </Fragment>
  );
}

export default Index;
