import type { Session } from "next-auth";
import WrapperLayoutTab from "./wrapper-layout.tab";

interface ScheduleTabProps {
  tabKey: string;
  session: Session | null;
}

export default function ScheduleTabContent({ tabKey }: ScheduleTabProps) {
  return <WrapperLayoutTab tabKey={tabKey}> </WrapperLayoutTab>;
}
