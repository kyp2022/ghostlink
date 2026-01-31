#!/bin/bash

# Stop on error
set -e

REMOTE_USER="root"
REMOTE_HOST="118.31.238.137"
REMOTE_DIR="/opt/ghostlink-backend"
APP_NAME="ghostlink-backend"
PORT="8080"

echo "🚧 Starting backend deployment..."

# 1. Build locally
echo "📦 Building JAR file..."
./mvnw clean package -DskipTests

# Check if jar exists
JAR_FILE=$(ls target/ghostlink-*.jar | head -n 1)
if [ -z "$JAR_FILE" ]; then
  echo "❌ Build failed: JAR file not found in target/"
  exit 1
fi
echo "✅ JAR built: $JAR_FILE"

# 2. Prepare remote directory
echo "Prepare remote server..."
ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR"

# 3. Upload files
echo "🚀 Uploading JAR and Dockerfile..."
ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR/target"
scp -o StrictHostKeyChecking=no "$JAR_FILE" $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/target/
scp -o StrictHostKeyChecking=no Dockerfile $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/

# 4. Remote execution
echo "⚙️  Executing remote deployment commands..."
ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST "
  cd $REMOTE_DIR
  
  # Ensure base image is tagged correctly if loaded from file
  podman tag localhost/eclipse-temurin:21-jdk-alpine eclipse-temurin:21-jdk-alpine || true
  podman tag docker.io/library/eclipse-temurin:21-jdk-alpine eclipse-temurin:21-jdk-alpine || true

  # Build image
  echo 'Building Docker image...'
  docker build -t $APP_NAME .

  # Stop and remove old container
  echo 'Stopping old container...'
  docker stop $APP_NAME || true
  docker rm $APP_NAME || true

  # Run new container
  echo 'Starting new container...'
  docker run -d \
    --name $APP_NAME \
    --restart always \
    -p $PORT:8080 \
    $APP_NAME

  # Cleanup dangling images (optional)
  docker image prune -f
"

# 5. Health Check
echo "🏥 Performing health check..."
echo "Waiting for service to start (15s)..."
for i in {1..15}; do
  if curl -s "http://$REMOTE_HOST:$PORT/actuator/health" | grep -q "UP"; then
    echo "✅ Health check PASSED!"
    break
  fi
  if [ $i -eq 15 ]; then
    echo "⚠️  Health check timed out or failed. Please check logs manually: ssh $REMOTE_USER@$REMOTE_HOST 'docker logs $APP_NAME'"
  fi
  sleep 2
  echo -n "."
done
echo ""

echo "✅ Deployment completed!"
