# WebAR Experience with MindAR & Three.js 🕶️

![MindAR](https://img.shields.io/badge/MindAR-JS-blue?style=for-the-badge)
![Three.js](https://img.shields.io/badge/Three.js-3D-black?style=for-the-badge)

Project ini adalah implementasi **Web Augmented Reality (WebAR)** menggunakan library **MindAR** untuk *image tracking* dan **Three.js** untuk rendering objek 3D. Aplikasi ini berjalan langsung di browser tanpa perlu install aplikasi tambahan.

## Fitur
- **Marker Based Tracking:** Kamera akan mendeteksi gambar target (marker) dan memunculkan objek 3D di atasnya.
- **3D Rendering:** Menggunakan Three.js untuk menampilkan model 3D (GLTF/GLB).
- **Interactive:** Mendukung interaksi sentuh pada objek AR.
- **Cross-Platform:** Bisa dijalankan di Android & iOS (Safari/Chrome).

## Teknologi
- **MindAR:** Library tracking wajah/gambar yang ringan.
- **Three.js:** Library 3D JavaScript terpopuler.
- **HTML5 & CSS3:** Struktur dasar web.

## Cara Menjalankan (Local)

Karena WebAR membutuhkan akses kamera, project ini **harus dijalankan via HTTPS** atau **Localhost**. Tidak bisa hanya *double click* file HTML.

### Opsi 1: Menggunakan VS Code (Live Server)
1. Install ekstensi **Live Server** di VS Code.
2. Buka file `index.html`.
3. Klik kanan -> **Open with Live Server**.
4. Izinkan akses kamera browser.

### Opsi 2: Menggunakan XAMPP
1. Taruh folder project di `htdocs`.
2. Nyalakan Apache di XAMPP Control Panel.
3. Buka browser: `http://localhost/NAMA_FOLDER_KAMU`.

## Cara Penggunaan
1. Buka aplikasi di browser HP/Laptop.
2. Izinkan akses kamera ketika diminta.
3. Arahkan kamera ke **Target Image / Marker** (biasanya file `.mind` atau gambar target yang sudah disiapkan di folder `assets`).
4. Objek 3D akan muncul di atas gambar!

---
*Dikembangkan oleh [Hamid Abdul Aziz](https://github.com/HAMIDUMMAZIDUN)*


