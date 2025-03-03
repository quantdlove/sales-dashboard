#!/bin/bash

# Check if this script is running as root
if [ "$(id -u)" != "0" ]; then
    echo "This script must be run as root" 1>&2
    exit 1
fi

# Navigate to the project directory
cd /root/claude-test

# Pull latest changes from GitHub
git pull origin main

# Install any new dependencies
source dashboard_env/bin/activate
pip install -r requirements.txt 2>/dev/null || echo "No requirements.txt found, skipping"

# Add all changes to git
git add -A

# Commit any local changes
git commit -m "Automatic update from server $(date)" || echo "No changes to commit"

# Push changes to GitHub
git push origin python-dashboard || echo "Could not push changes. Internet connection issue or branch doesn't exist on remote."

# Run the dashboard with the helper script
./run_dashboard.sh