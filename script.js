(function () {
    'use strict';

    /* ----- Sticky header style ----- */
    var header = document.getElementById('header');
    function onScroll() {
        header.classList.toggle('scrolled', window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ----- Mobile menu ----- */
    var burger = document.getElementById('burger');
    var menu = document.getElementById('menu');

    function setMenu(open) {
        menu.classList.toggle('open', open);
        header.classList.toggle('menu-open', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.style.overflow = open ? 'hidden' : '';
    }
    burger.addEventListener('click', function () {
        setMenu(!menu.classList.contains('open'));
    });
    menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { setMenu(false); });
    });
    window.addEventListener('resize', function () {
        if (window.innerWidth >= 960) setMenu(false);
    });

    /* ----- Course tabs ----- */
    var tabs = document.querySelectorAll('.tab');
    var panels = document.querySelectorAll('.panel');

    function activate(tab) {
        tabs.forEach(function (t) {
            var on = t === tab;
            t.classList.toggle('active', on);
            t.setAttribute('aria-selected', String(on));
        });
        panels.forEach(function (p) {
            var on = p.id === tab.dataset.tab;
            p.classList.toggle('active', on);
            p.hidden = !on;
        });
    }
    tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { activate(tab); });
        tab.addEventListener('keydown', function (e) {
            var next;
            if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
            if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
            if (next) { next.focus(); activate(next); }
        });
    });

    /* ----- Subject icons: use images/icons/<name>.png when the file exists ----- */
    document.querySelectorAll('.subjects li[data-icon]').forEach(function (li) {
        var box = li.querySelector('.sicon');
        var img = new Image();
        img.alt = '';
        img.width = 36;
        img.height = 36;
        img.onload = function () {
            box.innerHTML = '';
            box.appendChild(img);
        };
        img.src = 'images/icons/' + li.dataset.icon + '.png';
    });

    /* ----- Scroll reveal ----- */
    var items = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    en.target.classList.add('in');
                    io.unobserve(en.target);
                }
            });
        }, { threshold: 0.1 });
        items.forEach(function (el, i) {
            el.style.transitionDelay = (i % 4) * 70 + 'ms';
            io.observe(el);
        });
    } else {
        items.forEach(function (el) { el.classList.add('in'); });
    }

    /* ----- Lightbox (results poster + gallery) ----- */
    var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
    var lb = document.getElementById('lightbox');
    var lbImg = document.getElementById('lb-img');
    var lbCap = document.getElementById('lb-cap');
    var current = 0;
    var lastFocus = null;

    function show(i) {
        current = (i + triggers.length) % triggers.length;
        var t = triggers[current];
        var thumb = t.querySelector('img');
        var fallback = thumb ? thumb.getAttribute('src') : '';

        // if the full-size file is missing, fall back to the thumbnail image
        lbImg.onerror = function () {
            lbImg.onerror = null;
            if (fallback) lbImg.src = fallback;
        };
        lbImg.src = t.dataset.full || fallback;
        lbImg.alt = t.dataset.alt || '';
        lbCap.textContent = t.dataset.alt || '';
    }
    function openLb(i) {
        lastFocus = document.activeElement;
        show(i);
        lb.hidden = false;
        document.body.style.overflow = 'hidden';
        document.getElementById('lb-close').focus();
    }
    function closeLb() {
        lb.hidden = true;
        lbImg.onerror = null;
        lbImg.removeAttribute('src');
        document.body.style.overflow = '';
        if (lastFocus) lastFocus.focus();
    }
    triggers.forEach(function (t, i) {
        t.addEventListener('click', function () { openLb(i); });
    });
    document.getElementById('lb-close').addEventListener('click', closeLb);
    document.getElementById('lb-prev').addEventListener('click', function () { show(current - 1); });
    document.getElementById('lb-next').addEventListener('click', function () { show(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (!lb.hidden) closeLb(); else setMenu(false);
        }
        if (!lb.hidden) {
            if (e.key === 'ArrowLeft') show(current - 1);
            if (e.key === 'ArrowRight') show(current + 1);
        }
    });
    // swipe on touch devices
    var startX = null;
    lb.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
        startX = null;
    });

    /* ----- Enquiry form -> WhatsApp ----- */
    var WHATSAPP_NUMBER = '919940400687';
    var form = document.getElementById('enquiry');
    var errorBox = document.getElementById('form-error');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var f = form.elements;
        var student = f.student.value.trim();
        var parent = f.parent.value.trim();
        var phone = f.phone.value.trim();
        var klass = f.klass.value;
        var msg = f.msg.value.trim();

        var problem = '';
        if (!student || !parent || !phone || !klass) {
            problem = 'Please fill in all required fields.';
        } else if (phone.replace(/\D/g, '').length < 10) {
            problem = 'Please enter a valid phone number.';
        }
        if (problem) {
            errorBox.textContent = problem;
            errorBox.hidden = false;
            return;
        }
        errorBox.hidden = true;

        var text =
            'Hello Vivegam Tuition Centre, I would like to enquire about admission.\n\n' +
            'Student name: ' + student + '\n' +
            'Parent name: ' + parent + '\n' +
            'Phone: ' + phone + '\n' +
            'Class / Group: ' + klass +
            (msg ? '\nMessage: ' + msg : '');

        window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });

    /* ----- Footer year ----- */
    document.getElementById('year').textContent = new Date().getFullYear();
})();