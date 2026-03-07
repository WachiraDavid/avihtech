<?php include('header.php'); ?>

<?php
$post_id = isset($_GET['id']) ? $_GET['id'] : null;
?>

<!-- Page Header -->
<section class="pt-44 pb-20 bg-primary text-white relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="text-accent font-bold tracking-widest uppercase text-sm">Blog Post</span>
        <h1 id="post-title" class="text-4xl md:text-5xl font-display font-bold mt-4 line-pulse h-12 w-3/4 mx-auto bg-slate-700/50 rounded-lg animate-pulse"></h1>
        <div id="post-meta" class="flex justify-center items-center text-slate-300 mt-6 space-x-4 opacity-0 transition-opacity duration-500">
            <span id="post-date"></span>
            <span>•</span>
            <span id="post-author">AVIHTECH Admin</span>
        </div>
    </div>
</section>

<!-- Main Content -->
<section class="py-24 bg-white min-h-[600px]">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Featured Image -->
        <div id="featured-image-container" class="rounded-3xl overflow-hidden mb-12 shadow-2xl opacity-0 transition-opacity duration-500">
            <img id="featured-image" src="" alt="" class="w-full h-auto object-cover max-h-[500px]">
        </div>

        <!-- Content Area -->
        <div id="post-content" class="prose prose-lg max-w-none text-slate-600 leading-relaxed space-y-6">
            <!-- Shimmer effect for content -->
            <div class="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
            <div class="h-4 bg-slate-100 rounded w-5/6 animate-pulse"></div>
            <div class="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
            <div class="h-4 bg-slate-100 rounded w-4/6 animate-pulse"></div>
            <div class="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
        </div>

        <!-- Navigation -->
        <div class="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center">
            <a href="blog.php" class="inline-flex items-center font-bold text-primary hover:text-accent transition-colors">
                <i class="fa-solid fa-arrow-left mr-2 text-xs"></i> Back to Blog
            </a>
            <div class="flex space-x-4">
                <span class="text-slate-400 font-bold">Share:</span>
                <a href="#" class="text-primary hover:text-accent transition-colors"><i class="fa-brands fa-facebook-f"></i></a>
                <a href="#" class="text-primary hover:text-accent transition-colors"><i class="fa-brands fa-twitter"></i></a>
                <a href="#" class="text-primary hover:text-accent transition-colors"><i class="fa-brands fa-linkedin-in"></i></a>
            </div>
        </div>
    </div>
</section>

<script>
    $(document).ready(function() {
        const postId = '<?php echo $post_id; ?>';
        const WP_API_URL = '<?php echo WP_API_URL; ?>/posts/' + postId + '?_embed';
        const WP_API_KEY = '<?php echo WP_API_KEY; ?>';

        if (!postId) {
            window.location.href = 'blog.php';
            return;
        }

        function renderPost(post) {
            // Update Title
            $('#post-title').text(post.title.rendered).removeClass('line-pulse bg-slate-700/50 animate-pulse h-12 w-3/4 mx-auto');

            // Update Meta
            const date = new Date(post.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            $('#post-date').text(date);
            $('#post-meta').removeClass('opacity-0');

            // Update Image
            const img = (post._embedded && post._embedded['wp:featuredmedia']) ? post._embedded['wp:featuredmedia'][0].source_url : 'assets/img/hero.png';
            $('#featured-image').attr('src', img).attr('alt', post.title.rendered);
            $('#featured-image-container').removeClass('opacity-0');

            // Update Content
            $('#post-content').html(post.content.rendered);

            // Transform Galleries to Carousels
            setTimeout(initializeCarousels, 100);
        }

        function initializeCarousels() {
            // Target both modern block galleries and traditional WordPress galleries
            $('.wp-block-gallery, div.gallery').each(function(index) {
                const $gallery = $(this);
                // Handle both <figure> (blocks) and .gallery-item (traditional)
                const $items = $gallery.find('figure, .gallery-item');

                if ($items.length <= 1) return;

                const carouselId = 'gallery-carousel-' + index;
                let swiperHtml = `
                    <div class="swiper ${carouselId} rounded-3xl overflow-hidden shadow-xl mb-12">
                        <div class="swiper-wrapper">
                `;

                const galleryImages = [];
                $items.each(function(itemIndex) {
                    const $item = $(this);
                    const $img = $item.find('img');
                    let imgSrc = $img.attr('src');
                    if (imgSrc) {
                        // Remove WordPress thumbnail dimensions (e.g., -150x150) to get original image
                        imgSrc = imgSrc.replace(/-\d+x\d+(\.(jpg|jpeg|png|webp|gif))$/i, '$1');
                    }
                    const imgAlt = $img.attr('alt') || '';
                    // Handle figcaption (blocks) or dd.wp-caption-text (traditional)
                    const caption = $item.find('figcaption, .wp-caption-text').text();

                    if (!imgSrc) return;

                    galleryImages.push({
                        src: imgSrc,
                        alt: imgAlt,
                        caption: caption
                    });

                    swiperHtml += `
                        <div class="swiper-slide relative cursor-zoom-in group overflow-hidden bg-slate-100 rounded-2xl" onclick="openLightbox(window['gallery_${index}'], ${itemIndex})">
                            <img src="${imgSrc}" alt="${imgAlt}" class="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110">
                            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                <i class="fa-solid fa-expand text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300"></i>
                            </div>
                            ${caption ? `<div class="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white text-[10px] italic font-medium rounded-b-2xl pointer-events-none">${caption}</div>` : ''}
                        </div>
                    `;
                });

                // Store images globally for the lightbox to access
                window['gallery_' + index] = galleryImages;

                swiperHtml += `
                        </div>
                        <div class="swiper-pagination !-bottom-6"></div>
                        <div class="swiper-button-prev !-left-4 !scale-75"></div>
                        <div class="swiper-button-next !-right-4 !scale-75"></div>
                    </div>
                `;

                $gallery.replaceWith(swiperHtml);

                new Swiper('.' + carouselId, {
                    slidesPerView: 1,
                    spaceBetween: 20,
                    loop: true,
                    grabCursor: true,
                    autoplay: {
                        delay: 4000,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev'
                    },
                    breakpoints: {
                        640: {
                            slidesPerView: 2
                        },
                        1024: {
                            slidesPerView: 3
                        }
                    }
                });
            });
        }

        function fetchPost() {
            $.ajax({
                url: WP_API_URL,
                method: 'GET',
                beforeSend: function(xhr) {
                    if (WP_API_KEY) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + WP_API_KEY);
                    }
                },
                success: function(data) {
                    renderPost(data);
                },
                error: function() {
                    // Fallback or error handling
                    $('#post-content').html('<p class="text-center text-red-500 font-bold py-20">Post not found or API error.</p>');
                    $('#post-title').text('Error Loading Content').removeClass('line-pulse animate-pulse');
                }
            });
        }

        fetchPost();
    });
</script>

<?php include('footer.php'); ?>