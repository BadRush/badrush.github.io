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

  // ===== SELF-HOSTED REAL-TIME VISITOR COUNTER =====
  const visitorCountElement = document.getElementById('visitor-count');
  if (visitorCountElement) {
    const DEFAULT_BASELINE = 24078;
    
    // Render instan dari cache lokal atau nilai dasar agar tampilan cepat tanpa kedip
    const cachedCount = localStorage.getItem('cached_visitor_count');
    const initialDisplay = cachedCount ? parseInt(cachedCount, 10) : DEFAULT_BASELINE;
    visitorCountElement.textContent = initialDisplay.toLocaleString('id-ID');

    // Kirim request ke backend counter lokal via reverse proxy Nginx (/api/visitors).
    // Backend Go memvalidasi cooldown 30 detik per IP pengunjung secara in-memory.
    fetch('/api/visitors', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (data && typeof data.count === 'number') {
          visitorCountElement.textContent = data.count.toLocaleString('id-ID');
          localStorage.setItem('cached_visitor_count', data.count.toString());
        }
      })
      .catch(error => {
        console.warn('Visitor counter local sync notice:', error);
        const fallback = localStorage.getItem('cached_visitor_count') || DEFAULT_BASELINE;
        visitorCountElement.textContent = Number(fallback).toLocaleString('id-ID');
      });
  }

  // ===== MODAL PROJECT =====
  const modal = document.getElementById('project-modal');
  const closeBtn = document.querySelector('.close-btn');
  const projectCards = document.querySelectorAll('.project-card');

  // Data proyek untuk isi modal
  const projectData = {
    "backuper": {
      title: "Backuper",
      image: "./res/images/backuper-mockup.png", 
      description: "<p>Aplikasi otomasi backup konfigurasi perangkat jaringan multi-vendor (MikroTik, Cisco, Huawei, Juniper) secara terjadwal dan terpusat.</p><p>Masih terus dikembangkan dengan fitur tambahan.</p>",
      tags: ["Python", "SSH", "Multi-Vendor"]
    },
    "logistik": {
      title: "Logistik App",
      image: "./res/images/mockup-placeholder.png",
      description: "<p>Aplikasi web internal untuk manajemen inventaris aset Data Center serta perangkat jaringan, mendukung efisiensi operasional tim NOC.</p>",
      tags: ["Web App", "Internal Tool"],
      links: []
    },
    "smoke-notifier": {
      title: "Smoke Notifier",
      image: "./res/images/mockup-placeholder.png",
      description: "<p>Sistem notifikasi cerdas terintegrasi Telegram untuk memfilter dan mengirimkan alert status jaringan yang relevan, meminimalkan notifikasi spam.</p>",
      tags: ["Telegram API", "Alerting", "Python"],
      links: [
        { text: "Source Code", url: "https://github.com/BadRush/smoke-notifer", icon: "github" }
      ]
    }
  };

  if (modal && closeBtn) {
    // Fungsi buka modal
    projectCards.forEach(card => {
      card.addEventListener('click', () => {
        const projectId = card.getAttribute('data-project');
        if (!projectId || !projectData[projectId]) return;
        
        const data = projectData[projectId];
        
        // Isi konten modal
        document.getElementById('modal-title').textContent = data.title;
        document.getElementById('modal-image').src = data.image;
        document.getElementById('modal-image').style.display = data.image ? 'block' : 'none';
        
        document.getElementById('modal-description').innerHTML = data.description;
        
        // Render tags
        const tagsHtml = data.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('');
        document.getElementById('modal-tags').innerHTML = tagsHtml;
        
        // Render links
        let linksHtml = '';
        if (data.links && data.links.length > 0) {
          linksHtml = data.links.map(link => {
            return `<a href="${link.url}" target="_blank" class="modal-link-btn">
                      <i data-lucide="${link.icon}" class="icon"></i> ${link.text}
                    </a>`;
          }).join('');
        }
        document.getElementById('modal-links').innerHTML = linksHtml;
        
        // Re-init lucide icons for newly added HTML
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
        
        // Tampilkan modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // cegah scroll background
      });
    });

    // Fungsi tutup modal
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto'; // kembalikan scroll
    });

    // Tutup jika klik area di luar konten modal
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
      }
    });
  }
});
