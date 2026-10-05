(async function () {
    const { esc, formatPrice, statusLabel, FALLBACK_IMAGE } = AV;
    const container = document.getElementById('featured-properties-list');

    const card = (p) => {
        const status = statusLabel(p);
        const statusClass = p.listing_type === 'sale' ? 'bg-primary' : 'bg-accent text-primary';
        const tags = p.tags.map((t) => `<span class="px-2 py-0.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-md text-[10px] uppercase tracking-wider font-bold">${esc(t)}</span>`).join('');
        const beds = p.beds ? `<span class="flex items-center text-sm"><i class="fa-solid fa-bed mr-2 text-accent"></i> ${esc(p.beds)} Beds</span>` : '';
        const baths = p.baths ? `<span class="flex items-center text-sm"><i class="fa-solid fa-bath mr-2 text-accent"></i> ${esc(p.baths)} Baths</span>` : '';
        return `
        <a href="/properties/${esc(p.slug)}" class="group block">
            <div class="relative h-[400px] overflow-hidden rounded-3xl transition-transform duration-500 hover:shadow-2xl">
                <img src="${esc(p.cover || FALLBACK_IMAGE)}" alt="${esc(p.title)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                <div class="absolute top-4 left-4"><div class="${statusClass} text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">${status}</div></div>
                <div class="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-primary/95 to-transparent text-white">
                    <h3 class="text-2xl font-bold mb-2 group-hover:text-accent transition-colors">${esc(p.title)}</h3>
                    <p class="text-white/80 text-sm flex items-center mb-3"><i class="fa-solid fa-location-dot mr-2 text-accent"></i> ${esc(p.location || 'Kenya')}</p>
                    <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
                        ${tags}${beds}${baths}
                        <span class="flex items-baseline text-sm font-bold text-accent ml-auto">${esc(formatPrice(p.price, p.listing_type))}</span>
                    </div>
                </div>
            </div>
        </a>`;
    };

    try {
        const { properties } = await AV.api('/api/properties?featured=1&limit=2');
        container.innerHTML = properties.length
            ? properties.map(card).join('')
            : '<p class="text-slate-500 text-center col-span-full py-12">No featured properties available at the moment.</p>';
    } catch (e) {
        container.innerHTML = `
        <div class="col-span-full text-center py-12 bg-white/5 rounded-3xl border border-white/10">
            <div class="text-4xl text-white/20 mb-4"><i class="fa-solid fa-circle-exclamation"></i></div>
            <p class="text-white/60">Featured properties are currently unavailable. Please check back later.</p>
        </div>`;
    }
})();
