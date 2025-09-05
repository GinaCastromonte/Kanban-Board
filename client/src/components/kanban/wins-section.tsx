import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Expand, Star, Medal, Rocket, Heart, ChevronDown, ChevronUp } from "lucide-react";
import type { Goal } from "@shared/schema";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface WinsSectionProps {
  wins: Goal[];
  onCommentClick: (goal: Goal) => void;
}

export function WinsSection({ wins, onCommentClick }: WinsSectionProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: "wins",
  });

  const getWinIcon = (index: number) => {
    const icons = [Star, Medal, Rocket];
    const Icon = icons[index % icons.length];
    return <Icon size={16} />;
  };

  const getWinColor = (index: number) => {
    const colors = [
      "bg-primary/10 border-primary/30 text-primary",
      "bg-accent/10 border-accent/30 text-accent", 
      "bg-purple-500/10 border-purple-500/30 text-purple-400"
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="border-t border-border p-6" data-testid="wins-section">
      <div className={cn("wins-section rounded-lg p-6", isMinimized && "minimized")}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Trophy className="text-primary text-xl" size={24} />
            <h3 className="text-xl font-bold text-foreground" data-testid="title-wins">
              Wins & Achievements
            </h3>
            <Badge className="bg-primary/20 text-primary" data-testid="wins-count">
              {wins.length} this week
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground" 
              onClick={() => setIsMinimized(!isMinimized)}
              data-testid="button-minimize-wins"
            >
              {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="button-expand-wins">
              <Expand size={16} />
            </Button>
          </div>
        </div>
        
        {!isMinimized && (
          <div 
            ref={setNodeRef}
            className={cn(
              "flex space-x-4 overflow-x-auto pb-2",
              isOver && "drop-zone rounded-lg"
            )}
            data-testid="wins-container"
          >
            {wins.map((win, index) => (
              <div
                key={win.id}
                className={cn(
                  "flex-shrink-0 w-64 rounded-lg p-4 cursor-move border",
                  getWinColor(index)
                )}
                data-testid={`win-card-${win.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium" data-testid={`win-title-${win.id}`}>
                    {win.title}
                  </h4>
                  {getWinIcon(index)}
                </div>
                <p className="text-sm text-muted-foreground mb-3" data-testid={`win-description-${win.id}`}>
                  {win.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground" data-testid={`win-date-${win.id}`}>
                    {win.completedAt ? formatDistanceToNow(win.completedAt, { addSuffix: true }) : "Recently"}
                  </span>
                  <div className="flex items-center space-x-1">
                    <div 
                      className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium"
                      data-testid={`win-achiever-${win.id}`}
                    >
                      {win.assignee}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-primary p-1"
                      onClick={() => onCommentClick(win)}
                      data-testid={`button-win-heart-${win.id}`}
                    >
                      <Heart size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Drop Zone Indicator */}
            <div className={cn(
              "flex-shrink-0 w-64 border-2 border-dashed border-muted rounded-lg p-4 flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors min-h-[120px]",
              isOver && "border-primary text-primary"
            )} data-testid="wins-drop-zone">
              <div className="text-center">
                <Trophy size={32} className="mx-auto mb-2" />
                <p className="text-sm">Drop goals here to celebrate wins!</p>
              </div>
            </div>
          </div>
        )}
        
        {isMinimized && (
          <div 
            ref={setNodeRef}
            className={cn(
              "text-center py-4 text-muted-foreground",
              isOver && "drop-zone rounded-lg"
            )}
            data-testid="wins-minimized"
          >
            <p className="text-sm">Drop goals here to celebrate wins!</p>
          </div>
        )}
      </div>
    </div>
  );
}