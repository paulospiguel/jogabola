"use client";

import { TrendingUp }from "@/components/icons";
import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { action: "wins", games: 6, fill: "green" },
  { action: "losses", games: 2, fill: "red" },
  { action: "draws", games: 2, fill: "yellow" },
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
        <CardTitle>Team Analysis</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="games" label nameKey="action" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total wins and losses for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
