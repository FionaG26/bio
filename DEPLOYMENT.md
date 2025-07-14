# Deployment Guide

This guide will help you deploy the US Visa Appointment Monitor to various platforms.

## Prerequisites

- GitHub account
- Email service credentials (Gmail recommended)
- Basic knowledge of git commands

## Step 1: Prepare for GitHub

1. **Create a new GitHub repository**:
   - Go to GitHub and create a new repository
   - Name it something like `us-visa-monitor`
   - Make it public or private as preferred
   - Don't initialize with README (we already have one)

2. **Initialize git in your project**:
```bash
git init
git add .
git commit -m "Initial commit: US Visa Appointment Monitor"
```

3. **Connect to GitHub**:
```bash
git remote add origin https://github.com/yourusername/us-visa-monitor.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up Email Configuration

### Gmail Setup (Recommended)
1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Generate an App Password:
   - Go to Google Account > Security > App passwords
   - Select "Mail" and generate a password
   - Save this password securely

### Environment Variables
Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

Edit `.env`:
```
EMAIL_USER=fionamuthoni18@gmail.com
EMAIL_PASS=your-generated-app-password
```

## Step 3: Local Testing

Test the application locally:
```bash
npm install
npm run dev
```

Visit `http://localhost:5000` and verify:
- Dashboard loads correctly
- Email notifications can be tested
- Manual checks work
- Settings can be saved

## Step 4: Deploy to Various Platforms

### A. Deploy to Replit (Easiest)

1. Go to [Replit](https://replit.com)
2. Click "Create Repl"
3. Select "Import from GitHub"
4. Enter your repository URL
5. Set environment variables in Replit Secrets:
   - `EMAIL_USER`: fionamuthoni18@gmail.com
   - `EMAIL_PASS`: your-app-password
6. Click "Run"

### B. Deploy to Heroku

1. Install Heroku CLI
2. Login to Heroku:
```bash
heroku login
```

3. Create a new app:
```bash
heroku create your-app-name
```

4. Set environment variables:
```bash
heroku config:set EMAIL_USER=fionamuthoni18@gmail.com
heroku config:set EMAIL_PASS=your-app-password
```

5. Deploy:
```bash
git push heroku main
```

### C. Deploy to Railway

1. Go to [Railway](https://railway.app)
2. Sign up/login with GitHub
3. Create new project from GitHub repo
4. Set environment variables in Railway dashboard
5. Deploy automatically

### D. Deploy to Render

1. Go to [Render](https://render.com)
2. Connect your GitHub account
3. Create a new web service
4. Select your repository
5. Set environment variables
6. Deploy

### E. Deploy to DigitalOcean App Platform

1. Go to DigitalOcean
2. Create new App
3. Connect GitHub repository
4. Configure environment variables
5. Deploy

## Step 5: Configure Your Domain (Optional)

If you want a custom domain:
1. Purchase a domain from any registrar
2. Configure DNS to point to your deployment
3. Set up SSL certificate (most platforms do this automatically)

## Step 6: Monitor Your Deployment

### Health Checks
Most platforms provide health monitoring. The app includes:
- Health endpoint at `/api/system/stats`
- Automatic error logging
- WebSocket connection monitoring

### Scaling
For high traffic:
- Enable auto-scaling on your platform
- Consider using a database (PostgreSQL) instead of memory storage
- Set up load balancing if needed

## Step 7: Maintenance

### Regular Tasks
- Monitor email delivery rates
- Check system logs for errors
- Update dependencies periodically
- Review compliance with embassy website changes

### Backup Strategy
- Export activity logs regularly
- Back up any persistent data
- Keep environment variables secure

## Troubleshooting Common Issues

### Email Not Sending
- Verify Gmail app password is correct
- Check spam/junk folders
- Ensure 2FA is enabled on Gmail
- Try with a different email service

### WebSocket Issues
- Ensure your platform supports WebSockets
- Check firewall settings
- Verify SSL configuration for secure connections

### Performance Issues
- Monitor memory usage
- Check for memory leaks in long-running processes
- Consider upgrading server resources

## Security Considerations

1. **Never commit sensitive data**:
   - Keep `.env` files out of git
   - Use platform-specific secret management
   - Regularly rotate passwords

2. **Rate limiting**:
   - Application includes built-in rate limiting
   - Monitor embassy website terms of service
   - Adjust check intervals if needed

3. **Data privacy**:
   - Only collect necessary information
   - Secure email addresses
   - Comply with data protection regulations

## Next Steps

After deployment:
1. Test all features thoroughly
2. Monitor system performance
3. Set up alerts for downtime
4. Document any customizations
5. Share the URL with users

## Support

If you encounter issues:
1. Check the application logs
2. Review this deployment guide
3. Create an issue on GitHub
4. Contact support if available

Remember: This tool is for monitoring assistance only. Always verify appointments manually and book through official channels.
