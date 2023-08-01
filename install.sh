#!/bin/bash

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Build the Vite project
echo "Building the Vite project..."
npm run build

# Start Electron app
echo "Starting the Electron app..."
npm run start

echo "Done!"