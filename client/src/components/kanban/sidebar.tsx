import { Trophy, Rocket, Plus, Columns, Trash2, Edit, Check, X, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useKanban } from "@/hooks/use-kanban";
import { useLocation } from "wouter";
import type { Column } from "@shared/schema";

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { boards, columns, createBoard, updateBoard, deleteBoard, updateColumn, deleteColumn, currentBoardId, setCurrentBoardId } = useKanban();
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [hoveredBoardId, setHoveredBoardId] = useState<string | null>(null);
  const [isManageColumnsOpen, setIsManageColumnsOpen] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editBoardTitle, setEditBoardTitle] = useState("");
  const [editBoardDescription, setEditBoardDescription] = useState("");

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      await createBoard.mutateAsync({
        title: newBoardTitle.trim(),
        description: newBoardDescription.trim() || undefined,
      });
      setNewBoardTitle("");
      setNewBoardDescription("");
      setIsCreatingBoard(false);
    } catch (error) {
      console.error("Failed to create board:", error);
    }
  };

  const handleStartEditBoard = (board: { id: string; title: string; description: string | null }) => {
    setEditingBoardId(board.id);
    setEditBoardTitle(board.title);
    setEditBoardDescription(board.description || "");
  };

  const handleCancelEditBoard = () => {
    setEditingBoardId(null);
    setEditBoardTitle("");
    setEditBoardDescription("");
  };

  const handleSaveEditBoard = async (boardId: string) => {
    if (!editBoardTitle.trim()) return;

    try {
      await updateBoard.mutateAsync({
        id: boardId,
        title: editBoardTitle.trim(),
        description: editBoardDescription.trim() || null,
      });
      handleCancelEditBoard();
    } catch (error) {
      console.error("Failed to update board:", error);
    }
  };

  const handleDeleteBoard = async (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this board? This action cannot be undone.")) {
      try {
        await deleteBoard.mutateAsync(boardId);
      } catch (error) {
        console.error("Failed to delete board:", error);
      }
    }
  };

  const handleDeleteColumn = (column: Column) => {
    if (window.confirm(`Are you sure you want to delete "${column.title}"? This will also delete all goals in this column.`)) {
      deleteColumn.mutate(column.id);
    }
  };

  const handleStartEdit = (column: Column) => {
    setEditingColumnId(column.id);
    setEditTitle(column.title);
    setEditColor(column.color || "#3B82F6");
  };

  const handleCancelEdit = () => {
    setEditingColumnId(null);
    setEditTitle("");
    setEditColor("");
  };

  const handleSaveEdit = async (columnId: string) => {
    if (!editTitle.trim()) return;

    try {
      await updateColumn.mutateAsync({
        id: columnId,
        title: editTitle.trim(),
        color: editColor,
      });
      handleCancelEdit();
    } catch (error) {
      console.error("Failed to update column:", error);
    }
  };

  const colorOptions = [
    { name: "Indigo", value: "#6366F1" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Pink", value: "#EC4899" },
    { name: "Red", value: "#EF4444" },
    { name: "Orange", value: "#F97316" },
    { name: "Yellow", value: "#EAB308" },
    { name: "Green", value: "#22C55E" },
    { name: "Blue", value: "#3B82F6" },
    { name: "Teal", value: "#14B8A6" },
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground mb-2" data-testid="title-goals-board">
          <Trophy className="text-primary mr-2 inline-block" size={20} />
          Goals Board
        </h1>
        <p className="text-sm text-muted-foreground" data-testid="text-subtitle">Track your personal goals</p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide" data-testid="text-all-boards">
            All Boards ({boards?.length || 0})
          </h3>
          <div className="space-y-2">
            {boards?.map((board) => (
              <div 
                key={board.id}
                className={`${
                  board.id === currentBoardId
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                } rounded-lg p-3 font-medium transition-colors group relative`}
                data-testid={`board-${board.id}`}
                onMouseEnter={() => setHoveredBoardId(board.id)}
                onMouseLeave={() => setHoveredBoardId(null)}
              >
                {editingBoardId === board.id ? (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      value={editBoardTitle}
                      onChange={(e) => setEditBoardTitle(e.target.value)}
                      placeholder="Board title"
                      className="w-full text-sm"
                      autoFocus
                      data-testid={`edit-board-title-${board.id}`}
                    />
                    <Input
                      type="text"
                      value={editBoardDescription}
                      onChange={(e) => setEditBoardDescription(e.target.value)}
                      placeholder="Description (optional)"
                      className="w-full text-sm"
                      data-testid={`edit-board-description-${board.id}`}
                    />
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEditBoard}
                        data-testid={`cancel-edit-board-${board.id}`}
                      >
                        <X size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveEditBoard(board.id)}
                        disabled={!editBoardTitle.trim() || updateBoard.isPending}
                        data-testid={`save-edit-board-${board.id}`}
                      >
                        <Check size={14} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center cursor-pointer" onClick={() => setCurrentBoardId(board.id)}>
                    <Rocket className="mr-3" size={16} />
                    <span className="flex-1">{board.title}</span>
                    {hoveredBoardId === board.id && (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-70 hover:opacity-100 text-foreground hover:bg-secondary/50 p-1 h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditBoard(board);
                          }}
                          data-testid={`edit-board-${board.id}`}
                        >
                          <Edit size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-70 hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 p-1 h-6 w-6"
                          onClick={(e) => handleDeleteBoard(board.id, e)}
                          data-testid={`delete-board-${board.id}`}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {isCreatingBoard ? (
              <form onSubmit={handleCreateBoard} className="space-y-2">
                <input
                  type="text"
                  placeholder="Board title"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="flex-1"
                    disabled={!newBoardTitle.trim() || createBoard.isPending}
                  >
                    {createBoard.isPending ? "Creating..." : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCreatingBoard(false);
                      setNewBoardTitle("");
                      setNewBoardDescription("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div 
                className="text-primary hover:bg-primary/10 rounded-lg p-3 cursor-pointer transition-colors flex items-center border border-dashed border-primary/50" 
                data-testid="button-create-new-board"
                onClick={() => setIsCreatingBoard(true)}
              >
                <Plus className="mr-3" size={16} />
                Create New Board
              </div>
            )}
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
              data-testid="button-manage-columns"
              onClick={() => setIsManageColumnsOpen(true)}
            >
              <Columns className="mr-3" size={16} />
              Manage Columns
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              data-testid="button-statistics"
              onClick={() => setLocation("/statistics")}
            >
              <BarChart3 className="mr-3" size={16} />
              Statistics
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isManageColumnsOpen} onOpenChange={(open) => {
        setIsManageColumnsOpen(open);
        if (!open) {
          handleCancelEdit();
        }
      }}>
        <DialogContent className="w-full max-w-md mx-4" data-testid="manage-columns-modal">
          <DialogHeader>
            <DialogTitle data-testid="modal-title">Manage Columns</DialogTitle>
            <p className="text-sm text-muted-foreground" data-testid="modal-subtitle">
              View and manage your board columns
            </p>
          </DialogHeader>
          
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {columns && columns.length > 0 ? (
              columns.map((column) => (
                <div
                  key={column.id}
                  className="p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                  data-testid={`column-item-${column.id}`}
                >
                  {editingColumnId === column.id ? (
                    <div className="space-y-3">
                      <div>
                        <Input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Column title"
                          className="w-full"
                          autoFocus
                          data-testid={`edit-title-${column.id}`}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground mb-2">Color</p>
                        <div className="grid grid-cols-5 gap-2">
                          {colorOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setEditColor(option.value)}
                              className={`w-6 h-6 rounded-full border-2 transition-all ${
                                editColor === option.value
                                  ? "border-foreground scale-110"
                                  : "border-border hover:scale-105"
                              }`}
                              style={{ backgroundColor: option.value }}
                              data-testid={`edit-color-${option.name.toLowerCase()}-${column.id}`}
                              title={option.name}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          data-testid={`cancel-edit-${column.id}`}
                        >
                          <X size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveEdit(column.id)}
                          disabled={!editTitle.trim() || updateColumn.isPending}
                          data-testid={`save-edit-${column.id}`}
                        >
                          <Check size={14} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: column.color || "#3B82F6" }}
                        />
                        <span className="font-medium text-foreground">{column.title}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => handleStartEdit(column)}
                          data-testid={`edit-column-${column.id}`}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteColumn(column)}
                          data-testid={`delete-column-${column.id}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground" data-testid="no-columns-message">
                <Columns className="mx-auto mb-2 opacity-50" size={24} />
                <p>No columns found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
