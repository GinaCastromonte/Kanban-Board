import { db, COLLECTIONS } from './firebase.js';
import type { User, InsertUser, Board, Column, Goal, Comment, InsertBoard, InsertColumn, InsertGoal, InsertComment, UpdateGoal, MoveGoal } from '@shared/schema';

export class FirebaseStorage {
  constructor() {
    if (!db) {
      throw new Error('Firebase not initialized. Please set up Firebase credentials.');
    }
  }

  // Helper to convert Firestore Timestamps to ISO strings for JSON serialization
  private convertTimestamp(ts: any): string | null {
    if (!ts) return null;
    let date: Date | null = null;
    if (ts.toDate && typeof ts.toDate === 'function') {
      date = ts.toDate();
    } else if (ts.toMillis && typeof ts.toMillis === 'function') {
      date = new Date(ts.toMillis());
    } else if (ts instanceof Date) {
      date = ts;
    } else {
      return ts; // Return as-is if not a timestamp
    }
    return date ? date.toISOString() : null;
  }

  // Helper to map Firestore document to Goal with timestamp conversion
  private mapDocToGoal(doc: any, data: any): Goal {
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      columnId: data.columnId,
      boardId: data.boardId,
      position: data.position ?? 0,
      goalType: data.goalType ?? 'short-term',
      assignee: data.assignee,
      completedSubtasks: data.completedSubtasks ?? 0,
      totalSubtasks: data.totalSubtasks ?? 0,
      isWin: data.isWin ?? 0,
      createdAt: this.convertTimestamp(data.createdAt),
      updatedAt: this.convertTimestamp(data.updatedAt),
      completedAt: this.convertTimestamp(data.completedAt),
    } as Goal;
  }

  // Helper to handle Firestore NOT_FOUND errors
  private handleNotFoundError(error: unknown, defaultReturn: any): any {
    if (error && typeof error === 'object' && 'code' in error && (error as any).code === 5) {
      return defaultReturn;
    }
    throw error;
  }

  // User operations (placeholder - not used in current app)
  async getUser(id: string): Promise<User | undefined> {
    // Not implemented - user management not used in current app
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Not implemented - user management not used in current app
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    // Not implemented - user management not used in current app
    throw new Error('User management not implemented');
  }

  // Board operations
  async getBoards(): Promise<Board[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.BOARDS).orderBy('createdAt', 'asc').get();
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Board));
    } catch (error) {
      return this.handleNotFoundError(error, []);
    }
  }

  async getBoard(id: string): Promise<Board | undefined> {
    const doc = await db.collection(COLLECTIONS.BOARDS).doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() } as Board;
  }

  async createBoard(boardData: InsertBoard): Promise<Board> {
    const docRef = await db.collection(COLLECTIONS.BOARDS).add({
      ...boardData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const doc = await docRef.get();
    const board = { id: doc.id, ...doc.data() } as Board;
    
    // Create default columns
    const defaultColumns = [
      { title: "To Do", color: "#3B82F6", position: 0 },
      { title: "Doing", color: "#F59E0B", position: 1 },
      { title: "Done", color: "#10B981", position: 2 }
    ];
    
    for (const columnData of defaultColumns) {
      await db.collection(COLLECTIONS.COLUMNS).add({
        ...columnData,
        boardId: board.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return board;
  }

  async updateBoard(id: string, updates: Partial<InsertBoard>): Promise<Board | undefined> {
    try {
      await db.collection(COLLECTIONS.BOARDS).doc(id).update({
        ...updates,
        updatedAt: new Date()
      });
      const doc = await db.collection(COLLECTIONS.BOARDS).doc(id).get();
      if (!doc.exists) return undefined;
      return { id: doc.id, ...doc.data() } as Board;
    } catch (error) {
      console.error('Error updating board:', error);
      return undefined;
    }
  }

  async deleteBoard(id: string): Promise<boolean> {
    try {
      // Delete all related data
      const batch = db.batch();
      
      // Delete columns
      const columnsSnapshot = await db.collection(COLLECTIONS.COLUMNS).where('boardId', '==', id).get();
      columnsSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
      
      // Delete goals
      const goalsSnapshot = await db.collection(COLLECTIONS.GOALS).where('boardId', '==', id).get();
      goalsSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
      
      // Delete comments for goals in this board
      for (const goalDoc of goalsSnapshot.docs) {
        const commentsSnapshot = await db.collection(COLLECTIONS.COMMENTS).where('goalId', '==', goalDoc.id).get();
        commentsSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
      }
      
      // Delete the board
      batch.delete(db.collection(COLLECTIONS.BOARDS).doc(id));
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error deleting board:', error);
      return false;
    }
  }

  // Column operations
  async getColumnsByBoard(boardId: string): Promise<Column[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.COLUMNS)
        .where('boardId', '==', boardId)
        .get();
      const columns = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Column));
      return columns.sort((a: Column, b: Column) => (a.position || 0) - (b.position || 0));
    } catch (error) {
      return this.handleNotFoundError(error, []);
    }
  }

  async getColumns(boardId: string): Promise<Column[]> {
    return this.getColumnsByBoard(boardId);
  }

  async getColumn(id: string): Promise<Column | undefined> {
    const doc = await db.collection(COLLECTIONS.COLUMNS).doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() } as Column;
  }

  async createColumn(columnData: InsertColumn): Promise<Column> {
    const docRef = await db.collection(COLLECTIONS.COLUMNS).add({
      ...columnData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Column;
  }

  async updateColumn(id: string, updates: Partial<InsertColumn>): Promise<Column | undefined> {
    try {
      await db.collection(COLLECTIONS.COLUMNS).doc(id).update({
        ...updates,
        updatedAt: new Date()
      });
      const doc = await db.collection(COLLECTIONS.COLUMNS).doc(id).get();
      if (!doc.exists) return undefined;
      return { id: doc.id, ...doc.data() } as Column;
    } catch (error) {
      console.error('Error updating column:', error);
      return undefined;
    }
  }

  async deleteColumn(id: string): Promise<boolean> {
    try {
      const batch = db.batch();
      
      // Delete goals in this column
      const goalsSnapshot = await db.collection(COLLECTIONS.GOALS).where('columnId', '==', id).get();
      goalsSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
      
      // Delete comments for goals in this column
      for (const goalDoc of goalsSnapshot.docs) {
        const commentsSnapshot = await db.collection(COLLECTIONS.COMMENTS).where('goalId', '==', goalDoc.id).get();
        commentsSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
      }
      
      // Delete the column
      batch.delete(db.collection(COLLECTIONS.COLUMNS).doc(id));
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error deleting column:', error);
      return false;
    }
  }

  // Goal operations
  async getGoalsByBoard(boardId: string): Promise<Goal[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.GOALS)
        .where('boardId', '==', boardId)
        .get();
      
      const goals = snapshot.docs
        .map((doc: any) => this.mapDocToGoal(doc, doc.data()))
        .filter((goal: Goal) => goal.isWin === 0)
        .sort((a: Goal, b: Goal) => a.position - b.position);
      
      return goals;
    } catch (error) {
      return this.handleNotFoundError(error, []);
    }
  }

  async getGoalsByColumn(columnId: string): Promise<Goal[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.GOALS)
        .where('columnId', '==', columnId)
        .get();
      
      return snapshot.docs
        .map((doc: any) => this.mapDocToGoal(doc, doc.data()))
        .filter((goal: Goal) => goal.isWin === 0)
        .sort((a: Goal, b: Goal) => a.position - b.position);
    } catch (error) {
      return this.handleNotFoundError(error, []);
    }
  }

  async getGoals(boardId: string): Promise<Goal[]> {
    return this.getGoalsByBoard(boardId);
  }

  async getWins(boardId: string): Promise<Goal[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.GOALS)
        .where('boardId', '==', boardId)
        .get();
      
      const wins = snapshot.docs
        .map((doc: any) => {
          const data = doc.data();
          return this.mapDocToGoal(doc, { ...data, isWin: data.isWin ?? 1 });
        })
        .filter((goal: Goal) => goal.isWin === 1)
        .sort((a: Goal, b: Goal) => a.position - b.position);
      
      return wins;
    } catch (error) {
      return this.handleNotFoundError(error, []);
    }
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    const doc = await db.collection(COLLECTIONS.GOALS).doc(id).get();
    if (!doc.exists) return undefined;
    return this.mapDocToGoal(doc, doc.data());
  }

  async createGoal(goalData: InsertGoal): Promise<Goal> {
    const docRef = await db.collection(COLLECTIONS.GOALS).add({
      ...goalData,
      isWin: 0,
      completedSubtasks: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const doc = await docRef.get();
    return this.mapDocToGoal(doc, doc.data());
  }

  async updateGoal(id: string, updates: UpdateGoal): Promise<Goal | undefined> {
    try {
      await db.collection(COLLECTIONS.GOALS).doc(id).update({
        ...updates,
        updatedAt: new Date()
      });
      const doc = await db.collection(COLLECTIONS.GOALS).doc(id).get();
      if (!doc.exists) return undefined;
      return this.mapDocToGoal(doc, doc.data());
    } catch (error) {
      console.error('Error updating goal:', error);
      return undefined;
    }
  }

  async deleteGoal(id: string): Promise<boolean> {
    try {
      const batch = db.batch();
      
      // Delete comments for this goal
      const commentsSnapshot = await db.collection(COLLECTIONS.COMMENTS).where('goalId', '==', id).get();
      commentsSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
      
      // Delete the goal
      batch.delete(db.collection(COLLECTIONS.GOALS).doc(id));
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  }

  async moveGoal(moveData: MoveGoal): Promise<Goal | undefined> {
    try {
      const { goalId, targetColumnId, targetPosition, isWin } = moveData;
      
      // Get the goal to move
      const goalDoc = await db.collection(COLLECTIONS.GOALS).doc(goalId).get();
      if (!goalDoc.exists) return undefined;
      
      const goal = { id: goalDoc.id, ...goalDoc.data() } as Goal;
      
      // Update the goal
      await db.collection(COLLECTIONS.GOALS).doc(goalId).update({
        columnId: targetColumnId || null,
        position: targetPosition,
        isWin: isWin ? 1 : 0,
        updatedAt: new Date()
      });
      
      // If moving within the same column, update positions of other goals
      if (targetColumnId && goal.columnId === targetColumnId && !isWin) {
        const goalsSnapshot = await db.collection(COLLECTIONS.GOALS)
          .where('columnId', '==', targetColumnId)
          .where('isWin', '==', 0)
          .orderBy('position', 'asc')
          .get();
        
        const batch = db.batch();
        let newPosition = 0;
        
        for (const doc of goalsSnapshot.docs as any[]) {
          if (doc.id !== goalId) {
            if (newPosition === targetPosition) newPosition++;
            batch.update(doc.ref, { position: newPosition });
            newPosition++;
          }
        }
        
        await batch.commit();
      }
      
      // Return the updated goal
      const updatedDoc = await db.collection(COLLECTIONS.GOALS).doc(goalId).get();
      if (!updatedDoc.exists) return undefined;
      return this.mapDocToGoal(updatedDoc, updatedDoc.data());
    } catch (error) {
      console.error('Error moving goal:', error);
      return undefined;
    }
  }

  // Comment operations
  async getCommentsByGoal(goalId: string): Promise<Comment[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.COMMENTS)
        .where('goalId', '==', goalId)
        .get();
      
      const comments = snapshot.docs
        .map((doc: any) => {
          const data = doc.data();
          return {
            id: doc.id,
            goalId: data.goalId,
            author: data.author,
            content: data.content,
            gifUrl: data.gifUrl || null,
            createdAt: this.convertTimestamp(data.createdAt),
          } as Comment;
        })
        .sort((a: Comment, b: Comment) => {
          // Sort by createdAt if available
          if (a.createdAt && b.createdAt) {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          }
          return 0;
        });
      
      return comments;
    } catch (error) {
      return this.handleNotFoundError(error, []);
    }
  }

  async getComments(goalId: string): Promise<Comment[]> {
    return this.getCommentsByGoal(goalId);
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const docRef = await db.collection(COLLECTIONS.COMMENTS).add({
      ...commentData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const doc = await docRef.get();
    const data = doc.data();
    return {
      id: doc.id,
      goalId: data.goalId,
      author: data.author,
      content: data.content,
      gifUrl: data.gifUrl || null,
      createdAt: this.convertTimestamp(data.createdAt),
    } as Comment;
  }

  async deleteComment(id: string): Promise<boolean> {
    try {
      await db.collection(COLLECTIONS.COMMENTS).doc(id).delete();
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }
}
