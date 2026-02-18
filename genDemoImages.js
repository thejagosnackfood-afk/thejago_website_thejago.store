/*
 * Generate demo product images via OpenAI Images API and save to frontend/public.
 * Usage:
 *   cd todo-app/website
 *   npm run gen:demo-images
 * Requires: OPENAI_API_KEY in ../website/.env
 */

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('../env');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const outDir = path.resolve(__dirname, '../../frontend/public');

const items = [
  { slug: 'cauliflower', prompt: 'studio photo of fresh cauliflower on white plate, grocery ecommerce packshot, soft shadow, high detail' },
  { slug: 'fresh-orange', prompt: 'packshot of fresh oranges, 6 pcs, green grocer style, clean background, soft light, condensation drops' },
  { slug: 'cilantro', prompt: 'cilantro bunch on white board, vivid green leaves, top-down, grocery product photo' },
  { slug: 'carrot', prompt: 'orange carrots with greens, neatly arranged, packshot, clean white background' },
  { slug: 'pineapple', prompt: 'pineapple queen 1 pc, isolated, soft shadow, ecommerce packshot' },
  { slug: 'capsicum', prompt: 'three green capsicum peppers, glossy, on white, grocery packshot' },
  { slug: 'maaza', prompt: 'bottle of mango maaza juice, upright, isolated on white, product render style' },
  { slug: 'mango', prompt: 'two fresh mango fruits from Mexico, yellow, natural light, clean background' },
  { slug: 'bread', prompt: 'soft bread loaf, bakery style, sliced partially, on white board, packshot' },
  { slug: 'eggs', prompt: '10 free-range eggs in carton, top-down, on white background, grocery packshot' },
];

async function generateOne(item) {
  const file = path.join(outDir, `demo-${item.slug}.png`);
  if (fs.existsSync(file)) {
    console.log(`skip ${item.slug} (exists)`);
    return;
  }

  console.log(`gen ${item.slug} ...`);
  const res = await client.images.generate({
    model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
    prompt: item.prompt,
    size: '768x768',
    response_format: 'b64_json',
  });

  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new Error(`no image for ${item.slug}`);
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
  console.log(`saved ${file}`);
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not set');
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });
  for (const item of items) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await generateOne(item);
    } catch (err) {
      console.error(`failed ${item.slug}`, err.message || err);
    }
  }
}

main();
