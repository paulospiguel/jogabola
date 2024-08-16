import { tabKeysSchema } from "@/schemas/manager";

const tabsValues = tabKeysSchema.Values;

export const dictionary = {
	managerTabs: {
		[tabsValues.home]: "Home",
		[tabsValues.teams]: "Teams",
		[tabsValues.players]: "Players",
		[tabsValues.schedule]: "Games",
	},
} as const;
