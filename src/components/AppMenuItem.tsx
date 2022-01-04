type Props = {
  label: string;
  iconCls: string;
  onSelect?: () => void;
};

export default ({ label, onSelect, iconCls }: Props) => {
  return (
    <div
      style={{ minHeight: "110px", minWidth: "150px" }}
      className="menu-item p-4  xs:m-2 md:m-8 flex flex-col-reverse items-center"
      role="button"
      onClick={onSelect}
    >
      <span>{label}</span>
      <span className={`${iconCls} icon-menu`}></span>
    </div>
  );
};
