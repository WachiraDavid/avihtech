<?php include('header.php'); ?>

<?php
$post_id = isset($_GET['id']) ? $_GET['id'] : null;
?>

<!-- Page Header / Property Banner -->
<section class="pt-44 pb-20 bg-slate-100 text-primary relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div class="flex-1">
                <span id="property-status" class="inline-block bg-accent text-primary text-xs font-bold px-3 py-1.5 rounded-lg mb-4 shadow-sm uppercase">Loading...</span>
                <h1 id="property-title" class="text-4xl md:text-5xl font-display font-bold mt-2 animate-pulse bg-slate-200 h-12 w-3/4 rounded-lg"></h1>
                <p id="property-location" class="text-slate-500 mt-4 flex items-center text-lg">
                    <i class="fa-solid fa-location-dot mr-2 text-accent"></i> <span>Identifying location...</span>
                </p>
            </div>
            <div class="text-left md:text-right">
                <p class="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Price Guide</p>
                <h2 id="property-price" class="text-3xl md:text-4xl font-bold text-primary">---</h2>
            </div>
        </div>
    </div>
</section>

<!-- Property Details Section -->
<section class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-16">

            <!-- Left Column: Image and Description -->
            <div class="lg:col-span-2 space-y-12">
                <!-- Main Image -->
                <div id="property-image-container" class="rounded-3xl overflow-hidden shadow-2xl opacity-0 transition-opacity duration-500">
                    <img id="property-image" src="" alt="" class="w-full h-auto object-cover max-h-[600px]">
                </div>

                <!-- Features Grid -->
                <!-- Property Tags / Features -->
                <div id="property-tags" class="flex flex-wrap gap-3 py-8 border-y border-slate-100 opacity-0 transition-opacity duration-500">
                    <!-- Dynamic tags will be injected here via JavaScript -->
                </div>

                <!-- Description -->
                <div>
                    <h3 class="text-2xl font-bold text-primary mb-6">Property Description</h3>
                    <div id="property-description" class="prose prose-lg max-w-none text-slate-600 leading-relaxed">
                        <!-- Shimmer -->
                        <div class="space-y-4">
                            <div class="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
                            <div class="h-4 bg-slate-100 rounded w-5/6 animate-pulse"></div>
                            <div class="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Sidebar / Contact Form -->
            <div class="lg:col-span-1">
                <div class="sticky top-32 space-y-8">
                    <!-- Contact Box -->
                    <div class="bg-primary p-8 rounded-3xl text-white shadow-2xl">
                        <h3 class="text-xl font-bold mb-6 italic">Quick WhatsApp Inquiry</h3>
                        <form id="whatsapp-inquiry-form" class="space-y-4">
                            <input type="text" id="inquiry-name" placeholder="Your Name" required class="w-full bg-slate-800/50 border-none rounded-xl px-4 py-3 placeholder:text-slate-500 focus:ring-2 focus:ring-accent text-white">
                            <input type="email" id="inquiry-email" placeholder="Your Email" required class="w-full bg-slate-800/50 border-none rounded-xl px-4 py-3 placeholder:text-slate-500 focus:ring-2 focus:ring-accent text-white">
                            <textarea id="inquiry-message" placeholder="I'm interested in this property..." rows="4" required class="w-full bg-slate-800/50 border-none rounded-xl px-4 py-3 placeholder:text-slate-500 focus:ring-2 focus:ring-accent text-white"></textarea>
                            <button type="submit" class="w-full bg-accent text-primary font-bold py-4 rounded-xl hover:bg-white transition-all flex items-center justify-center space-x-3 group">
                                <i class="fa-brands fa-whatsapp text-xl group-hover:scale-110 transition-transform"></i>
                                <span>Send WhatsApp Inquiry</span>
                            </button>
                        </form>
                        <p class="text-[10px] text-white/40 text-center mt-4">Safe & secure communication via WhatsApp</p>
                    </div>

                    <!-- Helpful Links -->
                    <div class="bg-slate-50 p-8 rounded-3xl">
                        <h3 class="text-xl font-bold text-primary mb-6">Important Information</h3>
                        <ul class="space-y-4 text-slate-600">
                            <li class="flex items-center"><i class="fa-solid fa-check text-accent mr-3"></i> Verification status: Confirmed</li>
                            <li class="flex items-center"><i class="fa-solid fa-check text-accent mr-3"></i> Documented for transfer</li>
                            <li class="flex items-center"><i class="fa-solid fa-check text-accent mr-3"></i> Viewing available daily</li>
                        </ul>
                    </div>
                </div>
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
            window.location.href = 'properties.php';
            return;
        }

        function renderProperty(prop) {
            // Title & Header
            $('#property-title').text(decodeEntities(prop.title.rendered)).removeClass('animate-pulse bg-slate-200 h-12 w-3/4 rounded-lg');

            // ACF Data
            const af = prop.acf || {};
            $('#property-location span').text(af.location || 'Nairobi, Kenya');

            const rawPrice = af.price || 'Request Quote';
            let formattedPrice = rawPrice;
            if (rawPrice !== 'Request Quote') {
                const numericPrice = rawPrice.toString().replace(/[^\d.]/g, '');
                if (numericPrice) {
                    formattedPrice = 'KES ' + parseFloat(numericPrice).toLocaleString('en-US');
                }
            }
            const priceFrom = af.price_from ? `<span class="text-sm font-normal text-slate-400 mr-2 block md:inline">${af.price_from}</span>` : '';
            $('#property-price').html(priceFrom + formattedPrice);
            $('#property-status').text(af.status || 'FEATURED');

            // Render Dynamic Tags (ACF Features + WP Tags)
            const $tagContainer = $('#property-tags');
            $tagContainer.empty();

            // 1. Key Features from ACF
            const keyFeatures = [{
                    val: af.beds,
                    label: 'Beds',
                    icon: 'fa-bed'
                },
                {
                    val: af.baths,
                    label: 'Baths',
                    icon: 'fa-bath'
                },
                {
                    val: af.size,
                    label: '',
                    icon: 'fa-ruler-combined'
                },
                {
                    val: af.type,
                    label: '',
                    icon: 'fa-building'
                }
            ];

            keyFeatures.forEach(feat => {
                if (feat.val) {
                    $tagContainer.append(`
                        <div class="flex items-center space-x-2 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-full shadow-sm hover:border-accent/30 transition-colors">
                            <i class="fa-solid ${feat.icon} text-accent text-sm"></i>
                            <span class="text-primary font-bold text-sm">${feat.val} ${feat.label}</span>
                        </div>
                    `);
                }
            });

            // 2. Generic Tags from WordPress
            if (prop._embedded && prop._embedded['wp:term']) {
                // Term sets: usually [categories, tags, ...]
                const terms = prop._embedded['wp:term'];
                terms.forEach(termSet => {
                    termSet.forEach(term => {
                        // Skip the main "Properties" category (usually ID 4 or name "Properties")
                        if (term.id == 4 || term.name === 'Properties') return;

                        $tagContainer.append(`
                            <div class="flex items-center space-x-2 px-5 py-2.5 bg-accent/5 border border-accent/20 rounded-full hover:bg-accent/10 transition-colors">
                                <i class="fa-solid fa-check-double text-accent text-xs"></i>
                                <span class="text-primary font-bold text-sm capitalize">${term.name}</span>
                            </div>
                        `);
                    });
                });
            }

            // Image
            const img = (prop._embedded && prop._embedded['wp:featuredmedia']) ? prop._embedded['wp:featuredmedia'][0].source_url : 'assets/img/hero.png';
            $('#property-image').attr('src', img).attr('alt', prop.title.rendered);
            $('#property-image-container').removeClass('opacity-0');
            $tagContainer.removeClass('opacity-0');

            // Description
            $('#property-description').html(prop.content.rendered);

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

        function fetchProperty() {
            $.ajax({
                url: WP_API_URL,
                method: 'GET',
                beforeSend: function(xhr) {
                    if (WP_API_KEY) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + WP_API_KEY);
                    }
                },
                success: function(data) {
                    renderProperty(data);
                },
                error: function() {
                    $('#property-description').html(`
                        <div class="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
                            <div class="text-5xl text-slate-200 mb-6"><i class="fa-solid fa-house-circle-exclamation"></i></div>
                            <h3 class="text-2xl font-bold text-primary mb-4">Property Unavailable</h3>
                            <p class="text-slate-500 mb-8">We could not load the details for this property. It may have been moved or is currently undergoing maintenance. Please try again later.</p>
                            <a href="properties.php" class="inline-block bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-slate-800 transition-colors">Back to Listings</a>
                        </div>
                    `);
                    $('#property-title').text('Detail Loading Failed').removeClass('animate-pulse');
                    $('#property-price').text('---');
                }
            });
        }

        // WhatsApp Inquiry Handler
        $('#whatsapp-inquiry-form').submit(function(e) {
            e.preventDefault();

            const name = sanitizeInput($('#inquiry-name').val());
            const email = sanitizeInput($('#inquiry-email').val());
            const message = sanitizeInput($('#inquiry-message').val());
            const propertyTitle = $('#property-title').text();
            const propertyLink = window.location.href;

            const whatsappNumber = '254702594345';
            const encodedMessage = encodeURIComponent(
                `*New Property Inquiry*\n\n` +
                `*Property:* ${propertyTitle}\n` +
                `*Link:* ${propertyLink}\n\n` +
                `*Client Name:* ${name}\n` +
                `*Client Email:* ${email}\n` +
                `*Message:* ${message}`
            );

            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');
        });

        fetchProperty();
    });
</script>

<?php include('footer.php'); ?>