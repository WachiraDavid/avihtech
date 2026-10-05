import { HttpError, json, readJson } from './util.js';
import { clearSessionCookie, createSession, isAuthenticated, passwordMatches } from './auth.js';
import * as site from './public.js';
import * as admin from './admin.js';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Match "METHOD /path/:param" patterns. */
function route(table, method, pathname) {
    for (const [pattern, handler] of table) {
        const [m, path] = pattern.split(' ');
        if (m !== method) continue;
        const names = [];
        const re = new RegExp('^' + path.replace(/:(\w+)/g, (_, n) => (names.push(n), '([^/]+)')) + '/?$');
        const match = pathname.match(re);
        if (match) return { handler, params: Object.fromEntries(names.map((n, i) => [n, decodeURIComponent(match[i + 1])])) };
    }
    return null;
}

const numericId = (value) => {
    const id = Number(value);
    if (!Number.isInteger(id) || id < 1) throw new HttpError(404, 'Not found');
    return id;
};

const publicRoutes = [
    ['GET /api/properties', (ctx) => site.listProperties(ctx.request, ctx.env)],
    ['GET /api/properties/:slug', (ctx) => site.getProperty(ctx.env, ctx.params.slug)],
    ['GET /api/tags', (ctx) => site.listTags(ctx.env)],
    ['GET /api/posts', (ctx) => site.listPosts(ctx.env)],
    ['GET /api/posts/:slug', (ctx) => site.getPost(ctx.env, ctx.params.slug)],
];

const adminRoutes = [
    ['GET /api/admin/properties', (c) => admin.adminListProperties(c.request, c.env)],
    ['GET /api/admin/tags', (c) => admin.adminListTags(c.env)],
    ['POST /api/admin/properties', (c) => admin.adminCreateProperty(c.request, c.env)],
    ['GET /api/admin/properties/:id', (c) => admin.adminGetProperty(c.env, numericId(c.params.id))],
    ['PUT /api/admin/properties/:id', (c) => admin.adminUpdateProperty(c.request, c.env, numericId(c.params.id))],
    ['PATCH /api/admin/properties/:id', (c) => admin.adminPatchProperty(c.request, c.env, numericId(c.params.id))],
    ['DELETE /api/admin/properties/:id', (c) => admin.adminDeleteProperty(c.env, numericId(c.params.id), new URL(c.request.url).origin)],
    ['GET /api/admin/posts', (c) => admin.adminListPosts(c.env)],
    ['POST /api/admin/posts', (c) => admin.adminCreatePost(c.request, c.env)],
    ['GET /api/admin/posts/:id', (c) => admin.adminGetPost(c.env, numericId(c.params.id))],
    ['PUT /api/admin/posts/:id', (c) => admin.adminUpdatePost(c.request, c.env, numericId(c.params.id))],
    ['PATCH /api/admin/posts/:id', (c) => admin.adminPatchPost(c.request, c.env, numericId(c.params.id))],
    ['DELETE /api/admin/posts/:id', (c) => admin.adminDeletePost(c.env, numericId(c.params.id), new URL(c.request.url).origin)],
    ['POST /api/admin/upload', (c) => admin.uploadImage(c.request, c.env)],
];

async function handleApi(request, env, url) {
    const { pathname } = url;
    const secure = url.protocol === 'https:';

    // Cross-site writes are never legitimate.
    if (MUTATING.has(request.method)) {
        const origin = request.headers.get('origin');
        if (origin && origin !== url.origin) throw new HttpError(403, 'Forbidden');
    }

    if (pathname === '/api/admin/login' && request.method === 'POST') {
        const { password } = await readJson(request);
        if (!(await passwordMatches(env, password))) {
            await new Promise((resolve) => setTimeout(resolve, 500)); // slow down guessing
            throw new HttpError(401, 'Incorrect password');
        }
        return json({ ok: true }, 200, { 'set-cookie': await createSession(env, secure) });
    }
    if (pathname === '/api/admin/logout' && request.method === 'POST') {
        return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie(secure) });
    }
    if (pathname === '/api/admin/me' && request.method === 'GET') {
        return json({ authenticated: await isAuthenticated(request, env) });
    }

    if (pathname.startsWith('/api/admin/')) {
        if (!(await isAuthenticated(request, env))) throw new HttpError(401, 'Please sign in');
        const hit = route(adminRoutes, request.method, pathname);
        if (hit) return hit.handler({ request, env, params: hit.params });
    } else {
        const hit = route(publicRoutes, request.method, pathname);
        if (hit) return hit.handler({ request, env, params: hit.params });
    }
    throw new HttpError(404, 'Not found');
}

async function handleImage(request, env, ctx, url) {
    if (request.method !== 'GET' && request.method !== 'HEAD') throw new HttpError(405, 'Method not allowed');
    const cache = caches.default;
    const cached = await cache.match(request);
    if (cached) return cached;

    const key = decodeURIComponent(url.pathname.slice('/images/'.length));
    const object = key && !key.includes('..') ? await env.IMAGES.get(key) : null;
    if (!object) throw new HttpError(404, 'Image not found');

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=86400');
    headers.set('x-content-type-options', 'nosniff');
    const response = new Response(request.method === 'HEAD' ? null : object.body, { headers });
    if (request.method === 'GET') ctx.waitUntil(cache.put(request, response.clone()));
    return response;
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        try {
            if (url.pathname.startsWith('/api/')) return await handleApi(request, env, url);
            if (url.pathname.startsWith('/images/')) return await handleImage(request, env, ctx, url);

            // Pretty URLs for detail pages share one static template each.
            if (/^\/properties\/[^/]+\/?$/.test(url.pathname)) return env.ASSETS.fetch(new Request(new URL('/property', url), request));
            if (/^\/blog\/[^/]+\/?$/.test(url.pathname)) return env.ASSETS.fetch(new Request(new URL('/post', url), request));

            return env.ASSETS.fetch(request);
        } catch (err) {
            if (err instanceof HttpError) return json({ error: err.message }, err.status);
            console.error(err);
            return json({ error: 'Something went wrong' }, 500);
        }
    },
};
