import { SpotifyCredentialsResponse, SpotifyUserCredentials } from './_types.js';

export const spotifyAccountApiUrl = 'https://accounts.spotify.com/api';

export function parseSpotifyCredentials(
  input: SpotifyCredentialsResponse,
  refreshToken?: string,
): SpotifyUserCredentials {
  const {
    access_token: accessToken,
    expires_in: expiresIn,
    refresh_token: refreshTokenInput,
    scope,
  } = input;

  return {
    accessToken,
    expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
    refreshToken: refreshTokenInput ?? refreshToken,
    scope: scope.split(' '),
  };
}
