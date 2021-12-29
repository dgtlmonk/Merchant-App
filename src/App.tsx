import "@/styles/App.css";
import { CircularProgress } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AddSales from "./components/AddSales";
import AppMenu from "./components/AppMenu";
import IssueCard from "./components/IssueCard";
import LoginForm from "./components/LoginForm";
import { getSettings, setSettings } from "./helpers/activation";
import { client } from "./helpers/api-client";
// import "./mirage";
import { activateParams, VIEWS } from "./types";

function App(props) {
  // server.shutdown();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const [localSettings, setLocalSettings] = useState<any>(null);
  const [viewState, setViewState] = useState<string>(VIEWS.IDLE);
  const [module, _setModule] = useState<any>(null);
  const [isReactivating, setIsReactivating] = useState<boolean>(false);
  const [settingsUrl, setSettingsUrl] = useState<string>();

  useEffect(() => {
    const callbackUrl = new URLSearchParams(search).get("callback");

    if (pathname === "/activate" && callbackUrl) {
      // TODO: validate callback url
      if (!getSettings()) {
        console.log("must write to local config");
        client
          .post(`${callbackUrl}`, {
            body: JSON.stringify(activateParams),
          })
          .then((res) => {
            console.log("response ", res);
            if (!res.error) {
              setSettings(res);
              console.log("get settings ", getSettings());
              setLocalSettings(res);
              setViewState(VIEWS.LOGIN);
            }
          })
          .catch(() => {
            setViewState(VIEWS.DENIED);
          });
      } else {
        console.log(" trying to activate?");

        setSettingsUrl(callbackUrl);
        setLocalSettings(getSettings());
        setIsReactivating(true);
      }
      return;
    }

    if (getSettings()) {
      setLocalSettings(getSettings());
      setViewState(VIEWS.LOGIN);
    } else {
      setViewState(VIEWS.DENIED);
    }
  }, [pathname, search]);

  useEffect(() => {
    if (module === "0") {
      setViewState(VIEWS.MENU);
      return;
    }

    if (module === "1") {
      setViewState(VIEWS.ISSUE_CARD);
      return;
    }

    if (module === "2") {
      setViewState(VIEWS.ADD_SALES);
      return;
    }

    // setViewState(VIEWS.LOGIN);
  }, [module]);

  const handleBackToMenu = () => {
    setViewState(VIEWS.MENU);
  };

  const handleMenuChange = (menu: VIEWS) => {
    setViewState(menu);
  };

  function handleUpdateSettings() {
    console.log(" updating settings from ", settingsUrl);

    client
      .post(`${settingsUrl}`, {
        body: JSON.stringify(activateParams),
      })
      .then((res) => {
        console.log("response ", res);
        if (!res.error) {
          setSettings(res);
          console.log("get settings ", getSettings());
          setLocalSettings(res);
          setViewState(VIEWS.LOGIN);
        }
      })
      .catch(() => {
        setViewState(VIEWS.DENIED);
      });
  }

  return (
    <div className="flex flex-col items-center h-full w-full">
      {
        {
          [VIEWS.IDLE]: (
            <div className="flex flex-col justify-center items-center h-full">
              {isReactivating ? (
                <div>
                  <div>This app is currently setup for</div>
                  <div>
                    <span
                      className="font-bold mr-2"
                      style={{ fontSize: "1.2rem" }}
                    >
                      {localSettings?.location?.name}
                    </span>
                    store
                  </div>
                  <div>You are attempting to change it</div>
                  <div className="flex flex-row w-full mt-8">
                    <button
                      className={`mr-4 p-2 px-8 border rounded-md  text-white`}
                      style={{ backgroundColor: "red" }}
                      id="update-settings"
                      onClick={handleUpdateSettings}
                    >
                      Change
                    </button>
                    <button
                      className={`p-2 px-8 border rounded-md  bg-blue-400 text-white`}
                      onClick={() => setViewState(VIEWS.LOGIN)}
                      id="update-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <span>
                  <CircularProgress size="2rem" />
                </span>
              )}
            </div>
          ),
          [VIEWS.LOGIN]: (
            <LoginForm
              settings={localSettings}
              onSuccess={() => {
                setViewState(VIEWS.MENU);
              }}
            />
          ),
          [VIEWS.MENU]: <AppMenu onMenuSelect={handleMenuChange} />,
          [VIEWS.ADD_SALES]: <AddSales onDone={handleBackToMenu} />,
          [VIEWS.ISSUE_CARD]: <IssueCard onDone={handleBackToMenu} />,
          [VIEWS.DENIED]: (
            <div className="flex flex-col w-full h-full items-center justify-center">
              <div className="p-12">
                <h1 className="text-red-600">Access denied.</h1>
                <span>Contact abcx@perkd.me to activate your account.</span>
              </div>
            </div>
          ),
        }[viewState]
      }
    </div>
  );
}

export default App;
