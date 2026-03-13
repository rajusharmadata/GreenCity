
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/rajus/Desktop/Resources/GreenCity/backend/.env' });

const ORS_BASE = 'https://api.openrouteservice.org/v2/directions';
const profiles = {
  walk: 'foot-walking',
  cycle: 'cycling-regular',
  drive: 'driving-car'
};

const apiKey = process.env.OPENROUTESERVICE_API_KEY;

const test = async () => {
  const fromLat = 28.9576409;
  const fromLng = 77.6330886;
  const toLat = 28.9844618;
  const toLng = 77.7064137;

  console.log('API KEY:', apiKey ? 'FOUND' : 'MISSING');

  for (const [mode, profile] of Object.entries(profiles)) {
    console.log(`Testing mode: ${mode} (${profile})`);
    const url = `${ORS_BASE}/${profile}`;
    try {
      const resp = await axios.post(
        url,
        {
          coordinates: [
            [fromLng, fromLat],
            [toLng, toLat]
          ]
        },
        {
          headers: {
            Authorization: apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      console.log(`  [${mode}] Success. Distance: ${resp.data?.features?.[0]?.properties?.summary?.distance}m`);
    } catch (err) {
      console.error(`  [${mode}] Error:`, err.response?.data || err.message);
    }
  }
};

test();
