# US Visa Appointment Monitor

A compliant web application that helps monitor US visa appointment availability at the Nairobi Embassy with email notifications and real-time updates.

## Features

- **Real-time Monitoring**: Automatic checking with configurable intervals (30s to 5 minutes)
- **Email Notifications**: Instant alerts sent to your email when appointments become available
- **Sound & Browser Alerts**: Audio notifications and browser notifications
- **Activity Logging**: Complete history of all monitoring activities
- **WebSocket Updates**: Real-time status updates without page refresh
- **Compliance Focused**: Respects embassy website terms and rate limits

## Screenshots

![Dashboard](./screenshots/dashboard.png)
*Main monitoring dashboard showing appointment status*

![Settings](./screenshots/settings.png)
*Monitoring and notification settings*

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Gmail account for email notifications (or configure other email service)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/us-visa-monitor.git
cd us-visa-monitor
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your email credentials:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

4. Start the application:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5000`

## Configuration

### Email Setup

For Gmail notifications:
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use your Gmail address and the generated app password in the environment variables

### Monitoring Settings

- **Check Interval**: How often to check for appointments (30s - 5 minutes)
- **Visa Type**: Type of visa to monitor (B1/B2, F1, H1B, J1)
- **Notifications**: Enable/disable email, sound, and browser notifications

## Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deploy to Replit
1. Import this repository to Replit
2. Set environment variables in Replit Secrets
3. Click "Run" to start the application

### Deploy to Other Platforms

**Heroku:**
```bash
heroku create your-app-name
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
git push heroku main
```

**Railway:**
```bash
railway login
railway new
railway add
railway deploy
```

## API Endpoints

- `GET /api/monitoring/status` - Get current monitoring status
- `POST /api/monitoring/check` - Perform manual appointment check
- `POST /api/monitoring/start` - Start automatic monitoring
- `POST /api/monitoring/stop` - Stop automatic monitoring
- `GET /api/monitoring/settings` - Get monitoring settings
- `POST /api/monitoring/settings` - Update monitoring settings
- `GET /api/activity-logs` - Get activity history
- `DELETE /api/activity-logs` - Clear activity logs
- `GET /api/system/stats` - Get system statistics

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, WebSocket
- **Database**: In-memory storage (easily extendable to PostgreSQL)
- **Build**: Vite, ESBuild
- **Notifications**: Nodemailer, Web Notifications API

## Important Notes

⚠️ **Compliance**: This tool is for monitoring assistance only. Users must:
- Verify appointment availability manually on the official website
- Book appointments through official channels only
- Respect embassy website terms of service
- Not use automated booking tools

⚠️ **Legal**: This application does not automatically book appointments. It only notifies users of potential availability.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the [FAQ](./docs/FAQ.md)
- Review the [troubleshooting guide](./docs/TROUBLESHOOTING.md)

## Disclaimer

This tool is provided for educational and assistance purposes only. Users are responsible for complying with all applicable laws and terms of service when using this application. The developers are not responsible for any misuse or consequences arising from the use of this tool.
