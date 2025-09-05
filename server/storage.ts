import { type User, type InsertUser, type Board, type InsertBoard, type Column, type InsertColumn, type Goal, type InsertGoal, type Comment, type InsertComment, type UpdateGoal, type MoveGoal } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Board methods
  getBoards(): Promise<Board[]>;
  getBoard(id: string): Promise<Board | undefined>;
  createBoard(board: InsertBoard): Promise<Board>;
  updateBoard(id: string, updates: Partial<InsertBoard>): Promise<Board | undefined>;
  deleteBoard(id: string): Promise<boolean>;
  
  // Column methods
  getColumnsByBoard(boardId: string): Promise<Column[]>;
  createColumn(column: InsertColumn): Promise<Column>;
  updateColumn(id: string, updates: Partial<InsertColumn>): Promise<Column | undefined>;
  deleteColumn(id: string): Promise<boolean>;
  
  // Goal methods
  getGoalsByBoard(boardId: string): Promise<Goal[]>;
  getGoalsByColumn(columnId: string): Promise<Goal[]>;
  getWins(boardId: string): Promise<Goal[]>;
  getGoal(id: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, updates: UpdateGoal): Promise<Goal | undefined>;
  moveGoal(moveData: MoveGoal): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;
  
  // Comment methods
  getCommentsByGoal(goalId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private boards: Map<string, Board>;
  private columns: Map<string, Column>;
  private goals: Map<string, Goal>;
  private comments: Map<string, Comment>;

  constructor() {
    this.users = new Map();
    this.boards = new Map();
    this.columns = new Map();
    this.goals = new Map();
    this.comments = new Map();
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default users
    const user1: User = {
      id: "user1",
      username: "johndoe",
      password: "password",
      displayName: "John Doe",
      initials: "JD"
    };
    
    const user2: User = {
      id: "user2",
      username: "sarahm",
      password: "password",
      displayName: "Sarah Miller", 
      initials: "SM"
    };
    
    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);

    // Create default board
    const defaultBoard: Board = {
      id: "board1",
      title: "Personal Goals Board",
      description: "Organize and track your short-term and long-term goals",
      createdAt: new Date()
    };
    this.boards.set(defaultBoard.id, defaultBoard);

    // Create default columns
    const todoColumn: Column = {
      id: "col1",
      boardId: "board1",
      title: "TODO",
      position: 0,
      color: "#3B82F6"
    };
    
    const doingColumn: Column = {
      id: "col2", 
      boardId: "board1",
      title: "DOING",
      position: 1,
      color: "#8B5CF6"
    };
    
    const doneColumn: Column = {
      id: "col3",
      boardId: "board1", 
      title: "DONE",
      position: 2,
      color: "#10B981"
    };

    this.columns.set(todoColumn.id, todoColumn);
    this.columns.set(doingColumn.id, doingColumn);
    this.columns.set(doneColumn.id, doneColumn);

    // Create default goals
    const goals: Goal[] = [
      {
        id: "goal1",
        title: "Learn React Hooks",
        description: "Master useState, useEffect, and custom hooks for better state management",
        columnId: "col1",
        boardId: "board1",
        position: 0,
        goalType: "short-term",
        assignee: "JD",
        completedSubtasks: 2,
        totalSubtasks: 5,
        isWin: 0,
        createdAt: new Date(),
        completedAt: null
      },
      {
        id: "goal2",
        title: "Build Portfolio Website",
        description: "Create a professional portfolio showcasing my projects and skills",
        columnId: "col1",
        boardId: "board1",
        position: 1,
        goalType: "long-term",
        assignee: "SM",
        completedSubtasks: 0,
        totalSubtasks: 8,
        isWin: 0,
        createdAt: new Date(),
        completedAt: null
      },
      {
        id: "goal3",
        title: "Daily Meditation Practice",
        description: "Establish a consistent 15-minute morning meditation routine",
        columnId: "col2",
        boardId: "board1",
        position: 0,
        goalType: "short-term",
        assignee: "JD",
        completedSubtasks: 7,
        totalSubtasks: 21,
        isWin: 0,
        createdAt: new Date(),
        completedAt: null
      },
      {
        id: "goal4",
        title: "Set Up GitHub Repository",
        description: "Initialize project repository with proper documentation",
        columnId: "col3",
        boardId: "board1",
        position: 0,
        goalType: "short-term",
        assignee: "SM",
        completedSubtasks: 3,
        totalSubtasks: 3,
        isWin: 0,
        createdAt: new Date(),
        completedAt: new Date()
      }
    ];

    goals.forEach(goal => this.goals.set(goal.id, goal));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Board methods
  async getBoards(): Promise<Board[]> {
    return Array.from(this.boards.values());
  }

  async getBoard(id: string): Promise<Board | undefined> {
    return this.boards.get(id);
  }

  async createBoard(insertBoard: InsertBoard): Promise<Board> {
    const id = randomUUID();
    const board: Board = { 
      ...insertBoard, 
      id, 
      description: insertBoard.description || null,
      createdAt: new Date() 
    };
    this.boards.set(id, board);
    return board;
  }

  async updateBoard(id: string, updates: Partial<InsertBoard>): Promise<Board | undefined> {
    const board = this.boards.get(id);
    if (!board) return undefined;
    
    const updatedBoard = { ...board, ...updates };
    this.boards.set(id, updatedBoard);
    return updatedBoard;
  }

  async deleteBoard(id: string): Promise<boolean> {
    return this.boards.delete(id);
  }

  // Column methods
  async getColumnsByBoard(boardId: string): Promise<Column[]> {
    return Array.from(this.columns.values())
      .filter(col => col.boardId === boardId)
      .sort((a, b) => a.position - b.position);
  }

  async createColumn(insertColumn: InsertColumn): Promise<Column> {
    const id = randomUUID();
    const column: Column = { 
      ...insertColumn, 
      id,
      color: insertColumn.color || "#3B82F6"
    };
    this.columns.set(id, column);
    return column;
  }

  async updateColumn(id: string, updates: Partial<InsertColumn>): Promise<Column | undefined> {
    const column = this.columns.get(id);
    if (!column) return undefined;
    
    const updatedColumn = { ...column, ...updates };
    this.columns.set(id, updatedColumn);
    return updatedColumn;
  }

  async deleteColumn(id: string): Promise<boolean> {
    return this.columns.delete(id);
  }

  // Goal methods
  async getGoalsByBoard(boardId: string): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.boardId === boardId && goal.isWin === 0)
      .sort((a, b) => a.position - b.position);
  }

  async getGoalsByColumn(columnId: string): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.columnId === columnId && goal.isWin === 0)
      .sort((a, b) => a.position - b.position);
  }

  async getWins(boardId: string): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.boardId === boardId && goal.isWin === 1)
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = { 
      ...insertGoal, 
      id, 
      description: insertGoal.description || null,
      columnId: insertGoal.columnId || null,
      completedSubtasks: 0,
      isWin: 0,
      createdAt: new Date(),
      completedAt: null
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: string, updates: UpdateGoal): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...updates };
    if (updates.completedAt) {
      updatedGoal.completedAt = typeof updates.completedAt === 'string' ? new Date(updates.completedAt) : updates.completedAt;
    }
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async moveGoal(moveData: MoveGoal): Promise<Goal | undefined> {
    const goal = this.goals.get(moveData.goalId);
    if (!goal) return undefined;

    // Update goal position and column
    const updates: Partial<Goal> = {
      position: moveData.targetPosition
    };

    if (moveData.targetColumnId !== undefined) {
      updates.columnId = moveData.targetColumnId;
    }

    if (moveData.isWin !== undefined) {
      updates.isWin = moveData.isWin ? 1 : 0;
      if (moveData.isWin) {
        updates.completedAt = new Date();
        updates.columnId = null; // Wins don't belong to columns
      }
    }

    const updatedGoal = { ...goal, ...updates };
    this.goals.set(moveData.goalId, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: string): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Comment methods
  async getCommentsByGoal(goalId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.goalId === goalId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = { 
      ...insertComment, 
      id, 
      gifUrl: insertComment.gifUrl || null,
      createdAt: new Date() 
    };
    this.comments.set(id, comment);
    return comment;
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }
}

export const storage = new MemStorage();
