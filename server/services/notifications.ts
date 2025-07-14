import nodemailer from "nodemailer";

class NotificationService {
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    this.emailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "your-email@gmail.com",
        pass: process.env.EMAIL_PASS || "your-app-password",
      },
    });
  }

  async sendEmailNotification(to: string, subject: string, message: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || "your-email@gmail.com",
        to,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1976D2; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">🎉 US Visa Appointment Alert</h1>
            </div>
            <div style="padding: 20px; background-color: #f8f9fa;">
              <h2 style="color: #1976D2;">Appointment Available!</h2>
              <p style="font-size: 16px; line-height: 1.6;">${message}</p>
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <strong>⚠️ Important:</strong> Please verify appointment availability manually on the official website and book through legitimate channels only.
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://ais.usvisa-info.com/en-ke/niv" style="background-color: #1976D2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Visit Official Website</a>
              </div>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This notification was sent by the US Visa Appointment Monitor. 
                This tool is for assistance only and does not guarantee appointment availability.
              </p>
            </div>
          </div>
        `,
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log(`Email notification sent to ${to}`);
    } catch (error) {
      console.error("Error sending email notification:", error);
    }
  }

  async sendTelegramNotification(botToken: string, chatId: string, message: string): Promise<void> {
    try {
      const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      
      const response = await fetch(telegramApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      console.log(`Telegram notification sent to chat ${chatId}`);
    } catch (error) {
      console.error("Error sending Telegram notification:", error);
    }
  }

  async testEmailConfiguration(emailAddress: string): Promise<boolean> {
    try {
      await this.sendEmailNotification(
        emailAddress,
        "Test Email - US Visa Monitor",
        "This is a test email from your US Visa Appointment Monitor. If you received this, your email notifications are working correctly!"
      );
      return true;
    } catch (error) {
      console.error("Email test failed:", error);
      return false;
    }
  }

  async testTelegramConfiguration(botToken: string, chatId: string): Promise<boolean> {
    try {
      await this.sendTelegramNotification(
        botToken,
        chatId,
        "🧪 Test Message\n\nThis is a test message from your US Visa Appointment Monitor. If you received this, your Telegram notifications are working correctly!"
      );
      return true;
    } catch (error) {
      console.error("Telegram test failed:", error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();

