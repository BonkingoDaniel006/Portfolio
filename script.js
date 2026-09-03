document.addEventListener('DOMContentLoaded', function() {

    // Gestion du menu mobile
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    // Gestion des filtres de projets
    const filterButtons = document.querySelectorAll('.project-nav .btn');
    const projectCards = document.querySelectorAll('.projects-grid .project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Gérer la classe 'active' sur les boutons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.textContent.toLowerCase();

            projectCards.forEach(card => {
                const category = card.dataset.category;
                const webDesktop = (category === 'web' || category === 'desktop');

                if (filter === 'tous' || 
                    (filter === 'iot' && category === 'iot') ||
                    (filter === 'web & desktop' && webDesktop)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Gestion de la modale de projet
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

    function showSlide(index) {
        gallerySlider.style.transform = `translateX(-${index * 100}%)`;
        currentSlide = index;
    }

    function updateNavButtons() {
        prevBtn.style.display = currentSlide === 0 ? 'none' : 'block';
        nextBtn.style.display = currentSlide === slides.length - 1 ? 'none' : 'block';
    }

    openModalButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = button.closest('.project-card');
            
            modalTitle.textContent = card.dataset.title;
            modalText.textContent = card.dataset.description;

            // Créer la galerie
            const mediaUrls = card.dataset.media.split(',');
            gallerySlider.innerHTML = '';
            slides = [];
            
            mediaUrls.forEach(url => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                if (url.includes('youtube.com/embed')) {
                    item.innerHTML = `<iframe src="${url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                } else if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url.trim())) {
                    item.innerHTML = `<video src="${url.trim()}" controls playsinline preload="metadata"></video>`;
                } else {
                    item.innerHTML = `<img src="${url.trim()}" alt="${card.dataset.title}">`;
                }
                gallerySlider.appendChild(item);
                slides.push(item);
            });
            
            showSlide(0);
            updateNavButtons();

            modal.classList.add('visible'); // Rend la modale visible
        });
    });

    function closeModalFunction() {
        modal.classList.remove('visible');
        // Arrêter les vidéos YouTube lors de la fermeture
        gallerySlider.querySelectorAll('iframe').forEach(iframe => {
            iframe.src = iframe.src;
        });
        gallerySlider.querySelectorAll('video').forEach(video => {
            video.pause();
            video.currentTime = 0;
        });
    }

    closeModal.addEventListener('click', closeModalFunction);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModalFunction();
    });
    nextBtn.addEventListener('click', () => { if(currentSlide < slides.length - 1) showSlide(currentSlide + 1); updateNavButtons(); });
    prevBtn.addEventListener('click', () => { if(currentSlide > 0) showSlide(currentSlide - 1); updateNavButtons(); });

    // Animations au défilement
    const hiddenElements = document.querySelectorAll('.hidden');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                // Optionnel: arrêter d'observer l'élément une fois qu'il est visible
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // L'élément est considéré visible à 10%
    });

    hiddenElements.forEach((el) => observer.observe(el));

    // Bouton "Retour en haut"
    const backToTopButton = document.querySelector('.back-to-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { // Affiche le bouton après 300px de défilement
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

});