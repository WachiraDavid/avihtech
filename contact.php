<?php include('header.php'); ?>

<!-- Page Header -->
<section class="pt-44 pb-20 bg-slate-50 text-primary relative border-b border-slate-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="text-accent font-bold tracking-widest uppercase text-sm">Connect</span>
        <h1 class="text-4xl md:text-6xl font-display font-bold mt-4">Get in Touch</h1>
        <p class="text-slate-600 mt-6 max-w-2xl mx-auto">
            Have a question about a property or need expert management solutions? Our team is ready to help you.
        </p>
    </div>
</section>

<!-- Contact Section -->
<section class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <!-- Contact Form -->
            <div class="bg-slate-50 p-10 rounded-3xl border border-slate-100 shadow-sm">
                <h2 class="text-2xl font-display font-bold text-primary mb-8">Send us a Message</h2>
                <form id="contact-form" class="space-y-6">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                            <input type="text" id="contact-name" required class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm transition-all" placeholder="John Doe">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                            <input type="email" id="contact-email" required class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm transition-all" placeholder="john@example.com">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                        <input type="tel" id="contact-phone" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm transition-all" placeholder="+254 7XX XXX XXX">
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                        <select id="contact-subject" class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm transition-all appearance-none cursor-pointer">
                            <option>Property Inquiry</option>
                            <option>Leasing & Letting</option>
                            <option>Property Management</option>
                            <option>Investment Advisory</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Your Message</label>
                        <textarea id="contact-message" rows="5" required class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm transition-all" placeholder="Tell us more about your needs..."></textarea>
                    </div>

                    <button type="submit" class="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-primary/20 flex items-center justify-center space-x-3 group">
                        <i class="fa-brands fa-whatsapp text-xl group-hover:scale-110 transition-transform text-accent"></i>
                        <span>Send WhatsApp Message</span>
                    </button>

                    <div id="form-status" class="hidden py-3 px-4 rounded-xl bg-green-100 text-green-700 text-sm font-medium text-center">
                        Redirecting to WhatsApp...
                    </div>
                </form>
            </div>

            <!-- Contact Info & Map -->
            <div class="flex flex-col justify-between">
                <div>
                    <h2 class="text-2xl font-display font-bold text-primary mb-8">Contact Information</h2>
                    <div class="space-y-8">
                        <div class="flex items-start">
                            <div class="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-accent text-xl mr-6 flex-shrink-0">
                                <i class="fa-solid fa-location-dot"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-primary mb-1">Our Office</h4>
                                <p class="text-slate-500 text-sm leading-relaxed">Naivasha, Kenya<br>Kinamba</p>
                            </div>
                        </div>

                        <div class="flex items-start">
                            <div class="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-accent text-xl mr-6 flex-shrink-0">
                                <i class="fa-solid fa-phone"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-primary mb-1">Phone Numbers</h4>
                                <p class="text-slate-500 text-sm leading-relaxed">Office: +254 702 594 345</p>
                            </div>
                        </div>

                        <div class="flex items-start">
                            <div class="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-accent text-xl mr-6 flex-shrink-0">
                                <i class="fa-solid fa-envelope"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-primary mb-1">Email Support</h4>
                                <p class="text-slate-500 text-sm leading-relaxed">info@avihtechproperties.com</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Map Placeholder -->
                <div class="mt-12 overflow-hidden rounded-3xl h-64 grayscale hover:grayscale-0 transition-all duration-700 bg-slate-200 flex items-center justify-center relative border border-slate-100 shadow-inner">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d941.6843569317018!2d36.46956374091886!3d-0.7296399537996513!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18292282c19c82b7%3A0xf5fad8215b4b22cd!2sAvih%20Tech%20Agencies!5e0!3m2!1sen!2ske!4v1772792012702!5m2!1sen!2ske" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>
            </div>
        </div>
    </div>
</section>

<script>
    $(document).ready(function() {
        $('#contact-form').submit(function(e) {
            e.preventDefault();

            const name = sanitizeInput($('#contact-name').val());
            const email = sanitizeInput($('#contact-email').val());
            const phone = sanitizeInput($('#contact-phone').val());
            const subject = sanitizeInput($('#contact-subject').val());
            const message = sanitizeInput($('#contact-message').val());

            const whatsappNumber = '254706636596';
            const encodedMessage = encodeURIComponent(
                `*New Website Inquiry*\n\n` +
                `*Subject:* ${subject}\n\n` +
                `*Name:* ${name}\n` +
                `*Email:* ${email}\n` +
                `*Phone:* ${phone}\n\n` +
                `*Message:* ${message}`
            );

            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

            $('#form-status').removeClass('hidden');

            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
                $('#contact-form')[0].reset();
                $('#form-status').addClass('hidden');
            }, 500);
        });
    });
</script>

<?php include('footer.php'); ?>