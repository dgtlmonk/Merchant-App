import { Person } from "@material-ui/icons";
import { VIEWS } from "../types";
import AppMenuItem from "./AppMenuItem";

type Props = {
  onMenuSelect: (menu: VIEWS) => void;
  onLogout: () => void;
};

export default ({ onMenuSelect, onLogout }: Props) => (
  <div
    className="grid grid-cols-1 grid-rows-6 gap-0 overflow-hidden"
    style={{
      height: "100vh",
      width: "100vw",
      gridTemplateRows: "4rem 1fr 4rem",
    }}
  >
    <div
      className="flex w-full justify-center items-center font-bold"
      style={{ backgroundColor: "#FFB300", color: "#954700" }}
    >
      Home
    </div>
    <div className="flex w-full items-center justify-center">
      <div className="flex flex-row  p-4 flex-wrap w-4/5 justify-around ">
        <AppMenuItem
          label="Issue Card"
          iconCls="picon-barcode"
          onSelect={() => onMenuSelect(VIEWS.ISSUE_CARD)}
        />
        <AppMenuItem
          label="Add Sales"
          iconCls="picon-order"
          onSelect={() => onMenuSelect(VIEWS.ADD_SALES)}
        />
        {/* <AppMenuItem iconCls="picon-clock-outline" label="History" />
      <AppMenuItem iconCls="picon-setting-outline" label="Settings" /> */}
        <AppMenuItem isLogout={true} label="Logout" onSelect={onLogout} />
      </div>
    </div>

    <div
      className="flex w-full items-center font-bold px-4"
      style={{ backgroundColor: "#7B7B7B", color: "#FFFFFF" }}
    >
      <div className="flex items-center">
        <Person style={{ minWidth: "32px", minHeight: "32px" }} />
        <span className="font-extrabold">Admin</span>
      </div>
    </div>
  </div>
);
