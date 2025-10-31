import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GripVertical, MessageCircle, Pencil, Trash2, Calendar, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Goal, Subtask } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SortableGoalProps {
  goal: Goal;
  commentCount: number;
  onCommentClick: (goal: Goal) => void;
  onEditClick?: (goal: Goal) => void;
  onDeleteClick?: (goal: Goal) => void;
  isDragging?: boolean;
}

export function SortableGoal({ goal, commentCount, onCommentClick, onEditClick, onDeleteClick, isDragging = false }: SortableGoalProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: goal.id,
    disabled: false
  });

  const { data: subtasks } = useQuery({
    queryKey: ["/api/goals", goal.id, "subtasks"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/goals/${goal.id}/subtasks`);
      return response.json();
    },
    enabled: !!goal.id,
  });

  const allSubtasks = (subtasks as Subtask[]) || [];
  const completedSubtasks = allSubtasks.filter(s => s.completed === 1).length;
  const totalSubtasks = allSubtasks.length;
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const dueDateObj = goal.dueDate ? (() => {
    try {
      const dateStr = typeof goal.dueDate === 'string' ? goal.dueDate : String(goal.dueDate);
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return null;
      }
      const dateOnly = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      return new Date(dateOnly + 'T00:00:00');
    } catch {
      return null;
    }
  })() : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = dueDateObj && dueDateObj < today && goal.isWin === 0;
  const daysUntilDue = dueDateObj ? Math.ceil((dueDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-lg p-4 border-2 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing",
        goal.goalType === "long-term" 
          ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/50" 
          : "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/50",
        (isDragging || isSortableDragging) && "opacity-50 shadow-lg"
      )}
      data-testid={`goal-${goal.id}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 
          className="font-medium text-card-foreground flex-1"
          data-testid={`goal-title-${goal.id}`}
        >
          {goal.title}
        </h4>
        <div 
          className="flex items-center space-x-1"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {onEditClick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onEditClick(goal);
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 p-1.5 rounded transition-colors z-10 relative"
              data-testid={`button-edit-goal-${goal.id}`}
              title="Edit goal"
            >
              <Pencil size={14} />
            </button>
          )}
          {onDeleteClick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (window.confirm(`Are you sure you want to delete "${goal.title}"?`)) {
                  onDeleteClick(goal);
                }
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors z-10 relative"
              data-testid={`button-delete-goal-${goal.id}`}
              title="Delete goal"
            >
              <Trash2 size={14} />
            </button>
          )}
          <div 
            className="text-muted-foreground p-1 hover:bg-secondary/50 rounded"
            data-testid={`drag-handle-${goal.id}`}
          >
            <GripVertical size={12} />
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3" data-testid={`goal-description-${goal.id}`}>
        {goal.description}
      </p>

      {totalSubtasks > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">
              {completedSubtasks} of {totalSubtasks} subtasks
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}

      {goal.dueDate && (
        <div className={cn(
          "flex items-center space-x-1 mb-2 text-xs",
          isOverdue ? "text-destructive font-medium" : daysUntilDue !== null && daysUntilDue <= 7 ? "text-orange-500" : "text-muted-foreground"
        )}>
          <Calendar size={12} />
          <span>
            {isOverdue 
              ? `Overdue ${Math.abs(daysUntilDue || 0)} days`
              : daysUntilDue === 0 
                ? "Due today"
                : daysUntilDue === 1
                  ? "Due tomorrow"
                  : daysUntilDue !== null && daysUntilDue <= 7
                    ? `Due in ${daysUntilDue} days`
                    : `Due ${dueDateObj ? dueDateObj.toLocaleDateString() : ''}`
            }
          </span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" data-testid={`goal-type-${goal.id}`}>
            {goal.goalType === "short-term" ? "Short-term" : "Long-term"}
          </Badge>
          <span className="text-xs text-muted-foreground" data-testid={`goal-assignee-${goal.id}`}>
            {goal.assignee}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {goal.isJointGoal === 1 && (
            <Badge variant="outline" className="text-xs">
              Joint
            </Badge>
          )}
          <button
            className="text-muted-foreground hover:text-foreground hover:bg-primary/10 p-1 rounded transition-colors flex items-center space-x-1"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onCommentClick(goal);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            data-testid={`button-comment-${goal.id}`}
            title={`${commentCount} comment${commentCount !== 1 ? 's' : ''}`}
            type="button"
          >
            <MessageCircle size={12} />
            {commentCount > 0 && (
              <span className="text-xs font-medium text-primary" data-testid={`comment-count-${goal.id}`}>
                {commentCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
