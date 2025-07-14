import { 
  users, 
  monitoringSettings, 
  appointmentChecks, 
  activityLogs, 
  systemStats,
  type User, 
  type InsertUser,
  type MonitoringSettings,
  type InsertMonitoringSettings,
  type AppointmentCheck,
  type InsertAppointmentCheck,
  type ActivityLog,
  type InsertActivityLog,
  type SystemStats,
  type InsertSystemStats
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Monitoring settings
  getMonitoringSettings(userId: number): Promise<MonitoringSettings | undefined>;
  upsertMonitoringSettings(settings: InsertMonitoringSettings): Promise<MonitoringSettings>;
  
  // Appointment checks
  createAppointmentCheck(check: InsertAppointmentCheck): Promise<AppointmentCheck>;
  getRecentAppointmentChecks(userId: number, limit?: number): Promise<AppointmentCheck[]>;
  
  // Activity logs
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(userId: number, limit?: number): Promise<ActivityLog[]>;
  clearActivityLogs(userId: number): Promise<void>;
  
  // System stats
  getSystemStats(): Promise<SystemStats | undefined>;
  updateSystemStats(stats: Partial<InsertSystemStats>): Promise<SystemStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private monitoringSettings: Map<number, MonitoringSettings>;
  private appointmentChecks: Map<number, AppointmentCheck>;
  private activityLogs: Map<number, ActivityLog>;
  private systemStats: SystemStats | undefined;
  
  private currentUserId: number;
  private currentMonitoringId: number;
  private currentCheckId: number;
  private currentLogId: number;

  constructor() {
    this.users = new Map();
    this.monitoringSettings = new Map();
    this.appointmentChecks = new Map();
    this.activityLogs = new Map();
    this.systemStats = {
      id: 1,
      totalChecks: 0,
      successfulChecks: 0,
      errorCount: 0,
      averageResponseTime: 0,
      lastUpdated: new Date(),
    };
    
    this.currentUserId = 1;
    this.currentMonitoringId = 1;
    this.currentCheckId = 1;
    this.currentLogId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMonitoringSettings(userId: number): Promise<MonitoringSettings | undefined> {
    return Array.from(this.monitoringSettings.values()).find(
      (settings) => settings.userId === userId
    );
  }

  async upsertMonitoringSettings(settings: InsertMonitoringSettings): Promise<MonitoringSettings> {
    const existing = await this.getMonitoringSettings(settings.userId!);
    
    if (existing) {
      const updated: MonitoringSettings = {
        ...existing,
        ...settings,
        updatedAt: new Date(),
      };
      this.monitoringSettings.set(existing.id, updated);
      return updated;
    } else {
      const id = this.currentMonitoringId++;
      const newSettings: MonitoringSettings = {
        id,
        ...settings,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.monitoringSettings.set(id, newSettings);
      return newSettings;
    }
  }

  async createAppointmentCheck(check: InsertAppointmentCheck): Promise<AppointmentCheck> {
    const id = this.currentCheckId++;
    const appointmentCheck: AppointmentCheck = {
      id,
      ...check,
      checkTime: new Date(),
    };
    this.appointmentChecks.set(id, appointmentCheck);
    return appointmentCheck;
  }

  async getRecentAppointmentChecks(userId: number, limit: number = 50): Promise<AppointmentCheck[]> {
    const userChecks = Array.from(this.appointmentChecks.values())
      .filter(check => check.userId === userId)
      .sort((a, b) => b.checkTime!.getTime() - a.checkTime!.getTime())
      .slice(0, limit);
    
    return userChecks;
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = this.currentLogId++;
    const activityLog: ActivityLog = {
      id,
      ...log,
      timestamp: new Date(),
    };
    this.activityLogs.set(id, activityLog);
    return activityLog;
  }

  async getActivityLogs(userId: number, limit: number = 100): Promise<ActivityLog[]> {
    const userLogs = Array.from(this.activityLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime())
      .slice(0, limit);
    
    return userLogs;
  }

  async clearActivityLogs(userId: number): Promise<void> {
    const userLogIds = Array.from(this.activityLogs.entries())
      .filter(([_, log]) => log.userId === userId)
      .map(([id, _]) => id);
    
    userLogIds.forEach(id => this.activityLogs.delete(id));
  }

  async getSystemStats(): Promise<SystemStats | undefined> {
    return this.systemStats;
  }

  async updateSystemStats(stats: Partial<InsertSystemStats>): Promise<SystemStats> {
    if (this.systemStats) {
      this.systemStats = {
        ...this.systemStats,
        ...stats,
        lastUpdated: new Date(),
      };
    }
    return this.systemStats!;
  }
}

export const storage = new MemStorage();
