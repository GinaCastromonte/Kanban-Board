import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GripVertical, MessageCircle, Check } from "lucide-react";
import type { Goal } from "@shared/schema";
import { cn } from "@/lib/utils";

interface StickyNoteProps {
  goal: Goal;
  onCommentClick: (goal: Goal) => void;
  isDragging?: boolean;
}

export function StickyNote({ goal, onCommentClick, isDragging = false }: StickyNoteProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCompleted = goal.columnId === "col3" || goal.isWin === 1;
  const progressPercentage = goal.totalSubtasks > 0 ? (goal.completedSubtasks / goal.totalSubtasks) * 100 : 0;

  const getGoalTypeStyle = (type: string) => {
    return type === "short-term" 
      ? "bg-gradient-to-r from-accent/20 to-accent/30 text-accent border border-accent/30" 
      : "bg-gradient-to-r from-purple-500/20 to-pink-500/30 text-purple-400 border border-purple-400/30";
  };

  const getAssigneeStyle = (assignee: string) => {
    return assignee === "JD" 
      ? "bg-gradient-to-r from-primary/20 to-primary/30 text-primary border border-primary/30" 
      : "bg-gradient-to-r from-accent/20 to-accent/30 text-accent border border-accent/30";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "sticky-note rounded-lg p-4 card-hover cursor-move",
        (isDragging || isSortableDragging) && "dragging",
        isCompleted && "opacity-80"
      )}
      data-testid={`sticky-note-${goal.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className={cn(
          "font-medium text-card-foreground",
          isCompleted && "line-through"
        )} data-testid={`goal-title-${goal.id}`}>
          {goal.title}
        </h4>
        <div className="text-muted-foreground p-1" data-testid={`button-drag-${goal.id}`}>
          <GripVertical size={12} />
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3" data-testid={`goal-description-${goal.id}`}>
        {goal.description}
      </p>
      
      <div className="flex items-center justify-between mb-3">
        <Badge 
          className={getGoalTypeStyle(goal.goalType)}
          data-testid={`goal-type-${goal.id}`}
        >
          {goal.goalType === "short-term" ? "Short-term" : "Long-term"}
        </Badge>
        <div className="text-xs text-muted-foreground" data-testid={`goal-progress-${goal.id}`}>
          {isCompleted ? (
            <span className="text-primary font-medium flex items-center">
              <Check size={12} className="mr-1" />
              Completed
            </span>
          ) : (
            <span>{goal.completedSubtasks} of {goal.totalSubtasks} subtasks</span>
          )}
        </div>
      </div>

      {!isCompleted && progressPercentage > 0 && (
        <Progress 
          value={progressPercentage} 
          className="mb-3" 
          data-testid={`progress-bar-${goal.id}`}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div 
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
              getAssigneeStyle(goal.assignee)
            )}
            data-testid={`assignee-${goal.id}`}
          >
            {goal.assignee}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground p-1"
            onClick={() => onCommentClick(goal)}
            data-testid={`button-comment-${goal.id}`}
          >
            <MessageCircle size={12} />
          </Button>
          {isCompleted && (
            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center" data-testid={`check-mark-${goal.id}`}>
              <Check size={10} className="text-primary-foreground" />
            </div>
          )}
        </div>
        
        {goal.columnId === "col2" && (
          <div className="pulse-animation" data-testid={`pulse-indicator-${goal.id}`}>
            <div className="w-2 h-2 bg-primary rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
