import { CircularProgress, InputAdornment, TextField } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { client } from "../../helpers/api-client";

type Props = {
  onDone: () => void;
  location: any;
  currency: string;
  installationId: string;
  programs?: any;
};

function Index({
  onDone,
  currency,
  programs,
  installationId,
  location,
}: Props) {
  const host = import.meta.env.VITE_API_HOST;
  const cardNumberRef = useRef<any>();
  const qttyRef = useRef<any>();
  const receiptRef = useRef<any>();
  const amountRef = useRef<any>();

  const [isSearching, setIsSearching] = useState(false);
  const [isPersonFound, setIsPersonFound] = useState(false);
  const [isSearchingSuccess, setIsSearchingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSalesSubmitSuccess, setIsSalesSubmitSuccess] = useState(false);
  const [person, setPerson] = useState<any>(null);

  useEffect(() => {
    // @ts-ignore
    cardNumberRef?.current?.focus();
  }, []);

  const handleSearchMemberCard = () => {
    // @ts-ignore
    if (!cardNumberRef?.current?.value) {
      // @ts-ignore
      cardNumberRef?.current?.focus();
      return;
    }

    setIsSearching(true);
    client
      .get(`${host}/person/search?cardNumber=${cardNumberRef?.current.value}`, {
        headers: {
          "x-api-key": `${import.meta.env.VITE_API_KEY}`,
          "content-type": "application/json",
          "x-access-token": `${import.meta.env.VITE_API_TOKEN}`,
        },
      })
      .then((res: any) => {
        console.log("res ", res);

        if (res?.id) {
          setPerson(res);
          setIsPersonFound(true);
          setIsSearchingSuccess(true);
          // @ts-ignore
          receiptRef?.current?.focus();
        } else {
          setIsPersonFound(false);
          setIsSearchingSuccess(true);
        }
      })
      .catch(() => {
        setIsPersonFound(false);
        setIsSearchingSuccess(true);
      })
      .finally(() => setIsSearching(false));
  };

  const handleConfirm = () => {
    if (isSalesSubmitSuccess) {
      // New
      setIsSalesSubmitSuccess(false);
      setIsSubmitting(false);
      setIsSearchingSuccess(false);

      resetRefs();
      return;
    }

    // @ts-ignore
    if (!cardNumberRef?.current?.value && !setIsSearchingSuccess) {
      // @ts-ignore
      cardNumberRef?.current?.focus();
      return;
    }

    // @ts-ignore
    if (!receiptRef?.current?.value) {
      // @ts-ignore
      receiptRef?.current?.focus();
      return;
    }

    // @ts-ignore
    if (!qttyRef?.current?.value || qttyRef?.current?.value == 0) {
      // @ts-ignore
      qttyRef?.current?.focus();
      return;
    }

    // @ts-ignore
    if (!amountRef?.current?.value) {
      // @ts-ignore
      amountRef?.current?.focus();
      return;
    }

    const params = {
      orderSummary: {
        receipt: receiptRef.current.value,
        quantity: Number(qttyRef.current.value),
        // TODO: get actual currency from activation
        currency: currency || "SGD",
        amount: Number(amountRef.current.value),
      },
      membershipId: person?.membership?.membershipId,
      location,
      installation: {
        id: installationId,
      },
      // TODO: get from login
      staff: {},
    };

    console.log(" order params ", params);

    setIsSubmitting(true);
    client
      .post(`${host}/orders`, {
        headers: {
          "content-type": "application/json",
          "x-api-key": `${import.meta.env.VITE_API_KEY}`,
          "x-access-token": `${import.meta.env.VITE_API_TOKEN}`,
        },
        body: JSON.stringify({ ...params }),
      })
      .then((res) => {
        setIsSalesSubmitSuccess(true);
        setTimeout(() => {
          onDone();
        }, 700);
      })
      .finally(() => setIsSubmitting(false));
  };

  function handleReset() {
    setIsPersonFound(false);
    setIsSalesSubmitSuccess(false);
    setIsSubmitting(false);
    setIsSearchingSuccess(false);
    resetRefs();
  }

  function resetRefs() {
    setTimeout(() => {
      try {
        // @ts-ignore
        cardNumberRef?.current?.focus();

        // @ts-ignore
        cardNumberRef?.current?.focus();

        // @ts-ignore
        qttyRef.current.value = 0;
        // @ts-ignore
        cardNumberRef?.current?.focus();

        // @ts-ignore
        cardNumberRef?.current?.focus();

        // @ts-ignore
        cardNumberRef?.current?.focus();

        // @ts-ignore
        receiptRef.current.value = 0;
        // @ts-ignore
        cardNumberRef?.current?.focus();

        // @ts-ignore
        amountRef.current.value = 0;
      } catch {}
    }, 500);
  }

  function getMembershipDetails(programId: string, tierLevel: number) {
    if (!programs || !programs.length) return null;

    const currentProgram = programs.filter(
      (program) => program.programId === programId
    )[0];

    // @ts-ignore
    if (currentProgram && currentProgram?.tiers) {
      // @ts-ignore
      const { tiers } = currentProgram;

      if (tiers && tiers.length) {
        const currentMembership = tiers.filter(
          (tier) => tier.level == tierLevel
        )[0];

        return currentMembership;
      }

      return null;
    }

    return null;
  }

  return (
    <div className="flex flex-col w-full h-full items-center">
      <div
        className="module__header sticky top-0 w-full z-20 "
        style={{ backgroundColor: "#f8f8ff" }}
      >
        <div className="flex flex-row justify-center items-center relative w-full h-16">
          <button className={`absolute top-0 left-0 h-16 w-16 hidden`}>
            <ArrowBack className="opacity-50" />
          </button>
          <div className="p-4">Sales</div>
        </div>
      </div>

      {!isPersonFound && isSearchingSuccess ? (
        <div className="flex flex-col w-full" data-test="no-match-notice">
          <div className="flex flex-col  justify-center  items-center">
            <div
              data-test="notice-confirm"
              className="flex w-full p-4 flex-row justify-between items-center"
              style={{ backgroundColor: "#ffea8a" }}
            >
              <div className="flex flex-col">
                <div className="flex font-semibold text-xl">
                  No matching member.
                </div>
                <span className="text-gray-600">
                  Seach again or issue a new card.
                </span>
              </div>
              <div>
                <button
                  data-test="ok-no-match-btn"
                  className="px-4 py-2 border rounded-md w-12 bg-blue-400 text-white font-medium"
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex max-w-md flex-col justify-center z-10 p-8">
        <div
          className={`flex w-full px-4 py-2 border justify-center  rounded-md bg-orange-400 text-white text-sm mb-4 
        ${isSalesSubmitSuccess ? "visible" : "hidden"}`}
        >
          Sales added successfully
        </div>

        <div className="flex flex-col w-full">
          {isPersonFound ? (
            <div className="flex flex-row justify-between items-center">
              <span className="text-2xl">{person?.fullName}</span>
              <div className="relative rounded-lg overflow-hidden w-32">
                <div className="rounded-sm">
                  <img
                    className="object-fill"
                    src={`${
                      getMembershipDetails(
                        person?.membership.programId,
                        person?.membership.tierLevel
                      )?.card?.image?.thumbnail
                    }`}
                  />
                </div>
              </div>
            </div>
          ) : (
            <TextField
              label="Member Card Number"
              className="w-full"
              variant="filled"
              disabled={isSearching}
              inputRef={cardNumberRef}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearchMemberCard();
                  e.preventDefault();
                }
              }}
              defaultValue=""
              inputProps={{
                ["data-test"]: "card-number",
                style: { fontSize: "2rem" },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <div
                      className="flex justify-center items-center  w-12 h-12  relative -mt-4"
                      data-test="search-icon-btn"
                      onClick={handleSearchMemberCard}
                    >
                      {isSearching ? (
                        <CircularProgress size="1rem" />
                      ) : (
                        <FaSearch className="opacity-40" />
                      )}
                    </div>
                  </InputAdornment>
                ),
              }}
            />
          )}
          <div className="flex flex-row mt-8">
            <span className="flex mr-2 w-3/5 leading-tight">
              <TextField
                label="Receipt Number"
                inputRef={receiptRef}
                disabled={isSalesSubmitSuccess}
                inputProps={{ ["data-test"]: "sales-receipt" }}
                InputLabelProps={{ style: { fontSize: 15 } }} // font size of input text
              />
            </span>
            <span className="flex mr-2 w-1/5">
              <TextField
                inputRef={qttyRef}
                disabled={isSalesSubmitSuccess}
                inputProps={{ ["data-test"]: "sales-qtty" }}
                InputLabelProps={{ style: { fontSize: 15 } }} // font size of input text
                label="Quantity"
                type="number"
              />
            </span>
            <TextField
              inputRef={amountRef}
              disabled={isSalesSubmitSuccess}
              inputProps={{ ["data-test"]: "sales-amount" }}
              InputLabelProps={{ style: { fontSize: 15 } }} // font size of input text
              label="Total Amount"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="end">
                    <span className="mr-2 text-gray-400">$</span>
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </div>
        <div className="flex flex-row w-full items-center justify-center ">
          {isSubmitting ? (
            <div className="flex flex-row w-full items-center justify-center mt-8">
              <CircularProgress size="1.5rem" />
            </div>
          ) : isSearchingSuccess && !isSalesSubmitSuccess ? (
            <div className="flex flex-row w-full items-center justify-center mt-8">
              <button
                data-test="sales-reset-btn"
                disabled={isSubmitting}
                className={`p-2 px-8 border rounded-md  bg-slate-400 text-white mr-4`}
                onClick={handleReset}
              >
                Cancel
              </button>
              <button
                data-test="sales-confirm-btn"
                className={`p-2 px-8 border rounded-md  bg-blue-400 text-white`}
                onClick={handleConfirm}
              >
                {isSalesSubmitSuccess ? "New Sales" : "Confirm"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Index;
