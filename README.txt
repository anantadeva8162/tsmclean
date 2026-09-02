# TSM CLEAN — Website Pendaftaran

Website statis untuk GitHub Pages + Google Sheets/Apps Script sebagai backend.

## File
- index.html — halaman website
- style.css — desain
- script.js — koneksi frontend ke Apps Script
- apps-script.gs — backend Google Apps Script

## Setup singkat
1. Buat Google Sheet baru.
2. Extensions > Apps Script.
3. Paste isi apps-script.gs.
4. Simpan.
5. Deploy > New deployment > Web app.
6. Execute as: Me.
7. Who has access: Anyone.
8. Copy URL Web App.
9. Buka script.js dan ganti:
   PASTE_URL_APPS_SCRIPT_DI_SINI
   dengan URL Web App.
10. Upload index.html, style.css, script.js ke GitHub.
11. Aktifkan GitHub Pages dari Settings > Pages > Deploy from branch.

Kuota maksimal di backend: 30.
