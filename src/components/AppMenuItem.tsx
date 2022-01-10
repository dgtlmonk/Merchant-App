import { MdLogout } from "react-icons/md";

type Props = {
  label: string;
  iconCls?: string;
  isLogout?: boolean;
  onSelect?: () => void;
};

export default ({ label, onSelect, iconCls, isLogout }: Props) => {
  return (
    <div
      style={{ minHeight: "110px", minWidth: "150px" }}
      className="menu-item p-4  xs:m-2 md:m-8 flex flex-col-reverse items-center"
      role="button"
      onClick={onSelect}
    >
      <span>{label}</span>
      {isLogout ? (
        <span>
          <MdLogout className="w-16 h-16" />
        </span>
      ) : (
        <span className={`${iconCls} icon-menu`}></span>
      )}
    </div>
  );
};
