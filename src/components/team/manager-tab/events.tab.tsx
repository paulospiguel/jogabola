"use client";

import type { Session } from "next-auth";
import WrapperLayoutTab from "./wrapper-layout.tab";
import { Button } from "@/components/ui/button";
import { PlusIcon } 
import { Modal } from "@/components/modal";
import AddNewEvent from "../add-event";

interface EventsTabProps {
  tabKey: string;
  session: Session | null;
}

export default function EventsTabContent({ tabKey }: EventsTabProps) {
  return (
    <WrapperLayoutTab tabKey={tabKey}>
      <div className="flex flex-wrap items-center justify-center md:justify-end">
        <Modal
          size="large"
          triggerComponent={
            <Button className="mb-4 w-min">
              <PlusIcon className="mr-2 size-5" />
              Add new event
            </Button>
          }
          content={<AddNewEvent />}
          title=""
          description=""
        />
      </div>
    </WrapperLayoutTab>
  );
}
