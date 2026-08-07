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

  // ===== MODAL PROJECT =====
  const modal = document.getElementById('project-modal');
  const closeBtn = document.querySelector('.close-btn');
  const projectCards = document.querySelectorAll('.project-card');

  // Data proyek untuk isi modal
  const projectData = {
    "backuper": {
      title: "Backuper",
      image: "./res/images/mockup-placeholder.png", 
      description: "<p>Aplikasi otomasi backup konfigurasi perangkat jaringan multi-vendor (MikroTik, Cisco, Huawei, Juniper) secara terjadwal dan terpusat.</p><p>Masih terus dikembangkan dengan fitur tambahan.</p>",
      tags: ["Python", "SSH", "Multi-Vendor"],
      links: [
        { text: "Source Code", url: "https://github.com/BadRush", icon: "github" }
      ]
    },
    "logistik": {
      title: "Logistik App",
      image: "./res/images/mockup-placeholder.png",
      description: "<p>Aplikasi pengelola logistik internal untuk manajemen aset dan inventaris perangkat jaringan, mendukung efisiensi operasional tim NOC.</p>",
      tags: ["Web App", "Internal Tool"],
      links: []
    },
    "noc-monitoring": {
      title: "NOC Monitoring Stack",
      image: "./res/images/mockup-placeholder.png",
      description: "<p>Infrastruktur monitoring terpusat untuk pemantauan performa jaringan real-time. Memadukan Zabbix, LibreNMS, The Dude, dan PRTG, beserta visualisasi data tingkat lanjut menggunakan Grafana, InfluxDB, dan Smokeping.</p>",
      tags: ["Zabbix", "LibreNMS", "Grafana", "InfluxDB", "Smokeping", "PRTG", "The Dude"],
      links: []
    },
    "smoke-notifier": {
      title: "Smoke Notifier",
      image: "./res/images/mockup-placeholder.png",
      description: "<p>Sistem notifikasi cerdas terintegrasi Telegram untuk memfilter dan mengirimkan alert status jaringan yang relevan, meminimalkan notifikasi spam.</p>",
      tags: ["Telegram API", "Alerting", "Python"],
      links: [
        { text: "Source Code", url: "https://github.com/BadRush", icon: "github" }
      ]
    },
    "datacenter": {
      title: "Desain & Implementasi POP Data Center",
      image: "./res/images/mockup-placeholder.png",
      description: "<p>Perancangan dan setup infrastruktur Point of Presence (POP) Data Center internal. Meliputi instalasi server bare-metal, klaster Proxmox VE, deployment VPS, dan manajemen resource.</p>",
      tags: ["Data Center POP", "Proxmox", "Virtualization"],
      links: []
    },
    "speedtest": {
      title: "CDN Speedtest & Globalping",
      image: "./res/images/mockup-placeholder.png",
      description: "<p>Implementasi dan optimasi node server Speedtest serta integrasi jaringan Globalping untuk pengukuran latensi dan performa routing secara terdistribusi.</p>",
      tags: ["Speedtest Node", "Globalping", "Performance"],
      links: []
    },
    "shelter": {
      title: "End-to-End Shelter Integration",
      image: "./res/images/mockup-placeholder.png",
      description: "<p>Eksekusi pembangunan infrastruktur fisik shelter BTS/Node secara menyeluruh. Mencakup penyusunan RAB, desain topologi jaringan, instalasi hardware, penarikan kabel, hingga setup manajemen kelistrikan (power system).</p>",
      tags: ["Topology Design", "RAB Estimation", "Hardware Install", "Power & Cabling"],
      links: []
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
