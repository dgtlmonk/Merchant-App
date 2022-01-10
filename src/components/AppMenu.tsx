import { VIEWS } from "../types";
import AppMenuItem from "./AppMenuItem";

type Props = {
  onMenuSelect: (menu: VIEWS) => void;
  onLogout: () => void;
};

export default ({ onMenuSelect, onLogout }: Props) => (
  <div className="flex  items-center justify-center w-full h-full">
    <div className="flex flex-row  p-4 flex-wrap w-4/5 justify-around">
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
);
