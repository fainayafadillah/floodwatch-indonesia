from flask import Flask, render_template, jsonify, request
from pathlib import Path
import pandas as pd

app = Flask(__name__)
BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "flood_data.csv"

# Ambang batas ini hanya contoh untuk demonstrasi.
# Sesuaikan dengan karakteristik lokasi dan pedoman resmi sebelum penggunaan nyata.
def classify_risk(rainfall_mm, water_level_cm):
    """Klasifikasi berbasis aturan sederhana, bukan prediksi banjir tervalidasi."""
    rainfall = float(rainfall_mm)
    water = float(water_level_cm)

    if rainfall >= 100 or water >= 250:
        return "Bahaya"
    if rainfall >= 50 or water >= 180:
        return "Siaga"
    if rainfall >= 25 or water >= 120:
        return "Waspada"
    return "Aman"


def load_data():
    df = pd.read_csv(DATA_FILE)
    required = {"tanggal", "lokasi", "curah_hujan_mm", "tinggi_air_cm"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Kolom dataset tidak lengkap: {', '.join(sorted(missing))}")

    df["tanggal"] = pd.to_datetime(df["tanggal"], errors="coerce")
    df["curah_hujan_mm"] = pd.to_numeric(df["curah_hujan_mm"], errors="coerce")
    df["tinggi_air_cm"] = pd.to_numeric(df["tinggi_air_cm"], errors="coerce")
    df = df.dropna(subset=["tanggal", "lokasi", "curah_hujan_mm", "tinggi_air_cm"])
    df["risiko"] = df.apply(
        lambda row: classify_risk(row["curah_hujan_mm"], row["tinggi_air_cm"]), axis=1
    )
    return df.sort_values("tanggal")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/data")
def api_data():
    try:
        df = load_data()
        location = request.args.get("lokasi", "").strip()
        if location and location != "Semua lokasi":
            df = df[df["lokasi"] == location]

        if df.empty:
            return jsonify({"data": [], "locations": [], "message": "Tidak ada data untuk filter ini."})

        records = []
        for _, row in df.iterrows():
            records.append({
                "tanggal": row["tanggal"].strftime("%Y-%m-%d %H:%M"),
                "lokasi": str(row["lokasi"]),
                "curah_hujan_mm": float(row["curah_hujan_mm"]),
                "tinggi_air_cm": float(row["tinggi_air_cm"]),
                "risiko": str(row["risiko"]),
            })

        return jsonify({
            "data": records,
            "locations": sorted(load_data()["lokasi"].astype(str).unique().tolist()),
            "message": "Dataset contoh untuk demonstrasi; bukan data real-time."
        })
    except Exception as exc:
        app.logger.exception("Gagal memuat dataset")
        return jsonify({"error": str(exc)}), 500


if __name__ == "__main__":
    # Untuk penggunaan lokal. Jangan gunakan debug=True pada server produksi.
    app.run(host="127.0.0.1", port=5000, debug=True)
