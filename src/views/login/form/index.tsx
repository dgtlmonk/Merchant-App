import { CircularProgress, TextField } from "@material-ui/core";
import { useRef } from "react";

type Props = {
  onLogin: (username: string, password: string) => void;
  locationName: string;
  isAuthenticating: boolean;
  isLoginFailed: boolean;
};

export default ({
  isAuthenticating,
  isLoginFailed,
  locationName,
  onLogin,
}: Props) => {
  const usernameRef = useRef();
  const passwordRef = useRef();

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // @ts-ignore
    const username = usernameRef?.current?.value;

    // @ts-ignore
    const password = passwordRef?.current?.value;
    onLogin(username, password);
  }

  return (
    <div className="flex flex-col p-12 items-center justify-center max-w-md h-full">
      <div className="mb-8 text-3xl font-semibold">{locationName}</div>
      <form className="flex flex-col" onSubmit={handleLogin}>
        <TextField
          required
          label="username"
          inputRef={usernameRef}
          disabled={isAuthenticating}
          inputProps={{
            ["data-test"]: "login-username",
          }}
        />
        <span className="flex mt-4">
          <TextField
            label="password"
            type="password"
            inputRef={passwordRef}
            required
            disabled={isAuthenticating}
            inputProps={{
              ["data-test"]: "login-password",
            }}
          />
        </span>
        {isAuthenticating ? (
          <div className="flex justify-center pt-4">
            <CircularProgress size="1.5em" />
          </div>
        ) : (
          <button
            data-test="login-btn"
            type="submit"
            className="p-2 mt-4 h-12 rounded-md w-full bg-blue-400 text-white font-medium"
          >
            Login
          </button>
        )}
        {isLoginFailed && (
          <div className="flex justify-center p-2 prose-sm text-red-600">
            Login failed
          </div>
        )}
      </form>
    </div>
  );
};
