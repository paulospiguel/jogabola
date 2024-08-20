"use client";

import { TrendingUp } from "lucide-react";
import { LabelList, Pie, PieChart, RadialBar, RadialBarChart } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartData = [
	{ browser: "wins", visitors: 275, fill: "#fff000" },
	{ browser: "losses", visitors: 200, fill: "var(--color-safari)" },
	{ browser: "draws", visitors: 90, fill: "var(--color-other)" },
];

const chartConfig = {
	wins: {
		label: "Wins",
	},
	losses: {
		label: "Losses",
		color: "hsl(var(--chart-5))",
	},
	draws: {
		label: "Draws",
		color: "hsl(var(--chart-4))",
	},
} satisfies ChartConfig;

export function TeamCharts() {
	return <LossesWinsChart />;
}

function LossesWinsChart() {
	return (
		<Card className="flex flex-col">
			<CardHeader className="items-center pb-0">
				<CardTitle>Pie Chart - Label</CardTitle>
				<CardDescription>January - June 2024</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 pb-0">
				<ChartContainer
					config={chartConfig}
					className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
				>
					<PieChart>
						<ChartTooltip content={<ChartTooltipContent hideLabel />} />
						<Pie data={chartData} dataKey="visitors" label nameKey="browser" />
					</PieChart>
				</ChartContainer>
			</CardContent>
			<CardFooter className="flex-col gap-2 text-sm">
				<div className="flex items-center gap-2 font-medium leading-none">
					Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
				</div>
				<div className="leading-none text-muted-foreground">Showing total visitors for the last 6 months</div>
			</CardFooter>
		</Card>
	);
}

// TeamCharts.LossesWinsChart = LossesWinsChart;

// function LossesWinsChartV2() {
// 	return (
// 		<Card className="flex flex-col">
// 			<CardHeader className="items-center pb-0">
// 				<CardTitle>Radial Chart - Label</CardTitle>
// 				<CardDescription>January - June 2024</CardDescription>
// 			</CardHeader>
// 			<CardContent className="flex-1 pb-0">
// 				<ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
// 					<RadialBarChart data={chartData} startAngle={-90} endAngle={380} innerRadius={30} outerRadius={110}>
// 						<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="browser" />} />
// 						<RadialBar dataKey="visitors" background>
// 							<LabelList
// 								position="insideStart"
// 								dataKey="browser"
// 								className="fill-white capitalize mix-blend-luminosity"
// 								fontSize={11}
// 							/>
// 						</RadialBar>
// 					</RadialBarChart>
// 				</ChartContainer>
// 			</CardContent>
// 			<CardFooter className="flex-col gap-2 text-sm">
// 				<div className="flex items-center gap-2 font-medium leading-none">
// 					Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
// 				</div>
// 				<div className="leading-none text-muted-foreground">Showing total visitors for the last 6 months</div>
// 			</CardFooter>
// 		</Card>
// 	);
// }

// TeamCharts.LossesWinsChartV2 = LossesWinsChartV2;
