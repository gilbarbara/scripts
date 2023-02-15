import { VercelRequest, VercelResponse } from '@vercel/node';
import { darken, fade, lighten, luminance, textColor } from 'colorizr';
import { fileTypeFromBuffer } from 'file-type';
import getImageColors from 'get-image-colors';

export default async (request: VercelRequest, response: VercelResponse) => {
  const { quantity, url } = request.query as Record<string, string>;

  if (!url) {
    response.status(400).send('No url provided');
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

    response.send(colors.map(color => color.hex()));

    return;
  }

  const colors = await getImageColors(buffer, {
    count: 2,
    type: fileType?.mime,
  });

  if (!colors?.length) {
    response.status(500).send('No colors found');
  }

  const altColor = colors[1].hex();
  const baseColor = colors[0].hex();
  const colorLuminance = luminance(baseColor);

  const maxValue = Math.min(Math.max(Math.round(colorLuminance * 100), 10), 70);

  const bgColor = colorLuminance <= 0.02 ? lighten(baseColor, 10) : darken(baseColor, maxValue);
  const color = textColor(bgColor);

  response.send({
    altColor,
    bgColor,
    color,
    sliderColor: color,
    sliderHandleColor: color,
    sliderTrackColor: fade(color, 70),
    trackArtistColor: fade(color, 30),
    trackNameColor: color,
  });
};
