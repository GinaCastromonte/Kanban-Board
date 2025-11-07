import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertBoardSchema, insertColumnSchema, insertGoalSchema, insertCommentSchema, updateGoalSchema, moveGoalSchema, updateColumnSchema, insertCheckInSchema, insertReactionSchema, insertNotificationSchema, insertWeeklyReviewSchema, insertSubtaskSchema, updateSubtaskSchema, updateBoardSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/boards", async (req, res) => {
    try {
      const boards = await storage.getBoards();
      res.json(boards);
    } catch (error) {
      console.error('Error fetching boards:', error);
      res.status(500).json({ message: "Failed to fetch boards", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/boards/:id", async (req, res) => {
    try {
      const board = await storage.getBoard(req.params.id);
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }
      res.json(board);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch board" });
    }
  });

  app.post("/api/boards", async (req, res) => {
    try {
      const validatedData = insertBoardSchema.parse(req.body);
      const board = await storage.createBoard(validatedData);
      res.status(201).json(board);
    } catch (error) {
      res.status(400).json({ message: "Invalid board data" });
    }
  });

  app.patch("/api/boards/:id", async (req, res) => {
    try {
      const validatedData = updateBoardSchema.parse(req.body);
      const board = await storage.updateBoard(req.params.id, validatedData);
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }
      res.json(board);
    } catch (error) {
      res.status(400).json({ message: "Invalid board data" });
    }
  });

  app.delete("/api/boards/:id", async (req, res) => {
    try {
      const success = await storage.deleteBoard(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Board not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete board" });
    }
  });

  app.get("/api/boards/:boardId/columns", async (req, res) => {
    try {
      const columns = await storage.getColumnsByBoard(req.params.boardId);
      res.json(columns);
    } catch (error) {
      console.error('Error fetching columns:', error);
      res.status(500).json({ message: "Failed to fetch columns", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/columns", async (req, res) => {
    try {
      const validatedData = insertColumnSchema.parse(req.body);
      const column = await storage.createColumn(validatedData);
      res.status(201).json(column);
    } catch (error) {
      res.status(400).json({ message: "Invalid column data" });
    }
  });

  app.patch("/api/columns/:id", async (req, res) => {
    try {
      const validatedData = updateColumnSchema.parse(req.body);
      const column = await storage.updateColumn(req.params.id, validatedData);
      if (!column) {
        return res.status(404).json({ message: "Column not found" });
      }
      res.json(column);
    } catch (error) {
      res.status(400).json({ message: "Invalid column data" });
    }
  });

  app.delete("/api/columns/:id", async (req, res) => {
    try {
      const success = await storage.deleteColumn(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Column not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete column" });
    }
  });

  app.get("/api/boards/:boardId/goals", async (req, res) => {
    try {
      const goals = await storage.getGoalsByBoard(req.params.boardId);
      res.json(goals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      res.status(500).json({ message: "Failed to fetch goals", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/columns/:columnId/goals", async (req, res) => {
    try {
      const goals = await storage.getGoalsByColumn(req.params.columnId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.get("/api/boards/:boardId/wins", async (req, res) => {
    try {
      const wins = await storage.getWins(req.params.boardId);
      res.json(wins);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wins" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      console.error('Error creating goal:', error);
      res.status(400).json({ message: "Invalid goal data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const validatedData = updateGoalSchema.parse(req.body);
      const goal = await storage.updateGoal(req.params.id, validatedData);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid goal data" });
    }
  });

  app.post("/api/goals/move", async (req, res) => {
    try {
      const validatedData = moveGoalSchema.parse(req.body);
      const goal = await storage.moveGoal(validatedData);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid move data" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const success = await storage.deleteGoal(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  app.get("/api/goals/:goalId/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByGoal(req.params.goalId);
      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: "Failed to fetch comments", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ message: "Invalid comment data" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const user1 = await storage.getUser("user1");
      const user2 = await storage.getUser("user2");
      const users = [user1, user2].filter(Boolean);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/check-ins", async (req, res) => {
    try {
      const validatedData = insertCheckInSchema.parse(req.body);
      const checkIn = await storage.createCheckIn(validatedData);
      res.status(201).json(checkIn);
    } catch (error) {
      res.status(400).json({ message: "Invalid check-in data" });
    }
  });

  app.get("/api/goals/:goalId/check-ins", async (req, res) => {
    try {
      const checkIns = await storage.getCheckInsByGoal(req.params.goalId);
      res.json(checkIns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch check-ins" });
    }
  });

  app.get("/api/boards/:boardId/activities", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const activities = await storage.getActivitiesByBoard(req.params.boardId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/reactions", async (req, res) => {
    try {
      const validatedData = insertReactionSchema.parse(req.body);
      const reaction = await storage.createReaction(validatedData);
      res.json(reaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid reaction data" });
    }
  });

  app.get("/api/goals/:goalId/reactions", async (req, res) => {
    try {
      const reactions = await storage.getReactionsByGoal(req.params.goalId);
      res.json(reactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reactions" });
    }
  });

  app.get("/api/users/:userId/notifications", async (req, res) => {
    try {
      const unreadOnly = req.query.unreadOnly === 'true';
      const notifications = await storage.getNotificationsByUser(req.params.userId, unreadOnly);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const success = await storage.markNotificationAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/users/:userId/notifications/read-all", async (req, res) => {
    try {
      const success = await storage.markAllNotificationsAsRead(req.params.userId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.post("/api/weekly-reviews", async (req, res) => {
    try {
      const validatedData = insertWeeklyReviewSchema.parse(req.body);
      const review = await storage.createWeeklyReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid weekly review data" });
    }
  });

  app.get("/api/boards/:boardId/weekly-reviews", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const reviews = await storage.getWeeklyReviewsByBoard(req.params.boardId, userId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly reviews" });
    }
  });

  app.get("/api/boards/:boardId/statistics/:userId", async (req, res) => {
    try {
      const stats = await storage.getStatisticsByBoard(req.params.boardId, req.params.userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.post("/api/users/:userId/update-streak", async (req, res) => {
    try {
      const success = await storage.updateUserStreak(req.params.userId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user streak" });
    }
  });

  app.post("/api/subtasks", async (req, res) => {
    try {
      const validatedData = insertSubtaskSchema.parse(req.body);
      const subtask = await storage.createSubtask(validatedData);
      res.status(201).json(subtask);
    } catch (error) {
      res.status(400).json({ message: "Invalid subtask data" });
    }
  });

  app.get("/api/goals/:goalId/subtasks", async (req, res) => {
    try {
      const subtasks = await storage.getSubtasksByGoal(req.params.goalId);
      res.json(subtasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subtasks" });
    }
  });

  app.patch("/api/subtasks/:id", async (req, res) => {
    try {
      const validatedData = updateSubtaskSchema.parse(req.body);
      const subtask = await storage.updateSubtask(req.params.id, validatedData);
      if (!subtask) {
        return res.status(404).json({ message: "Subtask not found" });
      }
      res.json(subtask);
    } catch (error) {
      res.status(400).json({ message: "Invalid subtask data" });
    }
  });

  app.delete("/api/subtasks/:id", async (req, res) => {
    try {
      const success = await storage.deleteSubtask(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Subtask not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subtask" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
