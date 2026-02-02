#!/bin/bash

# Configuration
API_TOKEN="0ZNxsG-Daialx7a-K7rPjPrzoUPiN8YhDdGMOeRJ"
PROJECT_DIR="web"
DIST_DIR="dist"

# Function to check proxy
check_proxy() {
    local port=$1
    if nc -z 127.0.0.1 $port 2>/dev/null; then
        echo "✅ Detected active proxy on port $port"
        return 0
    fi
    return 1
}

# Try to find proxy
PROXY_PORT=""

echo "🔍 Checking for local proxies..."

if check_proxy 7890; then
    PROXY_PORT=7890
elif check_proxy 7897; then
    PROXY_PORT=7897
fi

if [ -n "$PROXY_PORT" ]; then
    # Set proxy variables
    export https_proxy=http://127.0.0.1:$PROXY_PORT
    export http_proxy=http://127.0.0.1:$PROXY_PORT
    # Also set for Node specifically if needed
    export ALL_PROXY=http://127.0.0.1:$PROXY_PORT
    
    echo "🚀 Proxy environment variables set to localhost:$PROXY_PORT"
    echo "🔄 Retrying deployment..."
    
    # Run the deployment
    export CLOUDFLARE_API_TOKEN="$API_TOKEN"
    
    # Check if we are already in the web directory or need to navigate
    if [ -d "$PROJECT_DIR" ]; then
        cd "$PROJECT_DIR" || exit
    fi
    
    # Ensure dist exists
    if [ ! -d "$DIST_DIR" ]; then
        echo "⚠️  Dist directory not found. Building first..."
        npm run build
    fi
    
    npx wrangler pages deploy "$DIST_DIR"
    
else
    echo "⚠️  No local proxy detected on port 7890 or 7897."
    echo ""
    echo "📋 Manual Deployment Instructions:"
    echo "1. Open your browser and go to: https://dash.cloudflare.com/"
    echo "2. Log in and select 'Workers & Pages' > 'Create Application' > 'Pages' > 'Create using direct upload'."
    echo "3. Project Name: ghostlink-web"
    echo "4. Upload the following directory:"
    PROJECT_FULL_PATH="$(pwd)/$PROJECT_DIR/$DIST_DIR"
    echo "   $PROJECT_FULL_PATH"
    echo ""
fi
