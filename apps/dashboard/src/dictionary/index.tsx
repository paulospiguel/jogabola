import { tabKeysSchema } from "@/schemas";

const tabsValues = tabKeysSchema.Values;

export const dictionary = {
	managerTabs: {
		[tabsValues.fields]: "Fields",
		[tabsValues.teams]: "Teams",
		[tabsValues.players]: "Players",
		[tabsValues.schedule]: "Schedules",
		[tabsValues.statistics]: "Statistics",
	},
} as const;
