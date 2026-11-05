// Renders the site icon (src/app/icon.svg) to the two raster files browsers
// still ask for, with headless Chromium, so all three stay in step:
//
//   npm run icons    src/app/icon.svg -> src/app/favicon.ico (16, 32, 48)
//                                     -> src/app/apple-icon.png (180)
//
// Next serves all three from src/app and writes the <link> tags.
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const SOURCE = 'src/app/icon.svg';
const FAVICON_SIZES = [16, 32, 48];
const APPLE_SIZE = 180;

const svg = await readFile(SOURCE, 'utf-8');

const browser = await chromium.launch();
try {
  const page = await browser.newPage();

  // The SVG drawn onto a size × size canvas: returns its RGBA pixels, or a PNG
  async function render(size, as) {
    await page.setViewportSize({ width: size, height: size });
    return page.evaluate(
      async ({ svg, size, as }) => {
        const img = new Image();
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        await img.decode();
        const canvas = Object.assign(document.createElement('canvas'), {
          width: size,
          height: size,
        });
        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, size, size);
        return as === 'png'
          ? canvas.toDataURL('image/png').split(',')[1]
          : Array.from(context.getImageData(0, 0, size, size).data);
      },
      { svg, size, as }
    );
  }

  const favicons = [];
  for (const size of FAVICON_SIZES) favicons.push({ size, rgba: await render(size, 'rgba') });

  await writeFile('src/app/favicon.ico', toIco(favicons));
  await writeFile('src/app/apple-icon.png', Buffer.from(await render(APPLE_SIZE, 'png'), 'base64'));
  process.stdout.write(
    `${SOURCE} -> src/app/favicon.ico (${FAVICON_SIZES.join(', ')}), src/app/apple-icon.png (${APPLE_SIZE})\n`
  );
} finally {
  await browser.close();
}

// An .ico is a small directory of images: a 6-byte header, a 16-byte entry per
// image, then the images. Each is stored as a 32-bit bitmap rather than a PNG,
// because PNGs inside an .ico must have an alpha channel and Chromium leaves it
// out of fully opaque images.
function toIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  const bitmaps = images.map(({ size, rgba }) => toBitmap(size, rgba));

  let offset = header.length + 16 * images.length;
  const entries = images.map(({ size }, i) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size % 256, 0); // width (0 means 256)
    entry.writeUInt8(size % 256, 1); // height
    entry.writeUInt8(0, 2); // palette colors: none
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(bitmaps[i].length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += bitmaps[i].length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...bitmaps]);
}

// BITMAPINFOHEADER, then BGRA pixels bottom row first, then a 1-bit AND mask
// (all zeros: the alpha channel already says what's transparent). The header's
// height is doubled to count the mask.
function toBitmap(size, rgba) {
  const info = Buffer.alloc(40);
  info.writeUInt32LE(40, 0); // header size
  info.writeInt32LE(size, 4); // width
  info.writeInt32LE(size * 2, 8); // height: pixels + mask
  info.writeUInt16LE(1, 12); // planes
  info.writeUInt16LE(32, 14); // bits per pixel

  const pixels = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const from = (y * size + x) * 4;
      const to = ((size - 1 - y) * size + x) * 4;
      pixels[to] = rgba[from + 2]; // B
      pixels[to + 1] = rgba[from + 1]; // G
      pixels[to + 2] = rgba[from]; // R
      pixels[to + 3] = rgba[from + 3]; // A
    }
  }

  // Each mask row is padded to a multiple of 4 bytes
  const mask = Buffer.alloc(Math.ceil(size / 32) * 4 * size);

  return Buffer.concat([info, pixels, mask]);
}
