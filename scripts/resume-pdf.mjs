// Renders an HTML résumé to a print-ready US Letter PDF with headless Chromium.
//
//   npm run resume:pdf                         resume/resume.html -> public/lola-dolinsky-resume.pdf
//   npm run resume:pdf -- <input.html> <out.pdf>   e.g. a tailored copy in resume/private/
//
// Exits non-zero if the résumé runs past one page.
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const [input = 'resume/resume.html', output = 'public/lola-dolinsky-resume.pdf'] =
  process.argv.slice(2);

// US Letter at CSS's 96px per inch
const LETTER_HEIGHT_PX = 11 * 96;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 8.5 * 96, height: LETTER_HEIGHT_PX } });
  await page.goto(pathToFileURL(path.resolve(input)).href);

  // Measure under print styles, the same layout the PDF uses
  await page.emulateMedia({ media: 'print' });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const pages = Math.ceil(height / LETTER_HEIGHT_PX);

  await page.pdf({ path: output, format: 'Letter', printBackground: true });
  process.stdout.write(`${input} -> ${output} (${pages} page${pages === 1 ? '' : 's'})\n`);

  if (pages > 1) {
    console.error('The résumé runs past one page: trim content before sending it.');
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
