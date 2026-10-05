(async function () {
    const { esc, formatDate, FALLBACK_IMAGE } = AV;
    const list = document.getElementById('blog-list');

    list.innerHTML = Array.from({ length: 6 }, () => `
    <article class="bg-white rounded-3xl overflow-hidden border border-slate-100">
        <div class="h-64 skeleton"></div>
        <div class="p-8">
            <div class="h-4 w-1/3 skeleton rounded mb-4"></div>
            <div class="h-8 w-full skeleton rounded-lg mb-4"></div>
            <div class="h-20 w-full skeleton rounded-lg mb-6"></div>
            <div class="h-6 w-1/4 skeleton rounded"></div>
        </div>
    </article>`).join('');

    const card = (post) => `
    <article class="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-300">
        <a href="/blog/${esc(post.slug)}" class="block relative h-64 overflow-hidden">
            <img src="${esc(post.cover_image || FALLBACK_IMAGE)}" alt="${esc(post.title)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold text-primary uppercase">${esc(post.category)}</div>
        </a>
        <div class="p-8">
            <div class="flex items-center text-slate-400 text-xs mb-4">
                <i class="fa-solid fa-calendar-days mr-2"></i> ${esc(formatDate(post.published_at))}
                <span class="mx-3">•</span>
                <i class="fa-solid fa-clock mr-2"></i> ${esc(post.read_minutes)} min read
            </div>
            <h3 class="text-2xl font-bold text-primary mb-4 leading-tight group-hover:text-accent transition-colors">${esc(post.title)}</h3>
            <p class="text-slate-500 text-sm leading-relaxed mb-6">${esc(post.excerpt)}</p>
            <a href="/blog/${esc(post.slug)}" class="inline-flex items-center font-bold text-primary group-hover:text-accent transition-colors">
                Read More <i class="fa-solid fa-arrow-right ml-2 text-xs group-hover:translate-x-1 transition-transform"></i>
            </a>
        </div>
    </article>`;

    try {
        const { posts } = await AV.api('/api/posts');
        list.innerHTML = posts.length
            ? posts.map(card).join('')
            : '<p class="col-span-full text-center text-slate-500 py-20">No posts yet — check back soon.</p>';
    } catch (e) {
        list.innerHTML = `
        <div class="col-span-full text-center py-20">
            <div class="text-6xl text-slate-200 mb-6"><i class="fa-solid fa-circle-exclamation"></i></div>
            <h3 class="text-2xl font-bold text-primary mb-2">Service Unavailable</h3>
            <p class="text-slate-500">We could not load our blog posts right now, please come back later.</p>
        </div>`;
    }
})();
