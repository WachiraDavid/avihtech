import { HttpError } from './util.js';

const COOKIE = 'avih_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const encoder = new TextEncoder();

const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (str) => Uint8Array.from(atob(str.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

const hmacKey = (secret) => crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);

async function sha256(text) {
    return crypto.subtle.digest('SHA-256', encoder.encode(text));
}

export async function passwordMatches(env, given) {
    if (!env.ADMIN_PASSWORD) throw new HttpError(500, 'ADMIN_PASSWORD is not configured');
    const [a, b] = await Promise.all([sha256(String(given ?? '')), sha256(env.ADMIN_PASSWORD)]);
    return crypto.subtle.timingSafeEqual(a, b);
}

export async function createSession(env, secure) {
    if (!env.SESSION_SECRET) throw new HttpError(500, 'SESSION_SECRET is not configured');
    const payload = b64url(encoder.encode(JSON.stringify({ exp: Date.now() + MAX_AGE * 1000 })));
    const sig = await crypto.subtle.sign('HMAC', await hmacKey(env.SESSION_SECRET), encoder.encode(payload));
    return `${COOKIE}=${payload}.${b64url(sig)}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}`;
}

export const clearSessionCookie = (secure) => `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}`;

export async function isAuthenticated(request, env) {
    if (!env.SESSION_SECRET) return false;
    const cookie = (request.headers.get('cookie') || '').split(/;\s*/).find((c) => c.startsWith(COOKIE + '='));
    if (!cookie) return false;
    const [payload, sig] = cookie.slice(COOKIE.length + 1).split('.');
    if (!payload || !sig) return false;
    try {
        const valid = await crypto.subtle.verify('HMAC', await hmacKey(env.SESSION_SECRET), fromB64url(sig), encoder.encode(payload));
        if (!valid) return false;
        const { exp } = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
        return typeof exp === 'number' && exp > Date.now();
    } catch {
        return false;
    }
}
