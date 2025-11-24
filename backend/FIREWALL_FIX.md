# Fix Firewall to Allow Mobile Device Access

## Problem
Your backend server is running but mobile devices can't connect because the firewall is blocking port 8080.

## Solution

### Option 1: Allow Port 8080 in Firewall (Recommended)

**Ubuntu/Debian (ufw):**
```bash
sudo ufw allow 8080/tcp
sudo ufw reload
```

**Other Linux (iptables):**
```bash
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
sudo iptables-save
```

**Check if firewall is active:**
```bash
sudo ufw status
```

### Option 2: Temporarily Disable Firewall (For Testing Only)

**Ubuntu/Debian:**
```bash
sudo ufw disable
```

**⚠️ WARNING:** Only do this for testing. Re-enable it after:
```bash
sudo ufw enable
```

### Option 3: Use a Different Port

If you can't modify firewall, you can use a port that's already open (like 3000 or 5000).

1. Update `.env` file:
   ```
   PORT=3000
   ```

2. Restart backend server

3. Update `Mobile/config.ts`:
   ```typescript
   const DEVICE_IP = '192.168.0.103';
   export const API_URL = `http://${DEVICE_IP}:3000/api`;
   ```

## Verify It Works

After allowing the port, test from another device or use:
```bash
curl http://192.168.0.103:8080/health
```

If you get a JSON response, it's working!

## Restart Backend

After making changes, restart your backend server:
```bash
cd backend
# Stop current server (Ctrl+C)
# Then restart:
node server.js
```

