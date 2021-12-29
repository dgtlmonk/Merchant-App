// import { client } from "@/helpers/api-client";
import { CircularProgress, TextField } from "@material-ui/core";
import { useRef, useState } from "react";
import { client } from "../helpers/api-client";

const ep = "https://bbab-2404-3c00-482e-99c0-c06c-bf4d-6f69-fb47.ngrok.io";
const host = `${ep}/api/users/login`;
// "http://d4b2-2404-3c00-482e-99c0-5d39-e26c-8a0a-2dbd.ngrok.io/api/users/login";

// const host = "https://61bbe191e943920017784fd9.mockapi.io/login";

type Props = {
  onSuccess: () => void;
  settings?: any;
};

export default ({ onSuccess, settings }: Props) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoginFailed, setIsLoginFailed] = useState(false);
  const emailRef = useRef();
  const passwordRef = useRef();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // @ts-ignore
    const email = emailRef?.current?.value;

    // @ts-ignore
    const password = passwordRef?.current?.value;

    setIsAuthenticating(true);
    setIsLoginFailed(false);

    client
      .post(host, {
        body: JSON.stringify({
          email,
          password,
        }),
      })
      .then((res) => {
        if (res.error) {
          setIsLoginFailed(true);
          return;
        }
        onSuccess();
      })
      .finally(() => setIsAuthenticating(false));
  }

  return (
    <div className="flex flex-col p-12 items-center justify-center max-w-md h-full">
      <div>{settings?.location?.name}</div>
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <TextField
          label="email"
          inputRef={emailRef}
          required
          disabled={isAuthenticating}
        />
        <span className="flex mt-4">
          <TextField
            label="password"
            inputRef={passwordRef}
            required
            disabled={isAuthenticating}
          />
        </span>
        {isAuthenticating ? (
          <div className="flex justify-center pt-4">
            <CircularProgress size="1.5em" />
          </div>
        ) : (
          <button
            type="submit"
            className="p-2 mt-4 rounded-md w-full bg-blue-400 text-white font-medium"
          >
            Login
          </button>
        )}
        {isLoginFailed && (
          <div className="flex justify-center p-2 prose-sm text-red-600">
            Invalid login
          </div>
        )}
      </form>
    </div>
  );
};
