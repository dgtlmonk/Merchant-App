import { VIEWS } from "../types";
import AppMenuItem from "./AppMenuItem";

type Props = {
  onMenuSelect: (menu: VIEWS) => void;
};

export default ({ onMenuSelect }: Props) => (
  <div className="flex  items-center justify-center w-full h-full">
    <div className="flex flex-row  p-4 flex-wrap w-4/5 justify-around">
      <AppMenuItem
        label="Issue Card"
        onSelect={() => onMenuSelect(VIEWS.ISSUE_CARD)}
      />
      <AppMenuItem
        label="Add Sales"
        onSelect={() => onMenuSelect(VIEWS.ADD_SALES)}
      />
      <AppMenuItem label="History" />
      <AppMenuItem label="Settings" />
    </div>
  </div>
);
