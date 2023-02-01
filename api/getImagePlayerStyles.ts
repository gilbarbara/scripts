import { VercelRequest, VercelResponse } from '@vercel/node';
import { fade, textColor } from 'colorizr';
import { fileTypeFromBuffer } from 'file-type';
import getImageColors from 'get-image-colors';

export default async (request: VercelRequest, response: VercelResponse) => {
  const url = request.query.url as string;

  if (!url) {
    response.status(400).send('No url provided');
  }

  const fetchUrl = await fetch(url);
  const arrayBuffer = await fetchUrl.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileType = await fileTypeFromBuffer(buffer);

  const colors = await getImageColors(buffer, {
    count: 1,
    type: fileType?.mime,
  });

  if (!colors?.length) {
    response.status(500).send('No colors found');
  }

  const baseColor = colors[0].hex();
  const color = textColor(baseColor);

  response.send({
    bgColor: baseColor,
    color,
    trackArtistColor: fade(color, 30),
    trackNameColor: color,
  });
};
