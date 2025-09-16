import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Board, Column, Goal, InsertGoal, InsertColumn, InsertBoard, MoveGoal, UpdateGoal } from "@shared/schema";

export function useKanban() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentBoardId, setCurrentBoardId] = useState<string>("board1");

  // Fetch boards
  const { data: boards, isLoading: boardsLoading } = useQuery({
    queryKey: ["/api/boards"],
  });

  // Fetch columns for current board
  const { data: columns, isLoading: columnsLoading } = useQuery({
    queryKey: ["/api/boards", currentBoardId, "columns"],
  });

  // Fetch goals for current board
  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ["/api/boards", currentBoardId, "goals"],
  });

  // Fetch wins for current board
  const { data: wins, isLoading: winsLoading } = useQuery({
    queryKey: ["/api/boards", currentBoardId, "wins"],
  });

  // Create goal mutation
  const createGoal = useMutation({
    mutationFn: async (goalData: InsertGoal) => {
      const response = await apiRequest("POST", "/api/goals", goalData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards", currentBoardId, "goals"] });
      toast({
        title: "Goal created",
        description: "Your new goal has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update goal mutation
  const updateGoal = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateGoal & { id: string }) => {
      const response = await apiRequest("PATCH", `/api/goals/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards", currentBoardId, "goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/boards", currentBoardId, "wins"] });
      toast({
        title: "Goal updated",
        description: "Your goal has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Move goal mutation
  const moveGoal = useMutation({
    mutationFn: async (moveData: MoveGoal) => {
      const response = await apiRequest("POST", "/api/goals/move", moveData);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards", currentBoardId, "goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/boards", currentBoardId, "wins"] });
      
      if (variables.isWin) {
        toast({
          title: "Congratulations! 🎉",
          description: "Goal moved to wins! Great job!",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to move goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete goal mutation
  const deleteGoal = useMutation({
    mutationFn: async (goalId: string) => {
      await apiRequest("DELETE", `/api/goals/${goalId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards", currentBoardId, "goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/boards", currentBoardId, "wins"] });
      toast({
        title: "Goal deleted",
        description: "Your goal has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create board mutation
  const createBoard = useMutation({
    mutationFn: async (boardData: InsertBoard) => {
      const response = await apiRequest("POST", "/api/boards", boardData);
      const newBoard = await response.json();
      
      // Create default columns for the new board
      const defaultColumns = [
        { boardId: newBoard.id, title: "To Do", position: 0, color: "#3B82F6" },
        { boardId: newBoard.id, title: "Doing", position: 1, color: "#F59E0B" },
        { boardId: newBoard.id, title: "Done", position: 2, color: "#10B981" }
      ];
      
      // Create each column
      for (const columnData of defaultColumns) {
        await apiRequest("POST", "/api/columns", columnData);
      }
      
      return newBoard;
    },
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards"] });
      setCurrentBoardId(newBoard.id);
      toast({
        title: "Board created",
        description: "Your new board has been created with default columns.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create board. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create column mutation
  const createColumn = useMutation({
    mutationFn: async (columnData: InsertColumn) => {
      const response = await apiRequest("POST", "/api/columns", columnData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards", currentBoardId, "columns"] });
      toast({
        title: "Column created",
        description: "Your new column has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create column. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete board mutation
  const deleteBoard = useMutation({
    mutationFn: async (boardId: string) => {
      await apiRequest("DELETE", `/api/boards/${boardId}`);
    },
    onSuccess: (_, boardId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards"] });
      // If we deleted the current board, switch to the first available board
      if (boardId === currentBoardId) {
        const remainingBoards = queryClient.getQueryData<Board[]>(["/api/boards"]);
        if (remainingBoards && remainingBoards.length > 0) {
          setCurrentBoardId(remainingBoards[0].id);
        }
      }
      toast({
        title: "Board deleted",
        description: "The board has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete board. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete column mutation
  const deleteColumn = useMutation({
    mutationFn: async (columnId: string) => {
      await apiRequest("DELETE", `/api/columns/${columnId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards", currentBoardId, "columns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/boards", currentBoardId, "goals"] });
      toast({
        title: "Column deleted",
        description: "The column has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete column. Please try again.",
        variant: "destructive",
      });
    },
  });

  const isLoading = boardsLoading || columnsLoading || goalsLoading || winsLoading;

  return {
    boards: boards as Board[] | undefined,
    columns: columns as Column[] | undefined,
    goals: goals as Goal[] | undefined,
    wins: wins as Goal[] | undefined,
    currentBoardId,
    setCurrentBoardId,
    isLoading,
    createBoard,
    deleteBoard,
    createGoal,
    createColumn,
    deleteColumn,
    updateGoal,
    moveGoal,
    deleteGoal,
  };
}
