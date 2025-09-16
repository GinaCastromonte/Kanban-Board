import { Trophy, Rocket, Plus, StickyNote, Columns, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useKanban } from "@/hooks/use-kanban";

export function Sidebar() {
  const { boards, createBoard, deleteBoard, currentBoardId, setCurrentBoardId } = useKanban();
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [hoveredBoardId, setHoveredBoardId] = useState<string | null>(null);

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
                } rounded-lg p-3 font-medium flex items-center transition-colors cursor-pointer group relative`}
                data-testid={`board-${board.id}`}
                onClick={() => setCurrentBoardId(board.id)}
                onMouseEnter={() => setHoveredBoardId(board.id)}
                onMouseLeave={() => setHoveredBoardId(null)}
              >
                <Rocket className="mr-3" size={16} />
                <span className="flex-1">{board.title}</span>
                {hoveredBoardId === board.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-70 hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 p-1 h-6 w-6"
                    onClick={(e) => handleDeleteBoard(board.id, e)}
                    data-testid={`delete-board-${board.id}`}
                  >
                    <Trash2 size={12} />
                  </Button>
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
    </div>
  );
}
