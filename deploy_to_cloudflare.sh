#!/bin/bash

# Configuration
DIST_DIR="web/dist"
PROJECT_NAME="ghostlink-web"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚧 Starting Cloudflare Pages deployment...${NC}"

# Navigate to web directory
cd web || { echo -e "${RED}❌ Web directory not found!${NC}"; exit 1; }

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Build project
echo -e "${YELLOW}📦 Building web project...${NC}"
npm run build 

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

# Proxy Detection Logic
detect_proxy() {
    local ports=(7890 7897 1080 1087 8888)
    for port in "${ports[@]}"; do
        if nc -z 127.0.0.1 $port 2>/dev/null; then
            echo -e "${YELLOW}🔍 Found active proxy on port $port${NC}"
            export http_proxy="http://127.0.0.1:$port"
            export https_proxy="http://127.0.0.1:$port"
            export all_proxy="socks5://127.0.0.1:$port"
            echo -e "${GREEN}✅ Proxy environment variables set.${NC}"
            return 0
        fi
    done
    echo -e "${YELLOW}⚠️ No common proxy ports open (checked: ${ports[*]}). Proceeding without proxy...${NC}"
    return 1
}

detect_proxy

# Deploy to Cloudflare Pages
echo -e "${YELLOW}🚀 Deploying to Cloudflare Pages...${NC}"

# Check filter user login status or use environment variable
# Assuming user is logged in via `npx wrangler login` or has CLOUDFLARE_API_TOKEN
# We use npx to avoid global install requirement

npx wrangler pages deploy dist --project-name "$PROJECT_NAME"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🌍 Visit your dashboard to see your site.${NC}"
else
    echo -e "${RED}❌ Deployment failed. Network issue possibly persists.${NC}"
    echo -e "${YELLOW}👉 Manual Deployment Instructions:${NC}"
    echo -e "1. Login to Cloudflare Dashboard (https://dash.cloudflare.com)"
    echo -e "2. Go to 'Workers & Pages' -> 'Create Application' -> 'Pages' -> 'Upload assets'"
    echo -e "3. Project Name: $PROJECT_NAME"
    echo -e "4. Drag and drop the folder: ${GREEN}$(pwd)/dist${NC}"
    exit 1
fi
