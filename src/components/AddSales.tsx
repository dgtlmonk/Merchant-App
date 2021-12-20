// import { client } from "@/helpers/api-client";

import { CircularProgress, InputAdornment, TextField } from "@material-ui/core";
import { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { client } from "../helpers/api-client";

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
};

function Index({ onDone }: Props) {
  const host = import.meta.env.VITE_API_HOST;
  const cardNumberRef = useRef<any>();
  const qttyRef = useRef<any>();
  const receiptRef = useRef<any>();
  const amountRef = useRef<any>();

  const [isSearching, setIsSearching] = useState(false);
  const [isSearchingSuccess, setIsSearchingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [person, setPerson] = useState(null);

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
    setIsSearchingSuccess(false);
    client
      .post(`${host}/memberships/search`, {
        headers: {
          "x-api-key": `${import.meta.env.VITE_API_KEY}`,
        },
        body: JSON.stringify({
          // @ts-ignore
          searchValue: cardNumberRef?.current.value,
        }),
      })
      .then((res: any) => {
        const [detail] = res;

        console.log(" res ", detail);
        const { fullName } = detail.person;
        setPerson(fullName);
        setIsSearchingSuccess(true);

        // @ts-ignore
        receiptRef?.current?.focus();
      })
      .finally(() => setIsSearching(false));
  };

  const handleConfirm = () => {
    console.log(" handle confirm ");

    if (isSubmitSuccess) {
      setIsSubmitSuccess(false);
      setIsSubmitting(false);
      setIsSearchingSuccess(false);

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

    setIsSubmitting(true);
    client
      .post(`${host}/orders/create`, {
        headers: {
          "x-api-key": `${import.meta.env.VITE_API_KEY}`,
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
        console.log(" add sales response ", res);
        setIsSubmitSuccess(true);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="flex flex-col max-w-md items-center justify-center w-full h-full p-4">
      <div
        className={`flex w-full px-4 py-2 border justify-center  rounded-md bg-orange-400 text-white text-sm mb-4 
        ${isSubmitSuccess ? "visible" : "hidden"}`}
      >
        Sales added successfully
      </div>

      <div className="flex flex-col w-full ">
        {isSearchingSuccess ? (
          <div className="flex flex-row justify-between">
            {person}
            <button onClick={() => setIsSearchingSuccess(false)}>X</button>
          </div>
        ) : (
          <TextField
            label="Member Card Number"
            className="w-full"
            variant="filled"
            disabled={isSearching}
            inputRef={cardNumberRef}
            defaultValue=""
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <span className="p-4 px-2" onClick={handleSearchMemberCard}>
                    {isSearching ? (
                      <CircularProgress size="1rem" />
                    ) : (
                      <FaSearch className="opacity-40" />
                    )}
                  </span>
                </InputAdornment>
              ),
            }}
          />
        )}
        <div className="flex flex-row mt-8">
          <span className="flex mr-2">
            <TextField label="Receipt #" inputRef={receiptRef} />
          </span>

          <span className="flex mr-2">
            <TextField
              inputRef={qttyRef}
              label="Qtty"
              type="number"
              defaultValue="0"
            />
          </span>
          <TextField
            inputRef={amountRef}
            label="Total Amount"
            defaultValue="0.00"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
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
              className="p-2 px-8 border rounded-md  bg-slate-400 text-white mr-4"
            >
              Cancel
            </button>
            <button
              className={`p-2 px-8 border rounded-md  bg-blue-400 text-white`}
              onClick={handleConfirm}
            >
              {isSubmitSuccess ? "New" : "Confirm"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Index;
