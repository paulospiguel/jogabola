import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const mobilePrefixes = [
	{ value: "+351", label: "🇵🇹 +351" },
	{ value: "+55", label: "🇧🇷 +55" },
	{ value: "+1", label: "🇺🇸 +1" },
	{ value: "+44", label: "🇬🇧 +44" },
	{ value: "+33", label: "🇫🇷 +33" },
];

export const LoginMobile = () => {
	return (
		<div className="flex flex-col w-full min-h-full items-center justify-center">
			<div className="flex w-full">
				<Select defaultValue={mobilePrefixes[0].value}>
					<SelectTrigger className="w-[180px] rounded-r-none">
						<SelectValue placeholder="Mobile country" />
					</SelectTrigger>
					<SelectContent>
						{mobilePrefixes.map((prefix) => (
							<SelectItem key={prefix.value} value={prefix.value}>
								{prefix.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Input type="tel" placeholder="Mobile number" className="rounded-l-none" />
			</div>
			<Button variant={"default"} className="w-full rounded-full mt-2">
				<span>Send OTP</span>
			</Button>
		</div>
	);
};
