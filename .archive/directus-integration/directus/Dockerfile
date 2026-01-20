# Directus Dockerfile for Railway deployment
FROM directus/directus:latest

# Directus runs from /directus directory
WORKDIR /directus

# Expose Directus port
EXPOSE 8055

# Directus image already has the entrypoint configured
# Environment variables are passed through from Railway
# Required env vars:
# - DB_CLIENT, DB_HOST, DB_PORT, DB_DATABASE, DB_USER, DB_PASSWORD
# - KEY, SECRET
# - ADMIN_EMAIL, ADMIN_PASSWORD
# - PUBLIC_URL
# - CORS_ENABLED, CORS_ORIGIN
