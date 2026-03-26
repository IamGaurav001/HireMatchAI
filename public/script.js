document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mock Chat Animation Sequence
    const typingIndicator = document.querySelector('.typing-indicator');
    const matchResult = document.querySelector('.match-result');
    
    // Simulate typing delay before showing result
    setTimeout(() => {
        if(typingIndicator && matchResult) {
            typingIndicator.style.display = 'none';
            matchResult.classList.remove('hidden');
        }
    }, 4500); // 4.5 seconds delay

    // Add entry animations on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply animation to feature cards and step cards
    const animatedElements = document.querySelectorAll('.feature-card, .step-card, .section-header');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
});
