export interface SpotifyCredentialsResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export interface SpotifyUserCredentials {
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
  scope: string[];
}
