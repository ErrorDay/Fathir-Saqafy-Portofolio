Portfolio (HTML statis) - hasil konversi dari template Astro "dark-minimal"

Cara pakai: buka index.html (klik dua kali) di browser.

Struktur:
  index.html      -> halaman utama
  css/style.css   -> semua gaya (hasil build Tailwind)
  js/main.js      -> interaksi (navbar, accordion, animasi huruf, like, form)
  fonts/ svg/ favicon.png og.image.png -> aset

Yang perlu diganti dengan data kamu:
  - "Your Name", "Your country", deskripsi, link GitHub/LinkedIn/email di index.html
  - Gambar proyek (placehold.co) di bagian Projects
  - Form kontak menggunakan Formspree; atur dan verifikasi email penerima di akun Formspree
  - Tombol Like menyimpan hitungan di localStorage browser (versi asli memakai Firebase)
