<?php require_once('config.php'); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AVIHTECH AGENCIES | Premium Real Estate & Property Management</title>
    <meta name="description" content="AVIHTECH AGENCIES - Professional real estate solutions in Kenya. Property sales, letting, management, and investment advisory.">

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="assets/img/avitech-icon.png">

    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Swiper JS CDN -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
    <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>

    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#0F172A', // Deep Navy
                        secondary: '#334155', // Slate
                        accent: '#EAB308', // Gold/Amber
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Outfit', 'sans-serif'],
                    },
                }
            }
        }
    </script>

    <style>
        .glass {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .nav-link {
            transition: all 0.3s ease;
        }

        .nav-link:hover {
            color: #EAB308;
        }

        .hero-gradient {
            background: linear-gradient(to bottom, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.4));
        }

        /* Swiper Custom Styling */
        .swiper-button-next,
        .swiper-button-prev {
            color: #EAB308 !important;
            background: white;
            width: 50px !important;
            height: 50px !important;
            border-radius: 50%;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .swiper-button-next:after,
        .swiper-button-prev:after {
            font-size: 1.2rem !important;
            font-weight: bold;
        }

        .swiper-pagination-bullet-active {
            background: #EAB308 !important;
        }

        /* WordPress Gallery Reset for Carousel */
        .wp-block-gallery,
        .gallery {
            display: block !important;
            margin: 2rem 0 !important;
            width: 100% !important;
        }

        .gallery-item {
            display: inline-block !important;
            width: 100% !important;
        }

        .lightbox-swiper {
            overflow: hidden !important;
        }

        /* Skeleton Screens */
        .skeleton {
            background: #f1f5f9;
            background: linear-gradient(110deg, #f1f5f9 8%, #f8fafc 18%, #f1f5f9 33%);
            background-size: 200% 100%;
            animation: shimmer 1.5s linear infinite;
        }

        @keyframes shimmer {
            to {
                background-position-x: -200%;
            }
        }
    </style>
</head>

<body class="font-sans text-slate-900 bg-slate-50">

    <!-- Navigation -->
    <nav class="fixed w-full z-50 transition-all duration-300 glass" id="main-nav">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-20">
                <div class="flex items-center">
                    <a href="index.php" class="flex-shrink-0 flex items-center gap-3">
                        <img src="assets/img/avitech-icon.png" alt="AVIHTECH" class="h-10 w-auto">
                        <span class="text-2xl font-display font-bold text-primary">AVIHTECH<span class="text-accent underline decoration-2 underline-offset-4">AGENCIES</span></span>
                    </a>
                </div>

                <!-- Desktop Menu -->
                <div class="hidden md:flex items-center space-x-8">
                    <a href="index.php" class="nav-link font-medium text-primary">Home</a>
                    <a href="about.php" class="nav-link font-medium text-primary">About</a>
                    <a href="properties.php" class="nav-link font-medium text-primary">Properties</a>
                    <a href="blog.php" class="nav-link font-medium text-primary">Blog</a>
                    <a href="contact.php" class="nav-link font-medium px-5 py-2.5 rounded-full bg-primary text-white hover:bg-slate-800 transition-colors">Contact Us</a>
                </div>

                <!-- Mobile menu button -->
                <div class="md:hidden flex items-center">
                    <button type="button" id="mobile-menu-button" class="text-primary hover:text-accent focus:outline-none">
                        <i class="fa-solid fa-bars text-2xl"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile Menu -->
        <div class="md:hidden hidden bg-white border-t border-slate-100 shadow-xl" id="mobile-menu">
            <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <a href="index.php" class="block px-3 py-4 text-base font-medium text-primary border-b border-slate-50">Home</a>
                <a href="about.php" class="block px-3 py-4 text-base font-medium text-primary border-b border-slate-50">About</a>
                <a href="properties.php" class="block px-3 py-4 text-base font-medium text-primary border-b border-slate-50">Properties</a>
                <a href="blog.php" class="block px-3 py-4 text-base font-medium text-primary border-b border-slate-50">Blog</a>
                <a href="contact.php" class="block px-3 py-4 text-base font-medium text-accent font-bold">Contact Us</a>
            </div>
        </div>
    </nav>

    <script>
        function sanitizeInput(str) {
            if (!str) return '';
            return str
                .trim()
                .replace(/<[^>]*>?/gm, ''); // Strip HTML tags
        }

        function decodeEntities(str) {
            if (!str) return '';
            var txt = document.createElement("textarea");
            txt.innerHTML = str;
            return txt.value;
        }

        $(document).ready(function() {
            $('#mobile-menu-button').click(function() {
                $('#mobile-menu').toggleClass('hidden');
                $(this).find('i').toggleClass('fa-bars fa-xmark');
            });

            $(window).scroll(function() {
                if ($(window).scrollTop() > 50) {
                    $('#main-nav').addClass('shadow-md bg-white/95').removeClass('bg-white/70');
                } else {
                    $('#main-nav').removeClass('shadow-md bg-white/95').addClass('bg-white/70');
                }
            });
        });
    </script>