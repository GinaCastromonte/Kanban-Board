import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { InsertGoal } from "@shared/schema";
import { cn } from "@/lib/utils";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: Omit<InsertGoal, "boardId" | "columnId" | "position">) => void;
  isLoading?: boolean;
}

export function GoalModal({ isOpen, onClose, onSubmit, isLoading = false }: GoalModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<"short-term" | "long-term">("short-term");
  const [assignee, setAssignee] = useState("JD");
  const [totalSubtasks, setTotalSubtasks] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      goalType,
      assignee,
      totalSubtasks,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setGoalType("short-term");
    setAssignee("JD");
    setTotalSubtasks(1);
    onClose();
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setGoalType("short-term");
    setAssignee("JD");
    setTotalSubtasks(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md mx-4" data-testid="goal-modal">
        <DialogHeader>
          <DialogTitle data-testid="modal-title">Create New Goal</DialogTitle>
          <p className="text-sm text-muted-foreground" data-testid="modal-subtitle">
            Add a new goal to track your progress
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
                  assignee === "JD" 
                    ? "bg-primary/20 text-primary hover:bg-primary/30" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
                onClick={() => setAssignee("JD")}
                data-testid="badge-assignee-jd"
              >
                JD
              </Badge>
              <Badge
                className={cn(
                  "cursor-pointer transition-colors",
                  assignee === "SM" 
                    ? "bg-primary/20 text-primary hover:bg-primary/30" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
                onClick={() => setAssignee("SM")}
                data-testid="badge-assignee-sm"
              >
                SM
              </Badge>
            </div>
          </div>

          <div>
            <Label htmlFor="subtasks" className="block text-sm font-medium text-foreground mb-2">
              Number of Subtasks
            </Label>
            <Input
              id="subtasks"
              type="number"
              min="1"
              max="50"
              value={totalSubtasks}
              onChange={(e) => setTotalSubtasks(parseInt(e.target.value) || 1)}
              className="w-full"
              data-testid="input-total-subtasks"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
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
              data-testid="button-create-goal"
            >
              {isLoading ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
