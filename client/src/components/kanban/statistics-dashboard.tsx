import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useKanban } from "@/hooks/use-kanban";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, TrendingUp, Calendar, BarChart3 } from "lucide-react";

export function StatisticsDashboard() {
  const { currentBoardId, goals, wins } = useKanban();

  const getWeeklyProgress = (userId: string) => {
    if (!goals || !wins) return [];
    
    const userWins = wins.filter(w => w.assignee === userId || w.sharedWith === userId);
    
    const weeklyData: Record<string, number> = {};
    
    userWins.forEach(win => {
      if (win.completedAt) {
        const date = new Date(win.completedAt);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekKey = weekStart.toISOString().split('T')[0];
        weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
      }
    });

    const last8Weeks = [];
    const today = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (today.getDay() + i * 7));
      weekStart.setHours(0, 0, 0, 0);
      const weekKey = weekStart.toISOString().split('T')[0];
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      last8Weeks.push({
        weekStart: weekKey,
        weekEnd: weekEnd.toISOString().split('T')[0],
        count: weeklyData[weekKey] || 0,
        label: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      });
    }

    return last8Weeks;
  };

  const gcStats = useQuery({
    queryKey: ["/api/boards", currentBoardId, "statistics", "GC"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/boards/${currentBoardId}/statistics/GC`);
      return response.json();
    },
    enabled: !!currentBoardId,
  });

  const skStats = useQuery({
    queryKey: ["/api/boards", currentBoardId, "statistics", "SK"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/boards/${currentBoardId}/statistics/SK`);
      return response.json();
    },
    enabled: !!currentBoardId,
  });

  const gcWeekly = getWeeklyProgress("GC");
  const skWeekly = getWeeklyProgress("SK");

  const maxGoals = Math.max(
    ...gcWeekly.map(w => w.count),
    ...skWeekly.map(w => w.count),
    1
  );

  if (!currentBoardId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BarChart3 className="mx-auto mb-2 opacity-50" size={24} />
        <p>Select a board to view statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Trophy className="mr-3 text-primary" size={24} />
              GC Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gcStats.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : gcStats.data ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base text-muted-foreground">Completion Rate</span>
                  <span className="text-2xl font-bold">{gcStats.data.completionRate || 0}%</span>
                </div>
                <Progress value={gcStats.data.completionRate || 0} className="h-3" />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Completed</div>
                    <div className="text-2xl font-bold">{gcStats.data.completed || 0}</div>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">In Progress</div>
                    <div className="text-2xl font-bold">{gcStats.data.inProgress || 0}</div>
                  </div>
                </div>
                {gcStats.data && (gcStats.data.totalSubtasks > 0 || gcStats.data.completedSubtasks > 0) && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Subtask Completion</span>
                      <span className="text-lg font-bold">{gcStats.data.subtaskCompletionRate || 0}%</span>
                    </div>
                    <Progress value={gcStats.data.subtaskCompletionRate || 0} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{gcStats.data.completedSubtasks || 0} of {gcStats.data.totalSubtasks || 0} completed</span>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Trophy className="mr-3 text-primary" size={24} />
              SK Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skStats.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : skStats.data ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base text-muted-foreground">Completion Rate</span>
                  <span className="text-2xl font-bold">{skStats.data.completionRate || 0}%</span>
                </div>
                <Progress value={skStats.data.completionRate || 0} className="h-3" />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Completed</div>
                    <div className="text-2xl font-bold">{skStats.data.completed || 0}</div>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">In Progress</div>
                    <div className="text-2xl font-bold">{skStats.data.inProgress || 0}</div>
                  </div>
                </div>
                {skStats.data && (skStats.data.totalSubtasks > 0 || skStats.data.completedSubtasks > 0) && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Subtask Completion</span>
                      <span className="text-lg font-bold">{skStats.data.subtaskCompletionRate || 0}%</span>
                    </div>
                    <Progress value={skStats.data.subtaskCompletionRate || 0} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{skStats.data.completedSubtasks || 0} of {skStats.data.totalSubtasks || 0} completed</span>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Weekly Progress</CardTitle>
          <CardDescription className="text-base">
            Goals completed per week (last 8 weeks)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">GC</span>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {gcWeekly.reduce((sum, w) => sum + w.count, 0)} total
                </Badge>
              </div>
              <div className="space-y-3">
                {gcWeekly.map((week, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground w-48 flex-shrink-0 font-medium">
                      {week.label}
                    </div>
                    <div className="flex-1 flex items-center gap-4">
                      <div className="flex-1 bg-secondary rounded-full h-6 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all flex items-center justify-end pr-2"
                          style={{ width: `${(week.count / maxGoals) * 100}%` }}
                        >
                          {week.count > 0 && (
                            <span className="text-xs font-bold text-primary-foreground">{week.count}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-base font-bold w-12 text-right">{week.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">SK</span>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {skWeekly.reduce((sum, w) => sum + w.count, 0)} total
                </Badge>
              </div>
              <div className="space-y-3">
                {skWeekly.map((week, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground w-48 flex-shrink-0 font-medium">
                      {week.label}
                    </div>
                    <div className="flex-1 flex items-center gap-4">
                      <div className="flex-1 bg-secondary rounded-full h-6 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all flex items-center justify-end pr-2"
                          style={{ width: `${(week.count / maxGoals) * 100}%` }}
                        >
                          {week.count > 0 && (
                            <span className="text-xs font-bold text-white">{week.count}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-base font-bold w-12 text-right">{week.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {(gcStats.data?.totalSubtasks > 0 || skStats.data?.totalSubtasks > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Subtask Progress</CardTitle>
            <CardDescription className="text-base">
              Overall subtask completion statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">GC Subtasks</span>
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    {gcStats.data?.completedSubtasks || 0} / {gcStats.data?.totalSubtasks || 0}
                  </Badge>
                </div>
                <Progress value={gcStats.data?.subtaskCompletionRate || 0} className="h-4" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">SK Subtasks</span>
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    {skStats.data?.completedSubtasks || 0} / {skStats.data?.totalSubtasks || 0}
                  </Badge>
                </div>
                <Progress value={skStats.data?.subtaskCompletionRate || 0} className="h-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

