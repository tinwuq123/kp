(function() {
    'use strict';

    //фон threejs
    function initThreeBackground() {
        const canvas = document.getElementById('three-bg');
        if (!canvas) return;
        
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        //частички на фоне
        const particleCount = 800;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
            colors[i * 3] = 0.96;
            colors[i * 3 + 1] = 0.77;
            colors[i * 3 + 2] = 0.09;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        //бублик на фоне
        const torusGeom = new THREE.TorusKnotGeometry(8, 2, 100, 16);
        const torusMat = new THREE.MeshBasicMaterial({
            color: 0xF5C518,
            wireframe: true,
            transparent: true,
            opacity: 0.04
        });
        const torusKnot = new THREE.Mesh(torusGeom, torusMat);
        torusKnot.position.set(20, 10, -20);
        scene.add(torusKnot);

        //многогранник на фоне
        const icoGeom = new THREE.IcosahedronGeometry(6, 1);
        const icoMat = new THREE.MeshBasicMaterial({
            color: 0xF5C518,
            wireframe: true,
            transparent: true,
            opacity: 0.03
        });
        const icosahedron = new THREE.Mesh(icoGeom, icoMat);
        icosahedron.position.set(-20, -10, -15);
        scene.add(icosahedron);

        //реакция на курсор
        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        //аним вращения
        function animate() {
            requestAnimationFrame(animate);
            particles.rotation.y += 0.0003;
            particles.rotation.x += 0.0001;
            particles.rotation.y += mouseX * 0.0005;
            particles.rotation.x += mouseY * 0.0003;
            torusKnot.rotation.x += 0.002;
            torusKnot.rotation.y += 0.003;
            icosahedron.rotation.x -= 0.002;
            icosahedron.rotation.z += 0.001;
            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    //переменные
    let currentPage = 1;
    let currentGenre = 'all';
    let currentSort = 'rating';
    let searchTerm = '';
    let favorites = JSON.parse(localStorage.getItem('cinemavault_favorites') || '[]');

    //экран загрузки
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

    //курсор
    function initCursorFollower() {
        const follower = document.getElementById('cursor-follower');
        if (!follower) return;

        let currentX = 0, currentY = 0;
        let targetX = 0, targetY = 0;
        let isHovering = false;

        const hoverTargets = [
            'a', 'button', '.movie-card', '.slider-movie-card', 
            '.genre-btn', '.nav-link', '.card-fav-btn', '.spin-btn', 
            '.quote-btn', '.promo-btn', '.modal-close', '.trailer-btn',
            '.slider-btn', '.btn', '.load-more-btn', '.fav-remove-btn',
            '.form-submit-btn', '.winner-details-btn'
        ];
        const targetsSelector = hoverTargets.join(',');
        
        function updateHoverState() {
            const elementUnderCursor = document.elementFromPoint(targetX, targetY);
            const isOverTarget = elementUnderCursor?.matches?.(targetsSelector) || 
                                 elementUnderCursor?.closest?.(targetsSelector);
            
            if (isOverTarget && !isHovering) {
                isHovering = true;
                document.body.classList.add('has-hover-target');
            } else if (!isOverTarget && isHovering) {
                isHovering = false;
                document.body.classList.remove('has-hover-target');
            }
        }

        document.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            updateHoverState();
            
            if (isHovering) {
                follower.style.left = targetX + 'px';
                follower.style.top = targetY + 'px';
            }
        });

        function animate() {
            if (isHovering) {
                currentX += (targetX - currentX) * 0.2;
                currentY += (targetY - currentY) * 0.2;
                follower.style.left = currentX + 'px';
                follower.style.top = currentY + 'px';
            }
            requestAnimationFrame(animate);
        }
        animate();

        document.querySelectorAll(targetsSelector).forEach(el => {
            el.addEventListener('mousedown', () => {
                if (isHovering) {
                    follower.style.transform = 'translate(-50%, -50%) scale(0.8)';
                }
            });
            el.addEventListener('mouseup', () => {
                if (isHovering) {
                    follower.style.transform = 'translate(-50%, -50%) scale(1)';
                }
            });
        });
    }

    //хедер, прогресс бар при скролле
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

    //бургер
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

    //плавный скролл при клике по навигации
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

    //подсветка навигации при скролле
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

    //уведы
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

    //не знаю что посмотреть
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

    //трейлеры
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

    //модалка с деталями фильма
    function openMovieModal(movie) {
        const modal = document.getElementById('movie-modal');
        const content = document.getElementById('movie-modal-content');
        
        if (!modal || !content) return;
        
        const trailerFile = movie.trailerFile || 'trailers/default.mp4';
        
        content.innerHTML = `
            <img class="movie-modal-poster" src="${movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
            <div class="movie-modal-title">${movie.title}</div>
            <div class="movie-modal-year">${movie.year} · ${movie.duration || '—'} · ${movie.age || '—'}</div>
            <div class="movie-modal-director">Режиссёр: ${movie.director || '—'}</div>
            <div class="movie-modal-rating"><img src="звезда.png" class="star-icon"> ${movie.rating > 0 ? movie.rating.toFixed(1) : '—'}</div>
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

    //карточки фильма
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
                    <span class="movie-rating"><img src="звезда.png" class="star-icon"> ${movie.rating > 0 ? movie.rating.toFixed(1) : '—'}</span>
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

    //добав и удал из избранного
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

    //модалка избранного
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

    //модалка обр связи
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

    //форма обр связи с прогресс баром
    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;
        
        const nameInput = document.getElementById('form-name');
        const emailInput = document.getElementById('form-email');
        const messageInput = document.getElementById('form-message');
        
        const progressBar = document.createElement('div');
        progressBar.className = 'form-progress';
        const progressFill = document.createElement('div');
        progressFill.className = 'form-progress-fill';
        progressBar.appendChild(progressFill);
        form.appendChild(progressBar);
        
        function updateFormProgress() {
            let filled = 0;
            if (nameInput && nameInput.value.trim() !== '') filled++;  
            if (emailInput && emailInput.value.trim() !== '') filled++; 
            if (messageInput && messageInput.value.trim() !== '') filled++; 
            const percent = (filled / 3) * 100;
            progressFill.style.width = percent + '%';
        }
        
        if (nameInput) nameInput.addEventListener('input', updateFormProgress);
        if (emailInput) emailInput.addEventListener('input', updateFormProgress);
        if (messageInput) messageInput.addEventListener('input', updateFormProgress);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = nameInput?.value || '';
            const email = emailInput?.value || '';
            const message = messageInput?.value || '';
            
            console.log('Сообщение:', { name, email, message });
            showToast('Сообщение отправлено! Спасибо, ' + name);
            form.reset();

            setTimeout(() => {
                progressFill.style.width = '0%';
            }, 100);
            
            closeContactModal();
        });
    }

    //колво фильмов в избранном
    function updateFavButtonCount() {
        const favBtn = document.getElementById('favorites-btn');
        if (favBtn) {
            favBtn.setAttribute('title', 'Избранное (' + favorites.length + ')');
        }
    }

    //отобр фильмов в двух блоках
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

    //кат фильмов фильтрация и пагинация
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

    //поиск, жанр, сортировка
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

    //слайдер
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
                        <div class="slider-movie-rating"><img src="звезда.png" class="star-icon"> ${movie.rating > 0 ? movie.rating.toFixed(1) : '—'}</div>
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

    //аним появ блоков при скролле
    function initScrollReveal() {
        const revealElements = document.querySelectorAll(
            '.hero, .top-section, .theaters-section, .coming-section, ' +
            '.catalog-section, .picker-section, .quotes-section'
        );
        
        revealElements.forEach(el => {
            el.classList.add('reveal-on-scroll');
        });
        
        function isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            return rect.top < window.innerHeight - 100;
        }
        
        function revealVisibleElements() {
            const elements = document.querySelectorAll('.reveal-on-scroll:not(.revealed)');
            elements.forEach(el => {
                if (isElementInViewport(el)) {
                    el.classList.add('revealed');
                }
            });
        }
        
        revealVisibleElements();
        window.addEventListener('scroll', revealVisibleElements);
        window.addEventListener('resize', revealVisibleElements);
    }

    //колесо
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
                            <div class="picker-result-meta">${winner.year} · ${winner.genre.join(', ')} · <img src="звезда.png" class="star-icon"> ${winner.rating}</div>
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

    //цитаты и промокоды
    function initQuotesAndPromo() {
        const quoteText = document.getElementById('quote-text');
        const quoteAuthor = document.getElementById('quote-author');
        const quoteBtn = document.getElementById('new-quote-btn');
        const promoCodeSpan = document.getElementById('promo-code');
        const promoBtn = document.getElementById('promo-btn');
        
        quoteText.textContent = 'Нажми кнопку, чтобы получить цитату из фильма';
        quoteAuthor.textContent = '';
        promoCodeSpan.textContent = 'Нажми "Сгенерировать"';
        
        function getRandomQuote() {
            const randomIndex = Math.floor(Math.random() * QUOTES_DATA.length);
            return QUOTES_DATA[randomIndex];
        }
        
        function displayRandomQuote() {
            const quote = getRandomQuote();
            quoteText.style.opacity = '0';
            quoteText.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                quoteText.textContent = quote.text;
                quoteAuthor.textContent = '— ' + quote.author;
                quoteText.style.opacity = '1';
                quoteText.style.transform = 'translateY(0)';
            }, 300);
        }
        
        function generatePromoCode() {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let code = 'CINE-';
            for (let i = 0; i < 6; i++) {
                code += chars[Math.floor(Math.random() * chars.length)];
            }
            return code;
        }
        
        function displayRandomPromoCode() {
            const newCode = generatePromoCode();
            promoCodeSpan.textContent = newCode;
            promoCodeSpan.style.animation = 'none';
            promoCodeSpan.offsetHeight;
            promoCodeSpan.style.animation = 'resultPop 0.5s ease';
            showToast('Промокод сгенерирован!', 'success');
        }
        
        quoteBtn.addEventListener('click', displayRandomQuote);
        promoBtn.addEventListener('click', displayRandomPromoCode);
        
        quoteText.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    }

    //запуск всего сайта
    document.addEventListener('DOMContentLoaded', () => {
        initThreeBackground();
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
        initQuotesAndPromo();
        initScrollReveal();
        
        //кнопки модалок
        const favBtn = document.getElementById('favorites-btn');
        if (favBtn) favBtn.addEventListener('click', showFavoritesModal);
        
        const contactBtn = document.getElementById('contact-btn');
        if (contactBtn) contactBtn.addEventListener('click', openContactModal);
        
        //закрыт модалок по крестику и по фону
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

        //горячая клавиша
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch (e.key.toLowerCase()) {
                case 'r':
                    e.preventDefault();
                    const randomMovie = MOVIES_DATA[Math.floor(Math.random() * MOVIES_DATA.length)];
                    openMovieModal(randomMovie);
                    showToast('Вам выпал: ' + randomMovie.title);
                    break;
            }
        });
        
        updateFavButtonCount();
    });

})();