"use client";

import type { Session } from "next-auth";
import WrapperLayoutTab from "./wrapper-layout.tab";
import { Button } from "@repo/ui/components/button";
import { PlusIcon } from "@repo/ui/icons";
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
						<Button className="w-min mb-4">
							<PlusIcon className="size-5 mr-2" />
							Adicionar novo evento
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
