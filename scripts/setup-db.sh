#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${DB_NAME:-tarea2}"
DB_USER="${DB_USER:-cc5002}"
DB_HOST="${DB_HOST:-localhost}"

if [[ -z "${DB_PASSWORD:-}" ]]; then
  read -r -s -p "Clave para el usuario MariaDB ${DB_USER}: " DB_PASSWORD
  echo
fi

sudo systemctl start mariadb

sudo mysql < sql/tarea2.sql
sudo mysql "${DB_NAME}" < sql/region-comuna.sql
sudo mysql "${DB_NAME}" < sql/tabla-comentario.sql

sudo mysql <<SQL
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT SELECT, INSERT, UPDATE, DELETE ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

mysql -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "SHOW TABLES;"
