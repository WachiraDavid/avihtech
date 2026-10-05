import { HttpError, json, readJson, slugify, uniqueSlug, toInt, clean, isOwnImage, sanitizeHtml, textOf } from './util.js';
import { PROPERTY_SELECT, propertyOut, propertyImages } from './public.js';

const LISTING_TYPES = ['sale', 'rent'];
const PROPERTY_TYPES = ['residential', 'commercial', 'land'];
const MAX_UPLOAD = 10 * 1024 * 1024;

/* ---------- Images (R2) ---------- */

const imageKey = (url) => (typeof url === 'string' && url.startsWith('/images/') ? url.slice('/images/'.length) : null);

async function deleteImages(env, urls, origin) {
    const keys = [...new Set(urls.map(imageKey).filter(Boolean))];
    if (!keys.length) return;
    await env.IMAGES.delete(keys);
    // Purge this data centre's cached copy; other locations expire within a day.
    await Promise.all(keys.map((key) => caches.default.delete(new Request(`${origin}/images/${key}`))));
}

const imageUrlsIn = (html) => [...String(html ?? '').matchAll(/\/images\/[\w\-./]+/g)].map((m) => m[0]);

function sniffImage(bytes) {
    const hex = [...bytes.slice(0, 12)].map((b) => b.toString(16).padStart(2, '0')).join('');
    if (hex.startsWith('ffd8ff')) return { type: 'image/jpeg', ext: 'jpg' };
    if (hex.startsWith('89504e47')) return { type: 'image/png', ext: 'png' };
    if (hex.startsWith('47494638')) return { type: 'image/gif', ext: 'gif' };
    if (hex.startsWith('52494646') && hex.slice(16, 24) === '57454250') return { type: 'image/webp', ext: 'webp' };
    return null;
}

export async function uploadImage(request, env) {
    const form = await request.formData().catch(() => null);
    const file = form && form.get('file');
    if (!file || typeof file === 'string') throw new HttpError(400, 'No file uploaded');
    if (file.size > MAX_UPLOAD) throw new HttpError(413, 'Image is too large (10 MB max)');

    const buffer = await file.arrayBuffer();
    const kind = sniffImage(new Uint8Array(buffer));
    if (!kind) throw new HttpError(415, 'Please upload a JPG, PNG, WebP or GIF image');

    const now = new Date();
    const key = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}.${kind.ext}`;
    await env.IMAGES.put(key, buffer, { httpMetadata: { contentType: kind.type } });
    return json({ url: `/images/${key}` }, 201);
}

/* ---------- Properties ---------- */

function parseProperty(body) {
    const title = clean(body.title, 200);
    if (!title) throw new HttpError(400, 'Please give the property a title');

    const tags = [...new Set((Array.isArray(body.tags) ? body.tags : []).map((t) => clean(t, 40)).filter(Boolean))].slice(0, 20);
    const images = (Array.isArray(body.images) ? body.images : []).filter(isOwnImage).slice(0, 40);

    return {
        title,
        description: clean(body.description, 20000),
        location: clean(body.location, 200),
        price: toInt(body.price),
        listing_type: LISTING_TYPES.includes(body.listing_type) ? body.listing_type : 'sale',
        property_type: PROPERTY_TYPES.includes(body.property_type) ? body.property_type : 'residential',
        beds: toInt(body.beds),
        baths: toInt(body.baths),
        size: clean(body.size, 60),
        tags: JSON.stringify(tags),
        featured: body.featured ? 1 : 0,
        published: body.published === false || body.published === 0 ? 0 : 1,
        images,
    };
}

const imageInserts = (db, propertyId, urls) =>
    urls.map((url, i) => db.prepare('INSERT INTO property_images (property_id, url, position) VALUES (?, ?, ?)').bind(propertyId, url, i));

export async function adminListProperties(request, env) {
    const q = new URL(request.url).searchParams;
    const perPage = Math.min(Math.max(parseInt(q.get('per_page')) || 10, 1), 50);
    const search = (q.get('q') || '').trim();

    let where = '';
    const args = [];
    if (search) {
        where = "WHERE (p.title LIKE ? ESCAPE '\\' OR p.location LIKE ? ESCAPE '\\' OR p.tags LIKE ? ESCAPE '\\')";
        const like = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
        args.push(like, like, like);
    }

    const { total } = await env.DB.prepare(`SELECT COUNT(*) AS total FROM properties p ${where}`).bind(...args).first();
    const pages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(Math.max(parseInt(q.get('page')) || 1, 1), pages);

    const { results } = await env.DB.prepare(`${PROPERTY_SELECT} ${where} ORDER BY p.created_at DESC, p.id DESC LIMIT ? OFFSET ?`)
        .bind(...args, perPage, (page - 1) * perPage)
        .all();
    return json({ properties: results.map(propertyOut), total, page, pages, per_page: perPage });
}

export async function adminListTags(env) {
    const { results } = await env.DB.prepare('SELECT DISTINCT j.value AS tag FROM properties p, json_each(p.tags) j ORDER BY j.value COLLATE NOCASE').all();
    return json({ tags: results.map((r) => r.tag) });
}

export async function adminGetProperty(env, id) {
    const row = await env.DB.prepare(`${PROPERTY_SELECT} WHERE p.id = ?`).bind(id).first();
    if (!row) throw new HttpError(404, 'Property not found');
    return json({ property: { ...propertyOut(row), images: await propertyImages(env.DB, id) } });
}

export async function adminCreateProperty(request, env) {
    const p = parseProperty(await readJson(request));
    const slug = await uniqueSlug(env.DB, 'properties', slugify(p.title));
    const res = await env.DB.prepare(
        `INSERT INTO properties (slug, title, description, location, price, listing_type, property_type, beds, baths, size, tags, featured, published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
        .bind(slug, p.title, p.description, p.location, p.price, p.listing_type, p.property_type, p.beds, p.baths, p.size, p.tags, p.featured, p.published)
        .run();
    const id = res.meta.last_row_id;
    if (p.images.length) await env.DB.batch(imageInserts(env.DB, id, p.images));
    return json({ id, slug }, 201);
}

export async function adminUpdateProperty(request, env, id) {
    const p = parseProperty(await readJson(request));
    const existing = await env.DB.prepare('SELECT id FROM properties WHERE id = ?').bind(id).first();
    if (!existing) throw new HttpError(404, 'Property not found');

    const before = await propertyImages(env.DB, id);
    await env.DB.batch([
        env.DB.prepare(
            `UPDATE properties SET title = ?, description = ?, location = ?, price = ?, listing_type = ?, property_type = ?,
             beds = ?, baths = ?, size = ?, tags = ?, featured = ?, published = ?, updated_at = datetime('now') WHERE id = ?`,
        ).bind(p.title, p.description, p.location, p.price, p.listing_type, p.property_type, p.beds, p.baths, p.size, p.tags, p.featured, p.published, id),
        env.DB.prepare('DELETE FROM property_images WHERE property_id = ?').bind(id),
        ...imageInserts(env.DB, id, p.images),
    ]);
    await deleteImages(env, before.filter((url) => !p.images.includes(url)), new URL(request.url).origin);
    return json({ ok: true });
}

export async function adminPatchProperty(request, env, id) {
    const body = await readJson(request);
    const sets = [];
    const args = [];
    if ('published' in body) { sets.push('published = ?'); args.push(body.published ? 1 : 0); }
    if ('featured' in body) { sets.push('featured = ?'); args.push(body.featured ? 1 : 0); }
    if (!sets.length) throw new HttpError(400, 'Nothing to update');
    const res = await env.DB.prepare(`UPDATE properties SET ${sets.join(', ')}, updated_at = datetime('now') WHERE id = ?`).bind(...args, id).run();
    if (!res.meta.changes) throw new HttpError(404, 'Property not found');
    return json({ ok: true });
}

export async function adminDeleteProperty(env, id, origin) {
    const images = await propertyImages(env.DB, id);
    await env.DB.batch([
        env.DB.prepare('DELETE FROM property_images WHERE property_id = ?').bind(id),
        env.DB.prepare('DELETE FROM properties WHERE id = ?').bind(id),
    ]);
    await deleteImages(env, images, origin);
    return json({ ok: true });
}

/* ---------- Blog posts ---------- */

function parsePost(body) {
    const title = clean(body.title, 200);
    if (!title) throw new HttpError(400, 'Please give the post a title');
    const content = sanitizeHtml(clean(body.content, 200000));
    const text = textOf(content);
    return {
        title,
        content,
        excerpt: clean(body.excerpt, 300) || (text.length > 160 ? text.slice(0, 157).trimEnd() + '...' : text),
        category: clean(body.category, 60) || 'Market Analysis',
        cover_image: isOwnImage(body.cover_image) ? body.cover_image : '',
        read_minutes: Math.max(1, Math.round(text.split(' ').filter(Boolean).length / 200)),
        published: body.published === false || body.published === 0 ? 0 : 1,
    };
}

export async function adminListPosts(env) {
    const { results } = await env.DB.prepare(
        `SELECT id, slug, title, category, cover_image, published, published_at, updated_at FROM posts ORDER BY published_at DESC, id DESC`,
    ).all();
    return json({ posts: results.map((r) => ({ ...r, published: !!r.published })) });
}

export async function adminGetPost(env, id) {
    const post = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
    if (!post) throw new HttpError(404, 'Post not found');
    return json({ post: { ...post, published: !!post.published } });
}

export async function adminCreatePost(request, env) {
    const p = parsePost(await readJson(request));
    const slug = await uniqueSlug(env.DB, 'posts', slugify(p.title));
    const res = await env.DB.prepare(
        `INSERT INTO posts (slug, title, excerpt, content, cover_image, category, read_minutes, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
        .bind(slug, p.title, p.excerpt, p.content, p.cover_image, p.category, p.read_minutes, p.published)
        .run();
    return json({ id: res.meta.last_row_id, slug }, 201);
}

export async function adminUpdatePost(request, env, id) {
    const p = parsePost(await readJson(request));
    const old = await env.DB.prepare('SELECT content, cover_image, published FROM posts WHERE id = ?').bind(id).first();
    if (!old) throw new HttpError(404, 'Post not found');

    // Restart the publish date when a hidden post goes live.
    const republish = p.published && !old.published ? ", published_at = datetime('now')" : '';
    await env.DB.prepare(
        `UPDATE posts SET title = ?, excerpt = ?, content = ?, cover_image = ?, category = ?, read_minutes = ?, published = ?,
         updated_at = datetime('now')${republish} WHERE id = ?`,
    )
        .bind(p.title, p.excerpt, p.content, p.cover_image, p.category, p.read_minutes, p.published, id)
        .run();

    const kept = new Set([p.cover_image, ...imageUrlsIn(p.content)]);
    await deleteImages(env, [old.cover_image, ...imageUrlsIn(old.content)].filter((u) => u && !kept.has(u)), new URL(request.url).origin);
    return json({ ok: true });
}

export async function adminPatchPost(request, env, id) {
    const body = await readJson(request);
    if (!('published' in body)) throw new HttpError(400, 'Nothing to update');
    const republish = body.published ? ", published_at = CASE WHEN published = 0 THEN datetime('now') ELSE published_at END" : '';
    const res = await env.DB.prepare(`UPDATE posts SET published = ?, updated_at = datetime('now')${republish} WHERE id = ?`).bind(body.published ? 1 : 0, id).run();
    if (!res.meta.changes) throw new HttpError(404, 'Post not found');
    return json({ ok: true });
}

export async function adminDeletePost(env, id, origin) {
    const old = await env.DB.prepare('SELECT content, cover_image FROM posts WHERE id = ?').bind(id).first();
    if (!old) throw new HttpError(404, 'Post not found');
    await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
    await deleteImages(env, [old.cover_image, ...imageUrlsIn(old.content)], origin);
    return json({ ok: true });
}
