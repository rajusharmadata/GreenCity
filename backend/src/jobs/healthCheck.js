import cron from 'node-cron';
import http from 'http';

/**
 * Runs every 14 minutes to verify the backend is responding.
 * Hits GET /health on the same server; logs result or failure.
 */
export function startHealthCheckCron(port) {
  const interval = '*/14 * * * *'; // Every 14 minutes
  const baseUrl = `http://127.0.0.1:${port}`;

  cron.schedule(interval, () => {
    const url = `${baseUrl}/health`;
    const req = http.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            const uptime = json.uptime != null ? `${Math.floor(json.uptime)}s` : '?';
            console.log(`[Health Cron] OK at ${new Date().toISOString()} (uptime: ${uptime})`);
          } catch {
            console.log(`[Health Cron] OK at ${new Date().toISOString()} (status: ${res.statusCode})`);
          }
        } else {
          console.warn(`[Health Cron] Unexpected status ${res.statusCode} at ${new Date().toISOString()}`);
        }
      });
    });

    req.on('error', (err) => {
      console.error(`[Health Cron] Backend health check failed at ${new Date().toISOString()}:`, err.message);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.error(`[Health Cron] Timeout at ${new Date().toISOString()}`);
    });
  });

  console.log('✅ Health check cron started (every 14 minutes)');
}
