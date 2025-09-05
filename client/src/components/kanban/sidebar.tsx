import { Trophy, Rocket, Briefcase, Heart, Plus, StickyNote, Columns, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground mb-2" data-testid="title-goals-board">
          <Trophy className="text-primary mr-2 inline-block" size={20} />
          Goals Board
        </h1>
        <p className="text-sm text-muted-foreground" data-testid="text-subtitle">Track your personal goals</p>
      </div>

      <div className="flex-1 p-4">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide" data-testid="text-all-boards">
            All Boards (3)
          </h3>
          <div className="space-y-2">
            <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg p-3 font-medium flex items-center shadow-lg" data-testid="board-personal-goals">
              <Rocket className="mr-3" size={16} />
              Personal Goals
            </div>
            <div className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg p-3 cursor-pointer transition-colors flex items-center" data-testid="board-work-projects">
              <Briefcase className="mr-3" size={16} />
              Work Projects
            </div>
            <div className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg p-3 cursor-pointer transition-colors flex items-center" data-testid="board-health-wellness">
              <Heart className="mr-3" size={16} />
              Health & Wellness
            </div>
            <div className="text-primary hover:bg-primary/10 rounded-lg p-3 cursor-pointer transition-colors flex items-center border border-dashed border-primary/50" data-testid="button-create-new-board">
              <Plus className="mr-3" size={16} />
              Create New Board
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide" data-testid="text-quick-actions">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              data-testid="button-add-sticky-note"
            >
              <StickyNote className="mr-3" size={16} />
              Add Sticky Note
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              data-testid="button-manage-columns"
            >
              <Columns className="mr-3" size={16} />
              Manage Columns
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3" data-testid="user-profile">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium" data-testid="avatar-user">
            JD
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium" data-testid="text-user-name">John Doe</p>
            <p className="text-xs text-muted-foreground" data-testid="text-user-role">Personal Board</p>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="button-user-settings">
            <Settings size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
