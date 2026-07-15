import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUCT_CATEGORIES, PRODUCT_DETAIL_PAGES } from '../src/data/productCatalog.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const expectedCount = 9;
const failures = [];

const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const uniqueCount = (values) => new Set(values).size;
const countMatches = (content, pattern) => (content.match(pattern) || []).length;

assert(PRODUCT_DETAIL_PAGES.length === expectedCount, `Expected ${expectedCount} product pages, found ${PRODUCT_DETAIL_PAGES.length}`);
assert(PRODUCT_CATEGORIES.length === expectedCount, `Expected ${expectedCount} product cards, found ${PRODUCT_CATEGORIES.length}`);
assert(uniqueCount(PRODUCT_DETAIL_PAGES.map((item) => item.slug)) === expectedCount, 'Product slugs must be unique');
assert(uniqueCount(PRODUCT_DETAIL_PAGES.map((item) => item.metaTitle)) === expectedCount, 'Product meta titles must be unique');
assert(uniqueCount(PRODUCT_DETAIL_PAGES.map((item) => item.metaDescription)) === expectedCount, 'Product meta descriptions must be unique');
assert(uniqueCount(PRODUCT_DETAIL_PAGES.map((item) => item.image)) === expectedCount, 'Product hero images must be unique');

for (const product of PRODUCT_DETAIL_PAGES) {
  const prefix = `[${product.slug}]`;
  const htmlPath = resolve(root, 'dist', 'produk', product.slug, 'index.html');
  const imagePath = resolve(root, 'public', product.image.replace(/^\//, ''));

  assert(existsSync(imagePath), `${prefix} Missing hero image: ${product.image}`);
  assert(product.faqs.length >= 4, `${prefix} Needs at least four FAQs`);
  assert(product.materials.length >= 3, `${prefix} Needs at least three material recommendations`);
  assert(product.supportServiceIds.length >= 1, `${prefix} Needs at least one supporting technology`);
  assert(existsSync(htmlPath), `${prefix} Missing built page; run the production build first`);
  if (!existsSync(htmlPath)) continue;

  const html = readFileSync(htmlPath, 'utf8');
  assert(countMatches(html, /<h1\b/g) === 1, `${prefix} Must render exactly one H1`);
  assert(html.includes(`<link rel="canonical" href="https://rajacuttinglaser.com/produk/${product.slug}/">`), `${prefix} Canonical URL is missing or incorrect`);
  assert(html.includes(product.metaDescription), `${prefix} Meta description is missing`);
  assert(html.includes('"@type":"FAQPage"'), `${prefix} FAQPage schema is missing`);
  assert(html.includes('"@type":"BreadcrumbList"'), `${prefix} BreadcrumbList schema is missing`);
  assert(html.includes('"@type":"Service"'), `${prefix} Service schema is missing`);
  assert(html.includes(product.image), `${prefix} Hero image is not referenced in HTML`);
}

const homePath = resolve(root, 'dist', 'index.html');
assert(existsSync(homePath), 'Homepage build is missing; run the production build first');
if (existsSync(homePath)) {
  const home = readFileSync(homePath, 'utf8');
  assert(countMatches(home, /<h1\b/g) === 1, 'Homepage must render exactly one H1');
  assert(home.includes('"@type":"FAQPage"'), 'Homepage FAQPage schema is missing');
  for (const product of PRODUCT_CATEGORIES) {
    assert(home.includes(product.href), `Homepage is missing product link: ${product.href}`);
  }
}

if (failures.length) {
  console.error(`Product audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Product audit passed: homepage + ${expectedCount} unique product pages, assets, metadata, schemas, and internal links.`);
