/* ==========================================
   ZIEL IMPORTS — Site Interactivity
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // === Navbar Scroll Effect & Floating WhatsApp ===
  const navbar = document.getElementById('navbar');
  const whatsappFloat = document.getElementById('whatsappFloat');
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    if (whatsappFloat) {
      if (window.scrollY > 350) {
        whatsappFloat.classList.add('visible');
      } else {
        whatsappFloat.classList.remove('visible');
      }
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Check initial state

  // === Mobile Menu Toggle ===
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');
  
  const toggleMenu = () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    navOverlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  };
  
  menuToggle.addEventListener('click', toggleMenu);
  navOverlay.addEventListener('click', toggleMenu);
  
  // Close menu on link click
  navLinks.querySelectorAll('a:not(.nav-cta)').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('active')) {
        toggleMenu();
      }
    });
  });

  // === Smooth Scroll for anchor links ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // === Scroll Animations (Intersection Observer) ===
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Staggered animation for grid items
        const parent = entry.target.closest('.products-grid, .differentials-grid, .about-features');
        if (parent) {
          const siblings = parent.querySelectorAll('.animate-on-scroll');
          siblings.forEach((sibling, index) => {
            sibling.style.transitionDelay = `${index * 0.1}s`;
          });
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });

  // === Counter Animation ===
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('.counter-number, .number');
        counters.forEach(counter => {
          animateCounter(counter);
        });
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  
  const counterSection = document.getElementById('counters');
  if (counterSection) {
    counterObserver.observe(counterSection);
  }
  
  // Also observe about stats
  document.querySelectorAll('.about-stats').forEach(el => {
    counterObserver.observe(el);
  });
  
  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const suffix = element.getAttribute('data-suffix') || '';
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeOut);
      
      element.textContent = current.toLocaleString('pt-BR') + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target.toLocaleString('pt-BR') + suffix;
      }
    }
    
    requestAnimationFrame(update);
  }

  // === Lightbox for Social Proof Images ===
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  
  document.querySelectorAll('.social-proof-item, .operacao-image-wrapper').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });
  
  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  };
  
  lightboxClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  // === Active Nav Link Highlight ===
  const sections = document.querySelectorAll('section[id]');
  
  const highlightNav = () => {
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.querySelectorAll('a').forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${id}`) {
            link.style.color = 'var(--gold-light)';
          }
        });
      }
    });
  };
  
  window.addEventListener('scroll', highlightNav, { passive: true });

  // === Parallax-like subtle effect on hero particles ===
  const particles = document.querySelectorAll('.particle');
  
  if (window.matchMedia('(min-width: 768px)').matches) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      
      particles.forEach((particle, index) => {
        const factor = (index + 1) * 0.3;
        particle.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    }, { passive: true });
  }

  // === Social Proof Scroll - Pause on hover ===
  const socialProofTrack = document.getElementById('socialProofTrack');
  if (socialProofTrack) {
    // Adjust animation duration based on content width
    const itemCount = socialProofTrack.children.length / 2; // Half because duplicated
    const duration = Math.max(30, itemCount * 4); // 4 seconds per item minimum
    socialProofTrack.style.animationDuration = `${duration}s`;
  }

  // === Typing effect for hero subtitle (subtle) ===
  // Already handled by CSS animations, no JS needed

  // === Operação Slider (Album) ===
  const slides = document.querySelectorAll('.operacao-slide-card');
  const prevBtn = document.getElementById('operacao-prev');
  const nextBtn = document.getElementById('operacao-next');
  let currentSlide = 0;

  if (slides.length > 0) {
    const showSlide = (n) => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (n + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
      });
    }

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    const sliderEl = document.getElementById('operacaoSlider');

    if (sliderEl) {
      sliderEl.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      sliderEl.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });
    }

    const handleSwipe = () => {
      const swipeThreshold = 50;
      if (touchStartX - touchEndX > swipeThreshold) {
        // Swipe left -> next
        showSlide(currentSlide + 1);
      } else if (touchEndX - touchStartX > swipeThreshold) {
        // Swipe right -> prev
        showSlide(currentSlide - 1);
      }
    };
  }

  // === Console Easter Egg ===
  console.log(
    '%c🏆 Ziel Imports %c— Site desenvolvido com ❤️',
    'color: #D4AF6E; font-size: 20px; font-weight: bold; font-family: Georgia, serif;',
    'color: #A0A0A0; font-size: 14px;'
  );
});
