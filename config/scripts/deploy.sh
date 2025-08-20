#!/usr/bin/env bash
set -euo pipefail

echo "🔑 Conectado a $(hostname)"

# instalar docker si no existe
if ! command -v docker >/dev/null 2>&1; then
    echo "⚙ Instalando Docker..."
    sudo apt-get update -y
    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo tee /etc/apt/keyrings/docker.asc > /dev/null
    sudo chmod a+r /etc/apt/keyrings/docker.asc
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo ${UBUNTU_CODENAME:-$VERSION_CODENAME}) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

echo "✔ Docker instalado: $(docker --version)"

echo "🔐 Logueando en Docker Hub..."
echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

echo "🚀 Desplegando ${NAME_APP}:${TAG}..."
docker pull ${DOCKER_USER}/${NAME_APP}:${TAG}

if [ $(docker ps -a -q -f name=${NAME_APP}) ]; then
    echo "🛑 Deteniendo y eliminando contenedor existente..."
    docker stop ${NAME_APP} || true
    docker rm ${NAME_APP} || true
fi

docker run -d --name ${NAME_APP} -p 80:3000 ${DOCKER_USER}/${NAME_APP}:${TAG}

echo "✅ Despliegue finalizado"
