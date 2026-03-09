<?php include('header.php'); ?>

<!-- Hero Section -->
<section class="relative h-screen flex items-center pt-32 overflow-hidden">
    <!-- Background Image -->
    <div class="absolute inset-0 z-0">
        <img src="assets/img/hero.png" alt="Nairobi Skyline" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-transparent"></div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="max-w-2xl text-white">
            <span class="inline-block py-1 px-3 rounded-full bg-accent/20 text-accent text-sm font-semibold mb-6 border border-accent/30 animate-pulse">
                Trusted Real Estate Partner in Kenya
            </span>
            <h1 class="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
                Redefining Your <span class="text-accent">Property</span> Experience
            </h1>
            <p class="text-xl text-slate-300 mb-10 leading-relaxed">
                Exceptional property solutions delivered with professionalism, discretion, and integrity. We guide you through acquisition, sales, letting, and management.
            </p>
            <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <a href="properties.php" class="bg-accent text-primary px-8 py-4 rounded-xl font-bold text-center hover:scale-105 transition-transform duration-300 shadow-lg shadow-accent/20">
                    View Properties
                </a>
                <a href="contact.php" class="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-center hover:bg-white/20 transition-all duration-300">
                    Consult an Expert
                </a>
            </div>

            <div class="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-8 hidden md:grid">
                <div>
                    <h4 class="text-3xl font-display font-bold text-accent">100+</h4>
                    <p class="text-slate-400 text-sm">Managed Units</p>
                </div>
                <div>
                    <h4 class="text-3xl font-display font-bold text-accent">Ksh 5M+</h4>
                    <p class="text-slate-400 text-sm">Transaction Value</p>
                </div>
                <div>
                    <h4 class="text-3xl font-display font-bold text-accent">98%</h4>
                    <p class="text-slate-400 text-sm">Client Satisfaction</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- About Preview -->
<section class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div class="relative">
                <div class="absolute -top-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
                <img src="assets/img/about-avihtech-1.jpg" alt="Professional Real Estate" class="rounded-3xl shadow-2xl relative z-10 w-full h-[500px] object-cover">
                <div class="absolute -bottom-6 -right-6 bg-primary p-8 rounded-2xl shadow-xl z-20 hidden md:block">
                    <p class="text-accent text-3xl font-bold mb-1">6+</p>
                    <p class="text-white text-sm font-medium">Years of Local Expertise</p>
                </div>
            </div>

            <div>
                <span class="text-accent font-bold tracking-widest uppercase text-sm">Our Presence</span>
                <h2 class="text-4xl font-display font-bold text-primary mt-4 mb-6 leading-snug">
                    Navigating the Kenyan Property Market with Modern Strategies
                </h2>
                <p class="text-slate-600 mb-8 leading-relaxed">
                    AVIHTECH AGENCIES is a forward-thinking real estate and property management company dedicated to delivering exceptional property solutions. We serve discerning clients seeking reliable guidance in property acquisition, sales, letting, and management.
                </p>

                <div class="space-y-4 mb-10">
                    <div class="flex items-start">
                        <div class="mt-1 bg-accent/10 p-2 rounded-lg text-accent mr-4">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-primary">Strategic Market Understanding</h4>
                            <p class="text-sm text-slate-500">We leverage data and local insights to maximize your asset value.</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <div class="mt-1 bg-accent/10 p-2 rounded-lg text-accent mr-4">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-primary">Transparent & Ethical Transactions</h4>
                            <p class="text-sm text-slate-500">Integrity is the core value in every deal we facilitate.</p>
                        </div>
                    </div>
                </div>

                <a href="about.php" class="inline-flex items-center text-primary font-bold hover:text-accent transition-colors">
                    Learn More About Us <i class="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                </a>
            </div>
        </div>
    </div>
</section>

<!-- Services Grid -->
<section class="py-24 bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16">
            <span class="text-accent font-bold tracking-widest uppercase text-sm">Services</span>
            <h2 class="text-4xl font-display font-bold text-primary mt-4">Our Expertise</h2>
            <p class="text-slate-600 mt-4">Comprehensive real estate solutions designed to meet the needs of homeowners, investors, tenants, and developers.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Service 1 -->
            <div class="bg-white p-10 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary text-2xl mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
                    <i class="fa-solid fa-house-circle-check"></i>
                </div>
                <h3 class="text-xl font-bold mb-4">Property Sales & Acquisition</h3>
                <p class="text-slate-500 text-sm leading-relaxed mb-6">
                    Expert assistance in buying and selling residential and commercial properties with strategic market positioning.
                </p>
                <a href="contact.php" class="text-primary font-bold text-sm flex items-center">
                    Get Assistance <i class="fa-solid fa-chevron-right ml-2 text-xs"></i>
                </a>
            </div>

            <!-- Service 2 -->
            <div class="bg-white p-10 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                <div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-accent text-2xl mb-8 group-hover:bg-accent group-hover:text-primary transition-colors">
                    <i class="fa-solid fa-key"></i>
                </div>
                <h3 class="text-xl font-bold mb-4">Premium Letting Services</h3>
                <p class="text-slate-500 text-sm leading-relaxed mb-6">
                    Connecting quality tenants with well-maintained properties through a seamless and transparent process.
                </p>
                <a href="contact.php" class="text-primary font-bold text-sm flex items-center">
                    Rent / List Property <i class="fa-solid fa-chevron-right ml-2 text-xs"></i>
                </a>
            </div>

            <!-- Service 3 -->
            <div class="bg-white p-10 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-secondary text-2xl mb-8 group-hover:bg-secondary group-hover:text-white transition-colors">
                    <i class="fa-solid fa-building-user"></i>
                </div>
                <h3 class="text-xl font-bold mb-4">Property Management</h3>
                <p class="text-slate-500 text-sm leading-relaxed mb-6">
                    End-to-end management services including tenant relations, rent administration, and asset protection.
                </p>
                <a href="contact.php" class="text-primary font-bold text-sm flex items-center">
                    Explore Solutions <i class="fa-solid fa-chevron-right ml-2 text-xs"></i>
                </a>
            </div>
        </div>
    </div>
</section>

<!-- Featured Properties Preview -->
<section class="py-24 bg-white overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
                <span class="text-accent font-bold tracking-widest uppercase text-sm">Portfolio</span>
                <h2 class="text-4xl font-display font-bold text-primary mt-4">Featured Listings</h2>
            </div>
            <a href="properties.php" class="mt-4 md:mt-0 px-6 py-3 border-2 border-primary rounded-xl font-bold hover:bg-primary hover:text-white transition-all">
                Browse All Properties
            </a>
        </div>

        <div id="featured-properties-list" class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Loading States -->
            <div class="animate-pulse bg-slate-100 h-[400px] rounded-3xl"></div>
            <div class="animate-pulse bg-slate-100 h-[400px] rounded-3xl hidden md:block"></div>
        </div>
    </div>
</section>

<!-- Call to Action -->
<section class="py-20 bg-primary relative overflow-hidden">
    <div class="absolute top-0 right-0 w-1/3 h-full bg-accent/10 -skew-x-12 translate-x-1/2"></div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="max-w-3xl">
            <h2 class="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                Ready to find your <span class="text-accent underline decoration-4 underline-offset-8">dream</span> property?
            </h2>
            <p class="text-xl text-slate-300 mb-10 leading-relaxed">
                Whether you're looking to buy, sell, or rent, our team of experts is here to provide value-driven solutions.
            </p>
            <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <a href="contact.php" class="bg-white text-primary px-8 py-4 rounded-xl font-bold text-center hover:bg-slate-100 transition-all">
                    Contact Us Today
                </a>
                <a href="properties.php" class="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-center hover:border-white transition-all">
                    Explore Listings
                </a>
            </div>
        </div>
    </div>
</section>

<script>
    $(document).ready(function() {
        // Fetch top 2 Featured Properties (Category 3)
        const PROPERTY_API_URL = '<?php echo WP_API_URL; ?>/posts?categories=3&per_page=2&_embed';
        const WP_API_KEY = '<?php echo WP_API_KEY; ?>';

        $.ajax({
            url: PROPERTY_API_URL,
            method: 'GET',
            beforeSend: function(xhr) {
                if (WP_API_KEY) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + WP_API_KEY);
                }
            },
            success: function(properties) {
                const $container = $('#featured-properties-list');
                $container.empty();

                if (properties.length === 0) {
                    $container.append('<p class="text-slate-500 text-center col-span-full py-12">No featured properties available at the moment.</p>');
                    return;
                }

                properties.forEach(prop => {
                    const title = decodeEntities(prop.title.rendered);
                    const img = (prop._embedded && prop._embedded['wp:featuredmedia']) ? prop._embedded['wp:featuredmedia'][0].source_url : 'assets/img/hero.png';
                    const af = prop.acf || {};
                    const rawPrice = af.price || 'Request Quote';
                    let price = rawPrice;
                    if (rawPrice !== 'Request Quote') {
                        const numericPrice = rawPrice.toString().replace(/[^\d.]/g, '');
                        if (numericPrice) {
                            price = 'KES ' + parseFloat(numericPrice).toLocaleString('en-US');
                        }
                    }
                    const priceFrom = af.price_from ? `<span class="text-[10px] font-normal text-white/60 mr-1 whitespace-nowrap">${af.price_from}</span>` : '';
                    const location = (prop.acf && prop.acf.location) ? prop.acf.location : 'Nairobi, Kenya';
                    const status = (af.status || 'FEATURED').toUpperCase();
                    const statusClass = status === 'SALE' ? 'bg-primary' : 'bg-accent text-primary';

                    // Extract Tags
                    let tagsHtml = '';
                    if (prop._embedded && prop._embedded['wp:term']) {
                        const terms = prop._embedded['wp:term'];
                        // Usually terms[0] is categories, terms[1] is tags
                        const tags = terms[1] || [];
                        tagsHtml = tags.map(tag => `
                            <span class="px-2 py-0.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-md text-[10px] uppercase tracking-wider font-bold">
                                ${tag.name}
                            </span>
                        `).join('');
                    }

                    const beds = af.beds ? `<span class="flex items-center text-sm"><i class="fa-solid fa-bed mr-2 text-accent"></i> ${af.beds} Beds</span>` : '';
                    const baths = af.baths ? `<span class="flex items-center text-sm"><i class="fa-solid fa-bath mr-2 text-accent"></i> ${af.baths} Baths</span>` : '';

                    const card = `
                        <a href="single-property.php?id=${prop.id}" class="group block">
                            <div class="relative h-[400px] overflow-hidden rounded-3xl transition-transform duration-500 hover:shadow-2xl">
                                <img src="${img}" alt="${title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                                
                                <div class="absolute top-4 left-4">
                                    <div class="${statusClass} text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">${status}</div>
                                </div>

                                <div class="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-primary/95 to-transparent text-white">
                                    <h3 class="text-2xl font-bold mb-2 group-hover:text-accent transition-colors">${title}</h3>
                                    <p class="text-white/80 text-sm flex items-center mb-3">
                                        <i class="fa-solid fa-location-dot mr-2 text-accent"></i> ${location}
                                    </p>
                                    
                                    <div class="flex items-center space-x-6">
                                    ${tagsHtml}
                                        ${beds}
                                        ${baths}
                                        <span class="flex items-baseline text-sm font-bold text-accent ml-auto">${priceFrom}${price}</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    `;
                    $container.append(card);
                });
            },
            error: function() {
                $('#featured-properties-list').html(`
                    <div class="col-span-full text-center py-12 bg-white/5 rounded-3xl border border-white/10">
                        <div class="text-4xl text-white/20 mb-4"><i class="fa-solid fa-circle-exclamation"></i></div>
                        <p class="text-white/60">Featured properties are currently unavailable. Please check back later.</p>
                    </div>
                `);
            }
        });
    });
</script>

<?php include('footer.php'); ?>