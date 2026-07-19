#!/bin/bash
# Build script for Render Static Site
# Generates config.js from environment variables set in Render Dashboard

cat > Restro/config.js << 'EOF'
const CONFIG = {
    GOOGLE_CLIENT_ID: '${GOOGLE_CLIENT_ID}',
    ADMIN_EMAIL: '${ADMIN_EMAIL}',
    ADMIN_PASSWORD: '${ADMIN_PASSWORD}',
};
EOF

# Replace shell variable references with actual env var values
# Using envsubst for reliable substitution
if command -v envsubst &> /dev/null; then
    envsubst < Restro/config.js > Restro/config.tmp.js
    mv Restro/config.tmp.js Restro/config.js
else
    # Fallback: manual substitution using sed
    sed -i "s|\${GOOGLE_CLIENT_ID}|${GOOGLE_CLIENT_ID}|g" Restro/config.js
    sed -i "s|\${ADMIN_EMAIL}|${ADMIN_EMAIL}|g" Restro/config.js
    sed -i "s|\${ADMIN_PASSWORD}|${ADMIN_PASSWORD}|g" Restro/config.js
fi

echo "config.js generated successfully."
