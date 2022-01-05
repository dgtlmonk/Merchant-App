import { CircularProgress, InputAdornment, TextField } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { client } from "../../helpers/api-client";

// TODO: finalize dynamic params
const defaultParams = {
  // "cardNumber": "S0650012049",
  // "receipt": "ION20211209001",
  // "quantity": 1,
  // "amount": 140.9,
  programId: "5d12e1a1e4a5c53fdd6fe352",
  tierLevel: 2,
  personId: "61b0d31490dcdc001d5a51ff",
  memberId: "61b0d3149c1223001defddc9",
  membershipId: "61b0e0c29c1223001defddd8",
  purchasedAt: "2021-12-09T03:31:39.753Z",
  placeId: "5d1b019745828f10b6c5eed1",
};

type Props = {
  onDone?: () => void;
  programs?: any;
};

function Index({ onDone, programs }: Props) {
  const host = import.meta.env.VITE_API_HOST;
  const cardNumberRef = useRef<any>();
  const qttyRef = useRef<any>();
  const receiptRef = useRef<any>();
  const amountRef = useRef<any>();

  const [isSearching, setIsSearching] = useState(false);
  const [isPersonFound, setIsPersonFound] = useState(false);
  const [isSearchingSuccess, setIsSearchingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
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
    if (isSubmitSuccess) {
      // New
      setIsSubmitSuccess(false);
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
        quantity: qttyRef.current.value,
        currency: "SGD",
        amount: amountRef.current.value,
      },
    };

    console.log(" params ", params);

    return;
    setIsSubmitting(true);
    // TODO: refactor
    client
      .post(`${host}/orders`, {
        headers: {
          "content-type": "application/json",
          "x-api-key": `${import.meta.env.VITE_API_KEY}`,
          "x-access-token": `${import.meta.env.VITE_API_TOKEN}`,
        },
        body: JSON.stringify({
          ...defaultParams,
          cardNumber: cardNumberRef.current?.value,
          receipt: receiptRef.current?.value,
          quantity: qttyRef.current?.value,
          amount: amountRef.current?.value,
        }),
      })
      .then((res) => {
        setIsSubmitSuccess(true);
      })
      .finally(() => setIsSubmitting(false));
  };

  function handleReset() {
    setIsPersonFound(false);
    setIsSubmitSuccess(false);
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
    console.log(" program id tier ", programId, tierLevel);

    console.log("program ", programs);
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
        ${isSubmitSuccess ? "visible" : "hidden"}`}
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
                inputProps={{ ["data-test"]: "sales-receipt" }}
                InputLabelProps={{ style: { fontSize: 15 } }} // font size of input text
              />
            </span>
            <span className="flex mr-2 w-1/5">
              <TextField
                inputRef={qttyRef}
                inputProps={{ ["data-test"]: "sales-qtty" }}
                InputLabelProps={{ style: { fontSize: 15 } }} // font size of input text
                label="Quantity"
                type="number"
              />
            </span>
            <TextField
              inputRef={amountRef}
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
          ) : isSearchingSuccess ? (
            <div className="flex flex-row w-full items-center justify-center mt-8">
              <button
                disabled={isSubmitting}
                className={`p-2 px-8 border rounded-md  bg-slate-400 text-white mr-4`}
                onClick={handleReset}
              >
                Cancel
              </button>
              <button
                className={`p-2 px-8 border rounded-md  bg-blue-400 text-white`}
                onClick={handleConfirm}
              >
                {isSubmitSuccess ? "Add New" : "Confirm"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Index;
