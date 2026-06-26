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