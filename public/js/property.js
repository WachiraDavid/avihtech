(async function () {
    const { esc, $, formatPrice, FALLBACK_IMAGE } = AV;
    const slug = decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() || '');

    if (!slug || slug === 'property') { location.replace('/properties'); return; }

    function render(p) {
        document.title = `${p.title} | AVIHTECH AGENCIES`;
        $('#property-title').textContent = p.title;
        $('#property-title').className = 'text-4xl md:text-5xl font-display font-bold mt-2';
        $('#property-location span').textContent = p.location || 'Kenya';
        $('#property-price').textContent = formatPrice(p.price, p.listing_type);
        $('#property-status').textContent = AV.statusLabel(p);

        const features = [
            p.beds && { icon: 'fa-bed', text: `${p.beds} Beds` },
            p.baths && { icon: 'fa-bath', text: `${p.baths} Baths` },
            p.size && { icon: 'fa-ruler-combined', text: p.size },
            { icon: 'fa-building', text: p.property_type.charAt(0).toUpperCase() + p.property_type.slice(1) },
        ].filter(Boolean);
        const chips = features.map((f) => `
            <div class="flex items-center space-x-2 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-full shadow-sm">
                <i class="fa-solid ${f.icon} text-accent text-sm"></i><span class="text-primary font-bold text-sm">${esc(f.text)}</span>
            </div>`).join('');
        const tagChips = p.tags.map((t) => `
            <div class="flex items-center space-x-2 px-5 py-2.5 bg-accent/5 border border-accent/20 rounded-full">
                <i class="fa-solid fa-check-double text-accent text-xs"></i><span class="text-primary font-bold text-sm capitalize">${esc(t)}</span>
            </div>`).join('');
        $('#property-tags').innerHTML = chips + tagChips;
        $('#property-tags').classList.remove('opacity-0');

        const images = p.images.length ? p.images : [FALLBACK_IMAGE];
        const main = $('#property-image');
        main.src = images[0];
        main.alt = p.title;
        main.classList.add('cursor-zoom-in');
        main.addEventListener('click', () => AV.openLightbox(images.map((src) => ({ src, alt: p.title })), 0));
        $('#property-image-container').classList.remove('opacity-0');

        if (images.length > 1) renderGallery(images, p.title);

        const paragraphs = (p.description || '').split(/\n{2,}/).map((t) => t.trim()).filter(Boolean);
        $('#property-description').innerHTML = paragraphs.length
            ? paragraphs.map((t) => `<p class="mb-4 whitespace-pre-line">${esc(t)}</p>`).join('')
            : '<p class="text-slate-400">Contact us for more details about this property.</p>';
    }

    function renderGallery(images, title) {
        const gallery = $('#property-gallery');
        gallery.classList.remove('hidden');
        gallery.innerHTML = `
        <div class="swiper property-gallery-swiper rounded-3xl overflow-hidden relative">
            <div class="swiper-wrapper">
                ${images.map((src, i) => `
                <div class="swiper-slide cursor-zoom-in group overflow-hidden bg-slate-100 rounded-2xl" data-index="${i}">
                    <img src="${esc(src)}" alt="${esc(title)}" loading="lazy" class="w-full h-40 object-cover transition-transform duration-700 group-hover:scale-110">
                </div>`).join('')}
            </div>
            <div class="swiper-pagination !-bottom-6"></div>
        </div>`;
        const lightboxImages = images.map((src) => ({ src, alt: title }));
        gallery.querySelectorAll('.swiper-slide').forEach((el) =>
            el.addEventListener('click', () => AV.openLightbox(lightboxImages, Number(el.dataset.index))));
        new Swiper('.property-gallery-swiper', {
            slidesPerView: 2, spaceBetween: 12, grabCursor: true,
            pagination: { el: '.property-gallery-swiper .swiper-pagination', clickable: true },
            breakpoints: { 640: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } },
        });
    }

    try {
        const { property } = await AV.api('/api/properties/' + encodeURIComponent(slug));
        render(property);
    } catch (e) {
        $('#property-description').innerHTML = `
        <div class="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div class="text-5xl text-slate-200 mb-6"><i class="fa-solid fa-house-circle-exclamation"></i></div>
            <h3 class="text-2xl font-bold text-primary mb-4">Property Unavailable</h3>
            <p class="text-slate-500 mb-8">We could not find this property. It may have been removed or is no longer listed.</p>
            <a href="/properties" class="inline-block bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-slate-800 transition-colors">Back to Listings</a>
        </div>`;
        $('#property-title').textContent = 'Property not found';
        $('#property-title').className = 'text-4xl md:text-5xl font-display font-bold mt-2';
        $('#property-status').textContent = '';
        $('#property-price').textContent = '';
    }

    $('#whatsapp-inquiry-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = AV.stripTags($('#inquiry-name').value);
        const email = AV.stripTags($('#inquiry-email').value);
        const message = AV.stripTags($('#inquiry-message').value);
        const text =
            `*New Property Inquiry*\n\n*Property:* ${$('#property-title').textContent}\n*Link:* ${location.href}\n\n` +
            `*Client Name:* ${name}\n*Client Email:* ${email}\n*Message:* ${message}`;
        window.open(`https://wa.me/${AV.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
    });
})();
