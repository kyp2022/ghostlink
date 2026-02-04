#!/bin/bash

set -euo pipefail

if [ -f ".deploy.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.deploy.env
  set +a
fi

REMOTE_HOST="${REMOTE_HOST:-${1:-${TencentHOST:-${HOST:-}}}}"
REMOTE_USER="${REMOTE_USER:-${2:-${TencentUSER:-ubuntu}}}"
REMOTE_DIR="${REMOTE_DIR:-${3:-/home/${REMOTE_USER}/ghostlink}}"

if [ -z "$REMOTE_HOST" ]; then
  echo "❌ 缺少 REMOTE_HOST（或 TencentHOST/HOST/参数1/.deploy.env）。"
  echo "用法：./deploy_compose.sh 服务器IP [用户] [目录]"
  exit 1
fi

echo "🚧 开始部署（docker compose）..."
echo "➡️  服务器：$REMOTE_USER@$REMOTE_HOST"
echo "➡️  目录：$REMOTE_DIR"

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
    cp .env.example .env.local
    echo "⚠️  未找到 web/.env.local，已从 web/.env.example 生成。你可以按需修改其中的 VITE_*。"
  fi
  npm -s ci
  npm -s run build
)

if [ ! -d "web/dist" ]; then
  echo "❌ 前端构建失败：未找到 web/dist"
  exit 1
fi

echo "🚀 上传部署文件到服务器..."
ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "mkdir -p '$REMOTE_DIR/target' '$REMOTE_DIR/web-dist'"
scp -o StrictHostKeyChecking=no "$JAR_FILE" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/target/"
scp -o StrictHostKeyChecking=no Dockerfile docker-compose.yml web-nginx.conf .env.example "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/"
if [ -f ".env" ]; then
  scp -o StrictHostKeyChecking=no .env "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/.env"
else
  echo "⚠️  未找到本地 .env，将不会覆盖服务器端 .env"
fi
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

  # 提示：OAuth 密钥为空会导致相关接口直接报错
  missing=0
  for k in GHOSTLINK_GITHUB_CLIENT_ID GHOSTLINK_GITHUB_CLIENT_SECRET; do
    v=\$(awk -F= -v key=\"\$k\" '\$1==key{print \$2}' .env 2>/dev/null | tr -d '\r')
    if [ -z \"\$v\" ]; then
      echo \"⚠️  服务器 .env 中 \$k 为空（需要填真实值）\"
      missing=1
    fi
  done
  if [ \"\$missing\" = \"1\" ]; then
    echo \"⚠️  请在服务器上编辑：$REMOTE_DIR/.env，然后执行：docker compose restart ghostlink-backend\"
  fi
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
echo "✅ 部署完成。"
