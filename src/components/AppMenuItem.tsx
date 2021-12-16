type Props = {
  label: string;
  onSelect?: () => void;
};

export default ({ label, onSelect }: Props) => {
  return (
    <div
      style={{ minHeight: "110px", minWidth: "150px" }}
      className="menu-item border p-4 shadow-sm rounded-md xs:m-2 md:m-8 flex flex-col-reverse items-center"
      role="button"
      onClick={onSelect}
    >
      <span>{label}</span>
    </div>
  );
};
