import "@/styles/App.css";
import { CircularProgress } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AppMenu from "./components/AppMenu";
import { getSettings, setSettings } from "./helpers/activation";
import { client } from "./helpers/api-client";
// import "./mirage";
import { activateParams, VIEWS } from "./types";
import AddSales from "./views/add-sales";
import IssueCard from "./views/issue-card";
import LoginForm from "./views/login";

function App(props) {
  const { pathname, search } = useLocation();
  // const navigate = useNavigate();

  const [localSettings, setLocalSettings] = useState<any>(null);
  const [viewState, setViewState] = useState<string>(VIEWS.IDLE);
  const [isReactivating, setIsReactivating] = useState<boolean>(false);
  const [settingsUrl, setSettingsUrl] = useState<string>();

  useEffect(() => {
    const cb = new URLSearchParams(search).get("callback");
    const mod = new URLSearchParams(search).get("module");
    const activateUrl = new URLSearchParams(search).get("a");

    const isActivating = (pathname === "/activate" && cb) || activateUrl;
    const callbackUrl = cb || activateUrl;

    if (isActivating) {
      if (!getSettings()) {
        client
          .post(`${callbackUrl}`, {
            body: JSON.stringify(activateParams),
          })
          .then((res) => {
            if (!res.error) {
              setSettings(res);
              console.log("get settings ", getSettings());
              setLocalSettings(res);
              setViewState(VIEWS.LOGIN);
              return;
            }

            setViewState(VIEWS.DENIED);
          })
          .catch(() => {
            setViewState(VIEWS.DENIED);
          });
      } else {
        // @ts-ignore
        setSettingsUrl(callbackUrl);
        setLocalSettings(getSettings());
        setIsReactivating(true);
      }
      return;
    }

    const isActivated = getSettings();

    if (isActivated) {
      setLocalSettings(getSettings());

      if (mod && mod === "1") {
        console.log("issue card module?");

        setViewState(VIEWS.ISSUE_CARD);
        return;
      }

      setViewState(VIEWS.LOGIN);
    } else {
      setViewState(VIEWS.DENIED);
    }
  }, [pathname, search]);

  // useEffect(() => {
  //   if (module === "0") {
  //     setViewState(VIEWS.MENU);
  //     return;
  //   }

  //   if (module === "1") {
  //     setViewState(VIEWS.ISSUE_CARD);
  //     return;
  //   }

  //   if (module === "2") {
  //     setViewState(VIEWS.ADD_SALES);
  //     return;
  //   }

  // }, [module]);

  const handleBackToMenu = () => {
    setViewState(VIEWS.MENU);
  };

  const handleMenuChange = (menu: VIEWS) => {
    setViewState(menu);
  };

  function handleUpdateSettings() {
    client
      .post(`${settingsUrl}`, {
        body: JSON.stringify(activateParams),
      })
      .then((res) => {
        if (!res.error) {
          setSettings(res);
          console.log("get settings ", getSettings());
          setLocalSettings(res);
          setViewState(VIEWS.LOGIN);

          return;
        }

        setViewState(VIEWS.DENIED);
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
          [VIEWS.ISSUE_CARD]: (
            <IssueCard
              onDone={handleBackToMenu}
              programs={localSettings?.programs}
              location={localSettings?.location}
              installationId={localSettings?.installation?.id}
            />
          ),
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
