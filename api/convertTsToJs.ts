import { transformSync } from '@swc/core';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default (request: VercelRequest, response: VercelResponse) => {
  const { body } = request;

  const { code } = transformSync(body, {
    jsc: {
      parser: {
        syntax: 'typescript',
      },
    },
  });

  response.send(code);
};
