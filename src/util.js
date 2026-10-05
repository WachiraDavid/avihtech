export class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

export const json = (data, status = 200, headers = {}) =>
    new Response(JSON.stringify(data), {
        status,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
    });

export function slugify(text) {
    return (
        String(text)
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 80) || 'item'
    );
}

/** Returns a slug that is not yet used in `table` (appends -2, -3, ... when needed). */
export async function uniqueSlug(db, table, base) {
    let slug = base;
    for (let n = 2; ; n++) {
        const taken = await db.prepare(`SELECT 1 FROM ${table} WHERE slug = ?`).bind(slug).first();
        if (!taken) return slug;
        slug = `${base}-${n}`;
    }
}

export const toInt = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const n = Math.round(Number(String(value).replace(/[^\d.-]/g, '')));
    return Number.isFinite(n) && n >= 0 ? n : null;
};

export const clean = (value, max) => String(value ?? '').trim().slice(0, max);

/** Only images we host ourselves may be attached to content. */
export const isOwnImage = (url) => typeof url === 'string' && /^\/(images|assets)\/[\w\-./]+$/.test(url) && !url.includes('..');

/** Defence in depth: the dashboard is trusted, but never store active content. */
export function sanitizeHtml(html) {
    return String(html ?? '')
        .replace(/<\s*(script|style|iframe|object|embed|form)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
        .replace(/<\s*\/?\s*(script|style|iframe|object|embed|link|meta|form)\b[^>]*>/gi, '')
        .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1=$2#$2');
}

export const textOf = (html) =>
    String(html ?? '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

export async function readJson(request) {
    try {
        return await request.json();
    } catch {
        throw new HttpError(400, 'Invalid request body');
    }
}
