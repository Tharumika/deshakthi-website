/* ========================================
   DESHAKTHEE LANKA - MAIN JS
   ======================================== */

// --- Navbar Scroll Effect ---
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

// --- Mobile Menu ---
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
}

// --- Active Page Highlight ---
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// --- CountUp Animation ---
function animateCountUp(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 2000;
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * (target - start) + start);
    el.textContent = current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// --- Intersection Observer for Animations ---
const observerOptions = { threshold: 0.2, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // CountUp elements
      if (entry.target.classList.contains('stat-number')) {
        animateCountUp(entry.target);
      }
      entry.target.classList.add('animated');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.stat-number').forEach(el => observer.observe(el));

// --- Testimonial Slider ---
function initTestimonialSlider() {
  const slider = document.querySelector('.testimonial-slider');
  if (!slider) return;
  const cards = slider.querySelectorAll('.testimonial-card');
  const dots = document.querySelector('.slider-dots');
  let current = 0;
  const total = cards.length;

  if (dots) {
    cards.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dots.appendChild(dot);
    });
  }

  function goTo(index) {
    current = index;
    slider.style.transform = `translateX(-${current * 100}%)`;
    if (dots) {
      dots.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }
  }

  setInterval(() => goTo((current + 1) % total), 5000);
}
initTestimonialSlider();

// --- Form Validation & Supabase Integration ---
// IMPORTANT: Replace these with your actual Supabase project URL and anon key!
// You also need to create a table named 'contact_messages' in your Supabase database 
// with columns: full_name (text), email (text), phone (text), subject (text), message (text).
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

let supabaseClient = null;
if (typeof window.supabase !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE') {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function initFormValidation() {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;
    
    // Validate required fields
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#ef4444';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });
    
    if (valid) {
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      btn.disabled = true;

      try {
        // Collect form data
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        // If Supabase is configured, send to backend
        if (supabaseClient) {
          const { data, error } = await supabaseClient
            .from('contact_messages')
            .insert([
              { 
                full_name: fullName, 
                email: email, 
                phone: phone, 
                subject: subject, 
                message: message 
              }
            ]);
            
          if (error) throw error;
        } else {
          // If Supabase isn't setup yet, simulate network request for testing
          console.warn("Supabase is not configured yet. Simulating success.");
          await new Promise(resolve => setTimeout(resolve, 800));
        }

        // Show Success Message
        btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        btn.style.background = 'linear-gradient(135deg, var(--accent), var(--accent-light))';
        
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.disabled = false;
          form.reset();
        }, 3000);

      } catch (error) {
        console.error('Error submitting form:', error);
        btn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error! Try Again.';
        btn.style.background = '#ef4444';
        
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }
    }
  });
}
initFormValidation();

// --- Typed Text Effect ---
function initTypedText() {
  const el = document.querySelector('.typed-text');
  if (!el) return;
  const texts = JSON.parse(el.getAttribute('data-texts') || '[]');
  if (!texts.length) return;
  let textIndex = 0, charIndex = 0, isDeleting = false;

  function type() {
    const currentText = texts[textIndex];
    if (isDeleting) {
      el.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
    }

    let speed = isDeleting ? 30 : 60;
    if (!isDeleting && charIndex === currentText.length) {
      speed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      speed = 500;
    }
    setTimeout(type, speed);
  }
  type();
}
initTypedText();

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
