#!/bin/bash
# ==============================================================================
# Este script monitora o status do container Docker do site do museu.
# Se o serviço estiver offline, ele dispara o reinício e registra o evento.
#
# AUTOMAÇÃO VIA CRONTAB (Como instalar):
# 1. Abra o editor de crontab: crontab -e
# 2. Adicione a seguinte linha para rodar a cada 1 minuto:
#    * * * * * /bin/bash /home/eq_site/ifsc-museu-saojose/scripts/dockerCheck.sh
# ==============================================================================



LOG_FILE="/home/eq_site/ifsc-museu-saojose/scripts/dockerCheck.log"
COMPOSE_FILE="/home/eq_site/ifsc-museu-saojose/docker-compose.yml"

if [ ! "$(docker ps -q -f name=ifsc-museu-saojose-app)" ]; then
    echo "[$(date +'%Y-%m-%d %H:%M:%S')]..." >> $LOG_FILE
    echo "Site Museu: Offline - Restarting..." >> $LOG_FILE

    /usr/bin/docker compose -f "$COMPOSE_FILE" up -d >> "$LOG_FILE" 2>&1

echo "----------------------------------------------------" >> $LOG_FILE
fi