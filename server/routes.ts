import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { monitoringService } from "./services/monitoring";
import { notificationService } from "./services/notifications";
import { insertMonitoringSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients: Map<number, WebSocket> = new Map();

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'auth' && data.userId) {
          clients.set(data.userId, ws);
          console.log(`User ${data.userId} authenticated via WebSocket`);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      // Remove client from map
      for (const [userId, client] of clients.entries()) {
        if (client === ws) {
          clients.delete(userId);
          break;
        }
      }
      console.log('WebSocket client disconnected');
    });
  });

  // Broadcast function for real-time updates
  const broadcast = (userId: number, data: any) => {
    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  };

  // Default user ID for demo (in a real app, this would come from authentication)
  const DEFAULT_USER_ID = 1;

  // Initialize default user
  const defaultUser = await storage.getUserByUsername("demo");
  if (!defaultUser) {
    await storage.createUser({ username: "demo", password: "demo" });
  }

  // API Routes

  // Get monitoring status
  app.get("/api/monitoring/status", async (req, res) => {
    try {
      const status = await monitoringService.getMonitoringStatus(DEFAULT_USER_ID);
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Manual appointment check
  app.post("/api/monitoring/check", async (req, res) => {
    try {
      const result = await monitoringService.checkAppointmentAvailability(DEFAULT_USER_ID);
      
      // Broadcast real-time update
      broadcast(DEFAULT_USER_ID, {
        type: 'appointment_check',
        data: result
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Start monitoring
  app.post("/api/monitoring/start", async (req, res) => {
    try {
      await monitoringService.startMonitoring(DEFAULT_USER_ID);
      
      broadcast(DEFAULT_USER_ID, {
        type: 'monitoring_started',
        data: { isActive: true }
      });

      res.json({ success: true, message: "Monitoring started" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Stop monitoring
  app.post("/api/monitoring/stop", async (req, res) => {
    try {
      await monitoringService.stopMonitoring(DEFAULT_USER_ID);
      
      broadcast(DEFAULT_USER_ID, {
        type: 'monitoring_stopped',
        data: { isActive: false }
      });

      res.json({ success: true, message: "Monitoring stopped" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Update monitoring settings
  app.post("/api/monitoring/settings", async (req, res) => {
    try {
      const validatedData = insertMonitoringSettingsSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
      });

      const settings = await storage.upsertMonitoringSettings(validatedData);
      
      broadcast(DEFAULT_USER_ID, {
        type: 'settings_updated',
        data: settings
      });

      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Get monitoring settings
  app.get("/api/monitoring/settings", async (req, res) => {
    try {
      const settings = await storage.getMonitoringSettings(DEFAULT_USER_ID);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get activity logs
  app.get("/api/activity-logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getActivityLogs(DEFAULT_USER_ID, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Clear activity logs
  app.delete("/api/activity-logs", async (req, res) => {
    try {
      await storage.clearActivityLogs(DEFAULT_USER_ID);
      
      broadcast(DEFAULT_USER_ID, {
        type: 'logs_cleared',
        data: {}
      });

      res.json({ success: true, message: "Activity logs cleared" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get system stats
  app.get("/api/system/stats", async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Test email notification
  app.post("/api/notifications/test/email", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email address is required" });
      }

      const success = await notificationService.testEmailConfiguration(email);
      res.json({ success, message: success ? "Test email sent" : "Email test failed" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Test Telegram notification
  app.post("/api/notifications/test/telegram", async (req, res) => {
    try {
      const { botToken, chatId } = req.body;
      if (!botToken || !chatId) {
        return res.status(400).json({ error: "Bot token and chat ID are required" });
      }

      const success = await notificationService.testTelegramConfiguration(botToken, chatId);
      res.json({ success, message: success ? "Test Telegram message sent" : "Telegram test failed" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  return httpServer;
}
