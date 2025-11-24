#!/bin/bash
# Script to start backend server with proper network configuration

echo "Starting GreenCity Backend Server..."
echo ""

# Check if port 8080 is already in use
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 8080 is already in use. Stopping existing process..."
    pkill -f "node.*server.js" || true
    sleep 2
fi

# Check firewall status
echo "Checking firewall status..."
if command -v ufw &> /dev/null; then
    FIREWALL_STATUS=$(sudo ufw status | grep -i "Status:" | awk '{print $2}')
    if [ "$FIREWALL_STATUS" = "active" ]; then
        echo "⚠️  Firewall is active. Checking if port 8080 is allowed..."
        if ! sudo ufw status | grep -q "8080"; then
            echo "🔓 Opening port 8080 in firewall..."
            sudo ufw allow 8080/tcp
            echo "✅ Port 8080 is now allowed"
        else
            echo "✅ Port 8080 is already allowed"
        fi
    else
        echo "ℹ️  Firewall is not active"
    fi
fi

# Get IP address
echo ""
echo "Your server will be accessible at:"
echo "  - Local: http://localhost:8080"
echo "  - Network: http://$(hostname -I | awk '{print $1}'):8080"
echo ""

# Start server
echo "Starting server..."
cd "$(dirname "$0")"
node server.js

