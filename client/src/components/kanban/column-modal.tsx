import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InsertColumn } from "@shared/schema";

interface ColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (column: Omit<InsertColumn, "boardId" | "position">) => void;
  isLoading?: boolean;
}

export function ColumnModal({ isOpen, onClose, onSubmit, isLoading = false }: ColumnModalProps) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#6366F1");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      color,
    });

    // Reset form
    setTitle("");
    setColor("#6366F1");
    onClose();
  };

  const handleClose = () => {
    setTitle("");
    setColor("#6366F1");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md mx-4" data-testid="column-modal">
        <DialogHeader>
          <DialogTitle data-testid="modal-title">Create New Column</DialogTitle>
          <p className="text-sm text-muted-foreground" data-testid="modal-subtitle">
            Add a new column to organize your goals
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
              Column Title
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter column title..."
              className="w-full"
              data-testid="input-column-title"
              required
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Column Color
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === option.value
                      ? "border-foreground scale-110"
                      : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: option.value }}
                  data-testid={`color-${option.name.toLowerCase()}`}
                  title={option.name}
                />
              ))}
            </div>
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
              data-testid="button-create-column"
            >
              {isLoading ? "Creating..." : "Create Column"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}