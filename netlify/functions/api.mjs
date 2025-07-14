import express from 'express';
import serverless from 'serverless-http';
import { storage } from '../../server/storage.js';
import { monitoringService } from '../../server/services/monitoring.js';
import { notificationService } from '../../server/services/notifications.js';

const app = express();

// Configure Express
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS for Netlify
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Default user ID for serverless environment
const DEFAULT_USER_ID = 1;

// Initialize default user for serverless
async function initializeUser() {
  try {
    const defaultUser = await storage.getUserByUsername("demo");
    if (!defaultUser) {
      await storage.createUser({ username: "demo", password: "demo" });
    }
  } catch (error) {
    console.error('Error initializing user:', error);
  }
}

// API Routes (simplified for serverless)
app.get("/api/monitoring/status", async (req, res) => {
  try {
    await initializeUser();
    const status = await monitoringService.getMonitoringStatus(DEFAULT_USER_ID);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/monitoring/check", async (req, res) => {
  try {
    await initializeUser();
    const result = await monitoringService.checkAppointmentAvailability(DEFAULT_USER_ID);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/monitoring/start", async (req, res) => {
  try {
    await initializeUser();
    await monitoringService.startMonitoring(DEFAULT_USER_ID);
    res.json({ success: true, message: "Monitoring started" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/monitoring/stop", async (req, res) => {
  try {
    await initializeUser();
    await monitoringService.stopMonitoring(DEFAULT_USER_ID);
    res.json({ success: true, message: "Monitoring stopped" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/monitoring/settings", async (req, res) => {
  try {
    await initializeUser();
    const settings = await storage.getMonitoringSettings(DEFAULT_USER_ID);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/monitoring/settings", async (req, res) => {
  try {
    await initializeUser();
    const settings = await storage.upsertMonitoringSettings({
      ...req.body,
      userId: DEFAULT_USER_ID,
    });
    res.json(settings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/activity-logs", async (req, res) => {
  try {
    await initializeUser();
    const limit = parseInt(req.query.limit) || 50;
    const logs = await storage.getActivityLogs(DEFAULT_USER_ID, limit);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/activity-logs", async (req, res) => {
  try {
    await initializeUser();
    await storage.clearActivityLogs(DEFAULT_USER_ID);
    res.json({ success: true, message: "Activity logs cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/system/stats", async (req, res) => {
  try {
    const stats = await storage.getSystemStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/notifications/test/email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }
    const success = await notificationService.testEmailConfiguration(email);
    res.json({ success, message: success ? "Test email sent" : "Email test failed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export handler for Netlify Functions
export const handler = serverless(app);
