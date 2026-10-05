#!/usr/bin/env node
/**
 * One-time import of the WordPress "Properties" category into D1 + R2.
 *
 *   node scripts/import-wordpress.mjs --dry-run     show what would be imported
 *   node scripts/import-wordpress.mjs --remote      import into the live database and bucket
 *   node scripts/import-wordpress.mjs --local       import into the local dev database and bucket
 *
 * Reads WP_API_BASE_URL from the environment or .env. Uses your wrangler login.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const run = promisify(execFile);
const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run') || (!args.has('--remote') && !args.has('--local'));
const target = args.has('--local') ? '--local' : '--remote';
const BUCKET = 'avihtech-images';
const DB = 'avihtech-db';
const PROPERTIES_CATEGORY = 3;

function wpUrl() {
    if (process.env.WP_API_BASE_URL) return process.env.WP_API_BASE_URL;
    const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
    return env.match(/^WP_API_BASE_URL=(.+)$/m)[1].trim();
}

const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };
const decode = (s) => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return entities[e.toLowerCase()] ?? m;
});

function htmlToText(html) {
    return decode(
        html
            .replace(/<div[^>]*class=['"][^'"]*gallery[\s\S]*?<\/div>\s*<\/div>/gi, '')
            .replace(/<div[^>]*class=['"][^'"]*gallery[^>]*>[\s\S]*$/i, '') // anything left of an unclosed gallery
            .replace(/<img[^>]*>/gi, '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/(p|div|li|h\d)>/gi, '\n')
            .replace(/<[^>]+>/g, ''),
    )
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\n\s*\n(?=[^\n]*\n\s*\n)/g, '\n\n')
        .trim();
}

const NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
function bedsFrom(text) {
    const m = text.toLowerCase().match(/\b(\d+|one|two|three|four|five|six)[\s-]*bed/);
    return m ? NUM[m[1]] ?? Number(m[1]) : null;
}
function sizeFrom(text) {
    const t = text.toLowerCase();
    const acre = t.match(/(\d+\/\d+|\d+(?:\.\d+)?)\s*acres?/);
    if (acre) return `${acre[1]} ${Number(acre[1]) > 1 ? 'acres' : 'acre'}`;
    const plot = t.match(/(\d+)\s*x\s*(\d+)/);
    return plot ? `${plot[1]} x ${plot[2]}` : '';
}
const titleCase = (s) => s.trim().replace(/\s+/g, ' ').replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());

/** Original-size version of a WordPress thumbnail URL (…-150x150.jpg → ….jpg). */
const fullSize = (url) => url.replace(/-\d+x\d+(\.(?:jpe?g|png|webp|gif))$/i, '$1');

function mapProperty(post) {
    const acf = post.acf || {};
    const terms = (post._embedded?.['wp:term'] || []).flat();
    const catNames = terms.filter((t) => t.taxonomy === 'category').map((t) => t.name.toLowerCase());
    const tags = terms.filter((t) => t.taxonomy === 'post_tag').map((t) => titleCase(t.name));
    const title = decode(post.title.rendered).trim().replace(/\s+/g, ' ');
    const haystack = `${title} ${post.slug} ${tags.join(' ')}`;

    const isRent = /\b(rent|to let|let)\b/i.test(haystack);
    const isLand = catNames.includes('land') || /\b(plot|acres?|land)\b/i.test(title);
    const type = isLand ? 'land' : catNames.includes('commercial') ? 'commercial' : 'residential';

    const contentImgs = [...post.content.rendered.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((m) => fullSize(m[1]));
    const featured = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const images = [...new Set([featured, ...contentImgs].filter(Boolean))];

    const price = Number(String(acf.price ?? '').replace(/[^\d.]/g, ''));
    return {
        wpId: post.id,
        slug: post.slug.slice(0, 80),
        title,
        description: htmlToText(post.content.rendered),
        location: decode(acf.location || '').trim(),
        price: price > 0 ? Math.round(price) : null,
        listing_type: isRent ? 'rent' : 'sale',
        property_type: type,
        beds: type === 'land' ? null : bedsFrom(haystack),
        size: sizeFrom(title),
        tags,
        createdAt: post.date.replace('T', ' '),
        images,
    };
}

async function fetchAll(base) {
    const out = [];
    for (let page = 1; ; page++) {
        const res = await fetch(`${base}/posts?categories=${PROPERTIES_CATEGORY}&per_page=100&page=${page}&_embed`);
        if (res.status === 400) break; // past the last page
        if (!res.ok) throw new Error(`WordPress API returned ${res.status}`);
        const batch = await res.json();
        out.push(...batch);
        if (batch.length < 100) break;
    }
    return out;
}

const q = (v) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);

async function pool(items, size, worker) {
    const results = new Array(items.length);
    let next = 0;
    await Promise.all(Array.from({ length: size }, async () => {
        while (next < items.length) { const i = next++; results[i] = await worker(items[i], i); }
    }));
    return results;
}

async function copyImage(url, tmp) {
    for (const candidate of [url, url.replace(/(\.[a-z]+)$/i, (m) => m)]) {
        const res = await fetch(candidate);
        if (!res.ok) continue;
        const type = (res.headers.get('content-type') || '').split(';')[0];
        const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }[type];
        if (!ext) return null;
        const d = new Date();
        const key = `uploads/${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${randomUUID()}.${ext}`;
        const file = join(tmp, key.split('/').pop());
        writeFileSync(file, Buffer.from(await res.arrayBuffer()));
        await run('npx', ['wrangler', 'r2', 'object', 'put', `${BUCKET}/${key}`, '--file', file, '--content-type', type, target]);
        return `/images/${key}`;
    }
    return null;
}

const base = wpUrl();
const posts = await fetchAll(base);
const props = posts.map(mapProperty);

props.forEach((p) =>
    console.log(`${String(p.wpId).padStart(3)} ${p.listing_type.padEnd(4)} ${p.property_type.padEnd(11)} beds=${p.beds ?? '-'} size=${p.size || '-'} KES ${p.price ?? '?'} imgs=${p.images.length} | ${p.title}\n      tags: ${p.tags.join(', ') || '-'}`));
console.log(`\n${props.length} properties, ${props.reduce((n, p) => n + p.images.length, 0)} images.`);

if (dryRun) {
    console.log('\nDry run only. Re-run with --remote (or --local) to import.');
    process.exit(0);
}

const tmp = join(tmpdir(), `avih-import-${Date.now()}`);
mkdirSync(tmp, { recursive: true });
const sql = [];
let failed = 0;

// Newest first in WordPress; insert oldest first so ids follow publish order.
for (const [n, p] of [...props].reverse().entries()) {
    console.log(`[${n + 1}/${props.length}] ${p.title}`);
    const urls = (await pool(p.images, 4, (u) => copyImage(u, tmp).catch(() => null)));
    failed += urls.filter((u) => !u).length;
    const hosted = urls.filter(Boolean);
    sql.push(
        `INSERT OR IGNORE INTO properties (slug, title, description, location, price, listing_type, property_type, beds, size, tags, featured, published, created_at, updated_at) VALUES (${[
            q(p.slug), q(p.title), q(p.description), q(p.location), q(p.price), q(p.listing_type), q(p.property_type), q(p.beds), q(p.size), q(JSON.stringify(p.tags)),
            props.indexOf(p) < 2 ? 1 : 0, 1, q(p.createdAt), q(p.createdAt),
        ].join(', ')});`,
    );
    hosted.forEach((url, i) =>
        sql.push(`INSERT INTO property_images (property_id, url, position) VALUES ((SELECT id FROM properties WHERE slug = ${q(p.slug)}), ${q(url)}, ${i});`));
}

const file = join(tmp, 'import.sql');
writeFileSync(file, sql.join('\n'));
await run('npx', ['wrangler', 'd1', 'execute', DB, target, '--file', file, '--yes'], { maxBuffer: 1 << 26 });
rmSync(tmp, { recursive: true, force: true });
console.log(`\nImported ${props.length} properties.${failed ? ` ${failed} images could not be copied.` : ''}`);
