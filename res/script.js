// ===== SCROLL REVEAL =====
document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for scroll animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // ===== MOBILE NAV TOGGLE =====
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggle.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.classList.remove('active');
      });
    });
  }

  // ===== ACTIVE NAV LINK ON SCROLL =====
  const sections = document.querySelectorAll('.section[id]');
  const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateActiveNav() {
    const scrollY = window.scrollY + 100;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navItems.forEach((a) => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ===== NAVBAR BACKGROUND ON SCROLL =====
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }



  // ===== BACK TO TOP =====
  const backBtn = document.getElementById('back-to-top');
  if (backBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backBtn.classList.add('visible');
      } else {
        backBtn.classList.remove('visible');
      }
    }, { passive: true });

    backBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== SUPABASE VISITOR COUNTER =====
  const visitorCountElement = document.getElementById('visitor-count');
  if (visitorCountElement) {
    const SUPABASE_URL = 'https://sbhhepdzuhocnptkitlb.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiaGhlcGR6dWhvY25wdGtpdGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODQ3MjksImV4cCI6MjA5MzQ2MDcyOX0.LoEBXVYnZLS-hTgu6BZcg3CsmWcZ6pp5TxZkDPwpzss';
    
    // Check if user already visited in the last hour to prevent spam
    const lastVisit = localStorage.getItem('last_visit');
    const now = new Date().getTime();
    const oneHour = 60 * 60 * 1000;
    
    let shouldIncrement = true;
    if (lastVisit && (now - parseInt(lastVisit)) < oneHour) {
      shouldIncrement = false;
    }

    const endpoint = shouldIncrement ? '/rest/v1/rpc/increment_visitor' : '/rest/v1/visitor_stats?id=eq.1&select=view_count';
    const method = shouldIncrement ? 'POST' : 'GET';
    
    fetch(`${SUPABASE_URL}${endpoint}`, {
      method: method,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    })
    .then(response => {
      if (!response.ok) throw new Error('API Error');
      return response.json();
    })
    .then(data => {
      let count = 0;
      if (shouldIncrement && typeof data === 'number') {
        count = data;
        localStorage.setItem('last_visit', now.toString());
      } else if (!shouldIncrement && data && data.length > 0) {
        count = data[0].view_count;
      }
      
      if (count > 0) {
        visitorCountElement.innerHTML = count.toLocaleString('en-US');
      } else {
        visitorCountElement.innerHTML = '---';
      }
    })
    .catch(error => {
      console.error('Error fetching visitor count:', error);
      visitorCountElement.innerHTML = '---';
    });
  }
});
