import { CircularProgress, TextField } from "@material-ui/core";
import { ArrowBack, Loop } from "@material-ui/icons";
import { withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/material-ui";
import { Fragment, useEffect, useRef, useState } from "react";
import Barcode from "react-barcode";
import { MdPersonSearch } from "react-icons/md";
import { FormProps } from "react-jsonschema-form";
import { useMediaQuery } from "react-responsive";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/material.css";
import { client, qualifySvcUrl } from "../../helpers/api-client";
import { schema, uiSchema } from "../../types";
import CardIssued from "./components/CardIssued";

enum MATCH_STATUS {
  found = "found",
  not_found = "not found",
  searching = "searching",
  idle = "idle",
  not_qualified = "not_qualified",
  qualified = "qualified",
}

const Form = withTheme(Theme);

type Props = {
  onDone: () => void;
  location: any;
  programs?: any;
  installationId: string;
};

function Index({ onDone, programs, location, installationId }: Props) {
  enum VIEW {
    fillup = "fillup",
    card_select = "card_select",
    confirm = "confirm",
    fullfilled = "fullfilled",
    search = "search",
  }

  // const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });
  const isPortrait = useMediaQuery({ query: "(orientation: portrait)" });

  const host = import.meta.env.VITE_API_HOST;
  const [viewState, setViewState] = useState<VIEW>(VIEW.card_select);
  const [membershipCards, setMembershipCards] = useState([]);
  const [membership, setMembership] = useState<any>({});
  const [selectedMembership, setSelectedMembership] = useState<any>(null);
  const [matchStatus, setMatchStatus] = useState<MATCH_STATUS>(
    MATCH_STATUS.idle
  );
  const [displayName, setDisplayName] = useState<string>("");
  const [toggleDisplayName, setToggleDisplayName] = useState<boolean>(false);
  const [data, setData] = useState<any>({});
  const [matchData, setMatchData] = useState<any>({});

  const formDataRef = useRef<any>();
  const familyNameRef = useRef<any>();
  const givenNameRef = useRef<any>();
  const birthDateRef = useRef<any>();
  const mobileRef = useRef<any>();
  const prevViewRef = useRef<VIEW>();
  const programRef = useRef<any>(null);

  useEffect(() => {
    console.log("is port ", isPortrait);
  }, [isPortrait]);

  function handleFormChange(e) {
    formDataRef.current = e.formData;
  }

  function handlePreviousView() {
    if (prevViewRef.current === VIEW.search) {
      prevViewRef.current = viewState;
      setViewState(VIEW.search);
      return;
    }

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
    console.log(" prev view ", prevViewRef.current);
  }, [prevViewRef.current]);

  useEffect(() => {
    if (programs.length) {
      const [p] = programs;
      programRef.current = p;

      let cardList = [];
      const tiers: [] = p?.tiers;

      if (!tiers.length) {
        console.warn("No Cards available!");
      } else {
        // @ts-ignore
        cardList = tiers.filter((tier) => tier?.card?.canIssue === true);
        setMembershipCards(cardList);
      }
    }
  }, [programs]);

  // TODO: validate
  let payload = {
    membershipId: "5d12e1a1e4a5c53fdd6fe352",
    placeId: "5d1b019745828f10b6c5eed1",
  };

  useEffect(() => {
    if (data) {
      setDisplayName(`${data?.givenName} ${data?.familyName}`);
    }
  }, [data]);

  useEffect(() => {
    if (matchData) {
      // setDisplayName(`${matchData?.person?.fullName}`);
      setData({
        ...data,
        // name: {
        //   ...matchData.person,
        // },
      });
      formDataRef.current = {
        ...data,
        mobile: matchData?.person?.mobile?.fullNumber,
      };
    }
  }, [matchData]);

  useEffect(() => {
    if (!toggleDisplayName) {
      setDisplayName(`${data?.givenName} ${data?.familyName}`);
    } else {
      setDisplayName(`${data?.familyName} ${data?.givenName}`);
    }
  }, [toggleDisplayName]);

  const handleSubmit = (
    { formData }: FormProps<any>,
    e: React.FormEvent<HTMLFormElement>
  ) => {
    const params = {
      profile: {
        ...formData,
      },
      tierLevel: selectedMembership.level,
      programId: programs[0].programId,
      location: {},
      staff: {},
    };

    client
      .post(`${qualifySvcUrl}`, {
        body: JSON.stringify(params),
        headers: {
          "content-type": "application/json",
          "x-api-key": `${import.meta.env.VITE_API_KEY}`,
          "tenant-code": `${import.meta.env.VITE_TENANT_CODE}`,
          "x-access-token": `${import.meta.env.VITE_API_TOKEN}`,
        },
      })
      .then((res) => {
        console.log(" qualify response ", res);

        if (res?.qualify && res?.qualify === "no") {
          // const [card] = res.person?.activeMemberships;
          const { person } = res;

          setMembership({
            mobile: null,
            phones: person.phones,
            activeMemberships: person.activeMemberships,
            fullName: person.fullName,
          });

          setMatchStatus(MATCH_STATUS.not_qualified);
          setViewState(VIEW.fullfilled);
        }

        if (res?.qualify && res?.qualify === "yes") {
          console.log(" --- qualified");

          setData({ ...formData });
          setViewState(VIEW.confirm);
        }
      });
  };

  const handleConfirmSubmit = () => {
    console.log("selected membership ", selectedMembership);
    const params = Object.assign(Object.create(null, {}), {
      programId: programRef?.current?.programId,
      tierLevel: selectedMembership.level,
      installation: {
        id: installationId,
      },
      location,
      profile: { ...data },
    });

    asyncJoin(params);
  };

  function asyncJoin(params: any) {
    client
      .post(`${host}/membership/join`, {
        headers: {
          "x-api-key": `${import.meta.env.VITE_API_KEY}`,
        },
        body: JSON.stringify(params),
      })
      .then((res) => {
        //  TODO: catch errors
        console.log("confirm issue response  ", res);

        setMatchStatus(MATCH_STATUS.qualified);
        setMembership({
          mobile: data.mobile,
          phones: null,
          activeMemberships: [
            {
              cardNumber: res.cardNumber,
              endTime: res.endTime,
              startTime: res.startTime,
            },
          ],
          fullName: displayName,
        });

        setViewState(VIEW.fullfilled);
      });
  }

  function getCurrentMembership(programId: string, tierLevel: number) {
    if (!programs || !programs.length) return null;

    const membership = programs.filter(
      (program) => program.programId === programId
    );

    // @ts-ignore
    if (membership.length && membership[0]?.tierList) {
      // @ts-ignore
      const { tierList } = membership[0];
      console.log(" tier list ", tierList);

      if (tierList && tierList.length) {
        const currentMembership = tierList.filter(
          (tier) => tier.level == tierLevel
        )[0];

        console.log(" current membership ?? ", currentMembership);

        return currentMembership;
      }

      return null;
    }

    return null;
  }

  function renderCardList() {
    // TODO: react memo ?

    if (!membershipCards || !membershipCards.length) {
      return <div className={`rounded-md flex w-full`}>No Card Available</div>;
    }

    return membershipCards.map((membership: any, i: number) => {
      return (
        <div
          className={`rounded-md flex w-full ${i > 0 ? "mt-8" : ""}`}
          data-test="shop-card"
          style={{ minHeight: "130px" }}
          key={i}
          role="button"
          onClick={() => {
            setSelectedMembership(membership);
            setViewState(VIEW.fillup);
          }}
        >
          <img src={membership.card.image.original} />
        </div>
      );
    });
  }

  function handleDone() {
    console.log("done ?");
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
          const [program] = res;

          const personMembership = getCurrentMembership(
            program.programId,
            program.tierLevel
          );

          personMembership && setSelectedMembership(personMembership);

          setMatchStatus(MATCH_STATUS.found);
          setMatchData(program);
        } else {
          setMatchStatus(MATCH_STATUS.not_found);
        }
      });
  }

  const handleConfirmMatch = (confirm: boolean) => (e) => {
    console.log("confirm ", confirm);

    prevViewRef.current = VIEW.search;

    const params = Object.assign(Object.create(null, {}), {
      membershipId: matchData?.membershipId,
      placeId: payload.placeId,
    });

    // revoke
    if (!confirm) {
      // revoke

      client
        .post(`${host}/cards/revoke`, {
          headers: {
            "x-api-key": `${import.meta.env.VITE_API_KEY}`,
          },
          body: JSON.stringify(params),
        })
        .then(() => {
          setMatchStatus(MATCH_STATUS.idle);
          setViewState(VIEW.confirm);
        });
    } else {
      // issue
      setMatchStatus(MATCH_STATUS.idle);
      setViewState(VIEW.confirm);
    }
  };

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
            <div className="p-4">
              Issue Card
              {`${selectedMembership ? ` : ${selectedMembership?.name}` : ""}`}
            </div>
          </div>
        </div>

        <div className="overflow-y-scroll flex justify-center ">
          {
            {
              [VIEW.card_select]: (
                <div className="flex flex-col w-3/5  items-center">
                  <div className="flex flex-row p-8">
                    <button
                      className="h-16 justify-around flex border items-center
                    p-2 rounded-md px-8 text-gray-700"
                      onClick={() => {
                        setViewState(VIEW.search);
                        setMatchStatus(MATCH_STATUS.idle);
                      }}
                    >
                      <span className="mr-4" data-test="person-search">
                        Existing Member
                      </span>
                      <MdPersonSearch className="opacity-70 text-gray-800 w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex flex-col  justify-center px-8">
                    {renderCardList()}
                  </div>
                </div>
              ),
              [VIEW.search]: (
                <div className={`flex flex-col  h-full  w-full`}>
                  <div
                    className={`flex pt-4 flex-col justify-center items-center ${
                      matchStatus === MATCH_STATUS.not_found
                        ? "visible"
                        : "hidden"
                    }`}
                  >
                    <span
                      className="text-red-600  p-2"
                      style={{ fontSize: "1.4rem" }}
                    >
                      Member not found
                    </span>
                  </div>

                  {/* match confirm start */}
                  <div
                    className={`flex pt-4 flex-col justify-center items-center ${
                      matchStatus === MATCH_STATUS.idle ||
                      matchStatus === MATCH_STATUS.not_found ||
                      matchStatus === MATCH_STATUS.searching
                        ? "hidden"
                        : "visible"
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

                    <div className="w-4/6 mt-4">
                      <img src={selectedMembership?.digitalCard?.image.front} />
                    </div>
                    <div className="w-4/6 flex flex-col  border justify-center align-center  bg-white shadow-md rounded-md mt-4 ">
                      <div className="flex px-2 w-full h-full justify-center">
                        {/* @ts-ignore */}
                        <Barcode value={`${matchData?.cardNumber || "..."}`} />
                      </div>
                    </div>

                    <div className="mt-4 mb-4 flex flex-col items-center">
                      <h2>Is this the same person?</h2>
                      <div className="flex flex-row w-full p-2 justify-around ">
                        <button
                          className="px-2 py-1 mr-2 border rounded-md w-full bg-blue-400 text-white font-medium"
                          onClick={handleConfirmMatch(true)}
                        >
                          Yes
                        </button>

                        <button
                          className="px-2 py-1 border rounded-md w-full bg-slate-400 text-white font-medium"
                          onClick={handleConfirmMatch(false)}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* match confirm ends */}

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
                        <img src={selectedMembership?.card?.image?.original} />
                      </div>

                      <div className="w-5/6 flex px-12 justify-center">
                        {/* @ts-ignore */}
                        <Form
                          key="cardIssueForm"
                          schema={schema}
                          uiSchema={uiSchema}
                          onChange={handleFormChange}
                          onSubmit={handleSubmit}
                          formData={data}
                        >
                          <button
                            type="submit"
                            data-test="issue-next-btn"
                            className="p-2 border rounded-md w-full bg-blue-400 text-white font-medium mt-4"
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
                    <img src={selectedMembership?.card?.image?.original} />
                  </div>

                  <div className="mt-6">
                    <span
                      data-test="title-display-as"
                      className={`font-normal text-xs text-slate-500 ${
                        prevViewRef.current === VIEW.search
                          ? "hidden"
                          : "visible"
                      }`}
                    >
                      display as
                    </span>

                    <div className="flex flex-row items-center -mt-4">
                      <div className="-mt-1 text-2xl ">{displayName}</div>
                      <button
                        className={`h-16 w-16 ${
                          prevViewRef.current === VIEW.search
                            ? "hidden"
                            : "visible"
                        }`}
                        onClick={() => setToggleDisplayName(!toggleDisplayName)}
                      >
                        <Loop className="opacity-80 text-blue-500" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="flex w-full justify-center items-center p-4">
                      <TextField label="mobile" value={data?.mobile} disabled />
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
                      data-test="issue-confirm-btn"
                      className="p-2 px-4 border rounded-md  bg-blue-400 text-white"
                      onClick={handleConfirmSubmit}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ),
              [VIEW.fullfilled]: (
                <CardIssued
                  isNotQualified={matchStatus === MATCH_STATUS.not_qualified}
                  membership={membership}
                  onDone={handleDone}
                />
              ),
            }[viewState]
          }
        </div>
      </div>
    </Fragment>
  );
}

export default Index;
