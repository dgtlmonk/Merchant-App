import { useState } from "react";
import "./App.css";
import AppMenu from "./components/AppMenu";
import IssueCard from "./components/IssueCard";
import LoginForm from "./components/LoginForm";
import { VIEWS } from "./types";

function App() {
  const [viewState, setViewState] = useState<VIEWS>(VIEWS.ISSUE_CARD);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDone = () => {
    setViewState(VIEWS.MENU);
  };

  const handleMenuChange = (menu: VIEWS) => {
    setViewState(menu);
  };

  const handleOnLogin = () => {
    setIsLoading(true);
  };

  const SubmitComp = () => (
    <button
      type="submit"
      className="p-2 mt-4 rounded-md w-full bg-blue-400 text-white font-medium"
    >
      Login
    </button>
  );

  return (
    <div className="flex flex-col p-4 items-center h-full">
      {
        {
          [VIEWS.LOGIN]: (
            <LoginForm onSuccess={() => handleMenuChange(VIEWS.MENU)} />
          ),
          [VIEWS.MENU]: <AppMenu onMenuSelect={handleMenuChange} />,
          [VIEWS.ISSUE_CARD]: <IssueCard onDone={handleDone} />,
        }[viewState]
      }
    </div>
  );
}
// {/* <LoginForm /> */}
// {/* <AppMenu /> */}

export default App;
