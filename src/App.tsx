import "@/styles/App.css";
import { CircularProgress } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ActivationHero from "./components/ActivationHero";
import AppMenu from "./components/AppMenu";
import { getSettings, setSettings } from "./helpers/activation";
import { client } from "./helpers/api-client";
import { deleteToken, getToken } from "./helpers/auth";
import { activateParams, VIEWS } from "./types";
import AddSales from "./views/add-sales";
import IssueCard from "./views/issue-card";
import LoginForm from "./views/login";

function App(props) {
  console.log("app props ", props);
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

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
        setViewState(VIEWS.CONFIRM_INSTALL);
        setSettingsUrl(callbackUrl as string);
      } else {
        // @ts-ignore
        setSettingsUrl(callbackUrl);
        setLocalSettings(getSettings());
        setIsReactivating(true);
      }
      return;
    }

    if (getSettings()) {
      setLocalSettings(getSettings());

      if (mod && mod === "1") {
        validateAccessToken(VIEWS.ISSUE_CARD);
        return;
      }

      if (mod && mod === "2") {
        validateAccessToken(VIEWS.ADD_SALES);
        return;
      }

      if (getToken()) {
        setViewState(VIEWS.MENU);
        return;
      }

      setViewState(VIEWS.LOGIN);
    } else {
      setViewState(VIEWS.DENIED);
    }
  }, [pathname, search]);

  function validateAccessToken(viewOnSuccess: VIEWS) {
    if (getToken()) {
      setViewState(viewOnSuccess);
      return;
    }

    setViewState(VIEWS.LOGIN);
  }

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
          setLocalSettings(res);
          navigate("/");
          setViewState(VIEWS.LOGIN);
          return;
        }

        setViewState(VIEWS.DENIED);
      })
      .catch(() => {
        setViewState(VIEWS.DENIED);
      });
  }

  function handleLogout() {
    deleteToken();
    setViewState(VIEWS.LOGIN);
  }

  return (
    <div className="flex flex-col items-center h-full w-full">
      {
        {
          [VIEWS.IDLE]: (
            <div className="flex flex-col justify-center items-center h-full">
              {isReactivating ? (
                <div className="flex flex-col justify-center w-full items-center">
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
                  <div className="mt-4 text-gray-500">
                    You are attempting to change it
                  </div>
                  <div className="flex flex-row w-full mt-4">
                    <button
                      className={`mr-4 h-12 p-2 px-8 border rounded-md  text-white`}
                      style={{ backgroundColor: "red" }}
                      id="update-settings"
                      onClick={handleUpdateSettings}
                    >
                      Change
                    </button>
                    <button
                      className={`p-2 h-12  px-8 border rounded-md  bg-blue-400 text-white`}
                      onClick={() => navigate("/")}
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
          [VIEWS.MENU]: (
            <AppMenu onMenuSelect={handleMenuChange} onLogout={handleLogout} />
          ),
          [VIEWS.ADD_SALES]: (
            <AddSales
              currency={localSettings?.business?.currency}
              installationId={localSettings?.installation?.id}
              programs={localSettings?.programs}
              location={localSettings?.location}
              onDone={handleBackToMenu}
            />
          ),
          [VIEWS.ISSUE_CARD]: (
            <IssueCard
              onDone={handleBackToMenu}
              programs={localSettings?.programs}
              location={localSettings?.location}
              tenantCode={localSettings?.business?.tenantCode}
              installationId={localSettings?.installation?.id}
            />
          ),
          [VIEWS.CONFIRM_INSTALL]: (
            <ActivationHero onActivate={handleUpdateSettings} />
          ),
          [VIEWS.DENIED]: <ActivationHero />,
        }[viewState]
      }
    </div>
  );
}

export default App;
