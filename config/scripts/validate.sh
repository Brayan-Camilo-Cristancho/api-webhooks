#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Validando despliegue de ${NAME_APP}..."

MAX_WAIT=20
WAIT_INTERVAL=2
elapsed=0

while ! docker ps --filter "name=${NAME_APP}" --filter "status=running" | grep -q "${NAME_APP}"; do
    if [ $elapsed -ge $MAX_WAIT ]; then
        echo "⚠️ Timeout: El contenedor ${NAME_APP} no se inició a tiempo."
        echo "Mostrando logs..."
        docker logs ${NAME_APP} || echo "❌ No se encontraron logs del contenedor"
        exit 1
    fi
    sleep $WAIT_INTERVAL
    elapsed=$((elapsed + WAIT_INTERVAL))
done

echo "✅ Contenedor ${NAME_APP} está corriendo correctamente"
