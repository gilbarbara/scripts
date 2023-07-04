import { VercelRequest, VercelResponse } from '@vercel/node';

const admins = ['gilbarbara'];

export default async (request: VercelRequest, response: VercelResponse) => {
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).end();
  }

  const { code } = request.query as Record<string, string>;

  if (!code) {
    return response.status(400).send('No code provided');
  }

  const {
    SVGLOGOS_GITHUB_CLIENT_ID = '',
    SVGLOGOS_GITHUB_CLIENT_SECRET = '',
    SVGLOGOS_GITHUB_REDIRECT_URI = '',
  } = process.env;

  const formData = new FormData();

  formData.append('client_id', SVGLOGOS_GITHUB_CLIENT_ID);
  formData.append('client_secret', SVGLOGOS_GITHUB_CLIENT_SECRET);
  formData.append('redirect_uri', SVGLOGOS_GITHUB_REDIRECT_URI);
  formData.append('code', code);

  const authentication = await fetch('https://github.com/login/oauth/access_token', {
    body: formData,
    headers: {
      Accept: 'application/json',
    },
    method: 'POST',
  }).then(data => data.json());

  if (authentication.error) {
    return response.status(401).send(authentication.error_description);
  }

  const user = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${authentication.access_token}`,
    },
  }).then(data => data.json());

  if (!admins.includes(user.login)) {
    return response.status(401).end();
  }

  return response.send({
    accessToken: authentication.access_token,
    avatar: user.avatar_url,
    login: user.login,
    profile: user.html_url,
  });
};
