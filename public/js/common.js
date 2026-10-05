/* Shared helpers for the public site and the dashboard. */
(function () {
    if (window.tailwind) {
        tailwind.config = {
            theme: {
                extend: {
                    colors: { primary: '#0F172A', secondary: '#334155', accent: '#EAB308' },
                    fontFamily: {
                        sans: ['"Book Antiqua"', 'Palatino', '"Palatino Linotype"', '"Palatino LT STD"', 'Georgia', 'serif'],
                        display: ['"Book Antiqua"', 'Palatino', '"Palatino Linotype"', '"Palatino LT STD"', 'Georgia', 'serif'],
                    },
                },
            },
        };
    }

    const AV = (window.AV = {});

    AV.WHATSAPP_NUMBER = '254702594345';
    AV.FALLBACK_IMAGE = '/assets/img/hero.png';

    AV.esc = (value) =>
        String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

    AV.stripTags = (str) => String(str ?? '').trim().replace(/<[^>]*>?/gm, '');

    AV.$ = (selector, root = document) => root.querySelector(selector);
    AV.$$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    AV.formatPrice = (price, listingType) => {
        if (price === null || price === undefined || price === '') return 'Request Quote';
        const text = 'KES ' + Number(price).toLocaleString('en-US');
        return listingType === 'rent' ? text + ' / month' : text;
    };

    AV.formatDate = (iso) => {
        if (!iso) return '';
        const date = new Date(String(iso).replace(' ', 'T') + (String(iso).includes('Z') || String(iso).includes('+') ? '' : 'Z'));
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    AV.statusLabel = (p) => (p.listing_type === 'rent' ? 'FOR RENT' : 'FOR SALE');

    AV.api = async (path, options = {}) => {
        const init = { credentials: 'same-origin', ...options, headers: { ...(options.headers || {}) } };
        if (init.body && !(init.body instanceof FormData) && typeof init.body !== 'string') {
            init.body = JSON.stringify(init.body);
            init.headers['content-type'] = 'application/json';
        }
        const res = await fetch(path, init);
        let data = null;
        try { data = await res.json(); } catch (e) { /* empty body */ }
        if (!res.ok) {
            const err = new Error((data && data.error) || 'Request failed (' + res.status + ')');
            err.status = res.status;
            throw err;
        }
        return data;
    };

    // Allow-list sanitizer for rich text coming from the dashboard.
    const ALLOWED_TAGS = new Set(['P', 'BR', 'H2', 'H3', 'H4', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A', 'IMG', 'FIGURE', 'FIGCAPTION', 'HR']);
    const ALLOWED_ATTRS = { A: ['href', 'target', 'rel'], IMG: ['src', 'alt'] };
    const SAFE_URL = /^(https?:|mailto:|tel:|\/|#)/i;

    AV.sanitizeHtml = (html) => {
        const tpl = document.createElement('template');
        tpl.innerHTML = html || '';
        const walk = (node) => {
            [...node.children].forEach((el) => {
                if (!ALLOWED_TAGS.has(el.tagName)) {
                    if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'SVG', 'FORM'].includes(el.tagName.toUpperCase())) {
                        el.remove();
                        return;
                    }
                    walk(el);
                    el.replaceWith(...el.childNodes);
                    return;
                }
                const allowed = ALLOWED_ATTRS[el.tagName] || [];
                [...el.attributes].forEach((attr) => {
                    if (!allowed.includes(attr.name) || (['href', 'src'].includes(attr.name) && !SAFE_URL.test(attr.value.trim()))) {
                        el.removeAttribute(attr.name);
                    }
                });
                if (el.tagName === 'A') { el.setAttribute('rel', 'noopener noreferrer'); }
                walk(el);
            });
        };
        walk(tpl.content);
        return tpl.innerHTML;
    };
})();
