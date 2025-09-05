import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Send, ImageIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Goal, Comment } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface CommentModalProps {
  isOpen: boolean;
  goal: Goal | null;
  onClose: () => void;
}

export function CommentModal({ isOpen, goal, onClose }: CommentModalProps) {
  const [newComment, setNewComment] = useState("");
  const [gifUrl, setGifUrl] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("GC");
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ["/api/goals", goal?.id, "comments"],
    enabled: isOpen && !!goal?.id,
  });

  const createComment = useMutation({
    mutationFn: async ({ content, gifUrl }: { content: string; gifUrl?: string }) => {
      if (!goal) throw new Error("No goal selected");
      const response = await apiRequest("POST", "/api/comments", {
        goalId: goal.id,
        author: selectedAuthor,
        content,
        gifUrl: gifUrl || null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/goals", goal?.id, "comments"],
      });
      setNewComment("");
      setGifUrl("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createComment.mutate({ 
      content: newComment.trim(),
      gifUrl: gifUrl.trim() || undefined 
    });
  };

  if (!goal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg mx-4 max-h-[80vh]" data-testid="comment-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2" data-testid="comment-modal-title">
            <MessageCircle size={20} />
            <span>Comments for "{goal.title}"</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Goal info */}
          <div className="p-3 bg-muted/20 rounded-lg border" data-testid="comment-goal-info">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm" data-testid="comment-goal-title">{goal.title}</h4>
              <Badge 
                className={goal.goalType === "short-term" ? "bg-accent/20 text-accent" : "bg-purple-500/20 text-purple-400"}
                data-testid="comment-goal-type"
              >
                {goal.goalType === "short-term" ? "Short-term" : "Long-term"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground" data-testid="comment-goal-description">
              {goal.description}
            </p>
          </div>

          {/* Comments list */}
          <ScrollArea className="h-64 w-full border rounded-lg p-3" data-testid="comments-list">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8" data-testid="comments-loading">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8" data-testid="comments-empty">
                No comments yet. Be the first to add one!
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment: Comment) => (
                  <div key={comment.id} className="border-b border-border pb-3 last:border-b-0" data-testid={`comment-${comment.id}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium" data-testid={`comment-author-${comment.id}`}>
                          {comment.author}
                        </div>
                        <span className="text-sm font-medium" data-testid={`comment-author-name-${comment.id}`}>
                          {comment.author === "GC" ? "Grace Chen" : "Sam Kim"}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground" data-testid={`comment-date-${comment.id}`}>
                        {comment.createdAt ? formatDistanceToNow(comment.createdAt, { addSuffix: true }) : "Just now"}
                      </span>
                    </div>
                    <p className="text-sm text-foreground" data-testid={`comment-content-${comment.id}`}>
                      {comment.content}
                    </p>
                    {comment.gifUrl && (
                      <img 
                        src={comment.gifUrl} 
                        alt="GIF" 
                        className="mt-2 max-w-full h-auto max-h-48 rounded border"
                        data-testid={`comment-gif-${comment.id}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Add comment form */}
          <form onSubmit={handleSubmit} className="space-y-3" data-testid="comment-form">
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Comment As
              </Label>
              <div className="flex space-x-2 mb-3">
                <Badge
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedAuthor === "GC" 
                      ? "bg-primary/20 text-primary hover:bg-primary/30" 
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                  onClick={() => setSelectedAuthor("GC")}
                  data-testid="badge-author-gc"
                >
                  GC (Grace Chen)
                </Badge>
                <Badge
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedAuthor === "SK" 
                      ? "bg-primary/20 text-primary hover:bg-primary/30" 
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                  onClick={() => setSelectedAuthor("SK")}
                  data-testid="badge-author-sk"
                >
                  SK (Sam Kim)
                </Badge>
              </div>
            </div>
            <div>
              <Label htmlFor="comment-text" className="text-sm font-medium">Comment</Label>
              <Textarea
                id="comment-text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full resize-none mt-1"
                rows={3}
                data-testid="textarea-new-comment"
              />
            </div>
            <div>
              <Label htmlFor="gif-url" className="text-sm font-medium flex items-center">
                <ImageIcon size={14} className="mr-1" />
                GIF URL (optional)
              </Label>
              <Input
                id="gif-url"
                type="url"
                value={gifUrl}
                onChange={(e) => setGifUrl(e.target.value)}
                placeholder="Paste a GIF URL here..."
                className="w-full mt-1"
                data-testid="input-gif-url"
              />
              {gifUrl && (
                <img 
                  src={gifUrl} 
                  alt="GIF Preview" 
                  className="mt-2 max-w-full h-auto max-h-32 rounded border"
                  data-testid="gif-preview"
                />
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="ghost" onClick={onClose} data-testid="button-close-comments">
                Close
              </Button>
              <Button 
                type="submit" 
                disabled={!newComment.trim() || createComment.isPending}
                data-testid="button-add-comment"
              >
                <Send size={16} className="mr-2" />
                {createComment.isPending ? "Sending..." : "Add Comment"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
