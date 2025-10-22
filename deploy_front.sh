#!/bin/bash
# ==========================================
# 🚀 Script de despliegue FRONTEND MetricMind
# ==========================================

# VARIABLES CONFIGURABLES
LOCAL_BUILD_PATH="/Users/cristiancamilocuevas/Desktop/MetricMind/frontend/build"
REMOTE_USER="root"
REMOTE_HOST="185.47.128.99"
REMOTE_PATH="/var/www/metricmind/frontend"

# ====== INICIO ======
echo "📦 Ejecutando build de React..."
cd "$(dirname "$LOCAL_BUILD_PATH")" || exit
npm run build

echo "🚀 Subiendo archivos al servidor (${REMOTE_HOST})..."
scp -r "${LOCAL_BUILD_PATH}"/* ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

if [ $? -eq 0 ]; then
  echo "✅ Despliegue completado exitosamente."
  echo "🌐 Verifica en: https://metricmind.cloud"
else
  echo "❌ Error al subir archivos."
fi
