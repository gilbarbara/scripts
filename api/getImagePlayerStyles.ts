import { VercelRequest, VercelResponse } from '@vercel/node';
import { darken, lighten, luminance, opacify, textColor } from 'colorizr';
import { fileTypeFromBuffer } from 'file-type';
import getImageColors from 'get-image-colors';

function generateColor(input: string, max: number) {
  const colorLuminance = Math.round(luminance(input) * 100);
  let maxValue = Math.min(Math.max(colorLuminance, 10), max);
  let bgColor = darken(input, maxValue);

  if (colorLuminance <= 0.02) {
    bgColor = lighten(input, 10);
  } else {
    while (luminance(bgColor) * 100 < 3) {
      bgColor = darken(input, maxValue);
      maxValue -= 1;
    }
  }

  return [bgColor, textColor(bgColor)];
}

export default async (request: VercelRequest, response: VercelResponse) => {
  const { max = '70', quantity, url } = request.query as Record<string, string>;
  const maxAmount = parseInt(max, 10);

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET') {
    return response.status(405).end();
  }

  if (!url) {
    return response.status(400).send('No url provided');
  }

  const fetchUrl = await fetch(url);
  const arrayBuffer = await fetchUrl.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileType = await fileTypeFromBuffer(buffer);

  if (quantity) {
    const colors = await getImageColors(buffer, {
      count: parseInt(quantity, 10),
      type: fileType?.mime,
    });

    if (!colors?.length) {
      response.status(500).send('No colors found');
    }

    return response.send(colors.map(color => color.hex()));
  }

  const colors = await getImageColors(buffer, {
    count: 2,
    type: fileType?.mime,
  });

  if (!colors?.length) {
    response.status(500).send('No colors found');
  }

  const [bgColor, color] = generateColor(colors[0].hex(), maxAmount);
  const [altBgColor, altColor] = generateColor(colors[1].hex(), maxAmount);

  return response.send({
    altBgColor,
    altColor,
    bgColor,
    color,
    sliderColor: color,
    sliderHandleColor: color,
    sliderTrackColor: opacify(color, 0.3),
    trackArtistColor: opacify(color, 0.7),
    trackNameColor: color,
  });
};
