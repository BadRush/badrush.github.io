---
title: "Setup Hotspot MikroTik: Panduan Ringkas & Skenario Penerapan Nyata"
excerpt: "Panduan ringkas cara setting Hotspot (Captive Portal) di MikroTik, lengkap dengan trik manajemen bandwidth, bypass MAC Address, pengaturan trial, hingga script eksekusi instan untuk kafe, hotel, maupun kampus."
tags: mikrotik, hotspot, captive portal, tutorial jaringan, wifi publik, mikhmon
slug: setup-hotspot-mikrotik-lengkap
---

# Setup Hotspot MikroTik: Panduan Ringkas & Skenario Penerapan

Hotspot MikroTik (atau *Captive Portal*) menahan koneksi internet sampai pengguna berhasil melewati halaman login. Fitur ini sangat ideal untuk mengelola akses WiFi di area publik. Sebelum memulai, pastikan router Anda sudah terkoneksi ke internet.

## 1. Setup Tercepat (Menggunakan Wizard)

Cara paling praktis adalah menggunakan fitur **Hotspot Setup** di Winbox. Berikut panduan langkah demi langkah beserta contoh inputnya:

1. Buka menu **IP → Hotspot** lalu klik **Hotspot Setup**.
2. **Hotspot Interface:** Pilih interface yang mengarah ke klien. (Contoh: `wlan1`).
3. **Local Address of Network:** Biarkan IP yang otomatis terisi dan centang opsi *Masquerade Network*. (Contoh: `192.168.50.1/24`).
4. **Address Pool of Network:** Ini adalah rentang IP yang akan dibagikan ke klien. (Contoh: `192.168.50.10 - 192.168.50.254`).
5. **Select Certificate:** Pilih `none` untuk saat ini (kecuali Anda punya sertifikat HTTPS).
6. **DNS Servers:** Biarkan default atau isi dengan DNS publik. (Contoh: `8.8.8.8`).
7. **DNS Name (Penting!):** Jangan dikosongkan. Isi dengan domain lokal agar halaman login otomatis muncul di HP modern. (Contoh: `login.hotspotku.net`).
8. **Name of Local Hotspot User:** Buat satu akun untuk *testing*. (Contoh username: `tamu`, password: `123`).

## 2. Mengontrol Pengguna (Limit & Bypass)

Hotspot standar memperlakukan semua pengguna sama. Untuk manajemen yang lebih baik, gunakan fitur lanjutan ini:

*   **User Profile:** Mengatur batas kecepatan dan batas perangkat per akun (*Shared Users*). Format kecepatan adalah `Upload/Download`. Contoh: `15M/50M` (15 Mbps Upload, 50 Mbps Download) — sangat lega untuk kebutuhan masa kini.
*   **IP Binding:** Mem-bypass perangkat tertentu agar langsung terkoneksi ke internet tanpa login. Cukup masukkan MAC Address perangkat (seperti Smart TV, mesin absensi, atau CCTV) dan set *Type* ke `bypassed`.
*   **Walled Garden:** Mengizinkan pengguna mengakses website tertentu (seperti portal kampus atau *payment gateway*) meski mereka belum login. Masukkan domain di kolom *Dst. Host* dengan awalan `*` (contoh: `*.kampus.ac.id`).

## 3. Skenario Penerapan Nyata

Berikut adalah contoh bagaimana fitur-fitur di atas digabungkan di lapangan, dengan alokasi *bandwidth* masa kini yang sudah lancar untuk *streaming* 4K:

**🏨 Hotel (120 Kamar)**
Selain profil di bawah, Smart TV di setiap kamar di-bypass via **IP Binding**, dan website resmi hotel dibuka via **Walled Garden**.

| Profile | Rate Limit (Up/Down) | Shared Users | Keterangan |
|---|---|---|---|
| `Tamu-Standard` | 15M/30M | 3 | Stabil untuk YouTube/Netflix 4K (3 perangkat/kamar). |
| `Tamu-VIP` | 30M/100M | 5 | Akses ultra-cepat untuk tamu Suite. |

**🎓 Kampus (Dua Zona)**
Menggunakan dua jaringan Hotspot di VLAN berbeda. Printer lab di-bypass via **IP Binding**. Portal akademik kampus bebas diakses via **Walled Garden**.

| Profile | Rate Limit (Up/Down) | Shared Users | Keterangan |
|---|---|---|---|
| `Mahasiswa` | 10M/25M | 1 | Cukup untuk riset dan kelas online (1 perangkat/mhs). |
| `Dosen` | 20M/50M | 2 | Prioritas koneksi tinggi untuk keperluan mengajar. |

**🏙️ WiFi Publik Taman Kota**
Menggunakan satu akun massal. Website pemkot (`*.kotahebat.go.id`) dibuka bebas via **Walled Garden**.

| Profile | Rate Limit (Up/Down) | Shared Users | Session Timeout |
|---|---|---|---|
| `Publik` | 10M/20M | 100 | Di-logout paksa tiap 2 jam agar bergantian. |

## 4. Tips & Trik Optimasi Hotspot

Agar operasional Hotspot lebih mulus dan ramah pengguna, terapkan beberapa pengaturan berikut:

*   **Login Otomatis (MAC Cookie):** Agar pengguna tak perlu memasukkan sandi berulang kali setiap hari, gunakan fitur MAC Cookie. Buka **IP → Hotspot → Server Profiles**, klik profil Anda, masuk ke tab *Login*. Centang opsi **MAC Cookie** dan atur *MAC Cookie Timeout* (misalnya `30d 00:00:00` untuk login otomatis selama sebulan).
*   **Fitur Trial (Coba Gratis):** Ingin pengunjung bisa internetan gratis 30 menit sebelum disuruh beli voucher? Di tab *Login* pada *Server Profiles*, centang opsi **Trial**. Atur *Trial Uptime Limit* ke `00:30:00` (30 menit) dan *Trial Uptime Reset* ke `1d 00:00:00` (reset harian).
*   **Session Timeout & Idle Timeout:** Menghemat IP dan membatasi waktu. Atur di **User Profiles**. *Session Timeout* (`02:00:00`) akan memutus total pengguna setelah 2 jam. Sedangkan *Idle Timeout* (`00:10:00`) akan menendang pengguna yang tertidur (AFK/tidak ada traffic) selama 10 menit.
*   **Cetak Voucher Massal (Gunakan Mikhmon):** Jika Anda mengelola Warkop atau RT/RW Net, jangan buat akun satu per satu di Winbox. Gunakan aplikasi gratis populer bernama **Mikhmon** (MikroTik Hotspot Monitor). Aplikasi ini dihubungkan ke router Anda untuk *generate* dan mencetak ratusan voucher (lengkap dengan QR Code) dalam sekali klik.
*   **Tampilan Halaman Login (HTTPS & Kustomisasi):** Tampilan bawaan bisa diubah dengan *drag-and-drop* folder `hotspot` dari menu **Files** ke komputer Anda untuk diedit file HTML-nya. Selain itu, agar tulisan "Not Secure" hilang di browser HP klien saat login, Anda perlu meng-install **SSL Certificate** ke dalam MikroTik (di menu `IP → Services` dan set sertifikatnya di pengaturan Hotspot Profile).
*   **Troubleshooting Halaman Login Tidak Muncul:** Ini adalah masalah paling sering terjadi. Penyebab utamanya karena kolom DNS Name dibiarkan kosong saat *setup*. Jika login tidak *pop-up*, arahkan pengunjung untuk mengetik **DNS Name** yang telah dibuat secara manual di browser (contoh: `http://login.hotspotku.net`). Ingatkan pengguna untuk mengetik menggunakan `http://` karena `https://` sering ditolak browser jika belum dipasang sertifikat SSL.

## 5. Konfigurasi Instan via Terminal

Jika Anda lebih suka eksekusi cepat, sesuaikan dan *copy-paste* skrip berikut ke terminal Winbox:

```routeros
# Set IP dan buat DHCP Server
/ip address add address=192.168.50.1/24 interface=wlan1
/ip pool add name=hs-pool ranges=192.168.50.10-192.168.50.254
/ip dhcp-server add address-pool=hs-pool interface=wlan1 name=dhcp-hotspot
/ip dhcp-server network add address=192.168.50.0/24 dns-server=8.8.8.8 gateway=192.168.50.1

# Setup Hotspot Server & Profile (Aktifkan MAC Cookie & Trial 30 Menit)
/ip hotspot profile add name=hsprof1 hotspot-address=192.168.50.1 dns-name="login.hotspotku.net" html-directory=hotspot login-by=cookie,mac-cookie,http-chap,trial trial-uptime-limit=30m trial-uptime-reset=1d mac-cookie-timeout=30d
/ip hotspot add name=hotspot1 interface=wlan1 address-pool=hs-pool profile=hsprof1 disabled=no

# Buat User Profile & Akun (Bandwidth Besar)
/ip hotspot user profile add name="Paket-Standard" rate-limit="15M/30M" shared-users=1 idle-timeout=10m
/ip hotspot user add name="tamu" password="123" profile="Paket-Standard" server=hotspot1

# Bypass & Walled Garden
/ip hotspot ip-binding add mac-address=AA:BB:CC:DD:EE:F1 type=bypassed comment="Smart TV"
/ip hotspot walled-garden add dst-host="*.kotahebat.go.id" action=allow
```
