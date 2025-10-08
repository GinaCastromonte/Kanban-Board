import { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners, rectIntersection, pointerWithin } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { KanbanColumn } from "./kanban-column";
import { WinsSection } from "./wins-section";
import { SortableGoal } from "./sortable-goal";
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
    commentCounts,
    currentBoardId,
    isLoading,
    moveGoal,
    createGoal,
    createColumn,
    deleteColumn,
    updateGoal,
    deleteGoal
  } = useKanban();

  const currentBoard = boards?.find(board => board.id === currentBoardId);
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

    // Check if dropping on another goal (reordering within column)
    const overGoal = boardGoals.find(g => g.id === overId);
    if (overGoal) {
      const sourceGoal = boardGoals.find(g => g.id === goalId);
      if (sourceGoal && sourceGoal.columnId === overGoal.columnId) {
        // Reordering within the same column
        const columnGoals = boardGoals
          .filter(goal => goal.columnId === overGoal.columnId)
          .sort((a, b) => a.position - b.position);
        
        const overIndex = columnGoals.findIndex(g => g.id === overId);
        const sourceIndex = columnGoals.findIndex(g => g.id === goalId);
        
        if (sourceIndex !== overIndex) {
          moveGoal.mutate({
            goalId,
            targetColumnId: overGoal.columnId || undefined,
            targetPosition: overIndex,
            isWin: false
          });
        }
      } else if (sourceGoal) {
        // Moving to a different column
        const targetColumnGoals = boardGoals
          .filter(goal => goal.columnId === overGoal.columnId)
          .sort((a, b) => a.position - b.position);
        
        const overIndex = targetColumnGoals.findIndex(g => g.id === overId);
        moveGoal.mutate({
          goalId,
          targetColumnId: overGoal.columnId || undefined,
          targetPosition: overIndex,
          isWin: false
        });
      }
      return;
    }

    // Check if dropping in a column (empty column)
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
    console.log("🎯 handleCommentClick called with goal:", goal);
    setSelectedGoal(goal);
    setIsCommentModalOpen(true);
    console.log("🎯 Modal state updated - should open now");
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
      collisionDetection={pointerWithin}
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
            {boardColumns.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-80">
                <KanbanColumn
                  column={column}
                  goals={boardGoals.filter(goal => goal.columnId === column.id)}
                  commentCounts={commentCounts}
                  onCommentClick={handleCommentClick}
                  onCreateGoal={() => setIsGoalModalOpen(true)}
                  onDeleteColumn={(columnId) => deleteColumn.mutate(columnId)}
                />
              </div>
            ))}
            
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
            <SortableGoal 
              goal={draggedGoal} 
              commentCount={commentCounts[draggedGoal.id] || 0}
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
