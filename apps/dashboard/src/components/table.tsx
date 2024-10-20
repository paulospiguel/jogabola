import { Button } from "@repo/ui/components/button";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";

import type { ReactNode } from "react";
import AvatarPoligon from "./avatar-poligon";

type DataSource = {
	action?: () => void;
	actionLabel?: string | ReactNode;
	[key: string]: any;
};

export type THeader = {
	[key: string]: {
		title: string;
		className?: string;
	};
};

type TableComponentProps<T = DataSource> = {
	topReader?: ReactNode;
	headers: THeader;
	data: (DataSource & T)[];
};

export default function TableComponent<T = DataSource>({ topReader, headers, data }: TableComponentProps<T>) {
	return (
		<div className="overflow-x-auto">
			<Table>
				<TableCaption className="px-4">{topReader}</TableCaption>
				<ScrollArea className="h-[65vh] w-full">
					<TableHeader>
						<TableRow>
							{Object.entries(headers).map(([key, head]) => (
								<TableHead key={key} className={head?.className}>
									{head.title}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{data?.map((item, i) => (
							<TableRow key={i}>
								{Object.keys(headers).map((headerKey, idx) => {
									const cellValue = item[headerKey];

									if (headerKey === "action") {
										return (
											<TableCell key={idx}>
												<Button variant="outline" onClick={item.action}>
													{item?.actionLabel || "Click"}
												</Button>
											</TableCell>
										);
									}

									if (headerKey === "image") {
										return (
											<TableCell key={idx}>
												<AvatarPoligon label={""} avatarImage={cellValue} />
											</TableCell>
										);
									}

									return <TableCell key={idx}>{cellValue}</TableCell>;
								})}
							</TableRow>
						))}
					</TableBody>
				</ScrollArea>
			</Table>
		</div>
	);
}
