import type { Session } from "next-auth";
import WrapperLayoutTab from "./wrapper-layout.tab";
import { Button } from "@/components/ui/button";
import { PlusIcon } 
import AddNewMatch from "../add-matches";
import { Modal } from "@/components/modal";

interface MatchesTabProps {
  tabKey: string;
  session: Session | null;
}

export default function MatchesTabContent({ tabKey }: MatchesTabProps) {
  return (
    <WrapperLayoutTab tabKey={tabKey}>
      <div className="flex flex-wrap items-center justify-center md:justify-end">
        <Modal
          size="large"
          triggerComponent={
            <Button className="mb-4 w-min">
              <PlusIcon className="mr-2 size-5" />
              Add new match
            </Button>
          }
          content={<AddNewMatch />}
          title="Schedule a New Match"
          description="Enter the details for the upcoming match. Click save when you're done."
        />
      </div>
      {/* <GameSchedule /> */}
    </WrapperLayoutTab>
  );
}
