import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const boards = pgTable("boards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const columns = pgTable("columns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  boardId: varchar("board_id").notNull(),
  title: text("title").notNull(),
  position: integer("position").notNull(),
  color: text("color").notNull().default("#3B82F6"),
});

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  columnId: varchar("column_id"),
  boardId: varchar("board_id").notNull(),
  position: integer("position").notNull(),
  goalType: text("goal_type").notNull().default("short-term"), // "short-term" | "long-term"
  assignee: text("assignee").notNull(),
  completedSubtasks: integer("completed_subtasks").notNull().default(0),
  totalSubtasks: integer("total_subtasks").notNull().default(0),
  isWin: integer("is_win").notNull().default(0), // 0 or 1 (boolean)
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").notNull(),
  author: text("author").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  initials: text("initials").notNull(),
});

// Insert schemas
export const insertBoardSchema = createInsertSchema(boards).pick({
  title: true,
  description: true,
});

export const insertColumnSchema = createInsertSchema(columns).pick({
  boardId: true,
  title: true,
  position: true,
  color: true,
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  title: true,
  description: true,
  columnId: true,
  boardId: true,
  position: true,
  goalType: true,
  assignee: true,
  totalSubtasks: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  goalId: true,
  author: true,
  content: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  initials: true,
});

// Types
export type InsertBoard = z.infer<typeof insertBoardSchema>;
export type Board = typeof boards.$inferSelect;

export type InsertColumn = z.infer<typeof insertColumnSchema>;
export type Column = typeof columns.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Update schemas for API operations
export const updateGoalSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  columnId: z.string().optional(),
  position: z.number().optional(),
  goalType: z.enum(["short-term", "long-term"]).optional(),
  completedSubtasks: z.number().optional(),
  totalSubtasks: z.number().optional(),
  isWin: z.number().optional(),
  completedAt: z.string().optional(),
});

export const moveGoalSchema = z.object({
  goalId: z.string(),
  targetColumnId: z.string().optional(),
  targetPosition: z.number(),
  isWin: z.boolean().optional(),
});

export type UpdateGoal = z.infer<typeof updateGoalSchema>;
export type MoveGoal = z.infer<typeof moveGoalSchema>;
