import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GripVertical, MessageCircle, Pencil, Trash2 } from "lucide-react";
import type { Goal } from "@shared/schema";
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


  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "bg-card rounded-lg p-4 border border-border hover:shadow-md transition-shadow",
        (isDragging || isSortableDragging) && "opacity-50 shadow-lg"
      )}
      data-testid={`goal-${goal.id}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 
          className="font-medium text-card-foreground flex-1 cursor-grab active:cursor-grabbing"
          {...listeners}
          data-testid={`goal-title-${goal.id}`}
        >
          {goal.title}
        </h4>
        <div 
          className="flex items-center space-x-1"
        >
          {onEditClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onEditClick(goal);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 p-1.5 rounded transition-colors"
              data-testid={`button-edit-goal-${goal.id}`}
              title="Edit goal"
              type="button"
            >
              <Pencil size={14} />
            </button>
          )}
          {onDeleteClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (window.confirm(`Are you sure you want to delete "${goal.title}"?`)) {
                  onDeleteClick(goal);
                }
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors"
              data-testid={`button-delete-goal-${goal.id}`}
              title="Delete goal"
              type="button"
            >
              <Trash2 size={14} />
            </button>
          )}
          <div 
            className="text-muted-foreground p-1 hover:bg-secondary/50 rounded cursor-grab active:cursor-grabbing"
            {...listeners}
            data-testid={`drag-handle-${goal.id}`}
          >
            <GripVertical size={12} />
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3" data-testid={`goal-description-${goal.id}`}>
        {goal.description}
      </p>
      
      <div className="flex items-center justify-between">
        <Badge variant="secondary" data-testid={`goal-type-${goal.id}`}>
          {goal.goalType === "short-term" ? "Short-term" : "Long-term"}
        </Badge>
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
  );
}
