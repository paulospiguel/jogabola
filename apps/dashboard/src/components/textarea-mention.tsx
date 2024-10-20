import { Mention, MentionsInput } from "@repo/ui/components/mentions-input";
import { cn } from "@repo/ui/lib/cn";

export const TextareaMention = ({ value, onChange, data, onAdd, className }) => {
	return (
		<MentionsInput
			className={cn(
				"flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			value={value}
			onChange={onChange}
			placeholder="@__display__"
			//allowSuggestionsAboveCursor
		>
			<Mention
				markup="@[__display__](email:__id__)"
				trigger={"@"}
				data={data}
				onAdd={onAdd}
				style={{ backgroundColor: "#d1c4e9" }}
			/>
		</MentionsInput>
	);
};
