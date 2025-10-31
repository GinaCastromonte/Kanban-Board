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
  goalType: text("goal_type").notNull().default("short-term"),
  assignee: text("assignee").notNull(),
  completedSubtasks: integer("completed_subtasks").notNull().default(0),
  totalSubtasks: integer("total_subtasks").notNull().default(0),
  isWin: integer("is_win").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  dueDate: timestamp("due_date"),
  isJointGoal: integer("is_joint_goal").notNull().default(0),
  sharedWith: text("shared_with"),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").notNull(),
  author: text("author").notNull(),
  content: text("content").notNull(),
  gifUrl: text("gif_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  initials: text("initials").notNull(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActivityDate: timestamp("last_activity_date"),
});

export const insertBoardSchema = createInsertSchema(boards).pick({
  title: true,
  description: true,
});

export const updateBoardSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional().nullable(),
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
  dueDate: true,
  isJointGoal: true,
  sharedWith: true,
}).extend({
  dueDate: z.string().optional(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  goalId: true,
  author: true,
  content: true,
  gifUrl: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  initials: true,
});

export type Board = typeof boards.$inferSelect;
export type InsertBoard = z.infer<typeof insertBoardSchema>;
export type UpdateBoard = z.infer<typeof updateBoardSchema>;

export type InsertColumn = z.infer<typeof insertColumnSchema>;
export type Column = typeof columns.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
  dueDate: z.string().optional(),
  isJointGoal: z.number().optional(),
  sharedWith: z.string().optional(),
});

export const moveGoalSchema = z.object({
  goalId: z.string(),
  targetColumnId: z.string().optional(),
  targetPosition: z.number(),
  isWin: z.boolean().optional(),
});

export const updateColumnSchema = z.object({
  title: z.string().optional(),
  color: z.string().optional(),
  position: z.number().optional(),
});

export type UpdateGoal = z.infer<typeof updateGoalSchema>;
export type MoveGoal = z.infer<typeof moveGoalSchema>;
export type UpdateColumn = z.infer<typeof updateColumnSchema>;

export const checkIns = pgTable("check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").notNull(),
  userId: text("user_id").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  boardId: varchar("board_id").notNull(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  goalId: varchar("goal_id"),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reactions = pgTable("reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").notNull(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  goalId: varchar("goal_id"),
  read: integer("read").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weeklyReviews = pgTable("weekly_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  boardId: varchar("board_id").notNull(),
  userId: text("user_id").notNull(),
  weekStartDate: timestamp("week_start_date").notNull(),
  whatWentWell: text("what_went_well"),
  whatToFocusOn: text("what_to_focus_on"),
  goalsCompleted: integer("goals_completed").notNull().default(0),
  goalsInProgress: integer("goals_in_progress").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subtasks = pgTable("subtasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").notNull(),
  title: text("title").notNull(),
  completed: integer("completed").notNull().default(0),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCheckInSchema = createInsertSchema(checkIns).pick({
  goalId: true,
  userId: true,
  status: true,
  notes: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  boardId: true,
  userId: true,
  type: true,
  goalId: true,
  description: true,
});

export const insertReactionSchema = createInsertSchema(reactions).pick({
  goalId: true,
  userId: true,
  type: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  type: true,
  title: true,
  message: true,
  goalId: true,
});

export const insertWeeklyReviewSchema = createInsertSchema(weeklyReviews).pick({
  boardId: true,
  userId: true,
  weekStartDate: true,
  whatWentWell: true,
  whatToFocusOn: true,
  goalsCompleted: true,
  goalsInProgress: true,
}).extend({
  weekStartDate: z.union([z.string(), z.date()]),
});

export type CheckIn = typeof checkIns.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Reaction = typeof reactions.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type WeeklyReview = typeof weeklyReviews.$inferSelect;

export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertWeeklyReview = z.infer<typeof insertWeeklyReviewSchema>;

export const insertSubtaskSchema = createInsertSchema(subtasks).pick({
  goalId: true,
  title: true,
  position: true,
});

export const updateSubtaskSchema = z.object({
  title: z.string().optional(),
  completed: z.number().optional(),
  position: z.number().optional(),
});

export type Subtask = typeof subtasks.$inferSelect;
export type InsertSubtask = z.infer<typeof insertSubtaskSchema>;
export type UpdateSubtask = z.infer<typeof updateSubtaskSchema>;
