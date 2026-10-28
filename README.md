# Anam Badrus Salam — Portfolio Site

Website portofolio pribadi dan CV digital yang dirancang untuk menampilkan pengalaman profesional, keahlian teknis, dan proyek di bidang **Network Engineering & NOC**.

- **URL Resmi Profil**: [https://profil.anambadrus.my.id](https://profil.anambadrus.my.id)

---

## ✨ Fitur Utama
- **Modern & Premium UI**: Desain berbasis *Glassmorphism* dengan tema gelap yang elegan.
- **Fully Responsive & Mobile-First**: Dioptimalkan untuk perangkat mobile, tablet, dan desktop dengan Google Mobile-Friendly compliance.
- **Optimal Google Indexing**: Didukung XML Sitemap dengan ekstensi Google Image, `robots.txt` ramah crawler, serta schema terstruktur Schema.org `ProfilePage` & `Person`.
- **Interactive Experience**: Animasi *Scroll Reveal* dan ikon vektor interaktif menggunakan Lucide & Simple Icons.
- **Visitor Statistics**: Pelacakan statistik pengunjung situs secara *real-time* berbasis self-hosted Go microservice & JSON storage lokal (dimulai dari 24.078).
- **Quick Links**: Akses cepat ke Resume, CV Lengkap, dan kanal komunikasi (LinkedIn, GitHub, Telegram).

---

## 🛠️ Teknologi yang Digunakan
- **Frontend**: HTML5 Semantik, Modular CSS3 (Custom Design Tokens), Vanilla JavaScript.
- **Web Server**: `nginx:alpine` dengan konfigurasi *security-hardened* (Rate Limiting, HSTS, CSP, Anti-Scanning, Gzip, Real-IP Cloudflare).
- **Backend Counter**: Go (Golang) Microservice ultra-ringan (~12MB) dengan persistensi volume JSON & proteksi anti-spam cooldown 30 detik per IP.
- **Infrastruktur & Delivery**: Docker Compose (`web` + `counter` + `cloudflared`) dengan zero open inbound ports pada firewall VM.

---

## 🚀 Panduan Deployment ke Virtual Machine (VM)

Arsitektur deployment ini menggunakan pola **All-in-Docker**. Daemon `cloudflared` berjalan sebagai container pendamping yang membuat koneksi *outbound-only* ke edge Cloudflare, sehingga **port 80 dan 443 pada firewall/security group VM dapat ditutup total**.

### 1. Setup Tunnel di Cloudflare Zero Trust
1. Buka [one.dash.cloudflare.com](https://one.dash.cloudflare.com/) -> Masuk ke menu **Networks** > **Tunnels**.
2. Klik **Create a tunnel** -> Pilih **Cloudflared** -> Beri nama tunnel (contoh: `profil-vm`).
3. Pada tab **Install and run a connector**, pilih tab **Docker**. Salin string token setelah `--token` (misalnya: `eyJh...`).
4. Pada tab **Public Hostname**:
   - **Subdomain**: `profil`
   - **Domain**: `anambadrus.my.id`
   - **Path**: *(kosongkan)*
   - **Type**: `HTTP`
   - **URL**: `web:80` (merujuk ke nama service Nginx di docker-compose).
5. Klik **Save hostname**.

### 2. Deployment di VM
1. Clone repositori ke VM target:
   ```bash
   git clone -b dev https://github.com/BadRush/badrush.github.io.git /opt/profil-web
   cd /opt/profil-web
   ```
2. Buat berkas `.env` dari template:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Isi dengan token tunnel Anda:
   ```env
   TUNNEL_TOKEN=eyJh...
   PORT=4601
   ```
3. Build dan jalankan container:
   ```bash
   docker compose up -d --build
   ```
4. Verifikasi status tunnel:
   ```bash
   docker compose logs -f cloudflared
   ```
   Pastikan muncul log: `Connection registered` dan status di Cloudflare Zero Trust menunjukkan **Healthy**.

---

## 🔍 Optimalisasi Indexing Google (Google Search Console)

Setelah deployment aktif di `https://profil.anambadrus.my.id`:

1. Buka **Google Search Console** ([search.google.com/search-console](https://search.google.com/search-console)).
2. Tambahkan properti URL Prefix: `https://profil.anambadrus.my.id/`.
3. Verifikasi kepemilikan (menggunakan tag HTML yang sudah terpasang atau DNS Cloudflare TXT record).
4. Masuk ke menu **Sitemaps** -> Masukkan `sitemap.xml` -> Klik **Submit**.
5. Gunakan fitur **URL Inspection** untuk URL `https://profil.anambadrus.my.id/` dan klik **Test Live URL** untuk memvalidasi Rich Results `ProfilePage` dan respons mobile.

---

## 📁 Struktur Berkas Proyek
- `index.html`: Halaman utama portofolio & ProfilePage schema.
- `cv.html`: Halaman Curriculum Vitae lengkap.
- `resume.html`: Halaman One-Page Professional Resume.
- `sitemap.xml`: XML sitemap dengan ekstensi Google Image.
- `robots.txt`: Konfigurasi izin crawl mesin pencari & proteksi scanner.
- `nginx.conf`: Konfigurasi Nginx hardened dengan Real-IP Cloudflare, reverse proxy counter & CSP.
- `docker-compose.yml`: Orkestrasi service `web`, `counter`, dan `cloudflared`.
- `counter/`: Microservice Visitor Counter Go (Dockerfile, main.go, go.mod).
- `data/`: Volume direktori penyimpanan persisten hitungan pengunjung (`counter.json`).
- `.env.example`: Template environment variable deployment VM.
- `res/css/`: Direktori modul CSS (Base, Components, Hero, Sections, Responsive).
- `res/script.js`: Logika interaksi navigasi & modal.
- `res/images/`: Aset foto profil, ilustrasi, dan mockup proyek.

---
© 2026 Anam Badrus Salam.
