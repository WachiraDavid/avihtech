<?php include('header.php'); ?>

<!-- Page Header -->
<section class="pt-32 pb-20 bg-primary text-white relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="text-accent font-bold tracking-widest uppercase text-sm">Insights</span>
        <h1 class="text-4xl md:text-6xl font-display font-bold mt-4">Industry Blog & News</h1>
        <p class="text-slate-300 mt-6 max-w-2xl mx-auto">
            Stay updated with the latest trends, investment advice, and market analysis from our experts.
        </p>
    </div>
</section>

<!-- Blog Section -->
<section class="py-24 bg-white min-h-[600px]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div id="blog-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <!-- Skeletons will be injected here -->
        </div>

        <!-- Pagination (Placeholder) -->
        <div class="mt-20 flex justify-center space-x-4">
            <button class="px-6 py-3 rounded-xl border border-slate-200 text-slate-400 font-bold cursor-not-allowed">Previous</button>
            <button class="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-slate-800 transition-colors shadow-lg">Next Page</button>
        </div>
    </div>
</section>

<script>
    $(document).ready(function() {
        // WORDPRESS REST API CONFIGURATION
        const WP_API_URL = '<?php echo WP_API_URL; ?>/posts?categories=4&_embed';
        const WP_API_KEY = '<?php echo WP_API_KEY; ?>';

        function showSkeletonPosts() {
            $('#blog-list').empty();
            for (let i = 0; i < 6; i++) {
                const skeleton = `
                    <article class="bg-white rounded-3xl overflow-hidden border border-slate-100 animate-pulse">
                        <div class="h-64 skeleton"></div>
                        <div class="p-8">
                            <div class="h-4 w-1/3 skeleton rounded mb-4"></div>
                            <div class="h-8 w-full skeleton rounded-lg mb-4"></div>
                            <div class="h-20 w-full skeleton rounded-lg mb-6"></div>
                            <div class="h-6 w-1/4 skeleton rounded"></div>
                        </div>
                    </article>
                `;
                $('#blog-list').append(skeleton);
            }
        }

        function renderPosts(posts) {
            $('#blog-list').empty();

            posts.forEach(post => {
                const title = post.title.rendered;
                const excerpt = post.excerpt.rendered.substring(0, 120) + '...';
                const date = new Date(post.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
                const img = (post._embedded && post._embedded['wp:featuredmedia']) ? post._embedded['wp:featuredmedia'][0].source_url : 'assets/img/hero.png';

                const card = `
                <article class="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-300">
                    <div class="relative h-64 overflow-hidden">
                        <img src="${img}" alt="${title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold text-primary">
                            MARKET ANALYSIS
                        </div>
                    </div>
                    <div class="p-8">
                        <div class="flex items-center text-slate-400 text-xs mb-4">
                            <i class="fa-solid fa-calendar-days mr-2"></i> ${date}
                            <span class="mx-3">•</span>
                            <i class="fa-solid fa-clock mr-2"></i> 5 min read
                        </div>
                        <h3 class="text-2xl font-bold text-primary mb-4 leading-tight group-hover:text-accent transition-colors underline decoration-transparent group-hover:decoration-accent decoration-2 underline-offset-4">
                            ${title}
                        </h3>
                        <div class="text-slate-500 text-sm leading-relaxed mb-6">
                            ${excerpt}
                        </div>
                        <a href="single-blog.php?id=${post.id}" class="inline-flex items-center font-bold text-primary group-hover:text-accent transition-colors">
                            Read More <i class="fa-solid fa-arrow-right ml-2 text-xs group-hover:translate-x-1 transition-transform"></i>
                        </a>
                    </div>
                </article>
            `;
                $('#blog-list').append(card);
            });
        }

        function fetchPosts() {
            showSkeletonPosts();

            $.ajax({
                url: WP_API_URL,
                method: 'GET',
                beforeSend: function(xhr) {
                    if (WP_API_KEY) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + WP_API_KEY);
                    }
                },
                success: function(data) {
                    renderPosts(data);
                },
                error: function() {
                    $('#blog-list').empty().html(`
                        <div class="col-span-full text-center py-20">
                            <div class="text-6xl text-slate-200 mb-6"><i class="fa-solid fa-circle-exclamation"></i></div>
                            <h3 class="text-2xl font-bold text-primary mb-2">Service Unavailable</h3>
                            <p class="text-slate-500">We could not load our blog posts right now, please come back later. Feel free to explore other parts of the site.</p>
                        </div>
                    `);
                }
            });
        }

        fetchPosts();
    });
</script>

<?php include('footer.php'); ?>