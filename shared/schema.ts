import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const monitoringSettings = pgTable("monitoring_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  checkInterval: integer("check_interval").notNull().default(60), // seconds
  visaType: text("visa_type").notNull().default("B1B2"),
  soundAlerts: boolean("sound_alerts").notNull().default(true),
  browserNotifications: boolean("browser_notifications").notNull().default(true),
  emailNotifications: boolean("email_notifications").notNull().default(false),
  emailAddress: text("email_address"),
  telegramBotToken: text("telegram_bot_token"),
  telegramChatId: text("telegram_chat_id"),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const appointmentChecks = pgTable("appointment_checks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  checkTime: timestamp("check_time").defaultNow(),
  status: text("status").notNull(), // "no_appointments", "appointments_available", "error"
  message: text("message"),
  responseTime: integer("response_time"), // milliseconds
  errorDetails: text("error_details"),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: text("metadata"), // JSON string for additional data
});

export const systemStats = pgTable("system_stats", {
  id: serial("id").primaryKey(),
  totalChecks: integer("total_checks").notNull().default(0),
  successfulChecks: integer("successful_checks").notNull().default(0),
  errorCount: integer("error_count").notNull().default(0),
  averageResponseTime: integer("average_response_time").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMonitoringSettingsSchema = createInsertSchema(monitoringSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppointmentCheckSchema = createInsertSchema(appointmentChecks).omit({
  id: true,
  checkTime: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export const insertSystemStatsSchema = createInsertSchema(systemStats).omit({
  id: true,
  lastUpdated: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type MonitoringSettings = typeof monitoringSettings.$inferSelect;
export type InsertMonitoringSettings = z.infer<typeof insertMonitoringSettingsSchema>;

export type AppointmentCheck = typeof appointmentChecks.$inferSelect;
export type InsertAppointmentCheck = z.infer<typeof insertAppointmentCheckSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type SystemStats = typeof systemStats.$inferSelect;
export type InsertSystemStats = z.infer<typeof insertSystemStatsSchema>;
