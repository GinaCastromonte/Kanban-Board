import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Board, Column, Goal, InsertGoal, InsertColumn, MoveGoal, UpdateGoal } from "@shared/schema";

const BOARD_ID = "board1"; // Using default board for now

export function useKanban() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch boards
  const { data: boards, isLoading: boardsLoading } = useQuery({
    queryKey: ["/api/boards"],
  });

  // Fetch columns for current board
  const { data: columns, isLoading: columnsLoading } = useQuery({
    queryKey: ["/api/boards", BOARD_ID, "columns"],
  });

  // Fetch goals for current board
  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ["/api/boards", BOARD_ID, "goals"],
  });

  // Fetch wins for current board
  const { data: wins, isLoading: winsLoading } = useQuery({
    queryKey: ["/api/boards", BOARD_ID, "wins"],
  });

  // Create goal mutation
  const createGoal = useMutation({
    mutationFn: async (goalData: InsertGoal) => {
      const response = await apiRequest("POST", "/api/goals", goalData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards", BOARD_ID, "goals"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/boards", BOARD_ID, "goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/boards", BOARD_ID, "wins"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/boards", BOARD_ID, "goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/boards", BOARD_ID, "wins"] });
      
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
      queryClient.invalidateQueries({ queryKey: ["/api/boards", BOARD_ID, "goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/boards", BOARD_ID, "wins"] });
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

  // Create column mutation
  const createColumn = useMutation({
    mutationFn: async (columnData: InsertColumn) => {
      const response = await apiRequest("POST", "/api/columns", columnData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards", BOARD_ID, "columns"] });
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

  const isLoading = boardsLoading || columnsLoading || goalsLoading || winsLoading;

  return {
    boards: boards as Board[] | undefined,
    columns: columns as Column[] | undefined,
    goals: goals as Goal[] | undefined,
    wins: wins as Goal[] | undefined,
    isLoading,
    createGoal,
    createColumn,
    updateGoal,
    moveGoal,
    deleteGoal,
  };
}
