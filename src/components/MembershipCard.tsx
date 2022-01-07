import { EmailOutlined, PhoneOutlined } from "@material-ui/icons";

type Props = {
  cardImageSrc: string;
  onSelectDataIndex: () => void;
  person: {
    fullName: string;
    phones: any[];
    activeMemberships: any[];
    emails: any[];
  };
};

const MembershipCard = ({ onSelectDataIndex, person, cardImageSrc }: Props) => {
  return (
    <div
      className="flex flex-row w-full justify-between p-8 border-b"
      data-test="match-person"
      onClick={onSelectDataIndex}
    >
      <div className="flex flex-col w-full">
        <h1 className="text-2xl font-bold">{person?.fullName}</h1>
        <div className="flex flex-row items-center">
          <PhoneOutlined className="opacity-50 mr-2 text-blue-400" />{" "}
          {person?.phones[0]?.fullNumber}
        </div>
        <div className="flex flex-row items-center">
          <EmailOutlined className="opacity-50 mr-2 text-blue-400" />
          {(person?.emails && person?.emails[0]?.address) || "no email"}
        </div>
      </div>
      <div className="relative rounded-lg overflow-hidden w-48">
        <div className="rounded-sm">
          <img loading="lazy" className="object-fill" src={cardImageSrc} />
        </div>
      </div>
    </div>
  );
};

export default MembershipCard;
