import { StatisticsDashboard } from "@/components/kanban/statistics-dashboard";
import { Sidebar } from "@/components/kanban/sidebar";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function StatisticsPage() {
  const [location, setLocation] = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Board
              </Button>
              <h1 className="text-3xl font-bold">Statistics Dashboard</h1>
            </div>
          </div>
          <StatisticsDashboard />
        </div>
      </div>
    </div>
  );
}

