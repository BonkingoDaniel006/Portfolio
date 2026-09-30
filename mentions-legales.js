document.addEventListener('DOMContentLoaded', async () => {
    const fragmentTargets = Array.from(document.querySelectorAll('[data-include]'));

    try {
        await Promise.all(fragmentTargets.map(async target => {
            const response = await fetch(target.dataset.include, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`Impossible de charger ${target.dataset.include}`);
            const fragment = document.createElement('template');
            fragment.innerHTML = await response.text();
            target.replaceWith(fragment.content);
        }));
    } catch (error) {
        document.querySelector('main').innerHTML = '<section class="section section-light"><div class="container"><h1 class="section-title">Page momentanément indisponible</h1><p>Ouvre le site avec un serveur local pour charger ses éléments communs.</p></div></section>';
        console.error(error);
        return;
    }

    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    navLinks.querySelectorAll('a[href^="#"]').forEach(link => {
        link.href = `index.html${link.getAttribute('href')}`;
    });

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
});
