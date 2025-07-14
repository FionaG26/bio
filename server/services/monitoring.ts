import { storage } from "../storage";
import { notificationService } from "./notifications";
import type { InsertAppointmentCheck, InsertActivityLog } from "@shared/schema";

interface MonitoringStatus {
  isAvailable: boolean;
  message: string;
  responseTime: number;
  error?: string;
}

class MonitoringService {
  private activeMonitors: Map<number, NodeJS.Timer> = new Map();

  async checkAppointmentAvailability(userId: number): Promise<MonitoringStatus> {
    const startTime = Date.now();
    
    try {
      // Log the check attempt
      await storage.createActivityLog({
        userId,
        action: "manual_check",
        message: "Manual appointment availability check initiated",
      });

      // Simulate checking the embassy website
      // In a real implementation, this would use Puppeteer/Playwright
      // to check the actual website respecting rate limits
      const responseTime = Date.now() - startTime;
      
      // Simulate different scenarios
      const scenarios = [
        { isAvailable: false, message: "No Appointments Available", weight: 0.9 },
        { isAvailable: true, message: "Appointments Available", weight: 0.1 },
      ];
      
      const random = Math.random();
      let cumulative = 0;
      let selectedScenario = scenarios[0];
      
      for (const scenario of scenarios) {
        cumulative += scenario.weight;
        if (random <= cumulative) {
          selectedScenario = scenario;
          break;
        }
      }

      const status: MonitoringStatus = {
        isAvailable: selectedScenario.isAvailable,
        message: selectedScenario.message,
        responseTime,
      };

      // Record the check
      await storage.createAppointmentCheck({
        userId,
        status: selectedScenario.isAvailable ? "appointments_available" : "no_appointments",
        message: selectedScenario.message,
        responseTime,
      });

      // Log the result
      await storage.createActivityLog({
        userId,
        action: "check_result",
        message: `Appointment check completed: ${selectedScenario.message}`,
        metadata: JSON.stringify({ responseTime, isAvailable: selectedScenario.isAvailable }),
      });

      // Send notifications if appointments are available
      if (selectedScenario.isAvailable) {
        await this.handleAppointmentAvailable(userId);
      }

      // Update system stats
      await this.updateSystemStats(responseTime, !selectedScenario.isAvailable);

      return status;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      await storage.createAppointmentCheck({
        userId,
        status: "error",
        message: "Error checking appointment availability",
        responseTime,
        errorDetails: errorMessage,
      });

      await storage.createActivityLog({
        userId,
        action: "check_error",
        message: `Error during appointment check: ${errorMessage}`,
        metadata: JSON.stringify({ responseTime, error: errorMessage }),
      });

      await this.updateSystemStats(responseTime, false, true);

      return {
        isAvailable: false,
        message: "Error checking appointment availability",
        responseTime,
        error: errorMessage,
      };
    }
  }

  async startMonitoring(userId: number): Promise<void> {
    const settings = await storage.getMonitoringSettings(userId);
    if (!settings) {
      throw new Error("No monitoring settings found");
    }

    // Stop existing monitoring if any
    this.stopMonitoring(userId);

    // Start new monitoring
    const interval = setInterval(async () => {
      await this.checkAppointmentAvailability(userId);
    }, settings.checkInterval * 1000);

    this.activeMonitors.set(userId, interval);

    // Update settings to active
    await storage.upsertMonitoringSettings({
      ...settings,
      isActive: true,
    });

    await storage.createActivityLog({
      userId,
      action: "monitoring_started",
      message: `Monitoring started for ${settings.visaType} visa appointments (${settings.checkInterval}s interval)`,
    });
  }

  async stopMonitoring(userId: number): Promise<void> {
    const timer = this.activeMonitors.get(userId);
    if (timer) {
      clearInterval(timer);
      this.activeMonitors.delete(userId);
    }

    const settings = await storage.getMonitoringSettings(userId);
    if (settings) {
      await storage.upsertMonitoringSettings({
        ...settings,
        isActive: false,
      });
    }

    await storage.createActivityLog({
      userId,
      action: "monitoring_stopped",
      message: "Monitoring stopped",
    });
  }

  private async handleAppointmentAvailable(userId: number): Promise<void> {
    const settings = await storage.getMonitoringSettings(userId);
    if (!settings) return;

    await storage.createActivityLog({
      userId,
      action: "appointment_found",
      message: "Appointment availability detected!",
    });

    // Send email notification
    if (settings.emailNotifications && settings.emailAddress) {
      await notificationService.sendEmailNotification(
        settings.emailAddress,
        "US Visa Appointment Available",
        `An appointment slot has become available for ${settings.visaType} visa at the Nairobi Embassy. Please check the official website immediately to book your appointment.`
      );
    }

    // Send Telegram notification
    if (settings.telegramBotToken && settings.telegramChatId) {
      await notificationService.sendTelegramNotification(
        settings.telegramBotToken,
        settings.telegramChatId,
        `🎉 Appointment Available!\n\nAn appointment slot has become available for ${settings.visaType} visa at the Nairobi Embassy. Check the official website now!`
      );
    }
  }

  private async updateSystemStats(responseTime: number, success: boolean, error: boolean = false): Promise<void> {
    const stats = await storage.getSystemStats();
    if (!stats) return;

    const totalChecks = stats.totalChecks + 1;
    const successfulChecks = stats.successfulChecks + (success ? 1 : 0);
    const errorCount = stats.errorCount + (error ? 1 : 0);
    const averageResponseTime = Math.round(
      ((stats.averageResponseTime * stats.totalChecks) + responseTime) / totalChecks
    );

    await storage.updateSystemStats({
      totalChecks,
      successfulChecks,
      errorCount,
      averageResponseTime,
    });
  }

  isMonitoringActive(userId: number): boolean {
    return this.activeMonitors.has(userId);
  }

  async getMonitoringStatus(userId: number) {
    const settings = await storage.getMonitoringSettings(userId);
    const recentChecks = await storage.getRecentAppointmentChecks(userId, 10);
    const isActive = this.isMonitoringActive(userId);

    return {
      isActive,
      settings,
      recentChecks,
      lastCheck: recentChecks[0],
    };
  }
}

export const monitoringService = new MonitoringService();

