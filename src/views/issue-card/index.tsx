import { CircularProgress, TextField } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { withTheme } from "@rjsf/core";
import { Theme } from "@rjsf/material-ui";
import { Fragment, useEffect, useRef, useState } from "react";
// import Barcode from "react-barcode";
import { MdPersonSearch } from "react-icons/md";
import { FormProps } from "react-jsonschema-form";
import { useMediaQuery } from "react-responsive";
import MembershipCard from "../../components/MembershipCard";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/material.css";
import { client, qualifySvcUrl } from "../../helpers/api-client";
import { getMembershipDetails } from "../../helpers/membership";
import { QUALIFY_TYPES, schema, uiSchema } from "../../types";
import CardConfirm from "./components/CardConfirm";
import CardIssued from "./components/CardIssued";

enum MATCH_STATUS {
  found = "found",
  not_found = "not found",
  searching = "searching",
  idle = "idle",
  not_qualified = "not_qualified",
  qualified = "qualified",
  confirm = "confirm",
}
confirm;
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
  const [memberTiers, setMemberTiers] = useState([]);
  const [membership, setMembership] = useState<any>({});
  const [selectedMembership, setSelectedMembership] = useState<any>(null);
  const [matchStatus, setMatchStatus] = useState<MATCH_STATUS>(
    MATCH_STATUS.idle
  );
  const [displayName, setDisplayName] = useState<string>("");
  const [toggleDisplayName, setToggleDisplayName] = useState<boolean>(false);
  const [data, setData] = useState<any>({});
  const [matchedPerson, setMatchedPerson] = useState<any[]>([]);
  const [isMultipleMatchedPerson, setIsMultipleMatchedPerson] =
    useState<boolean>(false);

  const formDataRef = useRef<any>();
  const searchQueryRef = useRef<any>();
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

    if (viewState === VIEW.card_select) {
      onDone();
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
    if (programs.length) {
      const [p] = programs;
      programRef.current = p;

      let tierList = [];
      const tiers: [] = p?.tiers;

      if (!tiers.length) {
        console.warn("No Cards available!");
      } else {
        // @ts-ignore
        tierList = tiers.filter((tier) => tier?.card?.canIssue === true);
        setMemberTiers(tierList);
      }
    }
  }, [programs]);

  useEffect(() => {
    if (data) {
      setDisplayName(`${data?.givenName} ${data?.familyName}`);
    }
  }, [data]);

  useEffect(() => {
    if (matchedPerson.length > 1) {
      setIsMultipleMatchedPerson(true);
    } else {
      setIsMultipleMatchedPerson(false);
      // for single match
      if (matchedPerson) {
        setData({
          ...data,
        });
        formDataRef.current = {
          ...data,
          mobile: matchedPerson[0]?.phones[0]?.fullNumber,
        };
      }
    }
  }, [matchedPerson]);

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
      location,
      // TODO: get from login
      staff: {},
      installation: {
        id: `${installationId}`,
      },
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
        if (res?.qualify) {
          if (res?.qualify === QUALIFY_TYPES.NO) {
            const { person } = res;

            setMembership({
              mobile: formData.mobile,
              phones: null,
              activeMemberships: person.activeMemberships,
              fullName: `${formData.givenName} ${formData.familyName} `,
            });

            setMatchStatus(MATCH_STATUS.not_qualified);
            setViewState(VIEW.fullfilled);
            return;
          }

          if (res?.qualify === QUALIFY_TYPES.YES) {
            setData({ ...formData });
            setViewState(VIEW.confirm);
            return;
          }

          if (res?.qualify === QUALIFY_TYPES.CONFIRM) {
            setData({ ...formData });
            setMatchStatus(MATCH_STATUS.confirm);
            setMatchedPerson(res?.persons);
            setViewState(VIEW.confirm);
            return;
          }
        }
      })
      .catch(() => {
        console.warn(" Qualify check failed to call api");
      });
  };

  const handleConfirmSubmit = () => {
    const params = Object.assign(Object.create(null, {}), {
      programId: programRef?.current?.programId,
      tierLevel: selectedMembership.level,
      installation: {
        id: `${installationId}`,
      },
      location,
      profile: { ...data },
      // TODO:  get this value after staff login
      staff: {
        id: "dev123",
      },
    });

    asyncJoin(params);
  };

  function asyncJoin(params: any) {
    client
      .post(`${host}/membership/join`, {
        headers: {
          "content-type": "application/json",
          "x-api-key": `${import.meta.env.VITE_API_KEY}`,
          "x-access-token": `${import.meta.env.VITE_API_TOKEN}`,
        },
        body: JSON.stringify(params),
      })
      .then((res) => {
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

  function getMembershipDetailsProxy(programId: string, tierLevel: number) {
    return getMembershipDetails(programId, tierLevel, programs);
  }

  function renderCardList() {
    if (!memberTiers || !memberTiers.length) {
      return (
        <div className={`rounded-md flex w-full`}>No Member Card Available</div>
      );
    }

    return memberTiers.map((membership: any, i: number) => {
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
          <img loading="lazy" src={membership.card.image.original} />
        </div>
      );
    });
  }

  function handleResetSearch() {
    formDataRef.current = null;
    setMembership(null);
    setIsMultipleMatchedPerson(false);
    setData(null);
    setMatchedPerson([]);
    setViewState(VIEW.card_select);
    setMatchStatus(MATCH_STATUS.idle);
  }

  function handleSearchExistingMember() {
    if (!searchQueryRef.current.value) {
      searchQueryRef.current.focus();
      return;
    }

    // save mobile for 'no match'
    setData({
      ...data,
      mobile: searchQueryRef?.current?.value,
    });
    setMatchStatus(MATCH_STATUS.searching);
    client
      .get(`${host}/person/search?q=${searchQueryRef.current.value}`, {
        headers: {
          "content-type": "application/json",
          "x-api-key": `${import.meta.env.VITE_API_KEY}`,
          "x-access-token": `${import.meta.env.VITE_API_TOKEN}`,
        },
      })
      .then((res: any[]) => {
        if (res.length) {
          // WATCHOUT: this block has both single and multiple result logic
          const [program] = res;
          const personMembership = getMembershipDetails(
            program.programId,
            program.tierLevel,
            programs
          );

          personMembership && setSelectedMembership(personMembership);

          setMatchStatus(MATCH_STATUS.found);
          setMatchedPerson(res);
        } else {
          setMatchStatus(MATCH_STATUS.not_found);
        }
      });
  }

  const handleConfirmMatch = (confirm: boolean) => (e) => {
    prevViewRef.current = VIEW.search;

    const [person] = matchedPerson;
    setMatchStatus(MATCH_STATUS.idle);

    // revoke
    if (!confirm) {
      console.log("not the same member");
      setMatchStatus(MATCH_STATUS.idle);
      setViewState(VIEW.confirm);

      // client
      //   .post(`${host}/cards/revoke`, {
      //     headers: {
      //       "x-api-key": `${import.meta.env.VITE_API_KEY}`,
      //     },
      //     body: JSON.stringify(params),
      //   })
      //   .then(() => {
      //     setMatchStatus(MATCH_STATUS.idle);
      //     setViewState(VIEW.confirm);
      //   });
    } else {
      setMembership(person);
      setMatchStatus(MATCH_STATUS.not_qualified);
      setViewState(VIEW.fullfilled);
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
              className={`absolute top-0 left-0 h-16 w-16  ${
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
                      data-test="person-search"
                      className="h-16 justify-around flex border items-center
                    p-2 rounded-md px-8 text-gray-700"
                      onClick={() => {
                        handleResetSearch();
                        setViewState(VIEW.search);
                        setTimeout(() => {
                          searchQueryRef?.current?.focus();
                        }, 500);
                      }}
                    >
                      <span className="mr-4">Existing Member</span>
                      <MdPersonSearch className="opacity-70 text-gray-800 w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex flex-col  justify-center px-8">
                    {renderCardList()}
                  </div>
                </div>
              ),
              [VIEW.search]: (
                <div className={`flex flex-col  h-full w-full`}>
                  <div className="flex flex-col  justify-center  items-center">
                    {matchStatus === MATCH_STATUS.not_found ? (
                      <Fragment>
                        <div
                          className={`flex w-full p-4 flex-col justify-around items-center`}
                          style={{ backgroundColor: "#ffea8a" }}
                        >
                          <div className="flex flex-row w-full justify-between items-center">
                            <div className="flex flex-col">
                              <div className="flex font-semibold text-xl">
                                No Matching Member
                              </div>
                              <span className="text-gray-600">
                                Search again or Issue a new card
                              </span>
                            </div>
                            <div>
                              <button
                                data-test="no-match-btn"
                                className="h-12 px-4 py-2 border rounded-md w-full bg-blue-400 text-white font-medium"
                                onClick={() => {
                                  setSelectedMembership(memberTiers[0]);
                                  setViewState(VIEW.fillup);
                                }}
                              >
                                Issue New Card
                              </button>
                            </div>
                          </div>
                        </div>
                      </Fragment>
                    ) : null}

                    {/* existing member match confirm */}
                    {!isMultipleMatchedPerson &&
                    matchedPerson[0] &&
                    matchedPerson[0]?.activeMemberships ? (
                      <div
                        className={`flex w-full p-4 mb-4 flex-col justify-around items-center ${
                          matchStatus === MATCH_STATUS.idle ||
                          matchStatus === MATCH_STATUS.not_found ||
                          matchStatus === MATCH_STATUS.searching
                            ? "hidden"
                            : "visible"
                        }`}
                        style={{ backgroundColor: "#ffea8a" }}
                      >
                        <div className="flex w-full  flex-row justify-around items-center mb-4">
                          <div className="flex w-full flex-col ">
                            <div className="flex flex-row text-2xl">
                              <h1 className=" text-gray-500">
                                Existing member found:
                              </h1>
                              <h1 className="ml-2  text-blue-600 font-bold">
                                {matchedPerson[0]?.fullName}
                              </h1>
                            </div>
                          </div>
                          <div className="p-2">
                            <img
                              loading="lazy"
                              src={`${
                                getMembershipDetailsProxy(
                                  matchedPerson[0]?.activeMemberships[
                                    matchedPerson[0]?.activeMemberships
                                      ?.length - 1
                                  ]?.programId,
                                  matchedPerson[0]?.activeMemberships[
                                    matchedPerson[0]?.activeMemberships
                                      ?.length - 1
                                  ]?.tierLevel
                                )?.card?.image?.thumbnail
                              }`}
                              width="150"
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col items-center">
                          <h2 style={{ fontSize: "1.5rem" }}>
                            Is this the same person?
                          </h2>
                          <div className="flex flex-row w-full p-2 justify-around ">
                            <button
                              data-test="person-query-same-person-btn"
                              className="px-2 py-1 h-12 mr-2 border rounded-md w-full bg-blue-400 text-white font-medium"
                              onClick={handleConfirmMatch(true)}
                            >
                              Yes
                            </button>

                            <button
                              className="h-12  px-2 py-1 border rounded-md w-full bg-slate-400 text-white font-medium"
                              onClick={handleConfirmMatch(false)}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      isMultipleMatchedPerson && (
                        <Fragment>
                          <div
                            className={`flex w-full p-4 flex-col justify-around items-center`}
                            style={{ backgroundColor: "#ffea8a" }}
                          >
                            <div className="flex flex-row w-full justify-between items-center">
                              <div className="flex flex-col">
                                <div className="flex font-semibold text-xl">
                                  Select a matching member
                                </div>
                                <span className="text-gray-600">
                                  or 'No Match' if none matches
                                </span>
                              </div>
                              <div>
                                <button
                                  data-test="no-match-btn"
                                  className="h-12 px-4 py-2 border rounded-md w-full bg-blue-400 text-white font-medium"
                                  onClick={() => {
                                    setSelectedMembership(memberTiers[0]);

                                    setViewState(VIEW.fillup);
                                  }}
                                >
                                  No Match
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col w-full justify-center">
                            {matchedPerson?.map((match, i) => (
                              <MembershipCard
                                cardImageSrc={`${
                                  getMembershipDetailsProxy(
                                    match?.activeMemberships[
                                      match?.activeMemberships?.length - 1
                                    ].programId,
                                    match?.activeMemberships[
                                      match?.activeMemberships?.length - 1
                                    ]?.tierLevel
                                  )?.card?.image?.thumbnail
                                }`}
                                onSelectDataIndex={() => {
                                  setMembership(matchedPerson[i]);
                                  setMatchStatus(MATCH_STATUS.not_qualified);
                                  setViewState(VIEW.fullfilled);
                                }}
                                key={match.id}
                                person={{
                                  fullName: match.fullName,
                                  phones: match.phones,
                                  activeMemberships: match.activeMemberships,
                                  emails: match.emails,
                                }}
                              />
                            ))}
                          </div>
                        </Fragment>
                      )
                    )}
                    {/* match confirm ends */}

                    {/* Search form */}
                    {isMultipleMatchedPerson ? null : (
                      <div className="flex flex-col justify-center items-center">
                        <div className="flex flex-col justify-center  items-center px-4 mt-4 w-full">
                          <TextField
                            label="card or mobile number"
                            InputLabelProps={{ style: { fontSize: 20 } }} // font size of input text
                            inputProps={{
                              style: { fontSize: "2rem" },
                              ["data-test"]: "seach-mobile-input",
                            }}
                            inputRef={searchQueryRef}
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
                            data-test="person-query-btn"
                            className={`h-12 p-2 border w-full rounded-md bg-blue-400 text-white font-medium
                      ${
                        matchStatus !== MATCH_STATUS.searching
                          ? "visible"
                          : "hidden"
                      }
                      
                      `}
                            onClick={handleSearchExistingMember}
                          >
                            Search
                          </button>
                        </div>
                      </div>
                    )}
                    {/* end Search form*/}
                  </div>
                </div>
              ),
              [VIEW.fillup]: (
                <Fragment>
                  <div className="flex flex-col mt-8">
                    <div className="flex flex-col max-w-sm  justify-center  items-center">
                      <div className="w-96">
                        <img
                          loading="lazy"
                          src={selectedMembership?.card?.image?.original}
                        />
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
                            className="h-12 p-2 border rounded-md w-full bg-blue-400 text-white font-medium mt-4"
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
                <CardConfirm
                  getMembershipDetails={getMembershipDetailsProxy}
                  matchedPersons={matchedPerson}
                  displayName={displayName}
                  onDone={handleResetSearch}
                  onToggleDisplayName={() =>
                    setToggleDisplayName(!toggleDisplayName)
                  }
                  cardImg={selectedMembership?.card?.image?.original}
                  mobile={data?.mobile}
                  onConfirm={handleConfirmSubmit}
                  onMatch={(data) => {
                    setMatchStatus(MATCH_STATUS.not_qualified);
                    setMembership(data);
                    setViewState(VIEW.fullfilled);
                  }}
                  onJoin={handleConfirmSubmit}
                  isToggleDisplayNameDisabled={
                    prevViewRef.current === VIEW.search
                  }
                />
              ),
              [VIEW.fullfilled]: (
                <CardIssued
                  isNotQualified={matchStatus === MATCH_STATUS.not_qualified}
                  membership={membership}
                  onDone={handleResetSearch}
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
