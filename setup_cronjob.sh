#!/bin/bash

# Create a cron job to run the dashboard and auto-update
CRON_JOB="0 */6 * * * /root/claude-test/update_and_run.sh > /root/claude-test/cron.log 2>&1"

# Add to crontab if it's not already there
(crontab -l 2>/dev/null | grep -v "/root/claude-test/update_and_run.sh"; echo "$CRON_JOB") | crontab -

echo "Cron job set up to run dashboard and update every 6 hours"
echo "To start immediately, run: ./update_and_run.sh"