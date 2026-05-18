(function() {
    'use strict';

    let currentPage = 1;
    let currentGenre = 'all';
    let currentSort = 'rating';
    let searchTerm = '';
    let favorites = JSON.parse(localStorage.getItem('cinemavault_favorites') || '[]');

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

        document.querySelectorAll('a, button, .movie-card, .slider-movie-card').forEach(el => {
            el.addEventListener('mouseenter', addHover);
            el.addEventListener('mouseleave', removeHover);
        });
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

    function showToast(message, type = 'info') {
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

    function initRandomPick() {
        const btn = document.getElementById('random-pick-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                const randomMovie = MOVIES_DATA[Math.floor(Math.random() * MOVIES_DATA.length)];
                openMovieModal(randomMovie);
                showToast('Вам выпал: ' + randomMovie.title);
            });
        }
    }

    function openVideoModal(videoFile) {
        const modal = document.getElementById('video-modal');
        const video = document.getElementById('trailer-video');
        const source = video.querySelector('source');
        
        if (source) {
            source.src = videoFile;
            video.load();
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        video.play();
    }

    function closeVideoModal() {
        const modal = document.getElementById('video-modal');
        const video = document.getElementById('trailer-video');
        
        modal.classList.remove('active');
        video.pause();
        document.body.style.overflow = '';
    }

    function openMovieModal(movie) {
        const modal = document.getElementById('movie-modal');
        const content = document.getElementById('movie-modal-content');
        
        if (!modal || !content) return;
        
        const trailerFile = movie.trailerFile || 'trailers/default.mp4';
        
        content.innerHTML = `
            <img class="movie-modal-poster" src="${movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
            <div class="movie-modal-title">${movie.title}</div>
            <div class="movie-modal-year">${movie.year} · ${movie.duration || '—'}</div>
            <div class="movie-modal-rating">⭐ ${movie.rating > 0 ? movie.rating.toFixed(1) : '—'}</div>
            <div class="movie-modal-description">${movie.description || 'Описание отсутствует'}</div>
            <div class="movie-modal-genres">
                ${movie.genre.map(g => `<span class="genre-tag">${g}</span>`).join('')}
            </div>
            ${movie.cast ? `
            <div class="movie-modal-cast">
                <strong>В ролях:</strong>
                <div class="cast-list">
                    ${movie.cast.map(c => `<span class="cast-item">${c}</span>`).join('')}
                </div>
            </div>` : ''}
            <div class="movie-modal-trailer">
                <button class="trailer-btn" id="play-trailer-btn">▶ Смотреть трейлер</button>
            </div>
        `;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        const trailerBtn = document.getElementById('play-trailer-btn');
        if (trailerBtn) {
            trailerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openVideoModal(trailerFile);
            });
        }
    }

    function closeMovieModal() {
        const modal = document.getElementById('movie-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function createMovieCard(movie) {
        const isFav = favorites.includes(movie.id);
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <img class="movie-poster" src="${movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-meta">
                    <span>${movie.year}</span>
                    <span class="movie-rating">⭐ ${movie.rating > 0 ? movie.rating.toFixed(1) : '—'}</span>
                </div>
            </div>
            <button class="card-fav-btn ${isFav ? 'active' : ''}" data-id="${movie.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFav ? '#ef4444' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
        `;
        
        const favBtn = card.querySelector('.card-fav-btn');
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(movie.id, favBtn);
        });
        
        card.addEventListener('click', () => openMovieModal(movie));
        return card;
    }

    function toggleFavorite(movieId, btn) {
        const index = favorites.indexOf(movieId);
        if (index === -1) {
            favorites.push(movieId);
            btn.classList.add('active');
            btn.querySelector('svg').setAttribute('fill', '#ef4444');
            showToast('Добавлено в избранное');
        } else {
            favorites.splice(index, 1);
            btn.classList.remove('active');
            btn.querySelector('svg').setAttribute('fill', 'none');
            showToast('Удалено из избранного');
        }
        localStorage.setItem('cinemavault_favorites', JSON.stringify(favorites));
        updateFavButtonCount();
    }

    function showFavoritesModal() {
        const modal = document.getElementById('favorites-modal');
        const list = document.getElementById('favorites-list');
        
        if (favorites.length === 0) {
            list.innerHTML = '<p style="color:#9CA3AF;text-align:center;padding:40px;">Нет избранных фильмов</p>';
        } else {
            list.innerHTML = '';
            favorites.forEach(id => {
                const movie = MOVIES_DATA.find(m => m.id === id);
                if (movie) {
                    const item = document.createElement('div');
                    item.className = 'fav-item';
                    item.innerHTML = `
                        <img class="fav-item-poster" src="${movie.poster}" alt="${movie.title}">
                        <div class="fav-item-info">
                            <div class="fav-item-title">${movie.title}</div>
                            <div class="fav-item-year">${movie.year} · ⭐ ${movie.rating}</div>
                        </div>
                        <button class="fav-remove-btn" data-id="${movie.id}">×</button>
                    `;
                    item.querySelector('.fav-remove-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        const idx = favorites.indexOf(movie.id);
                        if (idx !== -1) {
                            favorites.splice(idx, 1);
                            localStorage.setItem('cinemavault_favorites', JSON.stringify(favorites));
                            showFavoritesModal();
                            updateFavButtonCount();
                            showToast('Удалено из избранного');
                        }
                    });
                    item.addEventListener('click', () => {
                        closeFavoritesModal();
                        openMovieModal(movie);
                    });
                    list.appendChild(item);
                }
            });
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeFavoritesModal() {
        const modal = document.getElementById('favorites-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function openContactModal() {
        const modal = document.getElementById('contact-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            showToast('Форма обратной связи временно недоступна');
        }
    }

    function closeContactModal() {
        const modal = document.getElementById('contact-modal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('form-name')?.value || '';
                const email = document.getElementById('form-email')?.value || '';
                const message = document.getElementById('form-message')?.value || '';
                
                console.log('Сообщение:', { name, email, message });
                showToast('Сообщение отправлено! Спасибо, ' + name);
                form.reset();
                closeContactModal();
            });
        }
    }

    function updateFavButtonCount() {
        const favBtn = document.getElementById('favorites-btn');
        if (favBtn) {
            favBtn.setAttribute('title', 'Избранное (' + favorites.length + ')');
        }
    }

    function renderMovies() {
        const theatersGrid = document.getElementById('theaters-grid');
        if (theatersGrid) {
            const theaters = MOVIES_DATA.filter(m => m.inTheaters === true);
            theatersGrid.innerHTML = '';
            theaters.forEach(movie => theatersGrid.appendChild(createMovieCard(movie)));
        }

        const comingGrid = document.getElementById('coming-grid');
        if (comingGrid) {
            const comingSoon = MOVIES_DATA.filter(m => m.comingSoon === true);
            comingGrid.innerHTML = '';
            comingSoon.forEach(movie => comingGrid.appendChild(createMovieCard(movie)));
        }

        renderCatalog();
    }

    function renderCatalog() {
        const container = document.getElementById('catalog-grid');
        if (!container) return;

        let filtered = [...MOVIES_DATA];

        if (currentGenre !== 'all') {
            filtered = filtered.filter(m => m.genre.includes(currentGenre));
        }

        if (searchTerm) {
            filtered = filtered.filter(m => 
                m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (m.titleEn && m.titleEn.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (currentSort === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
        } else if (currentSort === 'year') {
            filtered.sort((a, b) => b.year - a.year);
        } else if (currentSort === 'title') {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        }

        const itemsPerPage = 12;
        const start = 0;
        const end = currentPage * itemsPerPage;
        const toShow = filtered.slice(start, end);

        container.innerHTML = '';
        toShow.forEach(movie => container.appendChild(createMovieCard(movie)));

        const wrapper = document.getElementById('load-more-wrapper');
        if (wrapper) {
            wrapper.style.display = (end >= filtered.length) ? 'none' : 'block';
        }
    }

    function loadMore() {
        currentPage++;
        renderCatalog();
    }

    function initCatalogFilters() {
        const searchInput = document.getElementById('search-input');
        const genreBtns = document.querySelectorAll('.genre-btn');
        const sortSelect = document.getElementById('sort-select');
        const loadMoreBtn = document.getElementById('load-more-btn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchTerm = e.target.value;
                currentPage = 1;
                renderCatalog();
            });
        }

        genreBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                genreBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentGenre = btn.dataset.genre;
                currentPage = 1;
                renderCatalog();
            });
        });

        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                currentSort = e.target.value;
                currentPage = 1;
                renderCatalog();
            });
        }

        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMore);
        }
    }

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
        
        topMovies.forEach((movie) => {
            const slide = document.createElement('div');
            slide.className = 'slider-slide';
            slide.style.minWidth = '300px';
            slide.style.flexShrink = '0';
            slide.style.width = '300px';
            
            const posterUrl = movie.poster || movie.backdrop || 'https://via.placeholder.com/300x170?text=No+Image';
            
            slide.innerHTML = `
                <div class="slider-movie-card" data-id="${movie.id}">
                    <img src="${posterUrl}" alt="${movie.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x170?text=No+Image'">
                    <div class="slider-movie-overlay">
                        <div class="slider-movie-title">${movie.title}</div>
                        <div class="slider-movie-meta">${movie.year} · ${movie.genre[0] || movie.genre}</div>
                        <div class="slider-movie-rating">⭐ ${movie.rating > 0 ? movie.rating.toFixed(1) : '—'}</div>
                    </div>
                </div>
            `;
            
            const card = slide.querySelector('.slider-movie-card');
            card.addEventListener('click', () => openMovieModal(movie));
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
        
        startAutoSlide();
        goToSlide(0);
    }

    document.addEventListener('DOMContentLoaded', () => {
        initLoadingScreen();
        initCursorFollower();
        initHeaderScroll();
        initMobileNav();
        initSmoothScroll();
        initActiveNav();
        initRandomPick();
        renderMovies();
        initCatalogFilters();
        initSlider();
        initContactForm();
        initWheelPicker();
        
        const favBtn = document.getElementById('favorites-btn');
        if (favBtn) favBtn.addEventListener('click', showFavoritesModal);
        
        const contactBtn = document.getElementById('contact-btn');
        if (contactBtn) contactBtn.addEventListener('click', openContactModal);
        
        const movieModalClose = document.getElementById('movie-modal-close');
        const movieModalOverlay = document.getElementById('movie-modal');
        if (movieModalClose) movieModalClose.addEventListener('click', closeMovieModal);
        if (movieModalOverlay) {
            movieModalOverlay.addEventListener('click', (e) => {
                if (e.target === movieModalOverlay) closeMovieModal();
            });
        }
        
        const videoModalClose = document.getElementById('video-modal-close');
        const videoModalOverlay = document.getElementById('video-modal');
        if (videoModalClose) videoModalClose.addEventListener('click', closeVideoModal);
        if (videoModalOverlay) {
            videoModalOverlay.addEventListener('click', (e) => {
                if (e.target === videoModalOverlay) closeVideoModal();
            });
        }
        
        const favModalClose = document.getElementById('favorites-modal-close');
        const favModalOverlay = document.getElementById('favorites-modal');
        if (favModalClose) favModalClose.addEventListener('click', closeFavoritesModal);
        if (favModalOverlay) {
            favModalOverlay.addEventListener('click', (e) => {
                if (e.target === favModalOverlay) closeFavoritesModal();
            });
        }
        
        const contactModalClose = document.getElementById('contact-modal-close');
        const contactModalOverlay = document.getElementById('contact-modal');
        if (contactModalClose) contactModalClose.addEventListener('click', closeContactModal);
        if (contactModalOverlay) {
            contactModalOverlay.addEventListener('click', (e) => {
                if (e.target === contactModalOverlay) closeContactModal();
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMovieModal();
                closeVideoModal();
                closeFavoritesModal();
                closeContactModal();
            }
        });
        
        updateFavButtonCount();
    });

        function initWheelPicker() {
        const canvas = document.getElementById('wheel-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const spinBtn = document.getElementById('spin-btn');
        const pickerGenre = document.getElementById('picker-genre');
        const resultDiv = document.getElementById('picker-result');
        
        let wheelMovies = [];
        let wheelAngle = 0;
        let isSpinning = false;
        
        const allGenres = new Set();
        MOVIES_DATA.forEach(m => m.genre.forEach(g => allGenres.add(g)));
        allGenres.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g;
            opt.textContent = g;
            pickerGenre.appendChild(opt);
        });
        
        function getFilteredMovies() {
            const genre = pickerGenre.value;
            if (genre === 'all') {
                return MOVIES_DATA.filter(m => m.rating > 0);
            }
            return MOVIES_DATA.filter(m => m.genre.includes(genre) && m.rating > 0);
        }
        
        function drawWheel() {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 10;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (wheelMovies.length === 0) {
                ctx.fillStyle = '#9CA3AF';
                ctx.font = '16px Inter';
                ctx.textAlign = 'center';
                ctx.fillText('Нет фильмов в этом жанре', centerX, centerY);
                return;
            }
            
            const sliceAngle = (2 * Math.PI) / wheelMovies.length;
            const colors = ['#F5C518', '#e0b400', '#c49d00', '#a88600', '#8c6f00', '#705800', '#F5C518', '#e0b400', '#c49d00', '#a88600'];
            
            wheelMovies.forEach((movie, i) => {
                const startAngle = wheelAngle + i * sliceAngle;
                const endAngle = startAngle + sliceAngle;
                
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = colors[i % colors.length];
                ctx.fill();
                
                ctx.strokeStyle = '#1a1f2e';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(startAngle + sliceAngle / 2);
                ctx.textAlign = 'right';
                ctx.fillStyle = '#1a1f2e';
                ctx.font = 'bold 11px Montserrat';
                let text = movie.title;
                if (text.length > 14) text = text.substring(0, 12) + '...';
                ctx.fillText(text, radius - 15, 5);
                ctx.restore();
            });
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
            ctx.fillStyle = '#1a1f2e';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
            ctx.fillStyle = '#F5C518';
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - radius - 8);
            ctx.lineTo(centerX - 12, centerY - radius + 12);
            ctx.lineTo(centerX + 12, centerY - radius + 12);
            ctx.closePath();
            ctx.fillStyle = '#F5C518';
            ctx.fill();
        }
        
        function spinWheel() {
            if (isSpinning) return;
            
            wheelMovies = getFilteredMovies();
            if (wheelMovies.length === 0) {
                showToast('Нет фильмов для выбора', 'error');
                return;
            }
            
            isSpinning = true;
            resultDiv.innerHTML = '';
            
            const totalSpin = Math.random() * 360 + 360 * 4;
            const duration = 3500;
            const startTime = performance.now();
            const startAngle = wheelAngle;
            
            function easeOutCubic(t) {
                return 1 - Math.pow(1 - t, 3);
            }
            
            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeOutCubic(progress);
                
                wheelAngle = startAngle + (totalSpin * eased * Math.PI / 180);
                drawWheel();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    const sliceAngle = (2 * Math.PI) / wheelMovies.length;
                    const pointerAngle = -Math.PI / 2;
                    let normalizedAngle = (pointerAngle - wheelAngle) % (2 * Math.PI);
                    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;
                    const winnerIndex = Math.floor(normalizedAngle / sliceAngle);
                    const winner = wheelMovies[winnerIndex % wheelMovies.length];
                    
                    resultDiv.innerHTML = `
                        <div class="picker-result-movie">
                            <div class="picker-result-title">${winner.title}</div>
                            <div class="picker-result-meta">${winner.year} · ${winner.genre.join(', ')} · ⭐ ${winner.rating}</div>
                            <button class="btn btn-primary winner-details-btn" style="margin-top:12px;">Подробнее</button>
                        </div>
                    `;
                    
                    const detailsBtn = resultDiv.querySelector('.winner-details-btn');
                    if (detailsBtn) {
                        detailsBtn.addEventListener('click', () => openMovieModal(winner));
                    }
                    
                    showToast('Вам выпал: ' + winner.title, 'success');
                    isSpinning = false;
                }
            }
            
            requestAnimationFrame(animate);
        }
        
        spinBtn.addEventListener('click', spinWheel);
        pickerGenre.addEventListener('change', () => {
            if (!isSpinning) {
                wheelMovies = getFilteredMovies();
                drawWheel();
            }
        });
        
        wheelMovies = getFilteredMovies();
        drawWheel();
    }
})();