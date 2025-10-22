#!/bin/bash
# ==========================================
# 🚀 Script de despliegue BACKEND MetricMind
# ==========================================

# VARIABLES CONFIGURABLES
LOCAL_BACKEND_PATH="/Users/cristiancamilocuevas/Desktop/MetricMind/backend_remote_copy"
REMOTE_USER="root"
REMOTE_HOST="185.47.128.99"
REMOTE_PATH="/var/www/metricmind/backend"

# ====== INICIO ======
echo "📦 Empaquetando backend..."
cd "$LOCAL_BACKEND_PATH" || exit

# Crear un zip temporal excluyendo node_modules
zip -r backend.zip . -x "node_modules/*"

echo "🚀 Subiendo backend al servidor (${REMOTE_HOST})..."
scp backend.zip ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

echo "🧩 Descomprimiendo en el servidor y reiniciando PM2..."
ssh ${REMOTE_USER}@${REMOTE_HOST} << EOF
cd ${REMOTE_PATH}
unzip -o backend.zip
rm backend.zip
npm install --omit=dev
pm2 restart metricmind-backend
EOF

echo "✅ Despliegue del backend completado exitosamente."
echo "🌐 Verifica en: https://api.metricmind.cloud"
