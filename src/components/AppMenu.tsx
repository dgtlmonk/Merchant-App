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
      className="flex flex-row w-full items-center justify-between  px-4 font-bold tracking-tighter"
      style={{ backgroundColor: "#7B7B7B", color: "#FFFFFF" }}
    >
      <div className="flex items-center ">
        <Person style={{ minWidth: "32px", minHeight: "32px" }} />
        <span style={{ fontFamily: "melbourne-bold" }}>admin</span>
      </div>
      <div className="flex flex-row tracking-tighter items-center justify-center">
        <span style={{ color: "#C0C0C0" }}>powered by </span>
        <div
          className="flex items-center justify-center "
          style={{
            fontFamily: "melbourne-bold",
            fontSize: "1.4rem",
            marginLeft: "4px",
            paddingBottom: "4px",
          }}
        >
          <span style={{ color: "#fff" }}>perk</span>
          <span style={{ color: "#ffb300" }}>d</span>
        </div>
      </div>
    </div>
  </div>
);
