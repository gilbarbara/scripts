import type { VercelRequest, VercelResponse } from '@vercel/node';

import { parseSpotifyCredentials, spotifyAccountApiUrl } from './_helpers.js';
import type { SpotifyCredentialsResponse } from './_types.js';

interface Body {
  refreshToken: string;
}

export default async (request: VercelRequest, response: VercelResponse) => {
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).end();
  }

  const { refreshToken } = request.body as Body;

  if (!refreshToken) {
    return response.status(400).send({ error: 'No refreshToken provided' });
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
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      method: 'POST',
    });

    if (credentials.status !== 200) {
      throw new Error(credentials.statusText);
    }

    return response.send(
      parseSpotifyCredentials(
        (await credentials.json()) as SpotifyCredentialsResponse,
        refreshToken,
      ),
    );
  } catch (error: any) {
    return response
      .status(400)
      .json({ error: error?.response?.error_description ?? error.message });
  }
};
