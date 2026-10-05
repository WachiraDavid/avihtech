(async function () {
    const { $, formatDate, FALLBACK_IMAGE } = AV;
    const slug = decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() || '');

    if (!slug || slug === 'post') { location.replace('/blog'); return; }

    try {
        const { post } = await AV.api('/api/posts/' + encodeURIComponent(slug));
        document.title = `${post.title} | AVIHTECH AGENCIES`;
        const title = $('#post-title');
        title.textContent = post.title;
        title.className = 'text-4xl md:text-5xl font-display font-bold mt-4';
        $('#post-date').textContent = formatDate(post.published_at);
        $('#post-meta').classList.remove('opacity-0');

        const img = $('#featured-image');
        if (post.cover_image) {
            img.src = post.cover_image;
            img.alt = post.title;
            $('#featured-image-container').classList.remove('opacity-0');
        } else {
            $('#featured-image-container').remove();
        }

        const content = $('#post-content');
        content.className = 'rich-text text-lg text-slate-600 leading-relaxed';
        content.innerHTML = AV.sanitizeHtml(post.content);

        // Photos inside a post open in the lightbox.
        const photos = [...content.querySelectorAll('img')];
        photos.forEach((el, i) => {
            el.classList.add('cursor-zoom-in');
            el.addEventListener('click', () => AV.openLightbox(photos.map((p) => ({ src: p.src, alt: p.alt })), i));
        });
    } catch (e) {
        $('#post-content').innerHTML = `
        <div class="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div class="text-5xl text-slate-200 mb-6"><i class="fa-solid fa-file-circle-exclamation"></i></div>
            <h3 class="text-2xl font-bold text-primary mb-4">Post Unavailable</h3>
            <p class="text-slate-500 mb-8">We could not find this post. Please check our other insights.</p>
            <a href="/blog" class="inline-block bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-slate-800 transition-colors">Back to Blog</a>
        </div>`;
        $('#post-title').textContent = 'Post not found';
        $('#post-title').className = 'text-4xl md:text-5xl font-display font-bold mt-4';
    }
})();
