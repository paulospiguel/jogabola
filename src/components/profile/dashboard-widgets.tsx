"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowRight, Calendar, Trophy, Users } from "lucide-react";

interface DashboardWidgetProps {
  role: string;
}

export function DashboardWidgets({ role }: DashboardWidgetProps) {
  if (role === "PLAYER") {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Next Match Widget */}
        <Card className="hover:border-neon-primary/30 relative overflow-hidden border-white/10 bg-white/5 backdrop-blur transition-all">
          <div className="bg-neon-primary/5 absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full blur-2xl" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-white">
              <Calendar className="text-neon-primary h-5 w-5" />
              Next Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-black/20 p-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">FC Porto</div>
                  <div className="text-text-muted text-xs">Home</div>
                </div>
                <div className="text-center">
                  <div className="text-neon-secondary text-sm font-bold">
                    VS
                  </div>
                  <div className="text-text-muted text-xs">20:00</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">Benfica</div>
                  <div className="text-text-muted text-xs">Away</div>
                </div>
              </div>
              <Button className="bg-neon-primary/10 text-neon-primary hover:bg-neon-primary/20 w-full">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Stats Widget */}
        <Card className="hover:border-accent-blue/30 relative overflow-hidden border-white/10 bg-white/5 backdrop-blur transition-all">
          <div className="bg-accent-blue/5 absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full blur-2xl" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-white">
              <Activity className="text-accent-blue h-5 w-5" />
              Recent Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              {["W", "W", "D", "L", "W"].map((result, i) => (
                <div
                  key={i}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold ${
                    result === "W"
                      ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                      : result === "D"
                        ? "border border-yellow-500/30 bg-yellow-500/20 text-yellow-400"
                        : "border border-red-500/30 bg-red-500/20 text-red-400"
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
            <div className="text-text-secondary mt-4 text-sm">
              Last 5 matches performance
            </div>
          </CardContent>
        </Card>

        {/* Achievements Widget */}
        <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur transition-all hover:border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-white">
              <Trophy className="h-5 w-5 text-purple-400" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="group relative flex h-12 w-12 cursor-help items-center justify-center rounded-full border border-yellow-400/30 bg-linear-to-br from-yellow-400/20 to-orange-500/20 transition-transform hover:scale-110">
                <Trophy className="h-6 w-6 text-yellow-400" />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                  MVP of the Month
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 opacity-50 grayscale">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 opacity-50 grayscale">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
            <Button
              variant="link"
              className="text-neon-primary mt-2 h-auto p-0 hover:text-white"
            >
              View all badges <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (role === "MANAGER") {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Team Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-text-secondary text-center">
              Team management widgets coming soon...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
