import { Database, LucideProps } from "lucide-react";

type LucideIconProp = React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

function NoData({
  Icon = Database,
  text = "No transactions match your selected filters.",
}: {
  Icon?: LucideIconProp;
  text?: string;
}) {
  return (
    <div className="flex flex-col space-y-4 h-84 mx-auto items-center opacity-70 pt-16">
      <Icon size={24} className="text-center mx-auto" />
      <span className="text-center font-normal text-sm">{text}</span>
    </div>
  );
}

export default NoData;
