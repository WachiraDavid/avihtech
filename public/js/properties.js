(function () {
    const { esc, formatPrice, statusLabel, FALLBACK_IMAGE, $ } = AV;
    const list = $('#property-list');
    const noResults = $('#no-results');
    const search = $('#property-search');
    const typeSelect = $('#property-type');
    const tagSelect = $('#property-status');

    const skeletons = () => {
        noResults.classList.add('hidden');
        list.innerHTML = Array.from({ length: 6 }, () => `
        <div class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
            <div class="h-64 skeleton"></div>
            <div class="p-8">
                <div class="h-6 w-3/4 skeleton rounded-lg mb-4"></div>
                <div class="h-4 w-1/2 skeleton rounded-lg mb-6"></div>
                <div class="flex gap-2 mb-6"><div class="h-6 w-16 skeleton rounded-md"></div><div class="h-6 w-16 skeleton rounded-md"></div></div>
                <div class="h-12 w-full skeleton rounded-xl mb-4"></div>
            </div>
        </div>`).join('');
    };

    const card = (p) => {
        const statusClass = p.listing_type === 'sale' ? 'bg-primary' : 'bg-accent text-primary';
        const tags = p.tags.map((t) => `<span class="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] uppercase tracking-wider font-bold text-slate-600">${esc(t)}</span>`).join('');
        const beds = p.beds ? `<span class="flex items-center"><i class="fa-solid fa-bed mr-2 text-accent"></i> ${esc(p.beds)}</span>` : '';
        const baths = p.baths ? `<span class="flex items-center"><i class="fa-solid fa-bath mr-2 text-accent"></i> ${esc(p.baths)}</span>` : '';
        return `
        <div class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div class="relative h-64 overflow-hidden">
                <img src="${esc(p.cover || FALLBACK_IMAGE)}" alt="${esc(p.title)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                <div class="absolute top-4 left-4 ${statusClass} text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">${statusLabel(p)}</div>
            </div>
            <div class="p-8">
                <h3 class="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">${esc(p.title)}</h3>
                <p class="text-slate-500 text-sm flex items-center mb-4"><i class="fa-solid fa-location-dot mr-2 text-accent"></i> ${esc(p.location || 'Kenya')}</p>
                <div class="flex flex-wrap gap-2 mb-6">${tags}</div>
                <div class="flex items-center space-x-6 text-sm text-slate-600 mb-8 border-y border-slate-50 py-4">
                    ${beds}${baths}
                    <span class="font-bold text-primary ml-auto">${esc(formatPrice(p.price, p.listing_type))}</span>
                </div>
                <a href="/properties/${esc(p.slug)}" class="block text-center py-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all">View Details</a>
            </div>
        </div>`;
    };

    let requestId = 0;
    async function load() {
        const mine = ++requestId;
        skeletons();
        const params = new URLSearchParams();
        if (search.value.trim()) params.set('q', search.value.trim());
        if (typeSelect.value) params.set('type', typeSelect.value);
        if (tagSelect.value) params.set('tag', tagSelect.value);
        try {
            const { properties } = await AV.api('/api/properties?' + params);
            if (mine !== requestId) return;
            list.innerHTML = properties.map(card).join('');
            noResults.classList.toggle('hidden', properties.length > 0);
        } catch (e) {
            if (mine !== requestId) return;
            list.innerHTML = `
            <div class="col-span-full text-center py-20">
                <div class="text-6xl text-slate-200 mb-6"><i class="fa-solid fa-circle-exclamation"></i></div>
                <h3 class="text-2xl font-bold text-primary mb-2">Service Unavailable</h3>
                <p class="text-slate-500">We could not load our properties right now, please come back later.</p>
            </div>`;
        }
    }

    async function loadTags() {
        try {
            const { tags } = await AV.api('/api/tags');
            tagSelect.innerHTML = '<option value="">All Features</option>' + tags.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join('');
        } catch (e) { /* filter just stays empty */ }
    }

    $('#filter-form').addEventListener('submit', (e) => { e.preventDefault(); load(); });
    typeSelect.addEventListener('change', load);
    tagSelect.addEventListener('change', load);
    let timer;
    search.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(load, 400); });

    loadTags();
    load();
})();
