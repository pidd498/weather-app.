const API = "https://api-faa.my.id/faa/cuaca";

const lokasiText = document.getElementById("lokasiText");
const infoHarian = document.getElementById("infoHarian");
const listCuaca = document.getElementById("listCuaca");
const loading = document.getElementById("loading");
const chartBox = document.getElementById("chartBox");

const kabInput = document.getElementById("kabupaten");
const kecInput = document.getElementById("kecamatan");
const desaInput = document.getElementById("desa");

let chart;

/* ===============================
   BUTTON
================================ */
document.getElementById("btnCari").onclick = () => {
  loadCuaca(kabInput.value, kecInput.value, desaInput.value);
};

document.getElementById("btnGPS").onclick = getLokasiOtomatis;

/* ===============================
   LOAD CUACA
================================ */
async function loadCuaca(kab, kec, desa) {
  if (!kab || !kec || !desa) {
    alert("Lengkapi lokasi!");
    return;
  }

  saveLokasi(kab, kec, desa);
  loading.classList.remove("hidden");

  const url = `${API}?kabupaten=${encodeURIComponent(kab)}&kecamatan=${encodeURIComponent(kec)}&desa=${encodeURIComponent(desa)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    loading.classList.add("hidden");

    if (!data.status) {
      alert(data.error);
      return;
    }

    renderData(data);
    renderChart(data.cuaca);

  } catch (err) {
    loading.classList.add("hidden");
    alert("Gagal memuat cuaca");
  }
}

/* ===============================
   RENDER
================================ */
function renderData(data) {
  lokasiText.textContent =
    `${data.lokasi.desa}, ${data.lokasi.kecamatan}, ${data.lokasi.kabupaten}`;

  infoHarian.classList.remove("hidden");
  chartBox.classList.remove("hidden");

  infoHarian.innerHTML = `
    <h3>Ringkasan Hari Ini</h3>
    <p>${data.prediksi_harian.ringkas}</p>
    <small>${data.prediksi_harian.detail}</small>
  `;

  listCuaca.innerHTML = "";
  data.cuaca.forEach(c => {
    const isHujan = c.peluang_hujan >= 30;

    listCuaca.innerHTML += `
      <div class="item ${isHujan ? "hujan" : ""}">
        <h4>${c.jam}</h4>
        <div style="font-size:28px">${c.emoji}</div>
        <p>${c.deskripsi}</p>
        <small>${c.instant.air_temperature}°C</small>
        <br>
        <small>🌧️ ${c.peluang_hujan}%</small>
      </div>
    `;
  });
}

/* ===============================
   CHART
================================ */
function renderChart(cuaca) {
  const labels = cuaca.map(c => c.jam);
  const temps = cuaca.map(c => c.instant.air_temperature);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("tempChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Suhu (°C)",
        data: temps,
        borderColor: "#38bdf8",
        fill: false,
        tension: 0.3
      }]
    }
  });
}

/* ===============================
   STORAGE
================================ */
function saveLokasi(kab, kec, desa) {
  localStorage.setItem("lokasi", JSON.stringify({ kab, kec, desa }));
}

(function init() {
  const loc = JSON.parse(localStorage.getItem("lokasi"));
  if (loc) {
    kabInput.value = loc.kab;
    kecInput.value = loc.kec;
    desaInput.value = loc.desa;
    loadCuaca(loc.kab, loc.kec, loc.desa);
  }
})();

/* ===============================
   GPS (AUTO ISI)
================================ */
function getLokasiOtomatis() {
  navigator.geolocation.getCurrentPosition(() => {
    alert(
      "Koordinat didapat.\n" +
      "Isi kabupaten, kecamatan, desa sesuai lokasi."
    );
  });
}

/* ===============================
   DARK MODE
================================ */
const darkBtn = document.getElementById("darkToggle");

darkBtn.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
  darkBtn.textContent =
    document.body.classList.contains("dark") ? "☀️" : "🌙";
};

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  darkBtn.textContent = "☀️";
}
