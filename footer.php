    <!-- Footer -->
    <footer class="bg-primary text-white pt-16 pb-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                <!-- Agency Info -->
                <div class="space-y-6">
                    <a href="index.php" class="flex items-center">
                        <span class="text-2xl font-display font-bold text-white">AVIHTECH<span class="text-accent">AGENCIES</span></span>
                    </a>
                    <p class="text-slate-400 text-sm leading-relaxed">
                        A forward-thinking real estate and property management company dedicated to delivering exceptional property solutions with professionalism and integrity.
                    </p>
                    <div class="flex space-x-4">
                        <a href="#" class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-accent hover:text-primary transition-all">
                            <i class="fa-brands fa-facebook-f"></i>
                        </a>
                        <a href="#" class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-accent hover:text-primary transition-all">
                            <i class="fa-brands fa-x-twitter"></i>
                        </a>
                        <a href="#" class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-accent hover:text-primary transition-all">
                            <i class="fa-brands fa-instagram"></i>
                        </a>
                        <a href="#" class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-accent hover:text-primary transition-all">
                            <i class="fa-brands fa-linkedin-in"></i>
                        </a>
                    </div>
                </div>

                <!-- Quick Links -->
                <div>
                    <h3 class="text-lg font-bold mb-6 text-accent">Quick Links</h3>
                    <ul class="space-y-4">
                        <li><a href="index.php" class="text-slate-400 hover:text-white transition-colors">Home</a></li>
                        <li><a href="about.php" class="text-slate-400 hover:text-white transition-colors">About Us</a></li>
                        <li><a href="properties.php" class="text-slate-400 hover:text-white transition-colors">Featured Properties</a></li>
                        <li><a href="blog.php" class="text-slate-400 hover:text-white transition-colors">Industry Blog</a></li>
                        <li><a href="contact.php" class="text-slate-400 hover:text-white transition-colors">Contact Us</a></li>
                    </ul>
                </div>

                <!-- Services -->
                <div>
                    <h3 class="text-lg font-bold mb-6 text-accent">Services</h3>
                    <ul class="space-y-4">
                        <li><a href="#" class="text-slate-400 hover:text-white transition-colors">Property Sales</a></li>
                        <li><a href="#" class="text-slate-400 hover:text-white transition-colors">Premium Letting</a></li>
                        <li><a href="#" class="text-slate-400 hover:text-white transition-colors">Property Management</a></li>
                        <li><a href="#" class="text-slate-400 hover:text-white transition-colors">Investment Advisory</a></li>
                        <li><a href="#" class="text-slate-400 hover:text-white transition-colors">Property Marketing</a></li>
                    </ul>
                </div>

                <!-- Contact Info -->
                <div>
                    <h3 class="text-lg font-bold mb-6 text-accent">Get In Touch</h3>
                    <ul class="space-y-4">
                        <li class="flex items-start">
                            <i class="fa-solid fa-location-dot mt-1.5 mr-3 text-accent"></i>
                            <span class="text-slate-400 text-sm">Nairobi, Kenya<br>CBD Office, 4th Floor</span>
                        </li>
                        <li class="flex items-center">
                            <i class="fa-solid fa-phone mr-3 text-accent"></i>
                            <span class="text-slate-400 text-sm">+254 7XX XXX XXX</span>
                        </li>
                        <li class="flex items-center">
                            <i class="fa-solid fa-envelope mr-3 text-accent"></i>
                            <span class="text-slate-400 text-sm">info@avihtech.com</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs">
                <p>&copy; <?php echo date('Y'); ?> AVIHTECH AGENCIES. All rights reserved.</p>
                <div class="flex space-x-6 mt-4 md:mt-0">
                    <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>

    <!-- Lightbox Modal -->
    <div id="gallery-lightbox" class="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300">
        <!-- Close Button -->
        <button onclick="closeLightbox()" class="absolute top-6 right-6 z-[10001] w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all">
            <i class="fa-solid fa-xmark text-2xl"></i>
        </button>

        <!-- Lightbox Swiper -->
        <div class="swiper lightbox-swiper w-full h-full max-w-5xl px-12">
            <div class="swiper-wrapper flex items-center">
                <!-- Slides will be injected here -->
            </div>
            <!-- Navigation -->
            <div class="swiper-button-prev !text-white !scale-125 !-left-2 md:!-left-8"></div>
            <div class="swiper-button-next !text-white !scale-125 !-right-2 md:!-right-8"></div>
            <!-- Pagination -->
            <div class="swiper-pagination !text-white !-bottom-8"></div>
        </div>
    </div>

    <script>
        let lightboxSwiper = null;

        function openLightbox(images, startIndex) {
            const $lightbox = $('#gallery-lightbox');
            const $wrapper = $lightbox.find('.swiper-wrapper');

            // Clear existing slides
            $wrapper.empty();

            // Add new slides
            images.forEach(img => {
                $wrapper.append(`
                    <div class="swiper-slide flex items-center justify-center p-4">
                        <img src="${img.src}" alt="${img.alt}" class="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl">
                        ${img.caption ? `<div class="absolute bottom-10 inset-x-0 text-center px-4"><span class="inline-block bg-black/50 backdrop-blur-md text-white px-6 py-2 rounded-full text-sm font-medium border border-white/10">${img.caption}</span></div>` : ''}
                    </div>
                `);
            });

            $lightbox.removeClass('pointer-events-none opacity-0').addClass('opacity-100');
            $('body').addClass('overflow-hidden');

            if (lightboxSwiper) {
                lightboxSwiper.destroy();
            }

            lightboxSwiper = new Swiper('.lightbox-swiper', {
                initialSlide: startIndex,
                loop: images.length > 1,
                grabCursor: true,
                speed: 600,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                pagination: {
                    el: '.swiper-pagination',
                    type: 'fraction',
                },
                keyboard: {
                    enabled: true,
                }
            });
        }

        function closeLightbox() {
            $('#gallery-lightbox').removeClass('opacity-100').addClass('opacity-0 pointer-events-none');
            $('body').removeClass('overflow-hidden');
        }

        // Close on Esc key
        $(document).keydown(function(e) {
            if (e.keyCode === 27) closeLightbox();
        });
    </script>
    </body>

    </html>