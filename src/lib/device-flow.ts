import { API_BASE_URL } from './config';
import { setTokens } from './store';

interface DeviceStartResponse {
  device_code: string;
  user_code: string;
  verification_url: string;
  expires_in: number;
  interval: number;
}

interface DeviceTokenResponse {
  cp_access_token: string;
  expires_in: number;
}

async function pollForToken(deviceCode: string, interval: number): Promise<DeviceTokenResponse> {
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/cp/device/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_code: deviceCode }),
        });

        if (response.ok) {
          const data = await response.json() as Partial<DeviceTokenResponse & { status?: string }>;
          if (data.cp_access_token) {
            clearInterval(intervalId);
            resolve(data as DeviceTokenResponse);
          }
        }
      } catch (error) {
        // Don't reject on poll error, just keep trying
      }
    }, interval * 1000);
  });
}

export async function startDeviceFlow() {
  const response = await fetch(`${API_BASE_URL}/cp/device/start`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Error starting device flow: ${response.status} ${response.statusText}`);
    console.error(`Response body: ${errorBody}`);
    throw new Error('Failed to start device flow. See logs for details.');
  }

  const data = await response.json() as DeviceStartResponse;

  console.log(`Please visit ${data.verification_url} and enter the code: ${data.user_code}`);

  const tokenResponse = await pollForToken(data.device_code, data.interval);

  // The device flow provides a short-lived access token without a refresh token.
  // We will store the access token in both slots for now.
  await setTokens(tokenResponse.cp_access_token, tokenResponse.cp_access_token);

  console.log('Successfully logged in!');
}
