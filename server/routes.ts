import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBoardSchema, insertColumnSchema, insertGoalSchema, insertCommentSchema, updateGoalSchema, moveGoalSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Board routes
  app.get("/api/boards", async (req, res) => {
    try {
      const boards = await storage.getBoards();
      res.json(boards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch boards" });
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

  // Column routes
  app.get("/api/boards/:boardId/columns", async (req, res) => {
    try {
      const columns = await storage.getColumnsByBoard(req.params.boardId);
      res.json(columns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch columns" });
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

  // Goal routes
  app.get("/api/boards/:boardId/goals", async (req, res) => {
    try {
      const goals = await storage.getGoalsByBoard(req.params.boardId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
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
      res.status(400).json({ message: "Invalid goal data" });
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

  // Comment routes
  app.get("/api/goals/:goalId/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByGoal(req.params.goalId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
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

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      // Get all users for assignee selection
      const user1 = await storage.getUser("user1");
      const user2 = await storage.getUser("user2");
      const users = [user1, user2].filter(Boolean);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
