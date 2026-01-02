import keytar from 'keytar';

const SERVICE = 'envgod-cli';
const ACCOUNT = 'default';

export async function setTokens(refreshToken: string, accessToken: string) {
  await keytar.setPassword(SERVICE, ACCOUNT, JSON.stringify({ refreshToken, accessToken }));
}

export async function getTokens(): Promise<{ refreshToken: string; accessToken: string } | null> {
  const data = await keytar.getPassword(SERVICE, ACCOUNT);
  if (!data) {
    return null;
  }
  return JSON.parse(data);
}

export async function getAccessToken(): Promise<string | null> {
    const tokens = await getTokens();
    // TODO: check for expiry and refresh if needed
    return tokens?.accessToken || null;
}

export async function clearTokens() {
  await keytar.deletePassword(SERVICE, ACCOUNT);
}
