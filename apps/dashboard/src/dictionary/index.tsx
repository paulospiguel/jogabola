import { tabKeysSchema } from "../../../../packages/shared/schemas/manager";

const tabsValues = tabKeysSchema.Values;

export const dictionary = {
	managerTabs: {
		[tabsValues.home]: "Home",
		[tabsValues.teams]: "Teams",
		[tabsValues.players]: "Players",
		[tabsValues.schedule]: "Schedules",
		[tabsValues.statistics]: "Statistics",
	},
} as const;
