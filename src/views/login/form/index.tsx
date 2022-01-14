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
      className="flex flex-col p-12 h-full w-full"
      style={{
        backgroundColor: `${
          // @ts-ignore
          getSettings() && getSettings().business.style.light.background
        }`,
      }}
    >
      <div className="flex flex-col items-center w-full">
        {
          // @ts-ignore
          getSettings() && getSettings().business?.logo ? (
            <div className="flex flex-row justify-between items-center mb-8 w-48">
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

        <div className="flex  flex-col w-full items-center">
          <div
            className="mb-12 text-4xl font-semibold"
            style={{
              color: `${
                // @ts-ignore
                getSettings() && getSettings().business.style.light.primary
              }`,
            }}
          >
            {locationName}
          </div>
          <form className="flex flex-col w-2/4" onSubmit={handleLogin}>
            <TextField
              required
              placeholder="username"
              inputRef={usernameRef}
              disabled={isAuthenticating}
              InputLabelProps={{
                style: {
                  color: "#c0c0c0",
                  zIndex: 10,
                  paddingLeft: "4px",
                  pointerEvents: "none",
                },
              }}
              inputProps={{
                ["data-test"]: "login-username",
                style: {
                  color: "#000",
                  backgroundColor: "#fff",
                  paddingLeft: "4px",
                  fontSize: "1.5rem",
                },
              }}
            />
            <TextField
              placeholder="password"
              type="password"
              inputRef={passwordRef}
              required
              disabled={isAuthenticating}
              InputLabelProps={{
                shrink: false,
                style: {
                  color: "#c0c0c0",
                  // zIndex: 10,
                  paddingLeft: "4px",
                  pointerEvents: "none",
                },
              }}
              inputProps={{
                ["data-test"]: "login-password",
                style: {
                  backgroundColor: "#fff",
                  color: "#000",
                  fontSize: "1.5rem",
                  paddingLeft: "4px",
                  marginTop: ".5rem",
                },
              }}
            />
            {isAuthenticating ? (
              <div className="flex justify-center pt-4">
                <CircularProgress size="1.5em" />
              </div>
            ) : (
              <button
                data-test="login-btn"
                type="submit"
                className="p-2 mt-4 h-14 rounded-md w-ful text-white font-bold"
                style={{
                  fontSize: "1.5rem",
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
    </div>
  );
};
