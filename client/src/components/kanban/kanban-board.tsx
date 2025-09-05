import { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { KanbanColumn } from "./kanban-column";
import { WinsSection } from "./wins-section";
import { StickyNote } from "./sticky-note";
import { GoalModal } from "./goal-modal";
import { CommentModal } from "./comment-modal";
import { ColumnModal } from "./column-modal";
import { useKanban } from "@/hooks/use-kanban";
import type { Goal } from "@shared/schema";

export function KanbanBoard() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedGoal, setDraggedGoal] = useState<Goal | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

  const {
    boards,
    columns,
    goals,
    wins,
    isLoading,
    moveGoal,
    createGoal,
    createColumn,
    updateGoal,
    deleteGoal
  } = useKanban();

  const currentBoard = boards?.[0];
  const boardColumns = columns || [];
  const boardGoals = goals || [];
  const boardWins = wins || [];

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id as string);
    
    const goal = boardGoals.find(g => g.id === active.id) || boardWins.find(w => w.id === active.id);
    setDraggedGoal(goal || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setDraggedGoal(null);

    if (!over) return;

    const goalId = active.id as string;
    const overId = over.id as string;

    // Check if dropping in wins section
    if (overId === "wins") {
      moveGoal.mutate({
        goalId,
        targetPosition: boardWins.length,
        isWin: true
      });
      return;
    }

    // Check if dropping in a column
    const targetColumn = boardColumns.find(col => col.id === overId);
    if (targetColumn) {
      const columnGoals = boardGoals.filter(goal => goal.columnId === targetColumn.id);
      moveGoal.mutate({
        goalId,
        targetColumnId: targetColumn.id,
        targetPosition: columnGoals.length,
        isWin: false
      });
    }
  }

  function handleCommentClick(goal: Goal) {
    setSelectedGoal(goal);
    setIsCommentModalOpen(true);
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 flex flex-col overflow-hidden" data-testid="kanban-board">
        <div className="flex-1 p-6 overflow-x-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground" data-testid="title-board-name">
                {currentBoard?.title || "Personal Goals Board"}
              </h2>
              <p className="text-muted-foreground" data-testid="text-board-description">
                {currentBoard?.description || "Organize and track your short-term and long-term goals"}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setIsGoalModalOpen(true)}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 shadow-lg transition-all duration-300"
                data-testid="button-add-goal"
              >
                <Plus size={16} className="mr-2" />
                Add Goal
              </Button>
              <Button variant="secondary" data-testid="button-filter">
                <Filter size={16} className="mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="flex gap-6 h-full min-h-[600px] overflow-x-auto pb-4">
            <SortableContext items={boardColumns.map(col => col.id)} strategy={horizontalListSortingStrategy}>
              {boardColumns.map((column) => (
                <div key={column.id} className="flex-shrink-0 w-80">
                  <KanbanColumn
                    column={column}
                    goals={boardGoals.filter(goal => goal.columnId === column.id)}
                    onCommentClick={handleCommentClick}
                    onCreateGoal={() => setIsGoalModalOpen(true)}
                  />
                </div>
              ))}
            </SortableContext>
            
            {/* Add Column Button */}
            <div className="flex-shrink-0 w-80">
              <button
                onClick={() => setIsColumnModalOpen(true)}
                className="w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors bg-card/50"
                data-testid="button-add-column"
              >
                <Plus size={24} className="mb-2" />
                <span className="text-sm font-medium">Add Column</span>
              </button>
            </div>
          </div>
        </div>

        <WinsSection wins={boardWins} onCommentClick={handleCommentClick} />

        <DragOverlay>
          {activeId && draggedGoal ? (
            <StickyNote 
              goal={draggedGoal} 
              onCommentClick={handleCommentClick}
              isDragging 
            />
          ) : null}
        </DragOverlay>

        <GoalModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          onSubmit={(goalData) => {
            if (currentBoard && boardColumns.length > 0) {
              createGoal.mutate({
                ...goalData,
                boardId: currentBoard.id,
                columnId: boardColumns[0].id,
                position: boardGoals.filter(g => g.columnId === boardColumns[0].id).length
              });
            }
          }}
          isLoading={createGoal.isPending}
        />

        <CommentModal
          isOpen={isCommentModalOpen}
          goal={selectedGoal}
          onClose={() => {
            setIsCommentModalOpen(false);
            setSelectedGoal(null);
          }}
        />

        <ColumnModal
          isOpen={isColumnModalOpen}
          onClose={() => setIsColumnModalOpen(false)}
          onSubmit={(columnData) => {
            if (currentBoard) {
              createColumn.mutate({
                ...columnData,
                boardId: currentBoard.id,
                position: boardColumns.length,
              });
            }
          }}
          isLoading={createColumn.isPending}
        />
      </div>
    </DndContext>
  );
}
