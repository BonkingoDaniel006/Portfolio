document.addEventListener('DOMContentLoaded', async function() {
    const includeTargets = Array.from(document.querySelectorAll('[data-include]'));

    try {
        await Promise.all(includeTargets.map(async target => {
            const response = await fetch(target.dataset.include, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`Impossible de charger ${target.dataset.include}`);
            const template = document.createElement('template');
            template.innerHTML = await response.text();
            target.replaceWith(template.content);
        }));
    } catch (error) {
        document.body.innerHTML = '<main class="include-error"><h1>Impossible de charger la page</h1><p>Ouvre le portfolio avec un serveur local (par exemple Live Server dans VS Code), pas directement avec file://.</p></main>';
        console.error(error);
        return;
    }

    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const filterRoot = document.querySelector('.project-nav');
    const projectCards = Array.from(document.querySelectorAll('.projects-grid .project-card'));
    const filterChoices = [
        { label: 'Tous', value: 'all' },
        { label: 'Web & desktop', value: 'web-desktop' },
        { label: 'IoT', value: 'iot' }
    ];

    navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    function matchesFilter(card, filter) {
        const category = card.dataset.category;
        return filter === 'all' ||
            (filter === 'web-desktop' && ['web', 'desktop'].includes(category)) ||
            (filter === 'iot' && category === 'iot');
    }

    function renderFallbackFilters() {
        let activeFilter = 'all';
        const group = document.createElement('div');
        group.className = 'project-filters';
        group.setAttribute('role', 'group');
        group.setAttribute('aria-label', 'Filtrer les projets');
        const count = document.createElement('p');
        count.className = 'filter-count';
        count.setAttribute('aria-live', 'polite');

        function updateFilters() {
            const visibleCount = projectCards.filter(card => matchesFilter(card, activeFilter)).length;
            projectCards.forEach(card => { card.hidden = !matchesFilter(card, activeFilter); });
            group.querySelectorAll('button').forEach(button => {
                const isActive = button.dataset.filter === activeFilter;
                button.classList.toggle('active', isActive);
                button.setAttribute('aria-pressed', String(isActive));
            });
            count.textContent = `${visibleCount} projet${visibleCount > 1 ? 's' : ''}`;
        }

        filterChoices.forEach(choice => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'filter-button';
            button.dataset.filter = choice.value;
            button.textContent = choice.label;
            button.addEventListener('click', () => {
                activeFilter = choice.value;
                updateFilters();
            });
            group.appendChild(button);
        });

        filterRoot.replaceChildren(group, count);
        updateFilters();
    }

    function mountReactFilters() {
        function ProjectFilters() {
            const [activeFilter, setActiveFilter] = React.useState('all');
            const visibleCount = projectCards.filter(card => matchesFilter(card, activeFilter)).length;

            React.useEffect(() => {
                projectCards.forEach(card => { card.hidden = !matchesFilter(card, activeFilter); });
            }, [activeFilter]);

            return React.createElement(React.Fragment, null,
                React.createElement('div', {
                    className: 'project-filters',
                    role: 'group',
                    'aria-label': 'Filtrer les projets'
                }, filterChoices.map(choice => React.createElement('button', {
                    key: choice.value,
                    type: 'button',
                    className: `filter-button${activeFilter === choice.value ? ' active' : ''}`,
                    'aria-pressed': activeFilter === choice.value,
                    onClick: () => setActiveFilter(choice.value)
                }, choice.label))),
                React.createElement('p', { className: 'filter-count', 'aria-live': 'polite' },
                    `${visibleCount} projet${visibleCount > 1 ? 's' : ''}`)
            );
        }

        ReactDOM.createRoot(filterRoot).render(React.createElement(ProjectFilters));
    }

    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    if (filterRoot && projectCards.length) {
        loadScript('https://unpkg.com/react@18/umd/react.production.min.js')
            .then(() => loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'))
            .then(mountReactFilters)
            .catch(renderFallbackFilters);
    }

    const modal = document.getElementById('project-modal');
    const openModalButtons = document.querySelectorAll('.open-modal-btn');
    const closeModal = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const gallerySlider = document.querySelector('.gallery-slider');
    const prevBtn = document.querySelector('.gallery-nav.prev');
    const nextBtn = document.querySelector('.gallery-nav.next');
    let currentSlide = 0;
    let slides = [];
    let lastFocusedElement = null;

    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');
    closeModal.setAttribute('role', 'button');
    closeModal.setAttribute('tabindex', '0');
    closeModal.setAttribute('aria-label', 'Fermer la fenêtre du projet');

    function showSlide(index) {
        currentSlide = index;
        gallerySlider.style.transform = `translateX(-${index * 100}%)`;
        prevBtn.hidden = index === 0;
        nextBtn.hidden = index === slides.length - 1;
    }

    function closeModalFunction() {
        modal.classList.remove('visible');
        document.body.classList.remove('modal-open');
        gallerySlider.querySelectorAll('iframe').forEach(iframe => { iframe.src = iframe.src; });
        gallerySlider.querySelectorAll('video').forEach(video => {
            video.pause();
            video.currentTime = 0;
        });
        if (lastFocusedElement) lastFocusedElement.focus();
    }

    openModalButtons.forEach(button => {
        button.addEventListener('click', event => {
            event.stopPropagation();
            const card = button.closest('.project-card');
            lastFocusedElement = button;
            modalTitle.textContent = card.dataset.title;
            modalText.textContent = card.dataset.description;
            slides = card.dataset.media.split(',').map(url => url.trim()).filter(Boolean).map(url => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                if (url.includes('youtube.com/embed')) {
                    const frame = document.createElement('iframe');
                    frame.src = url;
                    frame.title = `Vidéo : ${card.dataset.title}`;
                    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                    frame.allowFullscreen = true;
                    item.appendChild(frame);
                } else if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
                    const video = document.createElement('video');
                    video.src = url;
                    video.controls = true;
                    video.playsInline = true;
                    video.preload = 'metadata';
                    item.appendChild(video);
                } else {
                    const image = document.createElement('img');
                    image.src = url;
                    image.alt = card.dataset.title;
                    item.appendChild(image);
                }
                return item;
            });

            gallerySlider.replaceChildren(...slides);
            showSlide(0);
            modal.classList.add('visible');
            document.body.classList.add('modal-open');
            closeModal.focus();
        });
    });

    closeModal.addEventListener('click', closeModalFunction);
    closeModal.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            closeModalFunction();
        }
    });
    modal.addEventListener('click', event => {
        if (event.target === modal) closeModalFunction();
    });
    nextBtn.addEventListener('click', () => {
        if (currentSlide < slides.length - 1) showSlide(currentSlide + 1);
    });
    prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) showSlide(currentSlide - 1);
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            navLinks.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            if (modal.classList.contains('visible')) closeModalFunction();
        }
        if (modal.classList.contains('visible') && event.key === 'ArrowRight' && currentSlide < slides.length - 1) {
            showSlide(currentSlide + 1);
        }
        if (modal.classList.contains('visible') && event.key === 'ArrowLeft' && currentSlide > 0) {
            showSlide(currentSlide - 1);
        }
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    const revealItems = [];
    const revealSelectors = '.skill-item, .project-card, .timeline-item, .pill-list li';

    hiddenElements.forEach(container => {
        container.querySelectorAll(revealSelectors).forEach((item, index) => {
            item.classList.add('reveal-item');
            item.style.setProperty('--reveal-delay', `${Math.min(index % 8 * 55, 385)}ms`);
            revealItems.push(item);
        });
    });

    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });
        const itemObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-in');
                    itemObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

        hiddenElements.forEach(element => sectionObserver.observe(element));
        revealItems.forEach(item => itemObserver.observe(item));
    } else {
        hiddenElements.forEach(element => element.classList.add('show'));
        revealItems.forEach(item => item.classList.add('reveal-in'));
    }

    const backToTopButton = document.querySelector('.back-to-top');
    function updateBackToTop() {
        backToTopButton.classList.toggle('visible', window.scrollY > 300);
    }
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    updateBackToTop();
});