import { CircularProgress, TextField } from "@material-ui/core";
import { getSettings } from "helpers/activation";
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
    <div
      className="flex flex-col p-12 items-center justify-center h-full w-full"
      style={{
        // @ts-ignore
        backgroundColor: `${getSettings().business.style.light.background}`,
      }}
    >
      <div className="flex flex-col items-center">
        {
          // @ts-ignore
          getSettings() && getSettings().business?.logo ? (
            <div className="flex flex-row justify-between items-center mb-8">
              <img
                loading="lazy"
                aria-label="membership card image"
                className="w-full"
                src={`${
                  // @ts-ignore
                  getSettings() && getSettings().business?.logo.original
                }`}
              />
            </div>
          ) : null
        }

        <div
          className="mb-8 text-3xl font-semibold"
          style={{
            color: `${
              // @ts-ignore
              getSettings() && getSettings().business.style.light.primary
            }`,
          }}
        >
          {locationName}
        </div>
        <form className="flex flex-col" onSubmit={handleLogin}>
          <TextField
            required
            label="username"
            inputRef={usernameRef}
            disabled={isAuthenticating}
            InputLabelProps={{
              style: {
                color: "#c0c0c0",
                zIndex: 10,
                paddingLeft: "4px",
              },
            }}
            inputProps={{
              ["data-test"]: "login-username",
              style: {
                color: "#000",
                backgroundColor: "#fff",
                paddingLeft: "4px",
              },
            }}
          />
          <span className="flex mt-4">
            <TextField
              label="password"
              type="password"
              inputRef={passwordRef}
              required
              disabled={isAuthenticating}
              InputLabelProps={{
                style: {
                  color: "#c0c0c0",
                  zIndex: 10,
                  paddingLeft: "4px",
                },
              }}
              inputProps={{
                ["data-test"]: "login-password",
                style: {
                  backgroundColor: "#fff",
                  color: "#000",

                  paddingLeft: "4px",
                },
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
              className="p-2 mt-4 h-12 rounded-md w-ful text-white font-bold"
              style={{
                backgroundColor: `${
                  // @ts-ignore
                  getSettings() && getSettings().business.style.light.accent
                }`,
              }}
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
    </div>
  );
};
