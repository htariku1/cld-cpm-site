import { 
  ref, 
  set, 
  get, 
  remove, 
  update, 
  onValue, 
  off,
  DataSnapshot 
} from "firebase/database";
import { database } from "./firebase";
import { LOE, Task, Milestone } from "./data-context";

// Database paths
const LOES_PATH = "loes";
const TASKS_PATH = "tasks";
const MILESTONES_PATH = "milestones";

// Helper function to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// LOE operations
export const loeService = {
  // Get all LOEs
  async getAll(): Promise<LOE[]> {
    try {
      const snapshot = await get(ref(database, LOES_PATH));
      if (snapshot.exists()) {
        return Object.values(snapshot.val()) as LOE[];
      }
      return [];
    } catch (error) {
      console.error("Error fetching LOEs:", error);
      throw error;
    }
  },

  // Add new LOE
  async add(loe: Omit<LOE, 'id'>): Promise<LOE> {
    try {
      const id = generateId();
      const newLOE: LOE = { ...loe, id };
      await set(ref(database, `${LOES_PATH}/${id}`), newLOE);
      return newLOE;
    } catch (error) {
      console.error("Error adding LOE:", error);
      throw error;
    }
  },

  // Update LOE
  async update(id: string, updates: Partial<LOE>): Promise<void> {
    try {
      await update(ref(database, `${LOES_PATH}/${id}`), updates);
    } catch (error) {
      console.error("Error updating LOE:", error);
      throw error;
    }
  },

  // Delete LOE
  async delete(id: string): Promise<void> {
    try {
      await remove(ref(database, `${LOES_PATH}/${id}`));
    } catch (error) {
      console.error("Error deleting LOE:", error);
      throw error;
    }
  },

  // Listen to LOE changes
  subscribe(callback: (loes: LOE[]) => void): () => void {
    const loesRef = ref(database, LOES_PATH);
    
    const handleSnapshot = (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const loes = Object.values(snapshot.val()) as LOE[];
        callback(loes);
      } else {
        callback([]);
      }
    };

    onValue(loesRef, handleSnapshot);
    
    return () => off(loesRef, 'value', handleSnapshot);
  }
};

// Task operations
export const taskService = {
  // Get all tasks
  async getAll(): Promise<Task[]> {
    try {
      const snapshot = await get(ref(database, TASKS_PATH));
      if (snapshot.exists()) {
        return Object.values(snapshot.val()) as Task[];
      }
      return [];
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  },

  // Add new task
  async add(task: Omit<Task, 'id'>): Promise<Task> {
    try {
      const id = generateId();
      const newTask: Task = { ...task, id };
      await set(ref(database, `${TASKS_PATH}/${id}`), newTask);
      return newTask;
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  },

  // Update task
  async update(id: string, updates: Partial<Task>): Promise<void> {
    try {
      await update(ref(database, `${TASKS_PATH}/${id}`), updates);
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  // Delete task
  async delete(id: string): Promise<void> {
    try {
      await remove(ref(database, `${TASKS_PATH}/${id}`));
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  },

  // Listen to task changes
  subscribe(callback: (tasks: Task[]) => void): () => void {
    const tasksRef = ref(database, TASKS_PATH);
    
    const handleSnapshot = (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const tasks = Object.values(snapshot.val()) as Task[];
        callback(tasks);
      } else {
        callback([]);
      }
    };

    onValue(tasksRef, handleSnapshot);
    
    return () => off(tasksRef, 'value', handleSnapshot);
  }
};

// Milestone operations
export const milestoneService = {
  // Get all milestones
  async getAll(): Promise<Milestone[]> {
    try {
      const snapshot = await get(ref(database, MILESTONES_PATH));
      if (snapshot.exists()) {
        return Object.values(snapshot.val()) as Milestone[];
      }
      return [];
    } catch (error) {
      console.error("Error fetching milestones:", error);
      throw error;
    }
  },

  // Add new milestone
  async add(milestone: Omit<Milestone, 'id'>): Promise<Milestone> {
    try {
      const id = generateId();
      const newMilestone: Milestone = { ...milestone, id };
      await set(ref(database, `${MILESTONES_PATH}/${id}`), newMilestone);
      return newMilestone;
    } catch (error) {
      console.error("Error adding milestone:", error);
      throw error;
    }
  },

  // Update milestone
  async update(id: string, updates: Partial<Milestone>): Promise<void> {
    try {
      await update(ref(database, `${MILESTONES_PATH}/${id}`), updates);
    } catch (error) {
      console.error("Error updating milestone:", error);
      throw error;
    }
  },

  // Delete milestone
  async delete(id: string): Promise<void> {
    try {
      await remove(ref(database, `${MILESTONES_PATH}/${id}`));
    } catch (error) {
      console.error("Error deleting milestone:", error);
      throw error;
    }
  },

  // Listen to milestone changes
  subscribe(callback: (milestones: Milestone[]) => void): () => void {
    const milestonesRef = ref(database, MILESTONES_PATH);
    
    const handleSnapshot = (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const milestones = Object.values(snapshot.val()) as Milestone[];
        callback(milestones);
      } else {
        callback([]);
      }
    };

    onValue(milestonesRef, handleSnapshot);
    
    return () => off(milestonesRef, 'value', handleSnapshot);
  }
};

// Initialize database with sample data if empty
export const initializeDatabase = async () => {
  try {
    const loesSnapshot = await get(ref(database, LOES_PATH));
    const tasksSnapshot = await get(ref(database, TASKS_PATH));
    const milestonesSnapshot = await get(ref(database, MILESTONES_PATH));

    // Only initialize if all collections are empty
    if (!loesSnapshot.exists() && !tasksSnapshot.exists() && !milestonesSnapshot.exists()) {
      const { sampleLOEs, sampleTasks, sampleMilestones } = await import('./sample-loe-data');
      
      // Add sample LOEs
      for (const loe of sampleLOEs) {
        await set(ref(database, `${LOES_PATH}/${loe.id}`), loe);
      }
      
      // Add sample tasks
      for (const task of sampleTasks) {
        await set(ref(database, `${TASKS_PATH}/${task.id}`), task);
      }
      
      // Add sample milestones
      for (const milestone of sampleMilestones) {
        await set(ref(database, `${MILESTONES_PATH}/${milestone.id}`), milestone);
      }
      
      console.log("Database initialized with sample data");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}; 