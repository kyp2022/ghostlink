#!/bin/bash

# Stop on error
set -e

PROJECT_ROOT="/Users/ppg/Desktop/kyp/ghostlink"
REMOTE_USER="root"
REMOTE_HOST="118.31.238.137"
REMOTE_DIR="/var/www/ghostlink-web"

echo "🚧 Starting deployment process..."

# 1. Build the web project
echo "📦 Building web project..."
cd "$PROJECT_ROOT/web"
npm install
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed: 'dist' directory not found."
    exit 1
fi

# 2. Deploy files to server
echo "🚀 Uploading files to $REMOTE_HOST..."
# Ensure remote directory exists
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR"
# Upload contents of dist to remote directory
scp -r dist/* $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/

# 3. Setup and Restart Systemd Service
echo "⚙️  Configuring Systemd Service..."
scp $PROJECT_ROOT/ghostlink-web.service $REMOTE_USER@$REMOTE_HOST:/etc/systemd/system/
ssh $REMOTE_USER@$REMOTE_HOST "systemctl daemon-reload && systemctl enable ghostlink-web && systemctl restart ghostlink-web"

# 4. Check Status
echo "🏥 Checking service status..."
ssh $REMOTE_USER@$REMOTE_HOST "systemctl status ghostlink-web --no-pager"

echo "✅ Deployment successfully completed!"
echo "🌍 You can access your site at: http://$REMOTE_HOST:8000"
