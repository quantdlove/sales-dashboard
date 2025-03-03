#!/bin/bash

# This script merges the python-dashboard branch into main
# Make sure you have the necessary permissions to push to main

cd "$(dirname "$0")"  # Navigate to this script's directory

echo "Checking out main branch..."
git checkout main

echo "Pulling latest changes from remote..."
git pull origin main

echo "Merging python-dashboard branch..."
git merge python-dashboard

echo "Pushing changes to main..."
git push origin main

echo "Returning to python-dashboard branch..."
git checkout python-dashboard

echo "Done! Changes have been merged to main branch."