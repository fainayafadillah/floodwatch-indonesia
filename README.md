# FloodWatch Indonesia

Dashboard prototipe untuk memantau dan mengklasifikasikan risiko banjir berdasarkan curah hujan dan tinggi muka air. Proyek ini dibuat sebagai studi kasus penerapan komputasi untuk tantangan lokal, sesuai tema kuliah tamu tentang HPC.

## Fitur
- Ringkasan data curah hujan dan tinggi muka air.
- Klasifikasi risiko berbasis aturan: Aman, Waspada, Siaga, dan Bahaya.
- Grafik historis interaktif.
- Filter berdasarkan lokasi.
- Tabel data pengamatan.
- API sederhana menggunakan Flask.

## Teknologi
- HTML5 dan CSS3
- JavaScript
- Python + Flask
- Pandas
- Chart.js melalui CDN

## Menjalankan di komputer
Pastikan Python 3.10 atau lebih baru sudah terpasang.

1. Ekstrak ZIP dan buka folder `floodwatch-indonesia`.
2. Buat virtual environment (opsional tetapi disarankan):

   ```bash
   python -m venv .venv
   ```

3. Aktifkan virtual environment:

   **Windows**
   ```bash
   .venv\\Scripts\\activate
   ```

   **macOS/Linux**
   ```bash
   source .venv/bin/activate
   ```

4. Instal dependensi:

   ```bash
   pip install -r requirements.txt
   ```

5. Jalankan aplikasi:

   ```bash
   python app.py
   ```

6. Buka https://fainayafadillah.github.io/floodwatch-indonesia/#dashboard di browser.

## Struktur folder
```text
floodwatch-indonesia/
├── css
   ├── style.css
├── README.md
├── data/
   └── flood_data.csv
├── js
   └── script.js
├── README.md
├── index.html
 

## Dataset dan keterbatasan
`data/flood_data.csv` berisi data ilustrasi/simulasi untuk menguji aplikasi, bukan pengukuran sungai aktual dan bukan data real-time. Ambang klasifikasi di `app.py` juga hanya contoh. Untuk pemakaian nyata, gunakan data dari sumber yang dapat diverifikasi, tentukan ambang bersama pihak berwenang/ahli hidrologi, dan validasi model dengan data historis.

Versi ini adalah **klasifikasi risiko berbasis aturan**, bukan model prediksi banjir yang telah tervalidasi dan bukan sistem peringatan dini resmi. Penggunaan HPC belum diterapkan dalam prototipe; pengembangan HPC dapat dipertimbangkan bila volume data atau kebutuhan komputasi meningkat.

## Upload ke GitHub
Buat repository bernama `floodwatch-indonesia`, lalu unggah seluruh isi folder ini. Jangan unggah folder `.venv`.
