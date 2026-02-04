#!/bin/bash

set -euo pipefail

REMOTE_HOST="${REMOTE_HOST:-${TencentHOST:-${HOST:-}}}"
REMOTE_USER="${REMOTE_USER:-${TencentUSER:-${USER:-ubuntu}}}"
REMOTE_DIR="${REMOTE_DIR:-/home/${REMOTE_USER}/ghostlink}"
BACKEND_PUBLIC_URL="${BACKEND_PUBLIC_URL:-http://${REMOTE_HOST}:8080}"
ZERO_PUBLIC_URL="${ZERO_PUBLIC_URL:-${BACKEND_PUBLIC_URL}}"

if [ -z "$REMOTE_HOST" ]; then
  echo "❌ 缺少 REMOTE_HOST（或 TencentHOST/HOST）。用法示例：REMOTE_HOST=1.2.3.4 ./deploy_compose.sh"
  exit 1
fi

echo "🚧 开始部署（docker compose）..."
echo "➡️  服务器：$REMOTE_USER@$REMOTE_HOST"
echo "➡️  目录：$REMOTE_DIR"
echo "➡️  前端接口：$BACKEND_PUBLIC_URL"

echo "📦 构建后端 JAR..."
./mvnw -q clean package -DskipTests

JAR_FILE="$(ls target/ghostlink-*.jar | head -n 1 || true)"
if [ -z "$JAR_FILE" ]; then
  echo "❌ 构建失败：未找到 target/ghostlink-*.jar"
  exit 1
fi
echo "✅ 后端产物：$JAR_FILE"

echo "📦 构建前端..."
(
  cd web
  if [ ! -f ".env.local" ]; then
    if [ -z "${VITE_GITHUB_CLIENT_ID:-}" ] || [ -z "${VITE_TWITTER_CLIENT_ID:-}" ]; then
      echo "⚠️  未检测到前端 OAuth 配置（web/.env.local 或 VITE_GITHUB_CLIENT_ID/VITE_TWITTER_CLIENT_ID）。页面相关授权功能将提示配置缺失，但不影响接口地址修正与静态站点部署。"
    fi
  fi
  npm -s ci
  VITE_API_BASE_URL="$BACKEND_PUBLIC_URL" VITE_API_ZERO_URL="$ZERO_PUBLIC_URL" npm -s run build
  if rg -n "localhost:8080" dist >/dev/null 2>&1; then
    echo "❌ 前端产物仍包含 localhost:8080，请检查 VITE_API_BASE_URL 是否生效"
    exit 1
  fi
)

if [ ! -d "web/dist" ]; then
  echo "❌ 前端构建失败：未找到 web/dist"
  exit 1
fi

echo "🚀 上传部署文件到服务器..."
ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "mkdir -p '$REMOTE_DIR/target' '$REMOTE_DIR/web-dist'"
scp -o StrictHostKeyChecking=no "$JAR_FILE" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/target/"
scp -o StrictHostKeyChecking=no Dockerfile docker-compose.yml web-nginx.conf .env.example "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/"
scp -o StrictHostKeyChecking=no -r web/dist/* "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/web-dist/"

echo "⚙️  服务器端启动/更新容器..."
ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "
  set -e
  cd '$REMOTE_DIR'
  if [ ! -f .env ]; then
    cp .env.example .env
    echo '⚠️  未找到 .env，已从 .env.example 生成空白 .env。请尽快编辑填入 GHOSTLINK_*，再执行 docker compose restart ghostlink-backend。'
  fi
  docker compose up -d --build
"

echo "🏥 健康检查..."
BACKEND_PORT="$(ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "cd '$REMOTE_DIR' && (set -a; . ./.env 2>/dev/null || true; set +a; echo \"\${GHOSTLINK_BACKEND_PORT:-8080}\")" | tr -d '\r')"
HEALTH_URL="http://$REMOTE_HOST:${BACKEND_PORT}/actuator/health"
echo "检查：$HEALTH_URL"

ok="0"
for i in {1..20}; do
  if curl -fsS "$HEALTH_URL" 2>/dev/null | grep -q "UP"; then
    ok="1"
    break
  fi
  sleep 2
done

if [ "$ok" = "1" ]; then
  curl -fsS "$HEALTH_URL" | cat
  echo ""
else
  echo "⚠️  公网健康检查失败。尝试在服务器本机检查..."
  ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "curl -fsS \"http://127.0.0.1:8080/actuator/health\" || true; echo"
  echo "⚠️  若服务器本机正常但公网不通，请检查云安全组/防火墙是否放行 ${BACKEND_PORT} 端口。"
fi

echo "🌐 前端连通性检查..."
curl -fsS "http://$REMOTE_HOST/" >/dev/null && echo "前端首页：OK"
INDEX_HTML="$(curl -fsS "http://$REMOTE_HOST/")"
JS_PATH="$(printf '%s' "$INDEX_HTML" | grep -oE "/assets/index-[^\"]+\\.js" | head -n 1 || true)"
if [ -n "$JS_PATH" ]; then
  if curl -fsS "http://$REMOTE_HOST/$JS_PATH" | grep -q "localhost:8080"; then
    echo "⚠️  远端前端产物里仍发现 localhost:8080，请确认你访问的是最新部署版本"
  else
    echo "前端接口地址未发现 localhost：OK"
  fi
fi
echo "✅ 部署完成。"
