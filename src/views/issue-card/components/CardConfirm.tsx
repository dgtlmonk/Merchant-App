import { TextField } from "@material-ui/core";
import { Loop } from "@material-ui/icons";
import { Fragment, useEffect, useState } from "react";
import MembershipCard from "../../../components/MembershipCard";

type Props = {
  cardImg: string;
  mobile: string;
  displayName: string;
  onToggleDisplayName: () => void;
  onDone: () => void;
  onJoin: () => void;
  onMatch: (data: any) => void;
  onConfirm: () => void;
  isToggleDisplayNameDisabled: boolean;
  matchedPersons?: any[];
  getMembershipDetails(programId: string, tierLevel: number);
};

const Index = ({
  cardImg,
  mobile, // coming from form
  displayName,
  onToggleDisplayName,
  onDone,
  onConfirm,
  onMatch,
  isToggleDisplayNameDisabled,
  matchedPersons,
  getMembershipDetails,
  onJoin,
}: Props) => {
  const [previewDetails, setPreviewDetails] = useState<any>(null);
  const [isListView, setIsListView] = useState(false);
  const [currentPerson, setCurrentPerson] = useState<any>(null);

  console.log(" matched persons ", matchedPersons);

  useEffect(() => {
    if (matchedPersons && matchedPersons?.length) {
      const [membership] = matchedPersons[0].activeMemberships;
      const matchDetails = getMembershipDetails(
        membership.programId,
        membership.tierLevel
      );

      setPreviewDetails(matchDetails);
    }

    if (matchedPersons && matchedPersons.length > 1) {
      setIsListView(true);
    } else {
      // @ts-ignore
      setCurrentPerson(matchedPersons[0]);
    }
  }, [matchedPersons]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col  justify-center  items-center">
        {matchedPersons && matchedPersons?.length ? (
          <div
            data-test="notice-confirm"
            className="flex w-full p-4 flex-col justify-around items-center"
            style={{ backgroundColor: "#ffea8a" }}
          >
            {matchedPersons.length === 1 ? (
              <Fragment>
                <div className="flex w-full  flex-row justify-around items-center mb-4">
                  <div className="flex w-full flex-col ">
                    <div className="flex flex-row">
                      <h1 className="text-2xl  text-gray-500">
                        Existing member found:
                      </h1>
                      <h1 className="ml-2 text-2xl text-blue-600">
                        {matchedPersons[0]?.fullName}
                      </h1>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-light text-lg text-gray-400">
                        with the same mobile number
                      </span>
                    </div>
                  </div>
                  <div className="p-2">
                    <img
                      loading="lazy"
                      src={previewDetails?.card?.image?.thumbnail}
                      width="150"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <h2>Is this the same person?</h2>
                  <div className="flex flex-row w-full p-2 justify-around ">
                    <button
                      data-test="confirm-person-btn"
                      className="px-4 py-2 mr-2 border rounded-md w-full bg-blue-400 text-white font-medium"
                      onClick={() => {
                        if (matchedPersons.length == 1) {
                          onMatch(currentPerson);
                        }
                      }}
                    >
                      Yes
                    </button>

                    <button
                      data-test="confirm-false-btn"
                      className="px-4 py-2 border rounded-md w-full bg-slate-400 text-white font-medium"
                      onClick={onJoin}
                    >
                      No
                    </button>
                  </div>
                </div>
              </Fragment>
            ) : (
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
                    className="px-4 py-2 border rounded-md w-full bg-blue-400 text-white font-medium"
                    onClick={onConfirm}
                  >
                    No Match
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {isListView ? (
          <div className="flex flex-col w-full justify-center">
            {matchedPersons &&
              matchedPersons?.map((match, i) => (
                <MembershipCard
                  cardImageSrc={`${
                    getMembershipDetails(
                      match?.activeMemberships[
                        match?.activeMemberships?.length - 1
                      ].programId,
                      match?.activeMemberships[
                        match?.activeMemberships?.length - 1
                      ]?.tierLevel
                    )?.card?.image?.thumbnail
                  }`}
                  onSelectDataIndex={() => {
                    setCurrentPerson(matchedPersons[i]);
                    onMatch(matchedPersons[i]);
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
        ) : (
          <Fragment>
            <div className="mt-8">
              <img loading="lazy" src={cardImg} className="w-96" />
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
                <TextField
                  label="mobile"
                  value={mobile || matchedPersons}
                  disabled
                />
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
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default Index;
