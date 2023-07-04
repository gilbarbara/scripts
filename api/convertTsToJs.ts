import { transformSync } from '@swc/core';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default (request: VercelRequest, response: VercelResponse) => {
  const { body } = request;

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).end();
  }

  if (!body) {
    return response.status(400).send('No body provided');
  }

  try {
    const { code } = transformSync(body, {
      jsc: {
        parser: {
          syntax: 'typescript',
        },
      },
    });

    return response.send(code);
  } catch (error: any) {
    return response.status(400).send(error.message);
  }
};
