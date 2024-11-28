import type { VercelRequest, VercelResponse } from '@vercel/node';

import { parseSpotifyCredentials, spotifyAccountApiUrl } from './_helpers.js';
import type { SpotifyCredentialsResponse } from './_types.js';

interface Body {
  code: string;
  redirectUri: string;
}

export default async (request: VercelRequest, response: VercelResponse) => {
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).end();
  }

  const { code, redirectUri } = request.body as Body;

  if (!code) {
    return response.status(400).send({ error: 'No code provided' });
  }

  if (!redirectUri) {
    return response.status(400).send({ error: 'No redirect URI' });
  }

  const { SPOTIFY_WEB_PLAYER_CLIENT_ID = '', SPOTIFY_WEB_PLAYER_CLIENT_SECRET = '' } = process.env;

  try {
    const credentials = await fetch(`${spotifyAccountApiUrl}/token`, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${SPOTIFY_WEB_PLAYER_CLIENT_ID}:${SPOTIFY_WEB_PLAYER_CLIENT_SECRET}`,
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
      method: 'POST',
    });

    if (credentials.status !== 200) {
      throw new Error(credentials.statusText);
    }

    return response.send(
      parseSpotifyCredentials((await credentials.json()) as SpotifyCredentialsResponse),
    );
  } catch (error: any) {
    return response
      .status(400)
      .json({ error: error?.response?.error_description ?? error.message });
  }
};
