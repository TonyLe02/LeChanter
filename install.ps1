#!/bin/bash

# Install dependencies
#echo "Installing Node.js dependencies..."
#npm install

# Start callback server in background
echo "Starting callback server..."
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "callback-server.js"

# Build the Vite project
echo "Building the Vite project..."
npm run build

# Start Electron app
echo "Starting the Electron app..."
npm run start

echo "Done!"