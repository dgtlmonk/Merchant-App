import "@/styles/App.css";
import { CircularProgress } from "@material-ui/core";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AddSales from "./components/AddSales";
import AppMenu from "./components/AppMenu";
import IssueCard from "./components/IssueCard";
import LoginForm from "./components/LoginForm";
import { VIEWS } from "./types";

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

function App() {
  const [viewState, setViewState] = useState<string>(VIEWS.IDLE);
  const [module, setModule] = useState<any>(null);
  const [_token, setToken] = useState<any>(null);

  const r = useQuery();

  useEffect(() => {
    if (r.getAll("module")) {
      setModule(r.getAll("module")[0]);
    }

    if (r.getAll("token")) {
      setToken(r.getAll("token")[0]);
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

    setViewState(VIEWS.LOGIN);
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
