import "@/styles/App.css";
import { CircularProgress } from "@material-ui/core";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AddSales from "./components/AddSales";
import AppMenu from "./components/AppMenu";
import IssueCard from "./components/IssueCard";
import LoginForm from "./components/LoginForm";
import { deleteSettings, getSettings } from "./helpers/activation";
import "./mirage";
import { VIEWS } from "./types";

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

function App(props) {
  // server.shutdown();
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<string>(VIEWS.IDLE);
  const [module, setModule] = useState<any>(null);
  const [_token, setToken] = useState<any>(null);
  const r = useQuery();

  useEffect(() => {
    deleteSettings();
    // client.get("/validate").then((response) => {
    //   console.log(" validate response ", response);
    //   setSettings(response);
    // });

    if (getSettings()) {
      // TODO: validate/parse settings
      navigate("/?init");
    }
  }, []);

  useEffect(() => {
    if (r.getAll("module")) {
      setModule(r.getAll("module")[0]);
    }

    if (r.getAll("token")) {
      setToken(r.getAll("token")[0]);
    }

    if (r.has("login")) {
      setViewState(VIEWS.LOGIN);
    }

    if (r.has("callback")) {
      // TODO: validate call url
      // setViewState(VIEWS.LOGIN);
      navigate("/?login");
    }
  }, [r]);

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
            <div className="flex justify-center items-center h-full">
              <CircularProgress size="2rem" />
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
        }[viewState]
      }
    </div>
  );
}

export default App;
