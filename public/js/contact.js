(function () {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    const val = (id) => AV.stripTags(document.getElementById(id).value);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text =
            `*New Website Inquiry*\n\n*Subject:* ${val('contact-subject')}\n\n` +
            `*Name:* ${val('contact-name')}\n*Email:* ${val('contact-email')}\n*Phone:* ${val('contact-phone')}\n\n` +
            `*Message:* ${val('contact-message')}`;
        status.classList.remove('hidden');
        setTimeout(() => {
            window.open(`https://wa.me/${AV.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
            form.reset();
            status.classList.add('hidden');
        }, 500);
    });
})();
