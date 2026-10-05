/* Injects the shared navigation, footer and gallery lightbox. */
(function () {
    const links = [
        ['/', 'Home'],
        ['/about', 'About'],
        ['/properties', 'Properties'],
        ['/blog', 'Blog'],
    ];

    const nav = `
    <nav class="fixed w-full z-50 transition-all duration-300 glass" id="main-nav">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-20">
                <div class="flex items-center">
                    <a href="/" class="flex-shrink-0 flex items-center gap-3">
                        <img src="/assets/img/avitech-icon.png" alt="AVIHTECH" class="h-10 w-auto">
                        <span class="text-2xl font-display font-bold text-primary">AVIHTECH<span class="text-accent underline decoration-2 underline-offset-4">AGENCIES</span></span>
                    </a>
                </div>
                <div class="hidden md:flex items-center space-x-8">
                    ${links.map(([href, label]) => `<a href="${href}" class="nav-link font-medium text-primary">${label}</a>`).join('')}
                    <a href="/contact" class="nav-link font-medium px-5 py-2.5 rounded-full bg-primary text-white hover:bg-slate-800 transition-colors">Contact Us</a>
                </div>
                <div class="md:hidden flex items-center">
                    <button type="button" id="mobile-menu-button" aria-label="Menu" class="text-primary hover:text-accent focus:outline-none">
                        <i class="fa-solid fa-bars text-2xl"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="md:hidden hidden bg-white border-t border-slate-100 shadow-xl" id="mobile-menu">
            <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                ${links.map(([href, label]) => `<a href="${href}" class="block px-3 py-4 text-base font-medium text-primary border-b border-slate-50">${label}</a>`).join('')}
                <a href="/contact" class="block px-3 py-4 text-base font-medium text-accent font-bold">Contact Us</a>
            </div>
        </div>
    </nav>`;

    const social = ['facebook-f', 'x-twitter', 'instagram', 'linkedin-in']
        .map((icon) => `<a href="#" class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-accent hover:text-primary transition-all"><i class="fa-brands fa-${icon}"></i></a>`)
        .join('');

    const footerList = (items) => items.map(([href, label]) => `<li><a href="${href}" class="text-slate-400 hover:text-white transition-colors">${label}</a></li>`).join('');

    const footer = `
    <footer class="bg-primary text-white pt-16 pb-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                <div class="space-y-6">
                    <a href="/" class="flex items-center"><span class="text-2xl font-display font-bold text-white">AVIHTECH<span class="text-accent">AGENCIES</span></span></a>
                    <p class="text-slate-400 text-sm leading-relaxed">A forward-thinking real estate and property management company dedicated to delivering exceptional property solutions with professionalism and integrity.</p>
                    <div class="flex space-x-4">${social}</div>
                </div>
                <div>
                    <h3 class="text-lg font-bold mb-6 text-accent">Quick Links</h3>
                    <ul class="space-y-4">${footerList([['/', 'Home'], ['/about', 'About Us'], ['/properties', 'Featured Properties'], ['/blog', 'Industry Blog'], ['/contact', 'Contact Us']])}</ul>
                </div>
                <div>
                    <h3 class="text-lg font-bold mb-6 text-accent">Services</h3>
                    <ul class="space-y-4">${footerList([['/contact', 'Property Sales'], ['/contact', 'Premium Letting'], ['/contact', 'Property Management'], ['/contact', 'Investment Advisory'], ['/contact', 'Property Marketing']])}</ul>
                </div>
                <div>
                    <h3 class="text-lg font-bold mb-6 text-accent">Get In Touch</h3>
                    <ul class="space-y-4">
                        <li class="flex items-start"><i class="fa-solid fa-location-dot mt-1.5 mr-3 text-accent"></i><span class="text-slate-400 text-sm">Naivasha, Kenya<br>Kinamba</span></li>
                        <li class="flex items-center"><i class="fa-solid fa-phone mr-3 text-accent"></i><span class="text-slate-400 text-sm">+254 702 594 345</span></li>
                        <li class="flex items-center"><i class="fa-solid fa-envelope mr-3 text-accent"></i><span class="text-slate-400 text-sm">info@avihtechproperties.com</span></li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs">
                <p>&copy; ${new Date().getFullYear()} AVIHTECH AGENCIES. All rights reserved.</p>
                <div class="flex space-x-6 mt-4 md:mt-0">
                    <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>

    <div id="gallery-lightbox" class="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300">
        <button type="button" id="lightbox-close" aria-label="Close" class="absolute top-6 right-6 z-[10001] w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all">
            <i class="fa-solid fa-xmark text-2xl"></i>
        </button>
        <div class="swiper lightbox-swiper w-full h-full max-w-5xl px-12">
            <div class="swiper-wrapper flex items-center"></div>
            <div class="swiper-button-prev !text-white !scale-125 !-left-2 md:!-left-8"></div>
            <div class="swiper-button-next !text-white !scale-125 !-right-2 md:!-right-8"></div>
            <div class="swiper-pagination !text-white !-bottom-8"></div>
        </div>
    </div>`;

    document.getElementById('site-nav').innerHTML = nav;
    document.getElementById('site-footer').innerHTML = footer;

    // Mobile menu
    const menuButton = document.getElementById('mobile-menu-button');
    menuButton.addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.toggle('hidden');
        menuButton.querySelector('i').classList.toggle('fa-bars');
        menuButton.querySelector('i').classList.toggle('fa-xmark');
    });

    // Nav shadow on scroll
    const mainNav = document.getElementById('main-nav');
    const onScroll = () => mainNav.classList.toggle('shadow-md', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Lightbox
    const lightbox = document.getElementById('gallery-lightbox');
    let lightboxSwiper = null;

    AV.openLightbox = (images, startIndex = 0) => {
        const wrapper = lightbox.querySelector('.swiper-wrapper');
        wrapper.innerHTML = images.map((img) => `
            <div class="swiper-slide flex items-center justify-center p-4">
                <img src="${AV.esc(img.src)}" alt="${AV.esc(img.alt || '')}" class="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl">
            </div>`).join('');
        lightbox.classList.remove('pointer-events-none', 'opacity-0');
        lightbox.classList.add('opacity-100');
        document.body.classList.add('overflow-hidden');
        if (lightboxSwiper) lightboxSwiper.destroy(true, true);
        lightboxSwiper = new Swiper('.lightbox-swiper', {
            initialSlide: startIndex,
            loop: images.length > 1,
            grabCursor: true,
            speed: 600,
            navigation: { nextEl: '.lightbox-swiper .swiper-button-next', prevEl: '.lightbox-swiper .swiper-button-prev' },
            pagination: { el: '.lightbox-swiper .swiper-pagination', type: 'fraction' },
            keyboard: { enabled: true },
        });
    };

    AV.closeLightbox = () => {
        lightbox.classList.remove('opacity-100');
        lightbox.classList.add('opacity-0', 'pointer-events-none');
        document.body.classList.remove('overflow-hidden');
    };

    document.getElementById('lightbox-close').addEventListener('click', AV.closeLightbox);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') AV.closeLightbox(); });
})();
