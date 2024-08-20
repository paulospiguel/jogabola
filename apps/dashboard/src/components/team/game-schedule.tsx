"use client";

import { Calendar } from "@jogabola/ui/calendar";
import React from "react";

export default function GameSchedule() {
	const [date, setDate] = React.useState<Date | undefined>(new Date());

	return <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />;
}
