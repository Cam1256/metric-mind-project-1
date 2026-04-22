#!/bin/bash

LOCAL_BACKEND_PATH="/Users/cristiancamilocuevas/Desktop/MetricMind/backend_remote_copy"
REMOTE_USER="root"
REMOTE_HOST="185.47.128.99"
REMOTE_PATH="/var/www/metricmind/backend"

echo "📦 Empaquetando backend..."
cd "$LOCAL_BACKEND_PATH" || exit

rm -f backend.zip

zip -r backend.zip . \
-x "node_modules/*" \
-x ".env" "*.env" "*.zip" \
-x ".git/*" \
-x "logs/*" \
-x "*.log"

echo "🚀 Subiendo backend..."
scp backend.zip ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

echo "🧩 Desplegando..."
ssh ${REMOTE_USER}@${REMOTE_HOST} << EOF
cd ${REMOTE_PATH}
unzip -o backend.zip
rm backend.zip
npm install --omit=dev
pm2 restart metricmind-backend || pm2 start index.js --name metricmind-backend
EOF

echo "✅ Deploy listo"
echo "🌐 https://api.metricmind.cloud"