const $ = (selector) => document.querySelector(selector);

let allRecords = [];
let waterChart = null;
let rainChart = null;

const riskClass = {
  "Aman": "risk-aman",
  "Waspada": "risk-waspada",
  "Siaga": "risk-siaga",
  "Bahaya": "risk-bahaya"
};

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value);
}

function formatDate(value) {
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false
  });
}

function setRiskStatus(risk) {
  const descriptions = {
    "Aman": "Parameter di bawah ambang demo",
    "Waspada": "Perlu pemantauan lebih lanjut",
    "Siaga": "Pemantauan perlu ditingkatkan",
    "Bahaya": "Ambang bahaya demo terlampaui"
  };
  const colors = {
    "Aman": "#27976c",
    "Waspada": "#d4a027",
    "Siaga": "#e18b35",
    "Bahaya": "#d84d4d"
  };
  $("#riskValue").textContent = risk || "—";
  $("#riskDescription").textContent = descriptions[risk] || "Belum ada data";
  $("#riskDot").style.background = colors[risk] || "#9aa8b5";
  $("#riskDot").style.boxShadow = `0 0 0 4px ${risk === "Bahaya" ? "#fde8e8" : risk === "Siaga" ? "#fff0df" : risk === "Waspada" ? "#fff4d6" : "#e5f6ed"}`;
  $("#riskTag").textContent = "Aturan demo";
}

function renderMetrics(records) {
  if (!records.length) {
    ["rainValue", "waterValue", "recordValue"].forEach(id => $("#" + id).textContent = "—");
    setRiskStatus("");
    return;
  }
  const latest = records[records.length - 1];
  $("#rainValue").textContent = formatNumber(latest.curah_hujan_mm);
  $("#waterValue").textContent = formatNumber(latest.tinggi_air_cm);
  $("#recordValue").textContent = records.length;
  setRiskStatus(latest.risiko);
}

function renderCharts(records) {
  const labels = records.map(row => {
    const date = new Date(row.tanggal.replace(" ", "T"));
    return Number.isNaN(date.getTime()) ? row.tanggal : date.toLocaleTimeString("id-ID", {hour:"2-digit", minute:"2-digit", hour12:false}) + " · " + date.toLocaleDateString("id-ID", {day:"2-digit", month:"short"});
  });
  const commonOptions = {
    responsive: true, maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: "#102d46", padding: 11, titleFont: { family: "DM Sans", weight: "600" }, bodyFont: { family: "DM Sans" }, displayColors: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#8998a7", maxTicksLimit: 6, font: { family: "DM Sans", size: 9 } }, border: { display: false } },
      y: { beginAtZero: true, grid: { color: "#edf1f5", drawTicks: false }, ticks: { color: "#8998a7", padding: 9, font: { family: "DM Sans", size: 9 } }, border: { display: false } }
    }
  };

  if (waterChart) waterChart.destroy();
  if (rainChart) rainChart.destroy();

  if (typeof Chart === "undefined") {
    document.querySelectorAll(".chart-wrap").forEach(el => el.innerHTML = '<p class="empty-state">Grafik membutuhkan koneksi internet untuk memuat Chart.js.</p>');
    return;
  }

  waterChart = new Chart($("#waterChart"), {
    type: "line",
    data: { labels, datasets: [{
      data: records.map(row => row.tinggi_air_cm), borderColor: "#3284bd", backgroundColor: "rgba(50,132,189,.10)",
      fill: true, tension: .35, borderWidth: 2.5, pointRadius: records.length > 20 ? 0 : 3,
      pointHoverRadius: 5, pointBackgroundColor: "#fff", pointBorderColor: "#3284bd", pointBorderWidth: 2
    }]},
    options: {...commonOptions, scales: {...commonOptions.scales, y: {...commonOptions.scales.y, title: {display: true, text: "Tinggi air (cm)", color: "#7b8b99", font: {family:"DM Sans", size:10}}}}}
  });

  rainChart = new Chart($("#rainChart"), {
    type: "bar",
    data: { labels, datasets: [{
      data: records.map(row => row.curah_hujan_mm), backgroundColor: records.map(row => row.curah_hujan_mm >= 50 ? "#e7a34d" : "#65b7c5"),
      borderRadius: 4, borderSkipped: false, maxBarThickness: 27
    }]},
    options: {...commonOptions, scales: {...commonOptions.scales, y: {...commonOptions.scales.y, title: {display: true, text: "Curah hujan (mm)", color: "#7b8b99", font: {family:"DM Sans", size:10}}}}}
  });
}

function renderTable(records) {
  const tbody = $("#observationRows");
  $("#tableCount").textContent = `${records.length} catatan`;
  $("#tableInfo").textContent = records.length ? "Menampilkan data contoh sesuai filter." : "Tidak ada data pada filter terpilih.";
  if (!records.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Tidak ada data untuk lokasi ini.</td></tr>';
    return;
  }
  tbody.innerHTML = [...records].reverse().map(row => `
    <tr>
      <td>${escapeHtml(formatDate(row.tanggal))}</td>
      <td>${escapeHtml(row.lokasi)}</td>
      <td>${formatNumber(row.curah_hujan_mm)} mm</td>
      <td>${formatNumber(row.tinggi_air_cm)} cm</td>
      <td><span class="risk-badge ${riskClass[row.risiko] || ""}">${escapeHtml(row.risiko)}</span></td>
    </tr>`).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function renderAll(records) {
  renderMetrics(records);
  renderCharts(records);
  renderTable(records);
}

// Fungsi parse CSV sederhana untuk Static Website
function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(",");
    if (currentLine.length === headers.length) {
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        let val = currentLine[j].trim().replace(/^"|"$/g, "");
        if (!isNaN(val) && val !== "") val = Number(val);
        obj[headers[j]] = val;
      }
      result.push(obj);
    }
  }
  return result;
}

async function loadData() {
  const selectedLocation = $("#locationFilter").value || "Semua lokasi";
  $("#observationRows").innerHTML = '<tr><td colspan="5" class="loading-cell">Memuat data...</td></tr>';
  try {
    // Membaca file CSV langsung dari folder data/
    const response = await fetch('data/flood_data.csv');
    if (!response.ok) throw new Error("Gagal mengambil file CSV.");
    const csvText = await response.text();
    const parsedData = parseCSV(csvText);

    allRecords = parsedData;

    // Ambil daftar lokasi unik untuk dropdown filter
    const locations = [...new Set(parsedData.map(item => item.lokasi))];
    const locationSelect = $("#locationFilter");
    const previous = locationSelect.value;
    
    if (locationSelect.options.length <= 1) {
      locations.forEach(location => {
        const option = document.createElement("option");
        option.value = location;
        option.textContent = location;
        locationSelect.appendChild(option);
      });
      if (locations.includes(previous)) locationSelect.value = previous;
    }

    // Filter data berdasarkan lokasi yang dipilih
    const filteredRecords = selectedLocation === "Semua lokasi" 
      ? allRecords 
      : allRecords.filter(item => item.lokasi === selectedLocation);

    renderAll(filteredRecords);
  } catch (error) {
    $("#observationRows").innerHTML = `<tr><td colspan="5" class="empty-state">Gagal memuat data. ${escapeHtml(error.message)}</td></tr>`;
    $("#tableInfo").textContent = "Periksa keberadaan file data/flood_data.csv.";
  }
}

function downloadCsv() {
  if (!allRecords.length) return;
  const headers = ["tanggal", "lokasi", "curah_hujan_mm", "tinggi_air_cm", "risiko"];
  const rows = [headers.join(","), ...allRecords.map(record =>
    headers.map(key => `"${String(record[key] ?? "").replace(/"/g, '""')}"`).join(",")
  )];
  const blob = new Blob(["\uFEFF" + rows.join("\r\n")], {type: "text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "floodwatch-data.csv";
  link.click();
  URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", () => {
  $("#locationFilter").addEventListener("change", loadData);
  $("#downloadCsv").addEventListener("click", downloadCsv);
  $("#dismissNotice").addEventListener("click", () => $(".notice").remove());
  $("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  document.querySelectorAll(".nav-link").forEach(link => link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(item => item.classList.remove("active"));
    link.classList.add("active");
    $("#sidebar").classList.remove("open");
  }));
  loadData();
});
