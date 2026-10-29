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
      title: "Backuper — Multi-Vendor Network Config Backup",
      image: "./res/images/backuper-mockup.png", 
      description: "<p>Aplikasi otomasi backup konfigurasi perangkat jaringan multi-vendor secara terjadwal dan terpusat. Mendukung perangkat MikroTik, Cisco, Huawei, dan Juniper via protokol SSH aman. Dilengkapi fitur enkripsi file backup, rotasi penyimpanan, dan notifikasi status eksekusi otomatis.</p>",
      tags: ["Python", "Paramiko", "SSH", "Multi-Vendor", "Automation"],
      links: [
        { text: "Source Code", url: "https://github.com/BadRush", icon: "github" }
      ]
    },
    "logistik": {
      title: "Logistik App — Asset & Inventory Management",
      image: "./res/images/mockup-placeholder.png",
      description: "<p>Aplikasi web internal untuk manajemen inventaris aset Data Center serta perangkat jaringan (Router, Switch, SFP, Kabel Fiber, Server Bare-metal). Membantu tracking serial number, status operasional perangkat, dan alokasi site, sehingga meningkatkan efisiensi dan transparansi operasional tim NOC.</p>",
      tags: ["Web App", "Internal Tool", "Asset Tracking", "Data Center"],
      links: []
    },
    "noc-monitoring": {
      title: "NOC Centralized Monitoring Stack",
      image: "./res/images/mockup-placeholder.png",
      description: "<p>Infrastruktur monitoring terpusat untuk pemantauan performa jaringan 200+ node ISP backbone secara real-time. Memadukan SNMP polling Zabbix dan LibreNMS dengan database time-series InfluxDB serta dashboard visualisasi Grafana interaktif. Mendukung analisis traffic utilization, monitoring link BGP/upstream, serta deteksi latency spike via Smokeping.</p>",
      tags: ["Zabbix", "LibreNMS", "Grafana", "InfluxDB", "Smokeping", "PRTG", "The Dude"],
      links: []
    },
    "smoke-notifier": {
      title: "Smoke Notifier — Intelligent Telegram Alerting",
      image: "./res/images/mockup-placeholder.png",
      description: "<p>Sistem notifikasi cerdas berbasis Telegram Bot API yang berfungsi memfilter, mengelompokkan, dan meneruskan alert status jaringan dari monitoring tools (Smokeping, NMS) ke grup teknis yang relevan. Dilengkapi mekanisme deduplikasi notifikasi untuk mengeliminasi alert fatigue (spam).</p>",
      tags: ["Telegram API", "Alerting", "Python", "NOC Operations"],
      links: [
        { text: "Source Code", url: "https://github.com/BadRush/smoke-notifer", icon: "github" }
      ]
    },
    "datacenter": {
      title: "Desain & Implementasi POP Data Center",
      image: "./res/images/mockup-placeholder.png",
      description: "<p>Perancangan dan implementasi infrastruktur fisik Point of Presence (POP) Data Center internal. Mencakup perakitan server rack bare-metal, klaster virtualisasi Proxmox VE dengan penyimpanan redundansi ZFS, konfigurasi VLAN trunking antarrack, manajemen kelistrikan UPS/PDU, serta deployment VPS untuk layanan DNS recursive dan tools operasional internal.</p>",
      tags: ["Data Center POP", "Proxmox VE", "Virtualization", "ZFS", "High Availability"],
      links: []
    },
    "speedtest": {
      title: "CDN Speedtest Node & Globalping Probe",
      image: "./res/images/mockup-placeholder.png",
      description: "<p>Deployment dan tuning performa server node Speedtest resmi (Ookla & internal) serta integrasi node probe Globalping pada jaringan ISP. Melakukan optimasi throughput jaringan 10G/40G melalui kernel TCP buffer tuning pada Linux, konfigurasi BGP route policy untuk peering lokal/IXP, serta pengukuran performa latensi terdistribusi.</p>",
      tags: ["Speedtest Node", "Globalping", "Linux Kernel Tuning", "BGP Peering", "Latency Optimization"],
      links: []
    },
    "shelter": {
      title: "End-to-End Shelter Integration & BTS Tower",
      image: "./res/images/mockup-placeholder.png",
      description: "<p>Eksekusi proyek pembangunan fisik shelter BTS/Node jaringan secara terintegrasi: mulai dari perancangan diagram topologi fisik/logikal, penyusunan Rencana Anggaran Biaya (RAB), pemanjatan dan instalasi radio link pada Tower BTS, terminasi Optical Distribution Frame (ODF), hingga manajemen kelistrikan dan grounding system.</p>",
      tags: ["Topology Design", "RAB Estimation", "BTS Tower", "Hardware Install", "Power & Cabling"],
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
