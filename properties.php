<?php include('header.php'); ?>

<!-- Page Header -->
<section class="pt-44 pb-20 bg-slate-100 text-primary relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="text-accent font-bold tracking-widest uppercase text-sm">Portfolio</span>
        <h1 class="text-4xl md:text-6xl font-display font-bold mt-4">Featured Properties</h1>
        <p class="text-slate-600 mt-6 max-w-2xl mx-auto">
            Discover a wide range of residential and commercial properties available for rent, lease, or sale.
        </p>
    </div>
</section>

<!-- Filter & Search Section -->
<section class="py-12 bg-white border-b border-slate-100 sticky top-32 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <form id="filter-form" class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="relative">
                <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input type="text" id="property-search" placeholder="Search properties..." class="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm">
            </div>

            <select id="property-type" class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm appearance-none cursor-pointer">
                <option value="">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land/Plots</option>
            </select>

            <select id="property-status" class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm appearance-none cursor-pointer">
                <option value="">All Tags</option>
                <option value="sale">One Acre</option>
                <option value="rent">One Bedroom</option>
            </select>

            <button type="submit" class="bg-primary text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">
                Apply Filters
            </button>
        </form>
    </div>
</section>

<!-- Property Results Grid -->
<section class="py-24 bg-white min-h-[600px]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div id="property-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <!-- Skeletons will be injected here -->
        </div>

        <!-- No Results -->
        <div id="no-results" class="hidden text-center py-20">
            <div class="text-6xl text-slate-200 mb-6"><i class="fa-solid fa-house-circle-exclamation"></i></div>
            <h3 class="text-2xl font-bold text-primary mb-2">No properties found</h3>
            <p class="text-slate-500">Try adjusting your filters or search criteria.</p>
        </div>
    </div>
</section>

<script>
    $(document).ready(function() {
        // WORDPRESS REST API CONFIGURATION
        const BASE_API_URL = '<?php echo WP_API_URL; ?>';
        const WP_API_URL = BASE_API_URL + '/posts?categories=3&_embed';
        const WP_API_KEY = '<?php echo WP_API_KEY; ?>';

        let categoryMap = {};

        // Fetch categories to map slugs to IDs
        function fetchCategories() {
            $.ajax({
                url: BASE_API_URL + '/categories?per_page=100',
                method: 'GET',
                success: function(categories) {
                    categories.forEach(cat => {
                        categoryMap[cat.slug] = cat.id;
                    });
                }
            });
        }

        // Fetch and populate tags for filtering
        function fetchAndPopulateTags() {
            $.ajax({
                url: BASE_API_URL + '/tags?per_page=100',
                method: 'GET',
                success: function(tags) {
                    const $statusSelect = $('#property-status');
                    $statusSelect.empty().append('<option value="">All Tags</option>');

                    tags.forEach(tag => {
                        $statusSelect.append(`<option value="${tag.id}">${tag.name}</option>`);
                    });
                }
            });
        }

        // Mock Data for demonstration if API fails or is not yet set
        const mockProperties = [{
                title: {
                    rendered: "The Emerald Residency"
                },
                id: 1,
                _embedded: {
                    "wp:featuredmedia": [{
                        source_url: "assets/img/property-1.png"
                    }]
                },
                acf: {
                    location: "Karen, Nairobi",
                    price: "Ksh 45,000,000",
                    status: "sale",
                    type: "residential",
                    beds: 5,
                    baths: 4
                }
            },
            {
                title: {
                    rendered: "Skyline View Apartments"
                },
                id: 2,
                _embedded: {
                    "wp:featuredmedia": [{
                        source_url: "assets/img/property-2.png"
                    }]
                },
                acf: {
                    location: "Westlands, Nairobi",
                    price: "Ksh 85,000 /mo",
                    status: "rent",
                    type: "residential",
                    beds: 3,
                    baths: 2
                }
            }
        ];

        function showSkeletonProperties() {
            $('#property-list').empty();
            $('#no-results').addClass('hidden');

            for (let i = 0; i < 6; i++) {
                const skeleton = `
                    <div class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
                        <div class="h-64 skeleton"></div>
                        <div class="p-8">
                            <div class="h-6 w-3/4 skeleton rounded-lg mb-4"></div>
                            <div class="h-4 w-1/2 skeleton rounded-lg mb-6"></div>
                            <div class="flex gap-2 mb-6">
                                <div class="h-6 w-16 skeleton rounded-md"></div>
                                <div class="h-6 w-16 skeleton rounded-md"></div>
                            </div>
                            <div class="h-12 w-full skeleton rounded-xl mb-4"></div>
                            <div class="h-12 w-full border-2 border-slate-100 rounded-xl"></div>
                        </div>
                    </div>
                `;
                $('#property-list').append(skeleton);
            }
        }

        function renderProperties(properties) {
            $('#property-list').empty();

            if (properties.length === 0) {
                $('#no-results').removeClass('hidden');
                return;
            }

            $('#no-results').addClass('hidden');

            properties.forEach(prop => {
                const title = decodeEntities(prop.title.rendered);
                const img = (prop._embedded && prop._embedded['wp:featuredmedia']) ? prop._embedded['wp:featuredmedia'][0].source_url : 'assets/img/hero.png';
                const af = prop.acf || {};
                const location = af.location || 'Nairobi, Kenya';
                const rawPrice = af.price || 'Request Quote';
                let price = rawPrice;
                if (rawPrice !== 'Request Quote') {
                    const numericPrice = rawPrice.toString().replace(/[^\d.]/g, '');
                    if (numericPrice) {
                        price = 'KES ' + parseFloat(numericPrice).toLocaleString('en-US');
                    }
                }
                const priceFrom = af.price_from ? `<span class="text-[10px] font-normal text-slate-400 mr-1 whitespace-nowrap">${af.price_from}</span>` : '';
                const status = (af.status || 'FEATURED').toUpperCase();
                const statusClass = status === 'SALE' ? 'bg-primary' : 'bg-accent text-primary';

                // Extract Tags
                let tagsHtml = '';
                if (prop._embedded && prop._embedded['wp:term']) {
                    const terms = prop._embedded['wp:term'];
                    const tags = terms[1] || [];
                    tagsHtml = tags.map(tag => `
                        <span class="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] uppercase tracking-wider font-bold text-slate-600">
                            ${tag.name}
                        </span>
                    `).join('');
                }

                const beds = af.beds ? `<span class="flex items-center"><i class="fa-solid fa-bed mr-2 text-accent"></i> ${af.beds}</span>` : '';
                const baths = af.baths ? `<span class="flex items-center"><i class="fa-solid fa-bath mr-2 text-accent"></i> ${af.baths}</span>` : '';

                const card = `
                <div class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                    <div class="relative h-64 overflow-hidden">
                        <img src="${img}" alt="${title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                        <div class="absolute top-4 left-4 ${statusClass} text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">${status}</div>
                    </div>
                    <div class="p-8">
                        <h3 class="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">${title}</h3>
                        <p class="text-slate-500 text-sm flex items-center mb-4">
                            <i class="fa-solid fa-location-dot mr-2 text-accent"></i> ${location}
                        </p>
                        
                        <div class="flex flex-wrap gap-2 mb-6">
                            ${tagsHtml}
                        </div>

                        <div class="flex items-center space-x-6 text-sm text-slate-600 mb-8 border-y border-slate-50 py-4">
                            ${beds}
                            ${baths}
                            <span class="flex items-baseline font-bold text-primary ml-auto">${priceFrom}${price}</span>
                        </div>
                        <a href="single-property.php?id=${prop.id}" class="block text-center py-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all">
                            View Details
                        </a>
                    </div>
                </div>
            `;
                $('#property-list').append(card);
            });
        }

        // Function to fetch data
        function fetchProperties(tagId = '', searchTerm = '', typeSlug = '') {
            showSkeletonProperties();
            $('#no-results').addClass('hidden');

            // Determine categories to fetch
            // If a specific type slug is provided, and we have its ID, use ONLY that ID
            // Otherwise, fetch from the base 'Properties' category (3)
            let categoryId = 3;
            if (typeSlug && categoryMap[typeSlug]) {
                categoryId = categoryMap[typeSlug];
            }

            let url = BASE_API_URL + '/posts?_embed&categories=' + categoryId;

            if (tagId) url += '&tags=' + tagId;
            if (searchTerm) url += '&search=' + encodeURIComponent(searchTerm);

            $.ajax({
                url: url,
                method: 'GET',
                beforeSend: function(xhr) {
                    if (WP_API_KEY) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + WP_API_KEY);
                    }
                },
                success: function(data) {
                    renderProperties(data);
                },
                error: function() {
                    // Fallback to mock data for demonstration
                    setTimeout(() => {
                        renderProperties(mockProperties);
                    }, 800);
                }
            });
        }

        fetchCategories();
        fetchAndPopulateTags();
        fetchProperties();

        $('#filter-form').submit(function(e) {
            e.preventDefault();
            const tagId = $('#property-status').val();
            const searchTerm = $('#property-search').val();
            const typeSlug = $('#property-type').val();
            fetchProperties(tagId, searchTerm, typeSlug);
        });

        // Live search with debounce
        let searchTimeout;
        $('#property-search').on('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const tagId = $('#property-status').val();
                const searchTerm = $(this).val();
                const typeSlug = $('#property-type').val();
                fetchProperties(tagId, searchTerm, typeSlug);
            }, 500);
        });
    });
</script>

<?php include('footer.php'); ?>