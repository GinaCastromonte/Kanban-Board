import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus } from "lucide-react";
import { StickyNote } from "./sticky-note";
import type { Column, Goal } from "@shared/schema";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  column: Column;
  goals: Goal[];
  onCommentClick: (goal: Goal) => void;
  onCreateGoal: () => void;
}

export function KanbanColumn({ column, goals, onCommentClick, onCreateGoal }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const getColumnColor = (title: string) => {
    switch (title.toLowerCase()) {
      case "todo":
        return "bg-gradient-to-r from-blue-500 to-purple-500";
      case "doing":
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "done":
        return "bg-gradient-to-r from-primary to-accent";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "bg-card rounded-lg border border-border p-4 flex flex-col",
        isOver && "drop-zone"
      )}
      data-testid={`column-${column.title.toLowerCase()}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={cn("w-3 h-3 rounded-full", getColumnColor(column.title))} />
          <h3 className="font-semibold text-lg bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent" data-testid={`title-${column.title.toLowerCase()}`}>
            {column.title}
          </h3>
          <Badge variant="secondary" data-testid={`count-${column.title.toLowerCase()}`}>
            {goals.length}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" data-testid={`button-column-menu-${column.title.toLowerCase()}`}>
          <MoreHorizontal size={16} />
        </Button>
      </div>

      <div className="space-y-3 flex-1">
        <SortableContext items={goals.map(goal => goal.id)} strategy={verticalListSortingStrategy}>
          {goals.map((goal) => (
            <StickyNote
              key={goal.id}
              goal={goal}
              onCommentClick={onCommentClick}
            />
          ))}
        </SortableContext>

        <Button
          variant="outline"
          className="border-2 border-dashed border-muted text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors flex items-center justify-center space-x-2 min-h-[100px]"
          onClick={onCreateGoal}
          data-testid={`button-add-goal-${column.title.toLowerCase()}`}
        >
          <Plus size={16} />
          <span>Add new goal</span>
        </Button>
      </div>
    </div>
  );
}
