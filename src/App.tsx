import "@/styles/App.css";
import { CircularProgress } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AddSales from "./components/AddSales";
import AppMenu from "./components/AppMenu";
import IssueCard from "./components/IssueCard";
import LoginForm from "./components/LoginForm";
import "./mirage";
import { VIEWS } from "./types";

function App(props) {
  // server.shutdown();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<string>(VIEWS.IDLE);
  const [module, _setModule] = useState<any>(null);
  const [isReactivating, setIsReactivating] = useState<boolean>(false);

  useEffect(() => {
    // client.get("/validate").then((response) => {
    //   console.log(" validate response ", response);
    //   setSettings(response);
    // });
    // if (getSettings()) {
    //   // TODO: validate/parse settings
    //   navigate("/?init");
    // }
  }, []);

  useEffect(() => {
    // console.log(
    //   " pathname search ",
    //   pathname,
    //   new URLSearchParams(search).get("callback")
    // );

    if (
      pathname === "/activate" &&
      new URLSearchParams(search).get("callback")
    ) {
      console.log(" trying to activate?");
      setIsReactivating(true);
      return;
    }

    // if (r.getAll("module")) {
    //   setModule(r.getAll("module")[0]);
    // }

    // if (r.has("login")) {
    //   setViewState(VIEWS.LOGIN);
    // }

    setViewState(VIEWS.DENIED);
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

  return (
    <div className="flex flex-col items-center h-full w-full">
      {
        {
          [VIEWS.IDLE]: (
            <div className="flex flex-col justify-center items-center h-full">
              <span className={`${isReactivating ? "hidden" : "flex"}`}>
                <CircularProgress size="2rem" />
              </span>
              <div>This app is currently setup for</div>
              <div>[store name] store</div>
              <div>You are attempting to change it</div>
              <div className="flex flex-row w-full mt-8">
                <button
                  className={`mr-4 p-2 px-8 border rounded-md  bg-blue-400 text-white`}
                >
                  Change
                </button>
                <button
                  className={`p-2 px-8 border rounded-md  bg-blue-400 text-white`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ),
          [VIEWS.LOGIN]: (
            <LoginForm
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
