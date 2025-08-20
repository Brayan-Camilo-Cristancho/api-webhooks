#!/usr/bin/env bash

set -euo pipefail

echo "🔍 Validando despliegue de ${NAME_APP}..."

if docker ps --filter 'name=${NAME_APP}' --filter 'status=running' | grep ${NAME_APP}; then
    echo "✅ Contenedor ${NAME_APP} está corriendo correctamente"
else
    echo "⚠️ El contenedor ${NAME_APP} no está corriendo. Mostrando logs..."
    docker logs ${NAME_APP} || echo "❌ No se encontraron logs del contenedor"
    exit 1
fi