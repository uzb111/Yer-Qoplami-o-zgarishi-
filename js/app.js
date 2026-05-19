const VILOYAT_AREA_KM2 = 15100;
const YEARS = ["2017", "2020", "2024"];
const NS = "http://www.w3.org/2000/svg";

const CLASSES = [
  { key: "water",     name: "Suv",                   color: [44,  123, 182], hex: "#2c7bb6" },
  { key: "dense_veg", name: "Zich vegetatsiya",       color: [35,  139,  69], hex: "#238b45" },
  { key: "crop_veg",  name: "Ekinzor / siyrak veg.",  color: [166, 217, 106], hex: "#a6d96a" },
  { key: "bare",      name: "Yalang yer / qurilish",  color: [189, 135,  82], hex: "#bd8752" },
];

const ALL_CLASSIFY = [
  ...CLASSES,
  { key: "cloud", color: [190, 190, 190] },
];

// ── Pixel analysis ────────────────────────────────────────

function colorDistSq(r, g, b, cr, cg, cb) {
  return (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
}

function classifyPixel(r, g, b) {
  let minD = Infinity, best = null;
  for (const cls of ALL_CLASSIFY) {
    const d = colorDistSq(r, g, b, ...cls.color);
    if (d < minD) { minD = d; best = cls; }
  }
  return minD < 8100 ? best : null; // threshold: 90² = 8100
}

function analyzeImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const STEP = 5;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      let px;
      try {
        px = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      } catch (e) {
        reject(e);
        return;
      }
      const counts = { water: 0, dense_veg: 0, crop_veg: 0, bare: 0, cloud: 0 };
      let valid = 0;
      for (let i = 0; i < px.length; i += 4 * STEP) {
        const r = px[i], g = px[i + 1], b = px[i + 2];
        if (r >= 238 && g >= 238 && b >= 238) continue; // no-data oq
        const cls = classifyPixel(r, g, b);
        if (cls && cls.key in counts) { counts[cls.key]++; valid++; }
      }
      const result = {};
      Object.keys(counts).forEach(k => {
        result[k] = valid > 0 ? (counts[k] / valid) * 100 : 0;
      });
      resolve(result);
    };
    img.onerror = () => reject(new Error("Rasm yuklanmadi: " + src));
    img.src = src;
  });
}

// ── SVG chart ─────────────────────────────────────────────

function svgEl(tag, attrs = {}, text = "") {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text) e.textContent = text;
  return e;
}

const CM = { l: 44, r: 14, t: 16, b: 32 };
const CVW = 330, CVH = 205;
const CW = CVW - CM.l - CM.r;  // 272
const CH = CVH - CM.t - CM.b;  // 157

const X_YEAR = {
  "2017": CM.l,
  "2020": CM.l + CW / 2,
  "2024": CM.l + CW,
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function buildChart(allStats, currentYear) {
  const svg = document.getElementById("lineChart");
  svg.setAttribute("viewBox", `0 0 ${CVW} ${CVH}`);
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  let maxVal = 10;
  CLASSES.forEach(cls => {
    YEARS.forEach(yr => {
      maxVal = Math.max(maxVal, allStats[yr]?.[cls.key] ?? 0);
    });
  });
  maxVal = Math.ceil(maxVal / 10) * 10;

  const yS = v => CM.t + CH - (v / maxVal) * CH;
  const yBottom = CM.t + CH;

  // Grid lines + Y labels (4 steps)
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const v = (maxVal / steps) * i;
    const y = yS(v);
    svg.appendChild(svgEl("line", {
      x1: CM.l, y1: y, x2: CM.l + CW, y2: y,
      stroke: i === 0 ? "#3a4a3d" : "#263028",
      "stroke-width": i === 0 ? "1" : "0.7",
    }));
    if (i % 2 === 0 || i === steps) {
      svg.appendChild(svgEl("text", {
        x: CM.l - 6, y: y + 4,
        "text-anchor": "end", fill: "#5a7a5e", "font-size": "9.5",
      }, `${Math.round(v)}%`));
    }
  }

  // Year indicator rect (CSS animated)
  const indicator = svgEl("rect", {
    id: "yearIndicator",
    x: "-1", y: CM.t.toString(),
    width: "2", height: CH.toString(),
    fill: "#3fd67a", opacity: "0.5",
  });
  indicator.style.transform = `translateX(${X_YEAR[currentYear]}px)`;
  svg.appendChild(indicator);

  // Area fills (under lines, semi-transparent)
  CLASSES.forEach(cls => {
    const pts = YEARS.map(yr => {
      const v = allStats[yr]?.[cls.key] ?? 0;
      return { x: X_YEAR[yr], y: yS(v) };
    });
    const d = `M${pts[0].x},${yBottom} L${pts[0].x},${pts[0].y} L${pts[1].x},${pts[1].y} L${pts[2].x},${pts[2].y} L${pts[2].x},${yBottom} Z`;
    svg.appendChild(svgEl("path", {
      d, fill: `rgba(${hexToRgb(cls.hex)},0.1)`, stroke: "none",
    }));
  });

  // Lines
  CLASSES.forEach(cls => {
    const points = YEARS.map(yr => {
      const v = allStats[yr]?.[cls.key] ?? 0;
      return `${X_YEAR[yr]},${yS(v)}`;
    }).join(" ");
    svg.appendChild(svgEl("polyline", {
      points, fill: "none",
      stroke: cls.hex, "stroke-width": "2",
      "stroke-linejoin": "round", "stroke-linecap": "round",
      opacity: "0.95",
    }));
  });

  // Dots
  CLASSES.forEach(cls => {
    YEARS.forEach(yr => {
      const v = allStats[yr]?.[cls.key] ?? 0;
      const active = yr === currentYear;
      svg.appendChild(svgEl("circle", {
        id: `dot-${yr}-${cls.key}`,
        cx: X_YEAR[yr], cy: yS(v),
        r: active ? "5" : "3.2",
        fill: cls.hex,
        stroke: active ? "#0b100c" : "rgba(11,16,12,0.5)",
        "stroke-width": active ? "1.8" : "1",
        opacity: active ? "1" : "0.65",
      }));
    });
  });

  // X axis year labels
  YEARS.forEach(yr => {
    const active = yr === currentYear;
    svg.appendChild(svgEl("text", {
      id: `yearLabel-${yr}`,
      x: X_YEAR[yr], y: CM.t + CH + 20,
      "text-anchor": "middle",
      fill: active ? "#e4ede5" : "#5a7a5e",
      "font-size": active ? "11" : "10",
      "font-weight": active ? "800" : "400",
    }, yr));
  });

  // Legend
  const legendRow = document.getElementById("chartLegendRow");
  legendRow.innerHTML = "";
  CLASSES.forEach(cls => {
    const item = document.createElement("div");
    item.className = "chart-legend-item";
    item.innerHTML = `<i style="background:${cls.hex}"></i>${cls.name}`;
    legendRow.appendChild(item);
  });
}

function updateChartYear(year, allStats) {
  // Indicator smooth slide
  const indicator = document.getElementById("yearIndicator");
  if (indicator) {
    indicator.style.transform = `translateX(${X_YEAR[year]}px)`;
  }

  // Dot highlight
  CLASSES.forEach(cls => {
    YEARS.forEach(yr => {
      const dot = document.getElementById(`dot-${yr}-${cls.key}`);
      if (!dot) return;
      const active = yr === year;
      dot.setAttribute("r", active ? "4" : "2.8");
      dot.setAttribute("opacity", active ? "1" : "0.5");
      dot.setAttribute("stroke", active ? "#0d120e" : "none");
    });
  });

  // Year label highlight
  YEARS.forEach(yr => {
    const lbl = document.getElementById(`yearLabel-${yr}`);
    if (!lbl) return;
    const active = yr === year;
    lbl.setAttribute("fill", active ? "#e4ede5" : "#7a9b7e");
    lbl.setAttribute("font-weight", active ? "700" : "400");
  });

  // Readout fade-swap
  if (allStats && allStats[year]) {
    const readout = document.getElementById("chartReadout");
    readout.style.opacity = "0";
    setTimeout(() => {
      const s = allStats[year];
      const veg = (s.dense_veg + s.crop_veg).toFixed(1);
      const vegKm2 = Number(((veg / 100) * VILOYAT_AREA_KM2).toFixed(0)).toLocaleString();
      readout.innerHTML =
        `<strong>${year}</strong> &nbsp;·&nbsp; Vegetatsiya <em>${veg}%</em> &nbsp;·&nbsp; ~${vegKm2} km²`;
      readout.style.opacity = "1";
    }, 160);
  }
}

// ── Map setup ─────────────────────────────────────────────

const map = L.map("map", {
  zoomControl: false,
  preferCanvas: true,
});

L.control.zoom({ position: "topright" }).addTo(map);

L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    maxZoom: 18,
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP",
  }
).addTo(map);

map.createPane("rasterPane");
const rasterPaneEl = map.getPane("rasterPane");
rasterPaneEl.style.zIndex = 350;
rasterPaneEl.style.mixBlendMode = "multiply";

const state = {
  rasters: null,
  currentYear: "2017",
  rasterLayer: null,
  changeLayer: null,
  opacity: 0.82,
  allStats: {},
  chartReady: false,
};

const APP_VERSION = "visual-fill-20260519-001";

const statusText = document.getElementById("statusText");
const yearControls = document.getElementById("yearControls");
const changeToggle = document.getElementById("changeToggle");
const opacityRange = document.getElementById("opacityRange");

function setStatus(text) {
  statusText.textContent = text;
}

function rasterUrl(path) {
  return `${path}?v=${APP_VERSION}`;
}

function addRaster(year) {
  if (!state.rasters) return;
  const item = state.rasters.years[year];
  if (!item) return;

  if (state.rasterLayer) map.removeLayer(state.rasterLayer);

  state.rasterLayer = L.imageOverlay(rasterUrl(item.image), item.bounds, {
    opacity: state.opacity,
    interactive: false,
    pane: "rasterPane",
  }).addTo(map);

  state.currentYear = year;
  setStatus(`${year} — land-cover qatlami yuklandi`);

  if (state.chartReady) {
    updateChartYear(year, state.allStats);
  }
}

function toggleChange(enabled) {
  if (!state.rasters) return;
  const item = state.rasters.change["2017_2024"];

  if (state.changeLayer) {
    map.removeLayer(state.changeLayer);
    state.changeLayer = null;
  }

  if (enabled && item) {
    state.changeLayer = L.imageOverlay(rasterUrl(item.image), item.bounds, {
      opacity: state.opacity,
      interactive: false,
      pane: "rasterPane",
    }).addTo(map);
    setStatus("2017–2024 o'zgarish qatlami faol");
  } else {
    setStatus(`${state.currentYear} — land-cover qatlami`);
  }
}

function updateOpacity(value) {
  state.opacity = Number(value) / 100;
  if (state.rasterLayer) state.rasterLayer.setOpacity(state.opacity);
  if (state.changeLayer) state.changeLayer.setOpacity(state.opacity);
}

function styleTuman() {
  return { color: "#3fd67a", weight: 1, opacity: 0.6, fillOpacity: 0 };
}

function styleViloyat() {
  return {
    color: "#3fd67a", weight: 2.2, opacity: 0.9,
    fillOpacity: 0, dashArray: "5, 4",
  };
}

function bindTumanPopup(feature, layer) {
  const name =
    feature.properties?.district || feature.properties?.name || "Tuman";
  layer.bindPopup(`
    <p class="popup-title">${name}</p>
    <p class="popup-sub">Toshkent viloyati</p>
  `);
  layer.on({
    mouseover: () => layer.setStyle({ weight: 2, color: "#3fd67a", opacity: 1 }),
    mouseout: () => layer.setStyle(styleTuman()),
  });
}

async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} yuklanmadi`);
  return res.json();
}

async function init() {
  setStatus("Ma'lumotlar yuklanmoqda...");

  const [rasters, viloyat, tumanlar] = await Promise.all([
    loadJson("data/rasters.json"),
    loadJson("data/toshkent_viloyat.geojson"),
    loadJson("data/toshkent_tumanlar.geojson"),
  ]);

  state.rasters = rasters;

  const vilLayer = L.geoJSON(viloyat, { style: styleViloyat }).addTo(map);
  L.geoJSON(tumanlar, {
    style: styleTuman,
    onEachFeature: bindTumanPopup,
  }).addTo(map);

  map.fitBounds(vilLayer.getBounds(), { padding: [24, 24] });
  addRaster(state.currentYear);

  // Chart overlay ko'rsatish (loading holati)
  const chartOverlay = document.getElementById("chartOverlay");
  chartOverlay.style.display = "";
  setStatus("Barcha yillar tahlil qilinmoqda...");

  // 3 yilni parallel tahlil qilish
  await Promise.all(
    YEARS.map(yr =>
      analyzeImage(rasterUrl(rasters.years[yr].image))
        .then(stats => { state.allStats[yr] = stats; })
        .catch(err => {
          console.error(`${yr} tahlil xato:`, err);
          state.allStats[yr] = { water: 0, dense_veg: 0, crop_veg: 0, bare: 0, cloud: 0 };
        })
    )
  );

  state.chartReady = true;
  buildChart(state.allStats, state.currentYear);
  updateChartYear(state.currentYear, state.allStats);
  setStatus(`${state.currentYear} — land-cover qatlami yuklandi`);
}

yearControls.addEventListener("click", event => {
  const button = event.target.closest("button[data-year]");
  if (!button) return;
  yearControls.querySelectorAll("button").forEach(b => b.classList.remove("active"));
  button.classList.add("active");
  changeToggle.checked = false;
  toggleChange(false);
  addRaster(button.dataset.year);
});

changeToggle.addEventListener("change", event => {
  toggleChange(event.target.checked);
});

opacityRange.addEventListener("input", event => {
  updateOpacity(event.target.value);
});

init().catch(error => {
  console.error(error);
  setStatus("Xatolik: ma'lumot yuklanmadi");
});
