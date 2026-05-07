(function() {
    'use strict';

    function initLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const loaderProgress = document.getElementById('loader-progress');
        let progress = 0;

        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                    document.body.style.overflow = '';
                }, 400);
            }
            loaderProgress.style.width = progress + '%';
        }, 200);
    }

    document.body.style.overflow = 'hidden';
    initLoadingScreen();

    function initCursorFollower() {
        const follower = document.getElementById('cursor-follower');
        if (!follower) return;

        let currentX = 0, currentY = 0;
        let targetX = 0, targetY = 0;

        document.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        });

        function update() {
            currentX += (targetX - currentX) * 0.15;
            currentY += (targetY - currentY) * 0.15;
            follower.style.left = currentX + 'px';
            follower.style.top = currentY + 'px';
            requestAnimationFrame(update);
        }
        update();

        const addHover = () => follower.classList.add('hovering');
        const removeHover = () => follower.classList.remove('hovering');

        document.querySelectorAll('a, button, .nav-link, .btn').forEach(el => {
            el.addEventListener('mouseenter', addHover);
            el.addEventListener('mouseleave', removeHover);
        });

        const observer = new MutationObserver(() => {
            document.querySelectorAll('a, button, .nav-link, .btn').forEach(el => {
                el.addEventListener('mouseenter', addHover);
                el.addEventListener('mouseleave', removeHover);
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
    initCursorFollower();

    function initHeaderScroll() {
        const header = document.getElementById('header');
        const scrollProgress = document.getElementById('scroll-progress');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            const percent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            scrollProgress.style.width = percent + '%';
        });
    }
    initHeaderScroll();

    function initMobileNav() {
        const hamburger = document.getElementById('hamburger');
        const nav = document.getElementById('main-nav');

        if (hamburger && nav) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                nav.classList.toggle('open');
            });

            nav.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    nav.classList.remove('open');
                });
            });
        }
    }
    initMobileNav();

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }
    initSmoothScroll();

    function initActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        if (sections.length === 0) return;

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 200;
                if (window.scrollY >= sectionTop) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-section') === current) {
                    link.classList.add('active');
                }
            });
        });
    }
    initActiveNav();

    function initRandomPick() {
        const btn = document.getElementById('random-pick-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                if (typeof MOVIES_DATA !== 'undefined' && MOVIES_DATA.length > 0) {
                    const randomMovie = MOVIES_DATA[Math.floor(Math.random() * MOVIES_DATA.length)];
                    showToast(randomMovie.title);
                } else {
                    showToast('Фильмы загружаются...');
                }
            });
        }
    }

    function showToast(message) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:30000;display:flex;flex-direction:column;gap:8px;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = 'background:#1a1f2e;border-left:4px solid #F5C518;padding:14px 20px;border-radius:8px;color:white;font-size:14px;min-width:260px;animation:slideIn 0.3s ease,slideOut 0.3s ease 2.7s forwards;box-shadow:0 4px 20px rgba(0,0,0,0.3);';

        const style = document.getElementById('toast-styles');
        if (!style) {
            const s = document.createElement('style');
            s.id = 'toast-styles';
            s.textContent = '@keyframes slideIn{from{transform:translateX(100%);opacity:0;}to{transform:translateX(0);opacity:1;}}@keyframes slideOut{from{transform:translateX(0);opacity:1;}to{transform:translateX(100%);opacity:0;}}';
            document.head.appendChild(s);
        }

        container.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 3000);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.getElementById('hamburger')?.classList.remove('active');
            document.getElementById('main-nav')?.classList.remove('open');
        }
    });

    initRandomPick();
})();

const state = {
    favorites: JSON.parse(localStorage.getItem('cinemavault_favorites') || '[]'),
    currentPage: 1,
    moviesPerPage: 8,
    filteredMovies: [...MOVIES_DATA],
    currentGenre: 'all',
    sliderIndex: 0,  
    isSpinning: false,
    wheelAngle: 0,
    isLoading: false
};

function initSlider() {
    const topMovies = MOVIES_DATA.filter(m => m.top5 === true);
    const track = document.getElementById('slider-track');
    const dotsContainer = document.getElementById('slider-dots');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    
    if (!track || !dotsContainer || !prevBtn || !nextBtn || topMovies.length === 0) return;
    
    let currentIndex = 0;
    let autoSlideInterval;
    
    track.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    topMovies.forEach((movie, index) => {
        const slide = document.createElement('div');
        slide.className = 'slider-slide';
        slide.style.minWidth = '300px';
        slide.style.flexShrink = '0';
        slide.style.width = '300px';
        
        const posterUrl = movie.poster || movie.backdrop || 'https://via.placeholder.com/300x170?text=No+Image';
        
        slide.innerHTML = `
            <div class="slider-movie-card" data-id="${movie.id}" data-index="${index}">
                <img src="${posterUrl}" alt="${movie.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x170?text=No+Image'">
                <div class="slider-movie-overlay">
                    <div class="slider-movie-title">${movie.title}</div>
                    <div class="slider-movie-meta">${movie.year} · ${movie.genre[0] || movie.genre}</div>
                    <div class="slider-movie-rating">⭐ ${movie.rating > 0 ? movie.rating.toFixed(1) : '—'}</div>
                </div>
            </div>
        `;
        
        const card = slide.querySelector('.slider-movie-card');
        card.addEventListener('click', () => {
            if (typeof openMovieModal === 'function') {
                openMovieModal(movie);
            } else {
                console.log('Movie clicked:', movie.title);
                showToast(movie.title);
            }
        });
        
        track.appendChild(slide);
    });
    
    topMovies.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'slider-dot' + (i === currentIndex ? ' active' : '');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });
    
    function goToSlide(index) {
        currentIndex = index;
        const slideWidth = 324; 
        const offset = currentIndex * slideWidth;
        track.style.transform = `translateX(-${offset}px)`;
        
        document.querySelectorAll('.slider-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }
    
    function nextSlide() {
        const nextIndex = currentIndex < topMovies.length - 1 ? currentIndex + 1 : 0;
        goToSlide(nextIndex);
    }
    
    function prevSlide() {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : topMovies.length - 1;
        goToSlide(prevIndex);
    }
    
    prevBtn.addEventListener('click', () => {
        stopAutoSlide();
        prevSlide();
        startAutoSlide();
    });
    
    nextBtn.addEventListener('click', () => {
        stopAutoSlide();
        nextSlide();
        startAutoSlide();
    });
    
    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, 5000);
    }
    
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }
    
    const sliderWrapper = document.querySelector('.slider-wrapper');
    if (sliderWrapper) {
        sliderWrapper.addEventListener('mouseenter', stopAutoSlide);
        sliderWrapper.addEventListener('mouseleave', startAutoSlide);
    }
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoSlide();
    });
    
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const swipeThreshold = 50;
        
        if (touchStartX - touchEndX > swipeThreshold) {
            nextSlide();
        } else if (touchEndX - touchStartX > swipeThreshold) {
            prevSlide();
        }
        startAutoSlide();
    });
    
    startAutoSlide();
    goToSlide(0);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');
    setTimeout(function() {
        initSlider();
    }, 100);
});