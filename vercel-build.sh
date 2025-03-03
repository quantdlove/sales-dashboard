#!/bin/bash

# This script is used by Vercel to build and deploy the application

# Install dependencies
npm install

# Build the Next.js app
npm run build

# Print success message
echo "Build completed successfully!"