import { db, COLLECTIONS } from './firebase.js';
import type { User, InsertUser, Board, Column, Goal, Comment, InsertBoard, InsertColumn, InsertGoal, InsertComment, UpdateGoal, MoveGoal, CheckIn, Activity, Reaction, Notification, WeeklyReview, InsertCheckIn, InsertActivity, InsertReaction, InsertNotification, InsertWeeklyReview, Subtask, InsertSubtask, UpdateSubtask, UpdateBoard } from '@shared/schema';

export class FirebaseStorage {
  constructor() {
    if (!db) {
      throw new Error('Firebase not initialized. Please set up Firebase credentials.');
    }
  }

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
      return ts;
    }
    return date ? date.toISOString() : null;
  }

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
      dueDate: this.convertTimestamp(data.dueDate),
      isJointGoal: data.isJointGoal ?? 0,
      sharedWith: data.sharedWith || null,
    } as Goal;
  }

  private handleNotFoundError(error: unknown, defaultReturn: any): any {
    if (error && typeof error === 'object' && 'code' in error && (error as any).code === 5) {
      return defaultReturn;
    }
    throw error;
  }

  async getUser(id: string): Promise<User | undefined> {
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    throw new Error('User management not implemented');
  }

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

  async updateBoard(id: string, updates: UpdateBoard): Promise<Board | undefined> {
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
      const batch = db.batch();
      
      const columnsSnapshot = await db.collection(COLLECTIONS.COLUMNS).where('boardId', '==', id).get();
      columnsSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
      
      const goalsSnapshot = await db.collection(COLLECTIONS.GOALS).where('boardId', '==', id).get();
      goalsSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
      
      for (const goalDoc of goalsSnapshot.docs) {
        const commentsSnapshot = await db.collection(COLLECTIONS.COMMENTS).where('goalId', '==', goalDoc.id).get();
        commentsSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
      }
      
      batch.delete(db.collection(COLLECTIONS.BOARDS).doc(id));
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error deleting board:', error);
      return false;
    }
  }

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
      
      const goalsSnapshot = await db.collection(COLLECTIONS.GOALS).where('columnId', '==', id).get();
      goalsSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
      
      for (const goalDoc of goalsSnapshot.docs) {
        const commentsSnapshot = await db.collection(COLLECTIONS.COMMENTS).where('goalId', '==', goalDoc.id).get();
        commentsSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
      }
      
      batch.delete(db.collection(COLLECTIONS.COLUMNS).doc(id));
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error deleting column:', error);
      return false;
    }
  }

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
      isJointGoal: goalData.isJointGoal ?? 0,
      sharedWith: goalData.sharedWith || null,
      dueDate: goalData.dueDate ? new Date(goalData.dueDate) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const doc = await docRef.get();
    return this.mapDocToGoal(doc, doc.data());
  }

  async updateGoal(id: string, updates: UpdateGoal): Promise<Goal | undefined> {
    try {
      const updateData: any = { ...updates };
      if (updates.dueDate) {
        updateData.dueDate = new Date(updates.dueDate);
      }
      await db.collection(COLLECTIONS.GOALS).doc(id).update({
        ...updateData,
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
      
      const commentsSnapshot = await db.collection(COLLECTIONS.COMMENTS).where('goalId', '==', id).get();
      commentsSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
      
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
      
      const goalDoc = await db.collection(COLLECTIONS.GOALS).doc(goalId).get();
      if (!goalDoc.exists) return undefined;
      
      const goal = { id: goalDoc.id, ...goalDoc.data() } as Goal;
      
      await db.collection(COLLECTIONS.GOALS).doc(goalId).update({
        columnId: targetColumnId || null,
        position: targetPosition,
        isWin: isWin ? 1 : 0,
        updatedAt: new Date()
      });
      
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
      
      const updatedDoc = await db.collection(COLLECTIONS.GOALS).doc(goalId).get();
      if (!updatedDoc.exists) return undefined;
      return this.mapDocToGoal(updatedDoc, updatedDoc.data());
    } catch (error) {
      console.error('Error moving goal:', error);
      return undefined;
    }
  }

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

  async createCheckIn(checkInData: InsertCheckIn): Promise<CheckIn> {
    const docRef = await db.collection(COLLECTIONS.CHECK_INS).add({
      ...checkInData,
      createdAt: new Date()
    });
    const doc = await docRef.get();
    const data = doc.data();
    return {
      id: doc.id,
      goalId: data.goalId,
      userId: data.userId,
      status: data.status,
      notes: data.notes || null,
      createdAt: this.convertTimestamp(data.createdAt),
    } as CheckIn;
  }

  async getCheckInsByGoal(goalId: string): Promise<CheckIn[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.CHECK_INS)
        .where('goalId', '==', goalId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          goalId: data.goalId,
          userId: data.userId,
          status: data.status,
          notes: data.notes || null,
          createdAt: this.convertTimestamp(data.createdAt),
        } as CheckIn;
      });
    } catch (error) {
      return this.handleNotFoundError(error, []);
    }
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const docRef = await db.collection(COLLECTIONS.ACTIVITIES).add({
      ...activityData,
      createdAt: new Date()
    });
    const doc = await docRef.get();
    const data = doc.data();
    return {
      id: doc.id,
      boardId: data.boardId,
      userId: data.userId,
      type: data.type,
      goalId: data.goalId || null,
      description: data.description,
      createdAt: this.convertTimestamp(data.createdAt),
    } as Activity;
  }

  async getActivitiesByBoard(boardId: string, limit: number = 50): Promise<Activity[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.ACTIVITIES)
        .where('boardId', '==', boardId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          boardId: data.boardId,
          userId: data.userId,
          type: data.type,
          goalId: data.goalId || null,
          description: data.description,
          createdAt: this.convertTimestamp(data.createdAt),
        } as Activity;
      });
    } catch (error) {
      return this.handleNotFoundError(error, []);
    }
  }

  async createReaction(reactionData: InsertReaction): Promise<Reaction> {
    const existingSnapshot = await db.collection(COLLECTIONS.REACTIONS)
      .where('goalId', '==', reactionData.goalId)
      .where('userId', '==', reactionData.userId)
      .where('type', '==', reactionData.type)
      .get();
    
    if (!existingSnapshot.empty) {
      const existingDoc = existingSnapshot.docs[0];
      await db.collection(COLLECTIONS.REACTIONS).doc(existingDoc.id).delete();
      return existingDoc.data() as Reaction;
    }
    
    const docRef = await db.collection(COLLECTIONS.REACTIONS).add({
      ...reactionData,
      createdAt: new Date()
    });
    const doc = await docRef.get();
    const data = doc.data();
    return {
      id: doc.id,
      goalId: data.goalId,
      userId: data.userId,
      type: data.type,
      createdAt: this.convertTimestamp(data.createdAt),
    } as Reaction;
  }

  async getReactionsByGoal(goalId: string): Promise<Reaction[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.REACTIONS)
        .where('goalId', '==', goalId)
        .get();
      
      return snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          goalId: data.goalId,
          userId: data.userId,
          type: data.type,
          createdAt: this.convertTimestamp(data.createdAt),
        } as Reaction;
      });
    } catch (error) {
      return this.handleNotFoundError(error, []);
    }
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const docRef = await db.collection(COLLECTIONS.NOTIFICATIONS).add({
      ...notificationData,
      read: 0,
      createdAt: new Date()
    });
    const doc = await docRef.get();
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      goalId: data.goalId || null,
      read: data.read ?? 0,
      createdAt: this.convertTimestamp(data.createdAt),
    } as Notification;
  }

  async getNotificationsByUser(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    try {
      let query = db.collection(COLLECTIONS.NOTIFICATIONS)
        .where('userId', '==', userId);
      
      if (unreadOnly) {
        query = query.where('read', '==', 0);
      }
      
      const snapshot = await query
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
      
      return snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          goalId: data.goalId || null,
          read: data.read ?? 0,
          createdAt: this.convertTimestamp(data.createdAt),
        } as Notification;
      });
    } catch (error) {
      return this.handleNotFoundError(error, []);
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      await db.collection(COLLECTIONS.NOTIFICATIONS).doc(notificationId).update({
        read: 1
      });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      const snapshot = await db.collection(COLLECTIONS.NOTIFICATIONS)
        .where('userId', '==', userId)
        .where('read', '==', 0)
        .get();
      
      const batch = db.batch();
      snapshot.docs.forEach((doc: any) => {
        batch.update(doc.ref, { read: 1 });
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  async createWeeklyReview(reviewData: InsertWeeklyReview): Promise<WeeklyReview> {
    const weekStartDate = reviewData.weekStartDate instanceof Date 
      ? reviewData.weekStartDate 
      : new Date(reviewData.weekStartDate);
    const docRef = await db.collection(COLLECTIONS.WEEKLY_REVIEWS).add({
      ...reviewData,
      weekStartDate: weekStartDate,
      createdAt: new Date()
    });
    const doc = await docRef.get();
    const data = doc.data();
    const retrievedWeekStartDate = data.weekStartDate?.toDate ? data.weekStartDate.toDate() : new Date(data.weekStartDate);
    return {
      id: doc.id,
      boardId: data.boardId,
      userId: data.userId,
      weekStartDate: retrievedWeekStartDate,
      whatWentWell: data.whatWentWell || null,
      whatToFocusOn: data.whatToFocusOn || null,
      goalsCompleted: data.goalsCompleted ?? 0,
      goalsInProgress: data.goalsInProgress ?? 0,
      createdAt: this.convertTimestamp(data.createdAt),
    } as WeeklyReview;
  }

  async getWeeklyReviewsByBoard(boardId: string, userId?: string): Promise<WeeklyReview[]> {
    try {
      let query = db.collection(COLLECTIONS.WEEKLY_REVIEWS)
        .where('boardId', '==', boardId);
      
      if (userId) {
        query = query.where('userId', '==', userId);
      }
      
      const snapshot = await query
        .orderBy('weekStartDate', 'desc')
        .limit(20)
        .get();
      
      return snapshot.docs.map((doc: any) => {
        const data = doc.data();
        const retrievedWeekStartDate = data.weekStartDate?.toDate ? data.weekStartDate.toDate() : new Date(data.weekStartDate);
        return {
          id: doc.id,
          boardId: data.boardId,
          userId: data.userId,
          weekStartDate: retrievedWeekStartDate,
          whatWentWell: data.whatWentWell || null,
          whatToFocusOn: data.whatToFocusOn || null,
          goalsCompleted: data.goalsCompleted ?? 0,
          goalsInProgress: data.goalsInProgress ?? 0,
          createdAt: this.convertTimestamp(data.createdAt),
        } as WeeklyReview;
      });
    } catch (error) {
      return this.handleNotFoundError(error, []);
    }
  }

  async updateUserStreak(userId: string): Promise<boolean> {
    try {
      const user = await this.getUser(userId);
      if (!user) return false;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastActivity = user.lastActivityDate ? new Date(user.lastActivityDate) : null;
      const lastActivityDate = lastActivity ? new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate()) : null;
      
      let currentStreak = user.currentStreak ?? 0;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (!lastActivityDate) {
        currentStreak = 1;
      } else if (lastActivityDate.getTime() === today.getTime()) {
        return true;
      } else if (lastActivityDate.getTime() === yesterday.getTime()) {
        currentStreak = (user.currentStreak ?? 0) + 1;
      } else {
        currentStreak = 1;
      }
      
      const longestStreak = Math.max(currentStreak, user.longestStreak ?? 0);
      
      await db.collection('users').doc(userId).update({
        currentStreak,
        longestStreak,
        lastActivityDate: today
      });
      
      return true;
    } catch (error) {
      console.error('Error updating user streak:', error);
      return false;
    }
  }

  async getStatisticsByBoard(boardId: string, userId: string): Promise<any> {
    try {
      const goals = await this.getGoalsByBoard(boardId);
      const userGoals = goals.filter((g: Goal) => g.assignee === userId || g.sharedWith === userId);
      const wins = await this.getWins(boardId);
      const userWins = wins.filter((w: Goal) => w.assignee === userId || w.sharedWith === userId);
      
      const completed = userWins.length;
      const inProgress = userGoals.filter((g: Goal) => !g.isWin).length;
      const total = userGoals.length + userWins.length;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      
      const allUserGoalIds = [...userGoals.map((g: Goal) => g.id), ...userWins.map((w: Goal) => w.id)];
      let totalSubtasks = 0;
      let completedSubtasks = 0;
      
      for (const goalId of allUserGoalIds) {
        try {
          const subtasks = await this.getSubtasksByGoal(goalId);
          totalSubtasks += subtasks.length;
          completedSubtasks += subtasks.filter((s: Subtask) => s.completed === 1).length;
        } catch (error) {
          continue;
        }
      }
      
      const subtaskCompletionRate = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
      
      const goalsWithDueDates = userGoals.filter((g: Goal) => g.dueDate);
      const overdue = goalsWithDueDates.filter((g: Goal) => {
        if (!g.dueDate) return false;
        return new Date(g.dueDate) < new Date() && !g.isWin;
      }).length;
      
      const upcomingDeadlines = goalsWithDueDates.filter((g: Goal) => {
        if (!g.dueDate || g.isWin) return false;
        const dueDate = new Date(g.dueDate);
        const today = new Date();
        const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff <= 7;
      }).length;
      
      return {
        total,
        completed,
        inProgress,
        completionRate: Math.round(completionRate * 100) / 100,
        overdue,
        upcomingDeadlines,
        totalSubtasks,
        completedSubtasks,
        subtaskCompletionRate: Math.round(subtaskCompletionRate * 100) / 100,
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        completionRate: 0,
        overdue: 0,
        upcomingDeadlines: 0,
        totalSubtasks: 0,
        completedSubtasks: 0,
        subtaskCompletionRate: 0,
      };
    }
  }

  async createSubtask(subtaskData: InsertSubtask): Promise<Subtask> {
    const docRef = await db.collection(COLLECTIONS.SUBTASKS).add({
      ...subtaskData,
      completed: 0,
      createdAt: new Date()
    });
    const doc = await docRef.get();
    const data = doc.data();
    
    const goal = await this.getGoal(subtaskData.goalId);
    if (goal) {
      await this.updateGoal(goal.id, {
        totalSubtasks: (goal.totalSubtasks || 0) + 1
      });
    }
    
    return {
      id: doc.id,
      goalId: data.goalId,
      title: data.title,
      completed: data.completed ?? 0,
      position: data.position ?? 0,
      createdAt: this.convertTimestamp(data.createdAt),
    } as Subtask;
  }

  async getSubtasksByGoal(goalId: string): Promise<Subtask[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.SUBTASKS)
        .where('goalId', '==', goalId)
        .get();
      
      return snapshot.docs
        .map((doc: any) => {
          const data = doc.data();
          return {
            id: doc.id,
            goalId: data.goalId,
            title: data.title,
            completed: data.completed ?? 0,
            position: data.position ?? 0,
            createdAt: this.convertTimestamp(data.createdAt),
          } as Subtask;
        })
        .sort((a: Subtask, b: Subtask) => a.position - b.position);
    } catch (error) {
      return this.handleNotFoundError(error, []);
    }
  }

  async updateSubtask(id: string, updates: UpdateSubtask): Promise<Subtask | undefined> {
    try {
      const subtaskDoc = await db.collection(COLLECTIONS.SUBTASKS).doc(id).get();
      if (!subtaskDoc.exists) return undefined;
      
      const subtaskData = subtaskDoc.data();
      const oldCompleted = subtaskData.completed ?? 0;
      
      await db.collection(COLLECTIONS.SUBTASKS).doc(id).update({
        ...updates,
        updatedAt: new Date()
      });
      
      const goal = await this.getGoal(subtaskData.goalId);
      if (goal && updates.completed !== undefined) {
        const newCompleted = updates.completed;
        const completedDiff = newCompleted - oldCompleted;
        await this.updateGoal(goal.id, {
          completedSubtasks: (goal.completedSubtasks || 0) + completedDiff
        });
      }
      
      const updatedDoc = await db.collection(COLLECTIONS.SUBTASKS).doc(id).get();
      const data = updatedDoc.data();
      return {
        id: updatedDoc.id,
        goalId: data.goalId,
        title: data.title,
        completed: data.completed ?? 0,
        position: data.position ?? 0,
        createdAt: this.convertTimestamp(data.createdAt),
      } as Subtask;
    } catch (error) {
      console.error('Error updating subtask:', error);
      return undefined;
    }
  }

  async deleteSubtask(id: string): Promise<boolean> {
    try {
      const subtaskDoc = await db.collection(COLLECTIONS.SUBTASKS).doc(id).get();
      if (!subtaskDoc.exists) return false;
      
      const subtaskData = subtaskDoc.data();
      const goal = await this.getGoal(subtaskData.goalId);
      
      await db.collection(COLLECTIONS.SUBTASKS).doc(id).delete();
      
      if (goal) {
        const wasCompleted = subtaskData.completed === 1;
        await this.updateGoal(goal.id, {
          totalSubtasks: Math.max(0, (goal.totalSubtasks || 0) - 1),
          completedSubtasks: wasCompleted ? Math.max(0, (goal.completedSubtasks || 0) - 1) : goal.completedSubtasks
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting subtask:', error);
      return false;
    }
  }
}
