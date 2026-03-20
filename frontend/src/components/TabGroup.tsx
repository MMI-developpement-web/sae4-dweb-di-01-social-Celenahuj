import Tab from "../components/ui/Tab";

export default function TabGroup() {
  return (
    <div className="w-full max-w-xl">
      <div className="flex gap-4 border-b border-white/10 w-full mb-4 sm:mb-6">
        <Tab isActive={true}>Following</Tab>
        {/* <Tab isActive={false}>For You</Tab> */}
      </div>
    </div>
  );
}