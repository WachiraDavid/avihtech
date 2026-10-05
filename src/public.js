import { HttpError, json } from './util.js';

const COVER = `(SELECT url FROM property_images WHERE property_id = p.id ORDER BY position, id LIMIT 1) AS cover`;

export function propertyOut(row) {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        location: row.location,
        price: row.price,
        listing_type: row.listing_type,
        property_type: row.property_type,
        beds: row.beds,
        baths: row.baths,
        size: row.size,
        tags: JSON.parse(row.tags || '[]'),
        featured: !!row.featured,
        published: !!row.published,
        cover: row.cover || null,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}

export const PROPERTY_SELECT = `SELECT p.*, ${COVER} FROM properties p`;

export async function propertyImages(db, id) {
    const { results } = await db.prepare('SELECT url FROM property_images WHERE property_id = ? ORDER BY position, id').bind(id).all();
    return results.map((r) => r.url);
}

export async function listProperties(request, env) {
    const q = new URL(request.url).searchParams;
    const where = ['p.published = 1'];
    const args = [];

    if (q.get('featured') === '1') where.push('p.featured = 1');
    if (['residential', 'commercial', 'land'].includes(q.get('type'))) {
        where.push('p.property_type = ?');
        args.push(q.get('type'));
    }
    if (q.get('tag')) {
        where.push('EXISTS (SELECT 1 FROM json_each(p.tags) WHERE json_each.value = ?)');
        args.push(q.get('tag'));
    }
    if (q.get('q')) {
        where.push("(p.title LIKE ? ESCAPE '\\' OR p.location LIKE ? ESCAPE '\\' OR p.description LIKE ? ESCAPE '\\')");
        const like = `%${q.get('q').replace(/[\\%_]/g, '\\$&')}%`;
        args.push(like, like, like);
    }
    const limit = Math.min(Math.max(parseInt(q.get('limit')) || 60, 1), 100);

    const { results } = await env.DB.prepare(`${PROPERTY_SELECT} WHERE ${where.join(' AND ')} ORDER BY p.featured DESC, p.created_at DESC, p.id DESC LIMIT ?`)
        .bind(...args, limit)
        .all();
    return json({ properties: results.map(propertyOut) });
}

export async function getProperty(env, slug) {
    const row = await env.DB.prepare(`${PROPERTY_SELECT} WHERE p.slug = ? AND p.published = 1`).bind(slug).first();
    if (!row) throw new HttpError(404, 'Property not found');
    return json({ property: { ...propertyOut(row), images: await propertyImages(env.DB, row.id) } });
}

export async function listTags(env) {
    const { results } = await env.DB.prepare(
        `SELECT DISTINCT j.value AS tag FROM properties p, json_each(p.tags) j WHERE p.published = 1 ORDER BY j.value COLLATE NOCASE`,
    ).all();
    return json({ tags: results.map((r) => r.tag) });
}

export async function listPosts(env) {
    const { results } = await env.DB.prepare(
        `SELECT id, slug, title, excerpt, cover_image, category, read_minutes, published_at
         FROM posts WHERE published = 1 ORDER BY published_at DESC, id DESC LIMIT 100`,
    ).all();
    return json({ posts: results });
}

export async function getPost(env, slug) {
    const post = await env.DB.prepare(
        `SELECT id, slug, title, excerpt, content, cover_image, category, read_minutes, published_at
         FROM posts WHERE slug = ? AND published = 1`,
    )
        .bind(slug)
        .first();
    if (!post) throw new HttpError(404, 'Post not found');
    return json({ post });
}
