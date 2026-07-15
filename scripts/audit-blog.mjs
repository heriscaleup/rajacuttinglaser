import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const contentDir = join(root, 'src/content/blog');
const distBlogDir = join(root, 'dist/blog');
const files = (await readdir(contentDir)).filter((file) => file.endsWith('.md')).sort();
const failures = [];
const records = [];

function fail(message) {
  failures.push(message);
}

function parseFrontmatter(text, file) {
  const end = text.indexOf('\n---\n', 3);
  if (!text.startsWith('---\n') || end < 0) {
    fail(`${file}: frontmatter tidak valid`);
    return { data: {}, body: text };
  }
  const raw = text.slice(4, end);
  const data = {};
  for (const line of raw.split('\n')) {
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const key = line.slice(0, separator);
    const value = line.slice(separator + 1).trim();
    if (value.startsWith('"') || value.startsWith('[') || value === 'true' || value === 'false') {
      try {
        data[key] = JSON.parse(value);
      } catch {
        fail(`${file}: field ${key} tidak dapat diparse`);
      }
    } else {
      data[key] = value;
    }
  }
  return { data, body: text.slice(end + 5) };
}

function duplicates(values) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function shingles(body) {
  const words = body.toLowerCase().replace(/[^a-z0-9à-ÿ]+/g, ' ').trim().split(/\s+/);
  const output = new Set();
  for (let index = 0; index < words.length - 4; index += 1) output.add(words.slice(index, index + 5).join(' '));
  return output;
}

if (files.length !== 68) fail(`Jumlah artikel harus 68, ditemukan ${files.length}`);

for (const file of files) {
  const text = await readFile(join(contentDir, file), 'utf8');
  const { data, body } = parseFrontmatter(text, file);
  const slug = file.replace(/\.md$/, '');
  const required = ['title', 'description', 'updatedDate', 'category', 'tags', 'image', 'imageAlt', 'readTime', 'author', 'primaryKeyword', 'keyTakeaways', 'faq', 'relatedLinks'];
  for (const key of required) if (data[key] === undefined) fail(`${file}: field ${key} tidak ada`);

  const words = body.trim().split(/\s+/).length;
  if (words < 700) fail(`${file}: isi terlalu pendek (${words} kata)`);
  if (!data.title || data.title.length < 20 || data.title.length > 65) fail(`${file}: panjang title ${data.title?.length ?? 0}`);
  if (!data.description || data.description.length < 65 || data.description.length > 160) fail(`${file}: panjang description ${data.description?.length ?? 0}`);
  if (!Array.isArray(data.keyTakeaways) || data.keyTakeaways.length < 3) fail(`${file}: keyTakeaways kurang`);
  if (!Array.isArray(data.faq) || data.faq.length < 2) fail(`${file}: FAQ kurang`);
  if (!Array.isArray(data.relatedLinks) || data.relatedLinks.length < 3) fail(`${file}: internal link kurang`);

  const imagePath = join(root, 'public', String(data.image ?? '').replace(/^\//, ''));
  try {
    const buffer = await readFile(imagePath);
    const imageStat = await stat(imagePath);
    if (imageStat.size < 1000) fail(`${file}: hero image terlalu kecil secara data`);
    data.imageHash = createHash('sha256').update(buffer).digest('hex');
  } catch {
    fail(`${file}: hero image tidak ditemukan (${data.image})`);
  }

  records.push({ file, slug, data, body, shingleSet: shingles(body), words });
}

for (const field of ['title', 'description', 'primaryKeyword', 'image', 'imageAlt', 'imageHash']) {
  const found = duplicates(records.map((record) => record.data[field]));
  if (found.length) fail(`Duplikasi ${field}: ${found.join(', ')}`);
}

for (const record of records) {
  for (const link of record.data.relatedLinks ?? []) {
    if (link.href.startsWith('/blog/')) {
      const target = link.href.replace(/^\/blog\//, '').replace(/\/$/, '');
      if (!records.some((candidate) => candidate.slug === target)) fail(`${record.file}: broken blog link ${link.href}`);
    }
  }

  const htmlPath = join(distBlogDir, record.slug, 'index.html');
  let html = '';
  try {
    html = await readFile(htmlPath, 'utf8');
  } catch {
    fail(`${record.file}: halaman build tidak ditemukan`);
    continue;
  }
  const checks = [
    ['canonical', `rel="canonical" href=`],
    ['BlogPosting', '"@type":"BlogPosting"'],
    ['BreadcrumbList', '"@type":"BreadcrumbList"'],
    ['FAQPage', '"@type":"FAQPage"'],
    ['primary keyword', record.data.primaryKeyword],
    ['image alt', record.data.imageAlt.replaceAll('&', '&#38;').replaceAll('"', '&quot;')]
  ];
  for (const [name, needle] of checks) if (!html.includes(needle)) fail(`${record.file}: output tidak memuat ${name}`);
  if ((html.match(/<h1\b/g) ?? []).length !== 1) fail(`${record.file}: jumlah H1 bukan satu`);
  if (html.includes('onerror=null;this.src') && !html.includes(record.data.image)) fail(`${record.file}: hero memakai fallback`);
}

let highestSimilarity = 0;
let highestPair = [];
for (let left = 0; left < records.length; left += 1) {
  for (let right = left + 1; right < records.length; right += 1) {
    let intersection = 0;
    for (const item of records[left].shingleSet) if (records[right].shingleSet.has(item)) intersection += 1;
    const union = records[left].shingleSet.size + records[right].shingleSet.size - intersection;
    const score = intersection / union;
    if (score > highestSimilarity) {
      highestSimilarity = score;
      highestPair = [records[left].file, records[right].file];
    }
  }
}
if (highestSimilarity > 0.65) fail(`Kemiripan isi terlalu tinggi: ${highestSimilarity.toFixed(3)} (${highestPair.join(' <> ')})`);

const vercel = await readFile(join(root, 'vercel.json'), 'utf8');
const redirects = await readFile(join(root, 'public/_redirects'), 'utf8');
if (/source.*\/blog\//s.test(vercel) || /^\/blog\//m.test(redirects)) fail('Masih ada redirect konsolidasi blog');

if (failures.length) {
  console.error(failures.map((message) => `- ${message}`).join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({
  articles: records.length,
  minWords: Math.min(...records.map((record) => record.words)),
  maxWords: Math.max(...records.map((record) => record.words)),
  uniqueTitles: new Set(records.map((record) => record.data.title)).size,
  uniqueKeywords: new Set(records.map((record) => record.data.primaryKeyword)).size,
  uniqueImageFiles: new Set(records.map((record) => record.data.image)).size,
  uniqueImageHashes: new Set(records.map((record) => record.data.imageHash)).size,
  highestFiveWordShingleSimilarity: Number(highestSimilarity.toFixed(3))
}, null, 2));
