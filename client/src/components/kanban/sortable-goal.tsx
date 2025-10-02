import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GripVertical, MessageCircle } from "lucide-react";
import type { Goal } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SortableGoalProps {
  goal: Goal;
  commentCount: number;
  onCommentClick: (goal: Goal) => void;
  isDragging?: boolean;
}

export function SortableGoal({ goal, commentCount, onCommentClick, isDragging = false }: SortableGoalProps) {
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
      {...listeners}
      className={cn(
        "bg-card rounded-lg p-4 border border-border hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing",
        (isDragging || isSortableDragging) && "opacity-50 shadow-lg"
      )}
      data-testid={`goal-${goal.id}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-card-foreground flex-1" data-testid={`goal-title-${goal.id}`}>
          {goal.title}
        </h4>
        <div 
          className="text-muted-foreground p-1 hover:bg-secondary/50 rounded"
          data-testid={`drag-handle-${goal.id}`}
        >
          <GripVertical size={12} />
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3" data-testid={`goal-description-${goal.id}`}>
        {goal.description}
      </p>
      
      <div className="flex items-center justify-between">
        <Badge variant="secondary" data-testid={`goal-type-${goal.id}`}>
          {goal.goalType === "short-term" ? "Short-term" : "Long-term"}
        </Badge>
        <div 
          className="text-muted-foreground hover:text-foreground hover:bg-primary/10 p-1 rounded cursor-pointer flex items-center space-x-1"
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onCommentClick(goal);
          }}
          data-testid={`button-comment-${goal.id}`}
          title={`${commentCount} comment${commentCount !== 1 ? 's' : ''}`}
        >
          <MessageCircle size={12} />
          {commentCount > 0 && (
            <span className="text-xs font-medium text-primary" data-testid={`comment-count-${goal.id}`}>
              {commentCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
