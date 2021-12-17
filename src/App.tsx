import "@/styles/App.css";
import { useState } from "react";
import AddSales from "./components/AddSales";
import AppMenu from "./components/AppMenu";
import IssueCard from "./components/IssueCard";
import LoginForm from "./components/LoginForm";
import { VIEWS } from "./types";

function App() {
  const [viewState, setViewState] = useState<string>(VIEWS.ADD_SALES);

  const handleBackToMenu = () => {
    setViewState(VIEWS.MENU);
  };

  const handleMenuChange = (menu: VIEWS) => {
    setViewState(menu);
  };

  return (
    <div className="flex flex-col p-4 items-center h-full">
      {
        {
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
// {/* <LoginForm /> */}
// {/* <AppMenu /> */}

export default App;
