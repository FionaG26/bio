#!/bin/bash

# US Visa Appointment Monitor - GitHub Deployment Script
# This script helps you prepare and deploy the project to GitHub

set -e

echo "🚀 US Visa Appointment Monitor - GitHub Deployment"
echo "=================================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory."
    exit 1
fi

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your email credentials."
    echo "📧 Remember to set:"
    echo "   EMAIL_USER=fionamuthoni18@gmail.com"
    echo "   EMAIL_PASS=your-gmail-app-password"
    echo ""
    read -p "Press Enter to continue after updating .env file..."
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run tests to make sure everything works
echo "🧪 Testing the application..."
npm run check

# Add all files to git
echo "📋 Adding files to git..."
git add .

# Check if there are any changes to commit
if git diff --cached --exit-code > /dev/null; then
    echo "✅ No changes to commit. Repository is up to date."
else
    # Get commit message from user
    echo "💬 Enter commit message (or press Enter for default):"
    read commit_message
    
    if [ -z "$commit_message" ]; then
        commit_message="Deploy US Visa Appointment Monitor"
    fi
    
    # Commit changes
    echo "💾 Committing changes..."
    git commit -m "$commit_message"
fi

# Check if remote origin exists
if git remote get-url origin &> /dev/null; then
    echo "📡 Remote origin already configured."
else
    echo "🔗 Please enter your GitHub repository URL:"
    echo "   Example: https://github.com/yourusername/us-visa-monitor.git"
    read repo_url
    
    if [ -z "$repo_url" ]; then
        echo "❌ Repository URL is required."
        exit 1
    fi
    
    git remote add origin "$repo_url"
    echo "✅ Added remote origin: $repo_url"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "🎉 Deployment completed successfully!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Visit your GitHub repository"
echo "2. Set up deployment on your preferred platform:"
echo "   • Replit: Import from GitHub"
echo "   • Heroku: Connect GitHub repo"
echo "   • Railway: Deploy from GitHub"
echo "   • Render: Connect repository"
echo ""
echo "3. Set environment variables on your platform:"
echo "   • EMAIL_USER=fionamuthoni18@gmail.com"
echo "   • EMAIL_PASS=your-gmail-app-password"
echo ""
echo "4. Test the deployment and email notifications"
echo ""
echo "📖 For detailed deployment instructions, see DEPLOYMENT.md"
echo "🐛 For issues, check the GitHub repository issues page"
echo ""
echo "Happy monitoring! 🎯"
