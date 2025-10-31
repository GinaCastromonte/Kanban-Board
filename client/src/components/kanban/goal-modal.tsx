import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Check } from "lucide-react";
import { useKanban } from "@/hooks/use-kanban";
import { apiRequest } from "@/lib/queryClient";
import type { InsertGoal, Goal, UpdateGoal, Subtask } from "@shared/schema";
import { cn } from "@/lib/utils";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: Omit<InsertGoal, "boardId" | "columnId" | "position">) => void;
  onUpdate?: (goal: UpdateGoal & { id: string }) => void;
  goal?: Goal | null;
  isLoading?: boolean;
}

export function GoalModal({ isOpen, onClose, onSubmit, onUpdate, goal, isLoading = false }: GoalModalProps) {
  const { createSubtask, updateSubtask, deleteSubtask } = useKanban();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<"short-term" | "long-term">("short-term");
  const [assignee, setAssignee] = useState("GC");
  const [totalSubtasks, setTotalSubtasks] = useState(1);
  const [dueDate, setDueDate] = useState<string>("");
  const [isJointGoal, setIsJointGoal] = useState(false);
  const [sharedWith, setSharedWith] = useState<string>("SK");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const isEditMode = !!goal && !!onUpdate;

  useEffect(() => {
    if (goal && isOpen) {
      setTitle(goal.title || "");
      setDescription(goal.description || "");
      setGoalType((goal.goalType === "long-term" ? "long-term" : "short-term"));
      setAssignee(goal.assignee || "GC");
      setTotalSubtasks(goal.totalSubtasks || 1);
      setDueDate(goal.dueDate ? (() => {
        try {
          const dateStr = typeof goal.dueDate === 'string' ? goal.dueDate : goal.dueDate;
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            return "";
          }
          return date.toISOString().split('T')[0];
        } catch {
          return "";
        }
      })() : "");
      setIsJointGoal(goal.isJointGoal === 1);
      setSharedWith(goal.sharedWith || "SK");
      
      fetchSubtasks(goal.id);
    } else if (!goal && isOpen) {
      setTitle("");
      setDescription("");
      setGoalType("short-term");
      setAssignee("GC");
      setTotalSubtasks(1);
      setDueDate("");
      setIsJointGoal(false);
      setSharedWith("SK");
      setSubtasks([]);
      setNewSubtaskTitle("");
    }
  }, [goal, isOpen]);

  const fetchSubtasks = async (goalId: string) => {
    try {
      const response = await apiRequest("GET", `/api/goals/${goalId}/subtasks`);
      if (!response.ok) {
        setSubtasks([]);
        return;
      }
      const data = await response.json();
      setSubtasks(Array.isArray(data) ? data : []);
    } catch (error) {
      setSubtasks([]);
    }
  };

  const handleAddSubtask = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const subtaskTitle = newSubtaskTitle.trim();
    if (!subtaskTitle || !goal || !createSubtask) {
      return;
    }
    
    try {
      await createSubtask.mutateAsync({
        goalId: goal.id,
        title: subtaskTitle,
        position: subtasks.length,
      });
      setNewSubtaskTitle("");
      await fetchSubtasks(goal.id);
    } catch (error) {
      console.error("Failed to add subtask:", error);
    }
  };

  const handleToggleSubtask = async (subtask: Subtask) => {
    if (!goal || !updateSubtask) return;
    
    try {
      await updateSubtask.mutateAsync({
        id: subtask.id,
        completed: subtask.completed === 1 ? 0 : 1,
      });
      await fetchSubtasks(goal.id);
    } catch (error) {
      console.error("Failed to toggle subtask:", error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!goal || !deleteSubtask) return;
    
    try {
      await deleteSubtask.mutateAsync(subtaskId);
      await fetchSubtasks(goal.id);
    } catch (error) {
      console.error("Failed to delete subtask:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    if (isEditMode && goal && onUpdate) {
      onUpdate({
        id: goal.id,
        title: title.trim(),
        description: description.trim() || undefined,
        goalType,
        totalSubtasks,
        dueDate: dueDate ? new Date(dueDate + 'T00:00:00').toISOString() : undefined,
        isJointGoal: isJointGoal ? 1 : 0,
        sharedWith: isJointGoal ? sharedWith : undefined,
      });
    } else {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        goalType,
        assignee,
        totalSubtasks: 0,
        dueDate: dueDate ? new Date(dueDate + 'T00:00:00').toISOString() : undefined,
        isJointGoal: isJointGoal ? 1 : 0,
        sharedWith: isJointGoal ? sharedWith : undefined,
      });
    }

    setTitle("");
    setDescription("");
    setGoalType("short-term");
    setAssignee("GC");
    setTotalSubtasks(1);
    setDueDate("");
    setIsJointGoal(false);
    setSharedWith("SK");
    setSubtasks([]);
    setNewSubtaskTitle("");
    onClose();
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setGoalType("short-term");
    setAssignee("GC");
    setTotalSubtasks(1);
    setDueDate("");
    setIsJointGoal(false);
    setSharedWith("SK");
    setSubtasks([]);
    setNewSubtaskTitle("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md max-h-[90vh] mx-4 flex flex-col" data-testid="goal-modal">
        <DialogHeader>
          <DialogTitle data-testid="modal-title">
            {isEditMode ? "Edit Goal" : "Create New Goal"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground" data-testid="modal-subtitle">
            {isEditMode ? "Update your goal details" : "Add a new goal to track your progress"}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 min-h-0">
          <div>
            <Label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
              Goal Title
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your goal title..."
              className="w-full"
              data-testid="input-goal-title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your goal..."
              className="w-full h-24 resize-none"
              data-testid="textarea-goal-description"
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Goal Type
            </Label>
            <div className="flex space-x-2">
              <Badge
                className={cn(
                  "cursor-pointer transition-colors",
                  goalType === "short-term" 
                    ? "bg-accent/20 text-accent hover:bg-accent/30" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
                onClick={() => setGoalType("short-term")}
                data-testid="badge-short-term"
              >
                Short-term
              </Badge>
              <Badge
                className={cn(
                  "cursor-pointer transition-colors",
                  goalType === "long-term" 
                    ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
                onClick={() => setGoalType("long-term")}
                data-testid="badge-long-term"
              >
                Long-term
              </Badge>
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Assign To
            </Label>
            <div className="flex space-x-2">
              <Badge
                className={cn(
                  "cursor-pointer transition-colors",
                  assignee === "GC" 
                    ? "bg-primary/20 text-primary hover:bg-primary/30" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
                onClick={() => setAssignee("GC")}
                data-testid="badge-assignee-gc"
              >
                GC
              </Badge>
              <Badge
                className={cn(
                  "cursor-pointer transition-colors",
                  assignee === "SK" 
                    ? "bg-primary/20 text-primary hover:bg-primary/30" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
                onClick={() => setAssignee("SK")}
                data-testid="badge-assignee-sk"
              >
                SK
              </Badge>
            </div>
          </div>

          {goal && (
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Subtasks
              </Label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={subtask.completed === 1}
                      onChange={() => handleToggleSubtask(subtask)}
                      className="rounded border-border"
                      data-testid={`subtask-checkbox-${subtask.id}`}
                    />
                    <span 
                      className={cn(
                        "flex-1 text-sm",
                        subtask.completed === 1 && "line-through text-muted-foreground"
                      )}
                    >
                      {subtask.title}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      data-testid={`delete-subtask-${subtask.id}`}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center space-x-2 pt-2 border-t border-border">
                  <Input
                    type="text"
                    placeholder="Add subtask (e.g., 'Finish module 1')"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                    className="flex-1 text-sm"
                    data-testid="input-new-subtask"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddSubtask(e);
                    }}
                    disabled={!newSubtaskTitle.trim() || (createSubtask?.isPending ?? false)}
                    data-testid="button-add-subtask"
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
              {subtasks.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {subtasks.filter(s => s.completed === 1).length} of {subtasks.length} completed
                </p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="dueDate" className="block text-sm font-medium text-foreground mb-2">
              Due Date (Optional)
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full"
              data-testid="input-due-date"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isJointGoal"
              checked={isJointGoal}
              onChange={(e) => setIsJointGoal(e.target.checked)}
              className="rounded border-border"
              data-testid="checkbox-joint-goal"
            />
            <Label htmlFor="isJointGoal" className="text-sm font-medium text-foreground cursor-pointer">
              This is a joint goal with my friend
            </Label>
          </div>

          {isJointGoal && (
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Shared With
              </Label>
              <div className="flex space-x-2">
                <Badge
                  className={cn(
                    "cursor-pointer transition-colors",
                    sharedWith === "SK" 
                      ? "bg-primary/20 text-primary hover:bg-primary/30" 
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                  onClick={() => setSharedWith("SK")}
                  data-testid="badge-shared-sk"
                >
                  SK
                </Badge>
                {assignee === "GC" && (
                  <Badge
                    className={cn(
                      "cursor-pointer transition-colors",
                      sharedWith === "GC" 
                        ? "bg-primary/20 text-primary hover:bg-primary/30" 
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                    onClick={() => setSharedWith("GC")}
                    data-testid="badge-shared-gc"
                  >
                    GC
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4 flex-shrink-0">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !title.trim()}
              data-testid={isEditMode ? "button-update-goal" : "button-create-goal"}
            >
              {isLoading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Goal" : "Create Goal")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
