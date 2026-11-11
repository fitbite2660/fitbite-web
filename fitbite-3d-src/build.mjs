// Bouwt één zelfstandig HTML-bestand (three.js, code, fonts en texturen ingesloten).
//   npm install && node build.mjs
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || join(here, '..', 'fitbite-cyberpunk-3d.html');
const res = await build({ entryPoints: [join(here, 'src/main.js')], bundle: true, minify: true, format: 'iife', write: false, target: 'es2020', loader: { '.jpg': 'dataurl' }, nodePaths: (process.env.NODE_PATH || '').split(':').filter(Boolean), legalComments: 'none' });
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const font = (family, weight, file) => `@font-face{font-family:"${family}";font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${readFileSync(join(here, 'assets', file)).toString('base64')}) format("woff2")}`;
const fonts = [font('Sacramento', 400, 'sacramento-latin-400-normal.woff2'), font('Oswald', 500, 'oswald-latin-500-normal.woff2'), font('Oswald', 700, 'oswald-latin-700-normal.woff2'), font('Playfair Display', 700, 'playfair-display-latin-700-normal.woff2')].join('\n');
const html = readFileSync(join(here, 'template.html'), 'utf8').replace('/*__FONTS__*/', () => fonts).replace('/*__BUNDLE__*/', () => js);
writeFileSync(out, html);
console.log('geschreven:', out, (html.length / 1024 / 1024).toFixed(2) + ' MB');
