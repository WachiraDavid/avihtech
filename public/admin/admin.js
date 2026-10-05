/* AVIHTECH dashboard: manage properties and blog posts. */
(function () {
    const { esc, api, $, $$ } = AV;
    const app = document.getElementById('app');

    const INPUT = 'w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none text-base';
    const LABEL = 'block text-sm font-bold text-slate-700 mb-2';
    const CARD = 'bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8';
    const BTN_PRIMARY = 'inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50';
    const BTN_GHOST = 'inline-flex items-center justify-center gap-2 font-bold px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors';

    let dirty = false;
    const markDirty = () => { dirty = true; };

    /* ---------- small helpers ---------- */

    function toast(message, kind = 'ok') {
        const el = document.createElement('div');
        el.className = `pointer-events-auto px-5 py-3 rounded-xl shadow-xl text-sm font-bold text-white ${kind === 'error' ? 'bg-red-600' : 'bg-primary'}`;
        el.textContent = message;
        $('#toasts').appendChild(el);
        setTimeout(() => el.remove(), kind === 'error' ? 6000 : 2500);
    }

    const toggle = (id, label, hint, checked) => `
        <label class="flex items-start gap-4 cursor-pointer select-none">
            <input type="checkbox" id="${id}" class="peer sr-only" ${checked ? 'checked' : ''}>
            <span class="mt-0.5 shrink-0 w-12 h-7 bg-slate-300 rounded-full relative transition-colors peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-primary after:content-[''] after:absolute after:top-1 after:left-1 after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-5"></span>
            <span><span class="block font-bold text-primary">${label}</span><span class="block text-sm text-slate-500">${hint}</span></span>
        </label>`;

    const segmented = (name, options, value) => `
        <div class="flex flex-wrap gap-2">
            ${options.map(([val, label, icon]) => `
            <label class="cursor-pointer">
                <input type="radio" name="${name}" value="${val}" class="peer sr-only" ${val === value ? 'checked' : ''}>
                <span class="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-600 peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-accent transition-colors">
                    ${icon ? `<i class="fa-solid ${icon}"></i>` : ''}${label}
                </span>
            </label>`).join('')}
        </div>`;

    /** Shrinks big phone photos before upload, then sends the file to R2. Returns the public URL. */
    async function uploadImage(file) {
        let blob = file;
        if (/^image\/(jpeg|png|webp)$/.test(file.type)) {
            try {
                const bitmap = await createImageBitmap(file);
                const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
                if (scale < 1 || file.size > 1.5 * 1024 * 1024) {
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.round(bitmap.width * scale);
                    canvas.height = Math.round(bitmap.height * scale);
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
                    const resized = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
                    if (resized && resized.size < file.size) blob = resized;
                }
            } catch (e) { /* upload the original */ }
        }
        const body = new FormData();
        body.append('file', blob, file.name || 'image.jpg');
        const { url } = await api('/api/admin/upload', { method: 'POST', body });
        return url;
    }

    const imageFiles = (list) => [...list].filter((f) => f.type.startsWith('image/'));

    /* ---------- shell ---------- */

    function shell(active, content) {
        app.innerHTML = `
        <header class="bg-white border-b border-slate-100 sticky top-0 z-40">
            <div class="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
                <a href="#/properties" class="flex items-center gap-3 shrink-0">
                    <img src="/assets/img/avitech-icon.png" alt="" class="h-8 w-auto">
                    <span class="font-display font-bold text-primary hidden sm:inline">Dashboard</span>
                </a>
                <nav class="flex items-center gap-1">
                    <a href="#/properties" class="px-4 py-2 rounded-lg font-bold text-sm ${active === 'properties' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}"><i class="fa-solid fa-house mr-2"></i>Properties</a>
                    <a href="#/posts" class="px-4 py-2 rounded-lg font-bold text-sm ${active === 'posts' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}"><i class="fa-solid fa-pen-nib mr-2"></i>Blog</a>
                </nav>
                <div class="flex items-center gap-4 text-sm font-bold text-slate-500">
                    <a href="/" target="_blank" class="hover:text-primary whitespace-nowrap">View site <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i></a>
                    <button id="logout" class="hover:text-primary">Sign out</button>
                </div>
            </div>
        </header>
        <main class="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-32">${content}</main>`;
        $('#logout').addEventListener('click', async () => {
            await api('/api/admin/logout', { method: 'POST' });
            route();
        });
    }

    function loading() {
        app.innerHTML = '<div class="min-h-screen flex items-center justify-center text-slate-400"><i class="fa-solid fa-circle-notch fa-spin text-3xl"></i></div>';
    }

    function loginView() {
        app.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-4">
            <form id="login" class="${CARD} w-full max-w-sm text-center">
                <img src="/assets/img/avitech-icon.png" alt="" class="h-14 mx-auto mb-4">
                <h1 class="text-2xl font-display font-bold text-primary mb-1">Welcome back</h1>
                <p class="text-slate-500 text-sm mb-6">Sign in to manage properties and blog posts.</p>
                <input type="password" id="password" placeholder="Password" required autofocus autocomplete="current-password" class="${INPUT} mb-4">
                <p id="login-error" class="text-red-600 text-sm font-bold mb-4 hidden"></p>
                <button class="${BTN_PRIMARY} w-full">Sign in</button>
            </form>
        </div>`;
        $('#login').addEventListener('submit', async (e) => {
            e.preventDefault();
            const button = $('button', e.target);
            button.disabled = true;
            try {
                await api('/api/admin/login', { method: 'POST', body: { password: $('#password').value } });
                route();
            } catch (err) {
                $('#login-error').textContent = err.message;
                $('#login-error').classList.remove('hidden');
                button.disabled = false;
            }
        });
    }

    /* ---------- lists ---------- */

    const thumb = (url) => url
        ? `<img src="${esc(url)}" alt="" class="w-full h-full object-cover">`
        : '<div class="w-full h-full flex items-center justify-center text-slate-300"><i class="fa-regular fa-image text-2xl"></i></div>';

    const switchRow = (kind, id, on) => `
        <label class="flex items-center gap-2 cursor-pointer select-none text-sm font-bold ${on ? 'text-green-700' : 'text-slate-400'}" title="Show or hide on the website">
            <input type="checkbox" class="peer sr-only visibility" data-kind="${kind}" data-id="${id}" ${on ? 'checked' : ''}>
            <span class="w-10 h-6 bg-slate-300 rounded-full relative transition-colors peer-checked:bg-green-500 after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-4"></span>
            <span class="w-14">${on ? 'Live' : 'Hidden'}</span>
        </label>`;

    function wireList(kind, reload) {
        $$('.visibility').forEach((box) => box.addEventListener('change', async () => {
            try {
                await api(`/api/admin/${kind}/${box.dataset.id}`, { method: 'PATCH', body: { published: box.checked } });
                reload();
            } catch (err) { box.checked = !box.checked; toast(err.message, 'error'); }
        }));
        $$('.delete').forEach((btn) => btn.addEventListener('click', async () => {
            if (!confirm(`Delete "${btn.dataset.title}"? This cannot be undone.`)) return;
            try {
                await api(`/api/admin/${kind}/${btn.dataset.id}`, { method: 'DELETE' });
                toast('Deleted');
                reload();
            } catch (err) { toast(err.message, 'error'); }
        }));
    }

    const emptyState = (icon, text, href, cta) => `
        <div class="${CARD} text-center py-16">
            <div class="text-5xl text-slate-200 mb-4"><i class="fa-solid ${icon}"></i></div>
            <p class="text-slate-500 mb-6">${text}</p>
            <a href="${href}" class="${BTN_PRIMARY}"><i class="fa-solid fa-plus"></i> ${cta}</a>
        </div>`;

    async function propertiesList() {
        loading();
        const { properties } = await api('/api/admin/properties');
        shell('properties', `
            <div class="flex items-center justify-between gap-4 mb-6">
                <h1 class="text-3xl font-display font-bold text-primary">Properties</h1>
                <a href="#/properties/new" class="${BTN_PRIMARY}"><i class="fa-solid fa-plus"></i> Add property</a>
            </div>
            ${properties.length ? `<div class="space-y-3">${properties.map((p) => `
            <div class="${CARD} !p-4 flex flex-wrap sm:flex-nowrap items-center gap-4">
                <a href="#/properties/${p.id}" class="w-24 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">${thumb(p.cover)}</a>
                <a href="#/properties/${p.id}" class="min-w-0 flex-1">
                    <p class="font-bold text-primary truncate">${p.featured ? '<i class="fa-solid fa-star text-accent mr-1" title="Featured on homepage"></i>' : ''}${esc(p.title)}</p>
                    <p class="text-sm text-slate-500 truncate">${esc(p.location || 'No location')} · ${esc(AV.formatPrice(p.price, p.listing_type))}</p>
                    <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">${esc(AV.statusLabel(p))} · ${esc(p.property_type)}</p>
                </a>
                <div class="flex items-center gap-4 ml-auto">
                    ${switchRow('properties', p.id, p.published)}
                    <a href="#/properties/${p.id}" class="${BTN_GHOST} !px-4 !py-2 text-sm">Edit</a>
                    <button class="delete text-slate-400 hover:text-red-600 p-2" data-id="${p.id}" data-title="${esc(p.title)}" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`).join('')}</div>` : emptyState('fa-house-circle-exclamation', 'No properties yet. Add your first listing — it only takes a minute.', '#/properties/new', 'Add property')}`);
        wireList('properties', propertiesList);
    }

    async function postsList() {
        loading();
        const { posts } = await api('/api/admin/posts');
        shell('posts', `
            <div class="flex items-center justify-between gap-4 mb-6">
                <h1 class="text-3xl font-display font-bold text-primary">Blog posts</h1>
                <a href="#/posts/new" class="${BTN_PRIMARY}"><i class="fa-solid fa-plus"></i> Write a post</a>
            </div>
            ${posts.length ? `<div class="space-y-3">${posts.map((p) => `
            <div class="${CARD} !p-4 flex flex-wrap sm:flex-nowrap items-center gap-4">
                <a href="#/posts/${p.id}" class="w-24 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">${thumb(p.cover_image)}</a>
                <a href="#/posts/${p.id}" class="min-w-0 flex-1">
                    <p class="font-bold text-primary truncate">${esc(p.title)}</p>
                    <p class="text-sm text-slate-500">${esc(AV.formatDate(p.published_at))}</p>
                    <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">${esc(p.category)}</p>
                </a>
                <div class="flex items-center gap-4 ml-auto">
                    ${switchRow('posts', p.id, p.published)}
                    <a href="#/posts/${p.id}" class="${BTN_GHOST} !px-4 !py-2 text-sm">Edit</a>
                    <button class="delete text-slate-400 hover:text-red-600 p-2" data-id="${p.id}" data-title="${esc(p.title)}" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`).join('')}</div>` : emptyState('fa-file-circle-plus', 'No blog posts yet. Share some market insight with your visitors.', '#/posts/new', 'Write a post')}`);
        wireList('posts', postsList);
    }

    /* ---------- property form ---------- */

    const SUGGESTED_TAGS = ['One Acre', 'Half Acre', 'One Bedroom', 'Two Bedroom', 'Gated Community', 'Title Deed', 'Parking', 'Water On Site', 'Borehole', 'Furnished', 'Garden', 'Swimming Pool', 'Near Tarmac'];

    async function propertyForm(id) {
        loading();
        const [{ properties: all }, existing] = await Promise.all([
            api('/api/admin/properties'),
            id ? api(`/api/admin/properties/${id}`) : null,
        ]);
        const known = [...new Set([...SUGGESTED_TAGS, ...all.flatMap((p) => p.tags)])];
        const s = existing ? existing.property : {
            title: '', description: '', location: '', price: null, listing_type: 'sale', property_type: 'residential',
            beds: null, baths: null, size: '', tags: [], featured: false, published: true, images: [],
        };
        s.images = [...s.images];
        s.tags = [...s.tags];
        let uploading = 0;

        shell('properties', `
        <form id="form" class="max-w-3xl mx-auto space-y-6" novalidate>
            <div class="flex items-center gap-3 mb-2">
                <a href="#/properties" class="text-slate-400 hover:text-primary"><i class="fa-solid fa-arrow-left"></i></a>
                <h1 class="text-3xl font-display font-bold text-primary">${id ? 'Edit property' : 'Add a property'}</h1>
            </div>

            <section class="${CARD}">
                <h2 class="text-xl font-bold text-primary mb-1">1. Photos</h2>
                <p class="text-sm text-slate-500 mb-5">Add as many as you like. The first photo is the cover — drag photos to reorder.</p>
                <div id="photos"></div>
            </section>

            <section class="${CARD} space-y-6">
                <h2 class="text-xl font-bold text-primary">2. The basics</h2>
                <div>
                    <label class="${LABEL}" for="title">Property name</label>
                    <input id="title" class="${INPUT}" placeholder="e.g. Modern 3 Bedroom Maisonette" maxlength="200" value="${esc(s.title)}">
                </div>
                <div>
                    <span class="${LABEL}">Is it for sale or to rent?</span>
                    ${segmented('listing_type', [['sale', 'For sale', 'fa-tag'], ['rent', 'For rent', 'fa-key']], s.listing_type)}
                </div>
                <div>
                    <span class="${LABEL}">What kind of property?</span>
                    ${segmented('property_type', [['residential', 'Residential', 'fa-house'], ['commercial', 'Commercial', 'fa-building'], ['land', 'Land / plot', 'fa-mountain-sun']], s.property_type)}
                </div>
                <div class="grid sm:grid-cols-2 gap-6">
                    <div>
                        <label class="${LABEL}" for="location">Where is it?</label>
                        <input id="location" class="${INPUT}" placeholder="e.g. Kinamba, Naivasha" maxlength="200" value="${esc(s.location)}">
                    </div>
                    <div>
                        <label class="${LABEL}" for="price">Price (KES) <span id="price-unit" class="font-normal text-slate-400"></span></label>
                        <input id="price" inputmode="numeric" class="${INPUT}" placeholder="Leave blank for “Request Quote”" value="${s.price ?? ''}">
                        <p id="price-hint" class="text-sm text-slate-500 mt-1 h-5"></p>
                    </div>
                </div>
            </section>

            <section class="${CARD} space-y-6">
                <h2 class="text-xl font-bold text-primary">3. Details</h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <div id="beds-wrap"><label class="${LABEL}" for="beds">Bedrooms</label><input id="beds" type="number" min="0" class="${INPUT}" value="${s.beds ?? ''}"></div>
                    <div id="baths-wrap"><label class="${LABEL}" for="baths">Bathrooms</label><input id="baths" type="number" min="0" class="${INPUT}" value="${s.baths ?? ''}"></div>
                    <div class="col-span-2 sm:col-span-1"><label class="${LABEL}" for="size">Size</label><input id="size" class="${INPUT}" placeholder="e.g. 1 acre, 120 sqm" maxlength="60" value="${esc(s.size)}"></div>
                </div>
                <div>
                    <span class="${LABEL}">Highlights <span class="font-normal text-slate-400">— shown as tags, and used by visitors to filter</span></span>
                    <div id="chips" class="flex flex-wrap gap-2 mb-3"></div>
                    <input id="tag-input" class="${INPUT}" placeholder="Type a highlight and press Enter" maxlength="40" list="tag-list">
                    <datalist id="tag-list">${known.map((t) => `<option value="${esc(t)}">`).join('')}</datalist>
                    <div id="suggestions" class="flex flex-wrap gap-2 mt-3"></div>
                </div>
                <div>
                    <label class="${LABEL}" for="description">Description</label>
                    <textarea id="description" rows="7" class="${INPUT}" placeholder="Tell buyers what makes this property special. Leave a blank line between paragraphs.">${esc(s.description)}</textarea>
                </div>
            </section>

            <section class="${CARD} space-y-5">
                <h2 class="text-xl font-bold text-primary">4. Visibility</h2>
                ${toggle('published', 'Show on the website', 'Turn off to keep this as a hidden draft.', s.published)}
                ${toggle('featured', 'Feature on the home page', 'Featured properties appear first, and on the home page.', s.featured)}
            </section>

            <div class="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-slate-100 z-40">
                <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
                    <a href="#/properties" class="${BTN_GHOST}">Cancel</a>
                    <div class="flex items-center gap-3">
                        ${id ? `<button type="button" id="delete" class="text-slate-400 hover:text-red-600 font-bold text-sm px-3">Delete</button>` : ''}
                        <button type="submit" id="save" class="${BTN_PRIMARY}"><i class="fa-solid fa-check"></i> ${id ? 'Save changes' : 'Publish property'}</button>
                    </div>
                </div>
            </div>
        </form>`);

        dirty = false;
        const text = (field) => $('#' + field).addEventListener('input', (e) => { s[field] = e.target.value; markDirty(); });
        ['title', 'location', 'size', 'description'].forEach(text);
        $('#form').addEventListener('input', markDirty);

        /* price */
        const renderPrice = () => {
            const n = AV.formatPrice(s.price, s.listing_type);
            $('#price-hint').textContent = s.price ? n : '';
            $('#price-unit').textContent = s.listing_type === 'rent' ? '(per month)' : '';
        };
        $('#price').addEventListener('input', (e) => {
            const digits = e.target.value.replace(/[^\d]/g, '');
            s.price = digits ? Number(digits) : null;
            e.target.value = digits ? Number(digits).toLocaleString('en-US') : '';
            renderPrice();
        });
        if (s.price) $('#price').value = s.price.toLocaleString('en-US');

        /* type switches */
        const renderType = () => {
            const land = s.property_type === 'land';
            $('#beds-wrap').classList.toggle('hidden', land);
            $('#baths-wrap').classList.toggle('hidden', land);
            renderPrice();
        };
        $$('input[name=listing_type]').forEach((r) => r.addEventListener('change', () => { s.listing_type = r.value; renderType(); }));
        $$('input[name=property_type]').forEach((r) => r.addEventListener('change', () => { s.property_type = r.value; renderType(); }));
        $('#beds').addEventListener('input', (e) => { s.beds = e.target.value === '' ? null : Number(e.target.value); });
        $('#baths').addEventListener('input', (e) => { s.baths = e.target.value === '' ? null : Number(e.target.value); });
        $('#published').addEventListener('change', (e) => { s.published = e.target.checked; });
        $('#featured').addEventListener('change', (e) => { s.featured = e.target.checked; });
        renderType();

        /* highlights */
        const lower = (t) => t.toLowerCase();
        const addTag = (raw) => {
            const tag = raw.trim().replace(/\s+/g, ' ');
            if (!tag || s.tags.some((t) => lower(t) === lower(tag))) return;
            s.tags.push(tag);
            markDirty();
            renderTags();
        };
        function renderTags() {
            $('#chips').innerHTML = s.tags.map((t, i) => `
                <span class="inline-flex items-center gap-2 pl-4 pr-2 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-primary font-bold text-sm">
                    ${esc(t)}<button type="button" class="remove-tag w-6 h-6 rounded-full hover:bg-accent/30" data-i="${i}" aria-label="Remove ${esc(t)}"><i class="fa-solid fa-xmark text-xs"></i></button>
                </span>`).join('');
            $('#suggestions').innerHTML = known.filter((t) => !s.tags.some((x) => lower(x) === lower(t))).slice(0, 10).map((t) =>
                `<button type="button" class="suggest px-3 py-1 rounded-full border border-dashed border-slate-300 text-slate-500 text-sm hover:border-accent hover:text-primary" data-tag="${esc(t)}">+ ${esc(t)}</button>`).join('');
            $$('.remove-tag').forEach((b) => b.addEventListener('click', () => { s.tags.splice(Number(b.dataset.i), 1); markDirty(); renderTags(); }));
            $$('.suggest').forEach((b) => b.addEventListener('click', () => addTag(b.dataset.tag)));
        }
        $('#tag-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(e.target.value.replace(/,/g, '')); e.target.value = ''; }
        });
        $('#tag-input').addEventListener('change', (e) => { addTag(e.target.value); e.target.value = ''; });
        renderTags();

        /* photos */
        let dragIndex = null;
        function renderPhotos() {
            $('#photos').innerHTML = `
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                ${s.images.map((url, i) => `
                <div class="photo relative group aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 cursor-grab" draggable="true" data-i="${i}">
                    <img src="${esc(url)}" alt="" class="w-full h-full object-cover pointer-events-none">
                    ${i === 0 ? '<span class="absolute top-2 left-2 bg-accent text-primary text-xs font-bold px-2 py-1 rounded-md shadow">Cover</span>' : ''}
                    <div class="absolute inset-x-0 bottom-0 p-2 flex justify-between bg-gradient-to-t from-black/60 to-transparent opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        ${i !== 0 ? `<button type="button" class="make-cover text-white text-xs font-bold bg-black/40 hover:bg-black/70 rounded-md px-2 py-1" data-i="${i}"><i class="fa-solid fa-star mr-1"></i>Make cover</button>` : '<span></span>'}
                        <button type="button" class="remove-photo text-white bg-black/40 hover:bg-red-600 rounded-md w-7 h-7" data-i="${i}" aria-label="Remove photo"><i class="fa-solid fa-trash text-xs"></i></button>
                    </div>
                </div>`).join('')}
                ${Array.from({ length: uploading }, () => '<div class="aspect-[4/3] rounded-xl skeleton flex items-center justify-center text-slate-400"><i class="fa-solid fa-circle-notch fa-spin"></i></div>').join('')}
                <label id="dropzone" class="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-300 hover:border-accent hover:bg-accent/5 flex flex-col items-center justify-center text-slate-500 cursor-pointer transition-colors text-center p-2">
                    <i class="fa-solid fa-cloud-arrow-up text-2xl mb-2 text-accent"></i>
                    <span class="font-bold text-sm">${s.images.length ? 'Add more photos' : 'Add photos'}</span>
                    <span class="text-xs">click or drop here</span>
                    <input type="file" id="file-input" accept="image/*" multiple class="hidden">
                </label>
            </div>`;

            $$('.remove-photo').forEach((b) => b.addEventListener('click', () => { s.images.splice(Number(b.dataset.i), 1); markDirty(); renderPhotos(); }));
            $$('.make-cover').forEach((b) => b.addEventListener('click', () => { s.images.unshift(...s.images.splice(Number(b.dataset.i), 1)); markDirty(); renderPhotos(); }));
            $$('.photo').forEach((el) => {
                el.addEventListener('dragstart', () => { dragIndex = Number(el.dataset.i); el.classList.add('dragging'); });
                el.addEventListener('dragend', () => { dragIndex = null; el.classList.remove('dragging'); });
                el.addEventListener('dragover', (e) => { if (dragIndex !== null) e.preventDefault(); });
                el.addEventListener('drop', (e) => {
                    if (dragIndex === null) return;
                    e.preventDefault();
                    e.stopPropagation();
                    s.images.splice(Number(el.dataset.i), 0, ...s.images.splice(dragIndex, 1));
                    markDirty();
                    renderPhotos();
                });
            });
            const zone = $('#dropzone');
            zone.addEventListener('dragover', (e) => { if (dragIndex === null) { e.preventDefault(); zone.classList.add('drop-target'); } });
            zone.addEventListener('dragleave', () => zone.classList.remove('drop-target'));
            zone.addEventListener('drop', (e) => { if (dragIndex !== null) return; e.preventDefault(); zone.classList.remove('drop-target'); addFiles(e.dataTransfer.files); });
            $('#file-input').addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });
        }
        async function addFiles(fileList) {
            const files = imageFiles(fileList);
            if (!files.length) return toast('Please choose image files', 'error');
            uploading += files.length;
            renderPhotos();
            await Promise.all(files.map(async (file) => {
                try {
                    s.images.push(await uploadImage(file));
                    markDirty();
                } catch (err) {
                    toast(`${file.name}: ${err.message}`, 'error');
                } finally {
                    uploading--;
                    renderPhotos();
                }
            }));
        }
        renderPhotos();

        /* save / delete */
        $('#form').addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!s.title.trim()) { $('#title').focus(); $('#title').scrollIntoView({ block: 'center' }); return toast('Please give the property a name', 'error'); }
            if (uploading) return toast('Photos are still uploading — one moment', 'error');
            const save = $('#save');
            save.disabled = true;
            try {
                await api(id ? `/api/admin/properties/${id}` : '/api/admin/properties', { method: id ? 'PUT' : 'POST', body: s });
                dirty = false;
                toast(id ? 'Changes saved' : 'Property published');
                location.hash = '#/properties';
            } catch (err) {
                toast(err.message, 'error');
                save.disabled = false;
            }
        });
        const del = $('#delete');
        if (del) del.addEventListener('click', async () => {
            if (!confirm(`Delete "${s.title}"? This cannot be undone.`)) return;
            try { await api(`/api/admin/properties/${id}`, { method: 'DELETE' }); dirty = false; toast('Deleted'); location.hash = '#/properties'; }
            catch (err) { toast(err.message, 'error'); }
        });
    }

    /* ---------- blog post form ---------- */

    async function postForm(id) {
        loading();
        const s = id ? (await api(`/api/admin/posts/${id}`)).post : { title: '', excerpt: '', content: '', cover_image: '', category: 'Market Analysis', published: true };
        let uploading = false;
        let savedRange = null;

        const tools = [
            ['bold', 'fa-bold', 'Bold'], ['italic', 'fa-italic', 'Italic'], ['h2', 'fa-heading', 'Heading'], ['h3', 'fa-font', 'Subheading'],
            ['ul', 'fa-list-ul', 'Bullet list'], ['ol', 'fa-list-ol', 'Numbered list'], ['quote', 'fa-quote-left', 'Quote'],
            ['link', 'fa-link', 'Add link'], ['image', 'fa-image', 'Add photo'],
        ];

        shell('posts', `
        <form id="form" class="max-w-3xl mx-auto space-y-6" novalidate>
            <div class="flex items-center gap-3 mb-2">
                <a href="#/posts" class="text-slate-400 hover:text-primary"><i class="fa-solid fa-arrow-left"></i></a>
                <h1 class="text-3xl font-display font-bold text-primary">${id ? 'Edit post' : 'Write a post'}</h1>
            </div>

            <section class="${CARD}">
                <h2 class="text-xl font-bold text-primary mb-1">Cover photo</h2>
                <p class="text-sm text-slate-500 mb-5">The big picture shown at the top of the post and on the blog page.</p>
                <div id="cover"></div>
            </section>

            <section class="${CARD} space-y-6">
                <div>
                    <label class="${LABEL}" for="title">Title</label>
                    <input id="title" class="${INPUT} !text-xl !font-bold" placeholder="Give your post a title" maxlength="200" value="${esc(s.title)}">
                </div>
                <div>
                    <label class="${LABEL}" for="category">Topic</label>
                    <input id="category" class="${INPUT}" list="categories" maxlength="60" value="${esc(s.category)}">
                    <datalist id="categories"><option value="Market Analysis"><option value="Investment Tips"><option value="Buying Guide"><option value="Property News"><option value="Landlord Advice"></datalist>
                </div>
                <div>
                    <span class="${LABEL}">Your story</span>
                    <div class="border border-slate-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-accent">
                        <div id="toolbar" class="flex flex-wrap gap-1 p-2 bg-slate-50 border-b border-slate-200 rounded-t-xl sticky top-16 z-30">
                            ${tools.map(([cmd, icon, label]) => `<button type="button" data-cmd="${cmd}" title="${label}" aria-label="${label}" class="w-10 h-10 rounded-lg text-slate-600 hover:bg-white hover:text-primary hover:shadow-sm"><i class="fa-solid ${icon}"></i></button>`).join('')}
                            <span id="editor-status" class="ml-auto self-center text-xs text-slate-400 px-2"></span>
                        </div>
                        <div id="editor" class="editor rich-text min-h-[320px] p-5 text-lg leading-relaxed text-slate-700" contenteditable="true" data-placeholder="Start writing…"></div>
                    </div>
                    <input type="file" id="editor-file" accept="image/*" class="hidden">
                </div>
                <div>
                    <label class="${LABEL}" for="excerpt">Short summary <span class="font-normal text-slate-400">— optional, shown on the blog page (we'll write one from your story if you leave it blank)</span></label>
                    <textarea id="excerpt" rows="2" maxlength="300" class="${INPUT}">${esc(s.excerpt)}</textarea>
                </div>
            </section>

            <section class="${CARD}">
                ${toggle('published', 'Show on the website', 'Turn off to keep this as a hidden draft.', s.published)}
            </section>

            <div class="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-slate-100 z-40">
                <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
                    <a href="#/posts" class="${BTN_GHOST}">Cancel</a>
                    <div class="flex items-center gap-3">
                        ${id ? `<button type="button" id="delete" class="text-slate-400 hover:text-red-600 font-bold text-sm px-3">Delete</button>` : ''}
                        <button type="submit" id="save" class="${BTN_PRIMARY}"><i class="fa-solid fa-check"></i> ${id ? 'Save changes' : 'Publish post'}</button>
                    </div>
                </div>
            </div>
        </form>`);

        const editor = $('#editor');
        editor.innerHTML = AV.sanitizeHtml(s.content);
        dirty = false;
        $('#form').addEventListener('input', markDirty);
        ['title', 'category', 'excerpt'].forEach((f) => $('#' + f).addEventListener('input', (e) => { s[f] = e.target.value; }));
        $('#published').addEventListener('change', (e) => { s.published = e.target.checked; });

        /* cover */
        function renderCover() {
            $('#cover').innerHTML = s.cover_image
                ? `<div class="relative rounded-xl overflow-hidden aspect-[16/7] bg-slate-100">
                        <img src="${esc(s.cover_image)}" alt="" class="w-full h-full object-cover">
                        <div class="absolute top-3 right-3 flex gap-2">
                            <label class="cursor-pointer bg-white/90 hover:bg-white text-primary text-sm font-bold px-3 py-2 rounded-lg shadow">Change<input type="file" accept="image/*" class="hidden cover-input"></label>
                            <button type="button" id="cover-remove" class="bg-white/90 hover:bg-red-600 hover:text-white text-slate-600 text-sm font-bold px-3 py-2 rounded-lg shadow">Remove</button>
                        </div>
                   </div>`
                : `<label id="cover-drop" class="aspect-[16/7] rounded-xl border-2 border-dashed border-slate-300 hover:border-accent hover:bg-accent/5 flex flex-col items-center justify-center text-slate-500 cursor-pointer transition-colors">
                        ${uploading ? '<i class="fa-solid fa-circle-notch fa-spin text-2xl text-accent"></i>' : '<i class="fa-solid fa-cloud-arrow-up text-3xl mb-2 text-accent"></i><span class="font-bold">Add a cover photo</span><span class="text-sm">click or drop here</span>'}
                        <input type="file" accept="image/*" class="hidden cover-input">
                   </label>`;
            $$('.cover-input').forEach((i) => i.addEventListener('change', (e) => setCover(e.target.files[0])));
            const remove = $('#cover-remove');
            if (remove) remove.addEventListener('click', () => { s.cover_image = ''; markDirty(); renderCover(); });
            const drop = $('#cover-drop');
            if (drop) {
                drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('drop-target'); });
                drop.addEventListener('dragleave', () => drop.classList.remove('drop-target'));
                drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('drop-target'); setCover(imageFiles(e.dataTransfer.files)[0]); });
            }
        }
        async function setCover(file) {
            if (!file) return;
            uploading = true; renderCover();
            try { s.cover_image = await uploadImage(file); markDirty(); }
            catch (err) { toast(err.message, 'error'); }
            uploading = false; renderCover();
        }
        renderCover();

        /* editor */
        const saveRange = () => {
            const sel = getSelection();
            if (sel.rangeCount && editor.contains(sel.anchorNode)) savedRange = sel.getRangeAt(0).cloneRange();
        };
        const restoreRange = () => {
            editor.focus();
            if (savedRange) { const sel = getSelection(); sel.removeAllRanges(); sel.addRange(savedRange); }
        };
        document.addEventListener('selectionchange', saveRange);

        const insertImage = async (file) => {
            const status = $('#editor-status');
            status.textContent = 'Uploading photo…';
            try {
                const url = await uploadImage(file);
                restoreRange();
                document.execCommand('insertHTML', false, `<p><img src="${esc(url)}" alt=""></p><p><br></p>`);
                markDirty();
            } catch (err) { toast(err.message, 'error'); }
            status.textContent = '';
        };

        const block = (tag) => {
            const current = (document.queryCommandValue('formatBlock') || '').toLowerCase();
            document.execCommand('formatBlock', false, current === tag ? 'p' : tag);
        };
        const actions = {
            bold: () => document.execCommand('bold'),
            italic: () => document.execCommand('italic'),
            h2: () => block('h2'),
            h3: () => block('h3'),
            quote: () => block('blockquote'),
            ul: () => document.execCommand('insertUnorderedList'),
            ol: () => document.execCommand('insertOrderedList'),
            link: () => {
                const url = prompt('Link address (e.g. https://example.com):');
                if (!url) return;
                const href = /^(https?:|mailto:|tel:|\/)/i.test(url.trim()) ? url.trim() : 'https://' + url.trim();
                if (getSelection().isCollapsed) document.execCommand('insertHTML', false, `<a href="${esc(href)}">${esc(url.trim())}</a>`);
                else document.execCommand('createLink', false, href);
            },
            image: () => { saveRange(); $('#editor-file').click(); },
        };
        $$('#toolbar button').forEach((btn) => {
            btn.addEventListener('mousedown', (e) => e.preventDefault()); // keep the caret in the editor
            btn.addEventListener('click', () => {
                if (btn.dataset.cmd !== 'image') restoreRange();
                actions[btn.dataset.cmd]();
                markDirty();
            });
        });
        $('#editor-file').addEventListener('change', (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) insertImage(f); });

        editor.addEventListener('paste', (e) => {
            const files = imageFiles(e.clipboardData.files);
            e.preventDefault();
            if (files.length) return files.forEach(insertImage);
            const html = e.clipboardData.getData('text/html');
            if (html) document.execCommand('insertHTML', false, AV.sanitizeHtml(html));
            else document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
        });
        editor.addEventListener('drop', (e) => {
            const files = imageFiles(e.dataTransfer.files);
            if (!files.length) return;
            e.preventDefault();
            files.forEach(insertImage);
        });
        // Make the first line a paragraph so typing never produces bare text nodes.
        editor.addEventListener('focus', () => { if (!editor.innerHTML.trim()) document.execCommand('formatBlock', false, 'p'); });

        /* save / delete */
        $('#form').addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!s.title.trim()) { $('#title').focus(); return toast('Please give the post a title', 'error'); }
            if (uploading) return toast('Cover photo is still uploading — one moment', 'error');
            s.content = AV.sanitizeHtml(editor.innerHTML);
            const save = $('#save');
            save.disabled = true;
            try {
                await api(id ? `/api/admin/posts/${id}` : '/api/admin/posts', { method: id ? 'PUT' : 'POST', body: s });
                dirty = false;
                document.removeEventListener('selectionchange', saveRange);
                toast(id ? 'Changes saved' : 'Post published');
                location.hash = '#/posts';
            } catch (err) {
                toast(err.message, 'error');
                save.disabled = false;
            }
        });
        const del = $('#delete');
        if (del) del.addEventListener('click', async () => {
            if (!confirm(`Delete "${s.title}"? This cannot be undone.`)) return;
            try { await api(`/api/admin/posts/${id}`, { method: 'DELETE' }); dirty = false; toast('Deleted'); location.hash = '#/posts'; }
            catch (err) { toast(err.message, 'error'); }
        });
    }

    /* ---------- router ---------- */

    async function route() {
        const [section, arg] = (location.hash.replace(/^#\/?/, '') || 'properties').split('/');
        try {
            const { authenticated } = await api('/api/admin/me');
            if (!authenticated) return loginView();
            if (section === 'posts') return arg ? await postForm(arg === 'new' ? null : arg) : await postsList();
            if (section === 'properties' || !section) return arg ? await propertyForm(arg === 'new' ? null : arg) : await propertiesList();
            location.hash = '#/properties';
        } catch (err) {
            if (err.status === 401) return loginView();
            shell('', `<div class="${CARD} text-center"><p class="text-red-600 font-bold mb-4">${esc(err.message)}</p><a href="#/properties" class="${BTN_PRIMARY}">Back to dashboard</a></div>`);
        }
    }

    let lastHash = location.hash;
    window.addEventListener('hashchange', () => {
        if (dirty && !confirm('You have unsaved changes. Leave without saving?')) {
            history.replaceState(null, '', lastHash || '#/properties');
            return;
        }
        dirty = false;
        lastHash = location.hash;
        route();
    });
    window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

    route();
})();
