/* ========================================
   AgroEase – Dashboard Application Logic
   ======================================== */

const CROP_CATALOG = {
  Rice: {
    icon: '🌾',
    image: 'https://images.unsplash.com/photo-1586521995568-39abaa0c2311?auto=format&fit=crop&w=400&q=80',
    description: 'High-demand staple crop with strong returns in irrigated regions.',
    waterRequirement: 'High',
    season: 'Kharif',
    soilType: 'Alluvial / Clayey',
    averageYield: '22-28 qtl/acre',
    estimatedPrice: '₹2200/qtl',
    profitEstimation: '₹28,000 - ₹42,000 / acre',
    rules: {
      soils: ['alluvial', 'clayey'],
      seasons: ['kharif'],
      water: 'high'
    }
  },
  Wheat: {
    icon: '🌿',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80',
    description: 'Reliable cool-season crop with moderate input cost.',
    waterRequirement: 'Medium',
    season: 'Rabi',
    soilType: 'Alluvial / Black / Clayey',
    averageYield: '16-22 qtl/acre',
    estimatedPrice: '₹2400/qtl',
    profitEstimation: '₹20,000 - ₹32,000 / acre',
    rules: {
      soils: ['alluvial', 'black', 'clayey'],
      seasons: ['rabi'],
      water: 'medium'
    }
  },
  Chickpea: {
    icon: '🫘',
    image: 'https://images.unsplash.com/photo-1515543582370-4cff30cb85dd?auto=format&fit=crop&w=400&q=80',
    description: 'Low-water pulse crop ideal for dry rabi conditions.',
    waterRequirement: 'Low',
    season: 'Rabi',
    soilType: 'Black / Red / Alluvial',
    averageYield: '8-12 qtl/acre',
    estimatedPrice: '₹5800/qtl',
    profitEstimation: '₹24,000 - ₹36,000 / acre',
    rules: {
      soils: ['black', 'red', 'alluvial'],
      seasons: ['rabi'],
      water: 'low'
    }
  },
  Cotton: {
    icon: '🏵️',
    image: 'https://images.unsplash.com/photo-1590059530460-6b3a0937a346?auto=format&fit=crop&w=400&q=80',
    description: 'Commercial fiber crop best suited for black soil zones.',
    waterRequirement: 'Medium',
    season: 'Kharif',
    soilType: 'Black / Red',
    averageYield: '8-12 qtl/acre',
    estimatedPrice: '₹7200/qtl',
    profitEstimation: '₹35,000 - ₹55,000 / acre',
    rules: {
      soils: ['black', 'red'],
      seasons: ['kharif'],
      water: 'medium'
    }
  },
  Maize: {
    icon: '🌽',
    image: 'https://images.unsplash.com/photo-1598449176461-1c390a187b5d?auto=format&fit=crop&w=400&q=80',
    description: 'Flexible cereal crop suitable for multiple seasons.',
    waterRequirement: 'Medium',
    season: 'Kharif / Zaid',
    soilType: 'Alluvial / Red / Black',
    averageYield: '18-24 qtl/acre',
    estimatedPrice: '₹2100/qtl',
    profitEstimation: '₹22,000 - ₹34,000 / acre',
    rules: {
      soils: ['alluvial', 'red', 'black'],
      seasons: ['kharif', 'zaid'],
      water: 'medium'
    }
  }
};

const WATER_LEVEL_INDEX = { low: 0, medium: 1, high: 2 };

function getWaterFitScore(required, selected) {
  const req = WATER_LEVEL_INDEX[required] ?? 1;
  const sel = WATER_LEVEL_INDEX[selected] ?? 1;
  const diff = Math.abs(req - sel);

  if (diff === 0) return 3;
  if (diff === 1) return 2;
  return 1;
}

function scoreCropForInputs(crop, soil, season, water) {
  const soilMatch = crop.rules.soils.includes(soil);
  const seasonMatch = crop.rules.seasons.includes(season);
  const waterMatch = crop.rules.water === water;

  const score =
    (soilMatch ? 5 : 0) +
    (seasonMatch ? 4 : 0) +
    getWaterFitScore(crop.rules.water, water);

  return { score, soilMatch, seasonMatch, waterMatch };
}

function getBestCropRecommendation(soil, season, water) {
  const ranked = Object.entries(CROP_CATALOG)
    .map(([name, crop]) => ({
      name,
      crop,
      ...scoreCropForInputs(crop, soil, season, water)
    }))
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) return null;

  const best = ranked[0];
  const exactMatch = best.soilMatch && best.seasonMatch && best.waterMatch;

  return {
    ...best,
    isFallback: !exactMatch
  };
}

function renderRecommendedCrop(container, recommendation) {
  const { crop, name, isFallback } = recommendation;

  container.innerHTML = `
    ${isFallback ? '<div class="crop-fallback-label">Best Possible Crop</div>' : ''}
    <div class="crop-card crop-recommend-card">
      <div class="crop-icon">${crop.icon}</div>
      <img src="${crop.image}" class="crop-img" alt="${name}" />
      <h3>${name}</h3>
      <p class="crop-desc">${crop.description}</p>
      <div class="crop-meta"><strong>💧 Water:</strong> ${crop.waterRequirement}</div>
      <div class="crop-meta"><strong>🗓 Season:</strong> ${crop.season}</div>
      <div class="crop-meta"><strong>🌱 Soil:</strong> ${crop.soilType}</div>
      <div class="crop-meta"><strong>📊 Avg Yield:</strong> ${crop.averageYield}</div>
      <div class="crop-meta"><strong>💸 Price:</strong> ${crop.estimatedPrice}</div>
      <div class="crop-profit">Estimated Profit: ${crop.profitEstimation}</div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const name = localStorage.getItem('farmerName');
  
  if (!name && window.location.pathname.includes('dashboard.html')) {
    window.location.href = 'login.html';
    return;
  }

  setupAuthUser();
});

// ── Loading Screen ──
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    if (loader) loader.classList.add('hidden');
    initDashboard();
  }, 2000);
});

// ═══════════════════════════════════════════
// DATA STORE
// ═══════════════════════════════════════════

const AppData = {
  weather: {
    temperature: 32,
    humidity: 68,
    rainProbability: 45,
    forecast: [
      { day: 'Mon', icon: '☀️', temp: '34°C', rain: '10%' },
      { day: 'Tue', icon: '🌤️', temp: '31°C', rain: '25%' },
      { day: 'Wed', icon: '🌧️', temp: '28°C', rain: '75%' },
      { day: 'Thu', icon: '⛈️', temp: '26°C', rain: '85%' },
      { day: 'Fri', icon: '🌤️', temp: '30°C', rain: '20%' },
    ]
  },

  cropDatabase: {
    alluvial: {
      kharif: {
        high: [
          { name: 'Rice', emoji: '🌾', yield: '45 Q/ha', water: 'High', season: 'Kharif' },
          { name: 'Sugarcane', emoji: '🎋', yield: '700 Q/ha', water: 'High', season: 'Kharif' },
          { name: 'Jute', emoji: '🌿', yield: '25 Q/ha', water: 'High', season: 'Kharif' },
        ],
        medium: [
          { name: 'Maize', emoji: '🌽', yield: '35 Q/ha', water: 'Medium', season: 'Kharif' },
          { name: 'Soybean', emoji: '🫘', yield: '20 Q/ha', water: 'Medium', season: 'Kharif' },
          { name: 'Cotton', emoji: '🏵️', yield: '15 Q/ha', water: 'Medium', season: 'Kharif' },
        ],
        low: [
          { name: 'Millet', emoji: '🌾', yield: '18 Q/ha', water: 'Low', season: 'Kharif' },
          { name: 'Sorghum', emoji: '🌿', yield: '22 Q/ha', water: 'Low', season: 'Kharif' },
        ],
      },
      rabi: {
        high: [
          { name: 'Wheat', emoji: '🌿', yield: '40 Q/ha', water: 'High', season: 'Rabi' },
          { name: 'Potato', emoji: '🥔', yield: '250 Q/ha', water: 'High', season: 'Rabi' },
          { name: 'Mustard', emoji: '🌼', yield: '15 Q/ha', water: 'High', season: 'Rabi' },
        ],
        medium: [
          { name: 'Wheat', emoji: '🌿', yield: '35 Q/ha', water: 'Medium', season: 'Rabi' },
          { name: 'Chickpea', emoji: '🫘', yield: '18 Q/ha', water: 'Medium', season: 'Rabi' },
          { name: 'Lentil', emoji: '🟤', yield: '12 Q/ha', water: 'Medium', season: 'Rabi' },
        ],
        low: [
          { name: 'Barley', emoji: '🌾', yield: '30 Q/ha', water: 'Low', season: 'Rabi' },
          { name: 'Chickpea', emoji: '🫘', yield: '14 Q/ha', water: 'Low', season: 'Rabi' },
        ],
      },
      zaid: {
        high: [
          { name: 'Watermelon', emoji: '🍉', yield: '200 Q/ha', water: 'High', season: 'Zaid' },
          { name: 'Cucumber', emoji: '🥒', yield: '150 Q/ha', water: 'High', season: 'Zaid' },
          { name: 'Muskmelon', emoji: '🍈', yield: '180 Q/ha', water: 'High', season: 'Zaid' },
        ],
        medium: [
          { name: 'Moong', emoji: '🫘', yield: '10 Q/ha', water: 'Medium', season: 'Zaid' },
          { name: 'Sunflower', emoji: '🌻', yield: '18 Q/ha', water: 'Medium', season: 'Zaid' },
        ],
        low: [
          { name: 'Moong', emoji: '🫘', yield: '8 Q/ha', water: 'Low', season: 'Zaid' },
        ],
      }
    },
    black: {
      kharif: {
        high: [
          { name: 'Cotton', emoji: '🏵️', yield: '20 Q/ha', water: 'High', season: 'Kharif' },
          { name: 'Soybean', emoji: '🫘', yield: '25 Q/ha', water: 'High', season: 'Kharif' },
          { name: 'Sugarcane', emoji: '🎋', yield: '650 Q/ha', water: 'High', season: 'Kharif' },
        ],
        medium: [
          { name: 'Cotton', emoji: '🏵️', yield: '15 Q/ha', water: 'Medium', season: 'Kharif' },
          { name: 'Sorghum', emoji: '🌿', yield: '28 Q/ha', water: 'Medium', season: 'Kharif' },
        ],
        low: [
          { name: 'Millet', emoji: '🌾', yield: '15 Q/ha', water: 'Low', season: 'Kharif' },
          { name: 'Sorghum', emoji: '🌿', yield: '20 Q/ha', water: 'Low', season: 'Kharif' },
        ],
      },
      rabi: {
        high: [
          { name: 'Wheat', emoji: '🌿', yield: '42 Q/ha', water: 'High', season: 'Rabi' },
          { name: 'Gram', emoji: '🫘', yield: '20 Q/ha', water: 'High', season: 'Rabi' },
        ],
        medium: [
          { name: 'Wheat', emoji: '🌿', yield: '35 Q/ha', water: 'Medium', season: 'Rabi' },
          { name: 'Safflower', emoji: '🌼', yield: '12 Q/ha', water: 'Medium', season: 'Rabi' },
        ],
        low: [
          { name: 'Gram', emoji: '🫘', yield: '14 Q/ha', water: 'Low', season: 'Rabi' },
        ],
      },
      zaid: {
        high: [
          { name: 'Groundnut', emoji: '🥜', yield: '22 Q/ha', water: 'High', season: 'Zaid' },
          { name: 'Sunflower', emoji: '🌻', yield: '20 Q/ha', water: 'High', season: 'Zaid' },
        ],
        medium: [
          { name: 'Sesame', emoji: '🌿', yield: '8 Q/ha', water: 'Medium', season: 'Zaid' },
        ],
        low: [
          { name: 'Sesame', emoji: '🌿', yield: '6 Q/ha', water: 'Low', season: 'Zaid' },
        ],
      }
    },
    red: {
      kharif: {
        high: [
          { name: 'Groundnut', emoji: '🥜', yield: '25 Q/ha', water: 'High', season: 'Kharif' },
          { name: 'Rice', emoji: '🌾', yield: '40 Q/ha', water: 'High', season: 'Kharif' },
        ],
        medium: [
          { name: 'Maize', emoji: '🌽', yield: '30 Q/ha', water: 'Medium', season: 'Kharif' },
          { name: 'Groundnut', emoji: '🥜', yield: '18 Q/ha', water: 'Medium', season: 'Kharif' },
        ],
        low: [
          { name: 'Millet', emoji: '🌾', yield: '12 Q/ha', water: 'Low', season: 'Kharif' },
          { name: 'Pigeon Pea', emoji: '🫘', yield: '10 Q/ha', water: 'Low', season: 'Kharif' },
        ],
      },
      rabi: {
        high: [
          { name: 'Potato', emoji: '🥔', yield: '220 Q/ha', water: 'High', season: 'Rabi' },
          { name: 'Tomato', emoji: '🍅', yield: '300 Q/ha', water: 'High', season: 'Rabi' },
        ],
        medium: [
          { name: 'Linseed', emoji: '🌿', yield: '10 Q/ha', water: 'Medium', season: 'Rabi' },
          { name: 'Mustard', emoji: '🌼', yield: '12 Q/ha', water: 'Medium', season: 'Rabi' },
        ],
        low: [
          { name: 'Gram', emoji: '🫘', yield: '10 Q/ha', water: 'Low', season: 'Rabi' },
        ],
      },
      zaid: {
        high: [
          { name: 'Watermelon', emoji: '🍉', yield: '180 Q/ha', water: 'High', season: 'Zaid' },
        ],
        medium: [
          { name: 'Moong', emoji: '🫘', yield: '8 Q/ha', water: 'Medium', season: 'Zaid' },
        ],
        low: [
          { name: 'Moong', emoji: '🫘', yield: '6 Q/ha', water: 'Low', season: 'Zaid' },
        ],
      }
    },
    laterite: {
      kharif: {
        high: [
          { name: 'Cashew', emoji: '🥜', yield: '10 Q/ha', water: 'High', season: 'Kharif' },
          { name: 'Tea', emoji: '🍵', yield: '20 Q/ha', water: 'High', season: 'Kharif' },
        ],
        medium: [
          { name: 'Tapioca', emoji: '🌿', yield: '250 Q/ha', water: 'Medium', season: 'Kharif' },
        ],
        low: [
          { name: 'Millet', emoji: '🌾', yield: '10 Q/ha', water: 'Low', season: 'Kharif' },
        ],
      },
      rabi: {
        high: [
          { name: 'Coffee', emoji: '☕', yield: '8 Q/ha', water: 'High', season: 'Rabi' },
        ],
        medium: [
          { name: 'Lentil', emoji: '🟤', yield: '10 Q/ha', water: 'Medium', season: 'Rabi' },
        ],
        low: [
          { name: 'Gram', emoji: '🫘', yield: '8 Q/ha', water: 'Low', season: 'Rabi' },
        ],
      },
      zaid: {
        high: [
          { name: 'Pineapple', emoji: '🍍', yield: '200 Q/ha', water: 'High', season: 'Zaid' },
        ],
        medium: [
          { name: 'Moong', emoji: '🫘', yield: '7 Q/ha', water: 'Medium', season: 'Zaid' },
        ],
        low: [
          { name: 'Sesame', emoji: '🌿', yield: '5 Q/ha', water: 'Low', season: 'Zaid' },
        ],
      }
    },
    sandy: {
      kharif: {
        high: [
          { name: 'Groundnut', emoji: '🥜', yield: '20 Q/ha', water: 'High', season: 'Kharif' },
          { name: 'Millet', emoji: '🌾', yield: '22 Q/ha', water: 'High', season: 'Kharif' },
        ],
        medium: [
          { name: 'Bajra', emoji: '🌾', yield: '18 Q/ha', water: 'Medium', season: 'Kharif' },
          { name: 'Guar', emoji: '🌿', yield: '12 Q/ha', water: 'Medium', season: 'Kharif' },
        ],
        low: [
          { name: 'Bajra', emoji: '🌾', yield: '12 Q/ha', water: 'Low', season: 'Kharif' },
          { name: 'Moth Bean', emoji: '🫘', yield: '6 Q/ha', water: 'Low', season: 'Kharif' },
        ],
      },
      rabi: {
        high: [
          { name: 'Cumin', emoji: '🌿', yield: '8 Q/ha', water: 'High', season: 'Rabi' },
          { name: 'Mustard', emoji: '🌼', yield: '14 Q/ha', water: 'High', season: 'Rabi' },
        ],
        medium: [
          { name: 'Barley', emoji: '🌾', yield: '25 Q/ha', water: 'Medium', season: 'Rabi' },
        ],
        low: [
          { name: 'Barley', emoji: '🌾', yield: '18 Q/ha', water: 'Low', season: 'Rabi' },
        ],
      },
      zaid: {
        high: [
          { name: 'Watermelon', emoji: '🍉', yield: '160 Q/ha', water: 'High', season: 'Zaid' },
        ],
        medium: [
          { name: 'Moong', emoji: '🫘', yield: '7 Q/ha', water: 'Medium', season: 'Zaid' },
        ],
        low: [
          { name: 'Moong', emoji: '🫘', yield: '5 Q/ha', water: 'Low', season: 'Zaid' },
        ],
      }
    },
    clayey: {
      kharif: {
        high: [
          { name: 'Rice', emoji: '🌾', yield: '50 Q/ha', water: 'High', season: 'Kharif' },
          { name: 'Sugarcane', emoji: '🎋', yield: '750 Q/ha', water: 'High', season: 'Kharif' },
        ],
        medium: [
          { name: 'Rice', emoji: '🌾', yield: '38 Q/ha', water: 'Medium', season: 'Kharif' },
          { name: 'Cotton', emoji: '🏵️', yield: '16 Q/ha', water: 'Medium', season: 'Kharif' },
        ],
        low: [
          { name: 'Sorghum', emoji: '🌿', yield: '18 Q/ha', water: 'Low', season: 'Kharif' },
        ],
      },
      rabi: {
        high: [
          { name: 'Wheat', emoji: '🌿', yield: '45 Q/ha', water: 'High', season: 'Rabi' },
          { name: 'Potato', emoji: '🥔', yield: '280 Q/ha', water: 'High', season: 'Rabi' },
        ],
        medium: [
          { name: 'Wheat', emoji: '🌿', yield: '38 Q/ha', water: 'Medium', season: 'Rabi' },
          { name: 'Peas', emoji: '🟢', yield: '15 Q/ha', water: 'Medium', season: 'Rabi' },
        ],
        low: [
          { name: 'Lentil', emoji: '🟤', yield: '10 Q/ha', water: 'Low', season: 'Rabi' },
        ],
      },
      zaid: {
        high: [
          { name: 'Cucumber', emoji: '🥒', yield: '160 Q/ha', water: 'High', season: 'Zaid' },
        ],
        medium: [
          { name: 'Moong', emoji: '🫘', yield: '9 Q/ha', water: 'Medium', season: 'Zaid' },
        ],
        low: [
          { name: 'Sesame', emoji: '🌿', yield: '5 Q/ha', water: 'Low', season: 'Zaid' },
        ],
      }
    }
  },

  marketPrices: [
    { crop: '🌾 Rice', price: 2150, prev: 2040, unit: 'Quintal' },
    { crop: '🌿 Wheat', price: 2275, prev: 2200, unit: 'Quintal' },
    { crop: '🏵️ Cotton', price: 6620, prev: 6800, unit: 'Quintal' },
    { crop: '🎋 Sugarcane', price: 315, prev: 305, unit: 'Quintal' },
    { crop: '🫘 Soybean', price: 4600, prev: 4350, unit: 'Quintal' },
    { crop: '🌽 Maize', price: 2090, prev: 1980, unit: 'Quintal' },
    { crop: '🥔 Potato', price: 1250, prev: 1400, unit: 'Quintal' },
    { crop: '🍅 Tomato', price: 2800, prev: 2200, unit: 'Quintal' },
  ],

  cropMarketPrices: {
    rice: 2150,
    wheat: 2275,
    cotton: 6620,
    sugarcane: 315,
    soybean: 4600,
    maize: 2090,
    potato: 1250,
    tomato: 2800,
  },

  bestCrops: [
    { name: 'Tomato', emoji: '🍅', profitPerAcre: '₹45,000' },
    { name: 'Sugarcane', emoji: '🎋', profitPerAcre: '₹38,500' },
    { name: 'Potato', emoji: '🥔', profitPerAcre: '₹32,000' },
    { name: 'Cotton', emoji: '🏵️', profitPerAcre: '₹28,000' },
    { name: 'Soybean', emoji: '🫘', profitPerAcre: '₹22,000' },
  ],

  scheduledTasks: [],
};

// ═══════════════════════════════════════════
// LOCAL DATASET ENGINE (STATIC-HOSTING SAFE)
// ═══════════════════════════════════════════
// The small CSVs are read directly from this repository.  The fertilizer
// profiles below are averages derived from the supplied train.csv, keeping the
// 33 MB training file out of the visitor's download path.
const LocalDatasetEngine = (() => {
  const cropUrl = 'dataset/crop-recommendation%20dataset/Crop_recommendation.csv';
  const pestUrl = 'dataset/agricultural%20pest%20or%20disease%20dataset/tamil_agri_qa.csv';
  const mandiUrl = 'dataset/India%20Mandi%20Wholesale%20Prices%20dataset/commodity_price.csv';
  const fertilizerProfiles = [
    ['Red','Paddy',31.5,61.1,22.8,21.0,9.4,'14-35-14'], ['Sandy','Paddy',31.6,61.1,23.0,21.3,9.6,'28-28'],
    ['Clayey','Cotton',31.4,61.0,23.3,21.2,9.5,'20-20'], ['Black','Wheat',31.6,61.2,23.5,21.1,9.4,'10-26-26'],
    ['Clayey','Wheat',31.5,61.1,23.1,21.0,9.5,'20-20'], ['Black','Cotton',31.6,61.0,23.2,21.0,9.5,'10-26-26'],
    ['Black','Paddy',31.5,61.0,23.1,21.1,9.5,'10-26-26'], ['Red','Wheat',31.5,61.0,23.3,21.1,9.4,'DAP'],
    ['Loamy','Wheat',31.3,61.2,23.3,21.3,9.4,'10-26-26'], ['Loamy','Paddy',31.4,61.0,22.9,21.4,9.4,'10-26-26'],
    ['Loamy','Cotton',31.5,60.9,23.0,20.9,9.6,'17-17-17'], ['Clayey','Paddy',31.6,60.9,22.8,21.3,9.6,'17-17-17'],
    ['Sandy','Wheat',31.4,61.2,23.2,21.0,9.4,'10-26-26'], ['Sandy','Cotton',31.4,61.0,23.1,21.3,9.6,'17-17-17'],
    ['Red','Cotton',31.6,60.8,23.0,21.2,9.6,'14-35-14']
  ].map(([soil, crop, temperature, humidity, n, p, k, fertilizer]) => ({ soil, crop, temperature, humidity, n, p, k, fertilizer }));

  let cropRows = [];
  let pestRows = [];
  let mandiRows = [];
  let loading;

  function parseCsv(text) {
    const rows = [];
    let row = [], value = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (quoted && text[i + 1] === '"') { value += '"'; i++; }
        else quoted = !quoted;
      } else if (char === ',' && !quoted) { row.push(value); value = ''; }
      else if ((char === '\n' || char === '\r') && !quoted) {
        if (char === '\r' && text[i + 1] === '\n') i++;
        row.push(value); if (row.some(cell => cell !== '')) rows.push(row); row = []; value = '';
      } else value += char;
    }
    if (value || row.length) { row.push(value); rows.push(row); }
    const [headers, ...records] = rows;
    return records.map(record => Object.fromEntries(headers.map((header, index) => [header, record[index] || ''])));
  }

  function load() {
    if (loading) return loading;
    loading = Promise.all([fetch(cropUrl), fetch(pestUrl), fetch(mandiUrl)])
      .then(async ([cropResponse, pestResponse, mandiResponse]) => {
        if (!cropResponse.ok || !pestResponse.ok || !mandiResponse.ok) throw new Error('Local dataset could not be loaded');
        cropRows = parseCsv(await cropResponse.text()).map(row => ({
          n: Number(row.N), p: Number(row.P), k: Number(row.K), temperature: Number(row.temperature),
          humidity: Number(row.humidity), ph: Number(row.ph), rainfall: Number(row.rainfall), label: row.label
        }));
        pestRows = parseCsv(await pestResponse.text());
        mandiRows = parseCsv(await mandiResponse.text());
      });
    return loading;
  }

  function cropMatches({ n, p, k, ph }) {
    const temperature = AppData.weather.temperature;
    const humidity = AppData.weather.humidity;
    const rainfall = AppData.weather.rainProbability * 2;
    const scores = new Map();
    cropRows.forEach(row => {
      const distance = Math.sqrt(
        ((n - row.n) / 140) ** 2 + ((p - row.p) / 140) ** 2 + ((k - row.k) / 210) ** 2 +
        ((ph - row.ph) / 4) ** 2 + ((temperature - row.temperature) / 18) ** 2 +
        ((humidity - row.humidity) / 55) ** 2 + ((rainfall - row.rainfall) / 250) ** 2
      );
      scores.set(row.label, (scores.get(row.label) || 0) + 1 / (1 + distance));
    });
    return [...scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([label]) => label);
  }

  function fertilizerMatch({ soil, crop, n, p, k }) {
    const soilMap = { alluvial: 'Loamy', black: 'Black', red: 'Red' };
    const cropMap = { rice: 'Paddy', wheat: 'Wheat', cotton: 'Cotton' };
    const targetSoil = soilMap[soil];
    const targetCrop = cropMap[crop];
    const candidates = fertilizerProfiles.filter(profile => profile.crop === targetCrop);
    return candidates.sort((a, b) => {
      const score = profile => (profile.soil === targetSoil ? 0 : 1) + Math.abs(profile.n - n) / 30 + Math.abs(profile.p - p) / 30 + Math.abs(profile.k - k) / 20;
      return score(a) - score(b);
    })[0];
  }

  function pestOptions(crop) {
    return [...new Set(pestRows.filter(row => row.crop.toLowerCase() === crop).map(row => row.pest_or_disease))];
  }

  function pestMatch(crop, pest, severity) {
    return pestRows.find(row => row.crop.toLowerCase() === crop && row.pest_or_disease === pest && row.severity === severity)
      || pestRows.find(row => row.crop.toLowerCase() === crop && row.pest_or_disease === pest)
      || null;
  }

  function marketSnapshot() {
    const crops = [
      { name: 'Cotton', icon: '🏵️', terms: ['cotton'] }, { name: 'Rice', icon: '🌾', terms: ['rice', 'paddy'] },
      { name: 'Wheat', icon: '🌿', terms: ['wheat'] }, { name: 'Groundnut', icon: '🥜', terms: ['groundnut'] },
      { name: 'Maize', icon: '🌽', terms: ['maize'] }
    ];
    return crops.map(crop => {
      const matches = mandiRows.filter(row => crop.terms.some(term => row.Commodity.toLowerCase().includes(term)));
      if (!matches.length) return null;
      const record = matches[0];
      return { crop: `${crop.icon} ${crop.name}`, rawName: crop.name, price: Number(record.Modal_x0020_Price), changeVal: 0, changePct: '0.00', isUp: true, market: record.Market, date: record.Arrival_Date };
    }).filter(Boolean);
  }

  return { load, cropMatches, fertilizerMatch, pestOptions, pestMatch, marketSnapshot };
})();


// ═══════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════

function initDashboard() {
  setupAuthUser();
  setupLogout();
  setupSidebar();
  setupMobileMenu();
  setupFarmProfile();
  loadDashboardStats();
  initOverviewChart();
  initFarmingScore();
  setupWeatherAPI();
  setupLiveMarket();
  initMarketChart();
  loadTasksFromStorage();
  initCalendar();
  renderBestCrops();
  setupFertilizerPrediction();
  setupPestAdvisory();
  setupProfitEstimator();
  setupScheduler();
  initSoilQuiz();
  setupSearchOverlay();
  setupNotifications();
}

function setupAuthUser() {
  const userName = document.getElementById('user-name');
  const userLocation = document.getElementById('user-location');
  const topAvatar = document.getElementById('topbar-avatar');
  const sideAvatar = document.getElementById('sidebar-avatar');
  const welcome = document.getElementById('welcome');

  const name = localStorage.getItem('farmerName') || 'Farmer';
  const village = localStorage.getItem('farmerVillage') || '';
  const district = localStorage.getItem('farmerDistrict') || '';

  if (userName) userName.textContent = name;
  if (welcome) welcome.textContent = `Welcome, ${name} 🌱`;
  
  if (userLocation) {
    if (village && district) userLocation.textContent = `${village}, ${district}`;
    else if (village) userLocation.textContent = village;
    else if (district) userLocation.textContent = district;
    else userLocation.textContent = 'Location unknown';
  }
  
  const char = name.charAt(0).toUpperCase();
  if (topAvatar) topAvatar.textContent = char;
  if (sideAvatar) sideAvatar.textContent = char;
}

function setupLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });
}

function loadDashboardStats() {
  const statLand    = document.getElementById('stat-land');
  const statCrops   = document.getElementById('stat-crops');
  const statYield   = document.getElementById('stat-yield');
  const statRevenue = document.getElementById('stat-revenue');

  const ids = [statLand, statCrops, statYield, statRevenue];

  // Show skeletons while "loading"
  ids.forEach(el => {
    if (el && window.UI) el.innerHTML = UI.createSkeleton(1, 'title');
  });

  // Hide trends initially
  const trends = document.querySelectorAll('.stat-trend');
  trends.forEach(t => t.style.display = 'none');

  // Populate from the farmer's locally saved profile.
  setTimeout(() => {
    const profile = getFarmProfile();
    const hasProfile = profile && Object.values(profile).some(value => value !== '' && value !== null && value !== undefined);
    const stats = hasProfile ? [
      { el: statLand, value: profile.land !== '' ? `${profile.land} Acres` : 'No data available' },
      { el: statCrops, value: profile.crops !== '' ? profile.crops : 'No data available' },
      { el: statYield, value: profile.yield !== '' ? `${profile.yield} Tons` : 'No data available' },
      { el: statRevenue, value: profile.revenue !== '' ? `₹${Number(profile.revenue).toLocaleString('en-IN')}` : 'No data available' },
    ] : ids.map(el => ({ el, value: 'No data available' }));

    stats.forEach(({ el, value }) => {
      if (el) el.textContent = value;
    });

    // Trend badges need historical data, which this profile form does not collect.
    trends.forEach(t => t.style.display = 'none');
  }, 1200);
}

function getFarmProfile() {
  try {
    return JSON.parse(localStorage.getItem('agroease_farm_profile')) || null;
  } catch (_) {
    return null;
  }
}

function setupFarmProfile() {
  const form = document.getElementById('farm-profile-form');
  if (!form) return;

  const fields = {
    land: document.getElementById('farm-land'),
    crops: document.getElementById('farm-crops'),
    yield: document.getElementById('farm-yield'),
    revenue: document.getElementById('farm-revenue')
  };
  const saved = getFarmProfile();
  if (saved) Object.entries(fields).forEach(([key, field]) => { if (field) field.value = saved[key] ?? ''; });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const profile = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value.trim()]));
    if (!Object.values(profile).some(Boolean)) {
      if (window.UI) UI.toast('Enter at least one farm value to save your profile.', 'error');
      return;
    }
    localStorage.setItem('agroease_farm_profile', JSON.stringify(profile));
    loadDashboardStats();
    if (window.UI) UI.toast('Farm profile saved. Dashboard updated.');
  });
}


// ═══════════════════════════════════════════
// SIDEBAR NAVIGATION
// ═══════════════════════════════════════════

function setupSidebar() {
  const links = document.querySelectorAll('.sidebar-link');
  const panels = document.querySelectorAll('.panel');
  const topTitle = document.getElementById('topbar-title');

  const titleMap = {
    dashboard: 'Dashboard',
    weather: 'Weather Intelligence',
    fertilizer: 'Fertilizer Prediction',
    pest: 'Pest & Disease Advisory',
    soil: 'Soil Health Monitor',
    market: 'Market Tracker',
    scheduler: 'Farming Scheduler',
    profit: 'Profit Estimator',
  };

  links.forEach(link => {
    link.addEventListener('click', () => {
      const panelId = link.dataset.panel;

      // Update active link
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Show target panel
      panels.forEach(p => p.classList.remove('active'));
      const target = document.getElementById('panel-' + panelId);
      if (target) target.classList.add('active');

      // Update topbar title
      if (topTitle) topTitle.textContent = titleMap[panelId] || 'Dashboard';

      // Animate soil bars removed

      // Close mobile sidebar
      closeMobileSidebar();
    });
  });
}


// ═══════════════════════════════════════════
// MOBILE MENU
// ═══════════════════════════════════════════

function setupMobileMenu() {
  const hamburger = document.getElementById('topbar-hamburger');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeMobileSidebar);
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
}


// ═══════════════════════════════════════════
// OVERVIEW CHART
// ═══════════════════════════════════════════

let overviewChart = null;

function initOverviewChart() {
  const ctx = document.getElementById('overview-chart');
  if (!ctx) return;

  const chartData = {
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: [2.1, 1.8, 2.5, 3.0, 3.8, 4.2, 4.5, 4.1, 3.9, 3.5, 2.8, 2.3],
    },
    quarterly: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      data: [6.4, 11.0, 12.5, 8.6],
    },
    yearly: {
      labels: ['2022', '2023', '2024', '2025', '2026'],
      data: [28, 32, 36, 38.5, 42],
    }
  };

  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 250);
  gradient.addColorStop(0, 'rgba(22, 163, 74, 0.25)');
  gradient.addColorStop(1, 'rgba(22, 163, 74, 0.02)');

  overviewChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.monthly.labels,
      datasets: [{
        label: 'Yield (Tons)',
        data: chartData.monthly.data,
        borderColor: '#16a34a',
        backgroundColor: gradient,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#16a34a',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111827',
          titleFont: { family: 'Inter', weight: '600' },
          bodyFont: { family: 'Inter' },
          padding: 12,
          cornerRadius: 12,
          displayColors: false,
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 11 }, color: '#374151' },
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
          ticks: { font: { family: 'Inter', size: 11 }, color: '#374151' },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
    }
  });

  // Chart tab switching
  document.querySelectorAll('.chart-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const period = tab.dataset.period;
      const d = chartData[period];
      overviewChart.data.labels = d.labels;
      overviewChart.data.datasets[0].data = d.data;
      overviewChart.update('active');
    });
  });
}


// ═══════════════════════════════════════════
// FARMING SCORE
// ═══════════════════════════════════════════

function initFarmingScore() {
  const progress = document.getElementById('score-progress');
  if (!progress) return;

  const score = 87;
  const circumference = 2 * Math.PI * 65; // r = 65
  const offset = circumference - (score / 100) * circumference;

  setTimeout(() => {
    progress.style.strokeDashoffset = offset;
  }, 500);
}


// ═══════════════════════════════════════════
// WEATHER
// ═══════════════════════════════════════════

function renderWeatherForecast() {
  const container = document.getElementById('weather-forecast');
  if (!container) return;

  container.innerHTML = AppData.weather.forecast.map(day => `
    <div class="glass-card forecast-day">
      <div class="forecast-day-name">${day.day}</div>
      <div class="forecast-icon">${day.icon}</div>
      <div class="forecast-temp">${day.temp}</div>
      <div class="forecast-rain">💧 ${day.rain}</div>
    </div>
  `).join('');
}


// ═══════════════════════════════════════════
// CROP RECOMMENDATION
// ═══════════════════════════════════════════

function setupCropRecommendation() {
  // Crop recommendation panel removed per updated requirements.
}

function setupFertilizerPrediction() {
  const btn = document.getElementById('fert-btn');
  if (!btn) return;

  btn.addEventListener('click', async function () {
    const soil = document.getElementById('fert-soil').value;
    const crop = document.getElementById('fert-crop').value;
    const ph = parseFloat(document.getElementById('fert-ph').value);
    const n = parseFloat(document.getElementById('fert-n').value);
    const p = parseFloat(document.getElementById('fert-p').value);
    const k = parseFloat(document.getElementById('fert-k').value);

    const resultDiv = document.getElementById('fert-result');
    if (!resultDiv) return;

    resultDiv.innerHTML = '';

    if (!soil || !crop) {
      if(window.UI) UI.toast('Please select soil and crop', 'error');
      return;
    }
    if (Number.isNaN(ph) || Number.isNaN(n) || Number.isNaN(p) || Number.isNaN(k)) {
      if(window.UI) UI.toast('Please enter valid numeric parameters', 'error');
      return;
    }
    
    if (ph < 0 || ph > 14) {
      if(window.UI) UI.toast('pH must be between 0 and 14', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Loading dataset…';
    try {
      await LocalDatasetEngine.load();
      const fertilizer = LocalDatasetEngine.fertilizerMatch({ soil, crop, n, p, k });
      const crops = LocalDatasetEngine.cropMatches({ n, p, k, ph });
      if (!fertilizer) throw new Error('No matching fertilizer record');
      const phAdvice = ph < 6 ? 'Your pH is acidic; discuss liming before nutrient application.' : ph > 7.5 ? 'Your pH is alkaline; ask an agricultural officer about correcting it before applying nutrients.' : 'Your pH is within the general neutral range.';
      resultDiv.innerHTML = `
        <div class="glass-card fert-result-card">
          <h3>🌱 Dataset-backed match</h3>
          <p><strong>Suggested fertilizer type:</strong> ${fertilizer.fertilizer}</p>
          <p>Closest record: ${fertilizer.crop} on ${fertilizer.soil} soil. The recommendation considers your soil type and N/P/K values.</p>
          <h4>🌾 Crop suitability from the local crop dataset</h4>
          <p>${crops.map(name => name[0].toUpperCase() + name.slice(1)).join(' · ')}</p>
          <p>${phAdvice}</p>
          <p><strong>Safety:</strong> The supplied fertilizer dataset labels fertilizer type, not a field-validated application dose. Do not infer a urea quantity from this result; confirm the dose and split schedule with a soil-test lab or local agricultural officer.</p>
        </div>
      `;
    } catch (error) {
      resultDiv.innerHTML = '<div class="glass-card fert-result-card"><p>Could not load the local recommendation dataset. Run the site through a static server or GitHub Pages, rather than opening the HTML file directly.</p></div>';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Find Dataset Match';
    }
  });
}

function setupPestAdvisory() {
  const cropSelect = document.getElementById('pest-crop');
  const pestSelect = document.getElementById('pest-name');
  const severitySelect = document.getElementById('pest-severity');
  const btn = document.getElementById('pest-btn');
  const result = document.getElementById('pest-result');
  if (!cropSelect || !pestSelect || !severitySelect || !btn || !result) return;

  const populatePests = async () => {
    try {
      await LocalDatasetEngine.load();
      const options = LocalDatasetEngine.pestOptions(cropSelect.value);
      pestSelect.innerHTML = options.map(name => `<option value="${name}">${name}</option>`).join('');
    } catch (_) {
      pestSelect.innerHTML = '<option>Dataset unavailable</option>';
    }
  };
  cropSelect.addEventListener('change', populatePests);
  populatePests();

  btn.addEventListener('click', async () => {
    try {
      await LocalDatasetEngine.load();
      const match = LocalDatasetEngine.pestMatch(cropSelect.value, pestSelect.value, severitySelect.value);
      if (!match) throw new Error('No matching advisory');
      result.innerHTML = `
        <div class="glass-card fert-result-card">
          <h3>🛡️ ${match.pest_or_disease} — ${match.severity} severity</h3>
          <p>${match.answer_english}</p>
          <p><strong>Safety check:</strong> Follow the product label, wear required PPE, avoid spraying in rain or strong wind, and verify local registration and pre-harvest interval with an agricultural officer.</p>
          <p style="font-size:0.82rem;color:var(--text-muted)">Source: local Tamil agricultural pest/disease advisory dataset (${match.district}, ${match.season}).</p>
        </div>`;
    } catch (_) {
      result.innerHTML = '<div class="glass-card fert-result-card"><p>No advisory could be found for that selection.</p></div>';
    }
  });
}

// ═══════════════════════════════════════════
// SOIL HEALTH
// ═══════════════════════════════════════════

// animateSoilBars removed


// ═══════════════════════════════════════════
// MARKET TRACKER
// ═══════════════════════════════════════════

let liveMarketData = [];
let marketFilter = '';

function setupLiveMarket() {
  const searchInput = document.getElementById('market-search-input');
  if(!searchInput) return;
  
  searchInput.addEventListener('input', (e) => {
    marketFilter = e.target.value.toLowerCase().trim();
    renderLiveMarketTable();
  });

  document.getElementById('market-retry-btn').addEventListener('click', () => {
    fetchMarketData();
  });

  fetchMarketData();
}

async function fetchMarketData() {
  const loader = document.getElementById('market-loader');
  const errorWrap = document.getElementById('market-error');
  const tableWrap = document.getElementById('market-display');
  
  if (liveMarketData.length === 0) {
    loader.style.display = 'flex';
    tableWrap.style.display = 'none';
  }
  errorWrap.style.display = 'none';

  try {
    await LocalDatasetEngine.load();
    liveMarketData = LocalDatasetEngine.marketSnapshot();
    if (!liveMarketData.length) throw new Error('No supported commodities in dataset');
    document.getElementById('market-last-updated').textContent = `Dataset date: ${liveMarketData[0].date}`;
    loader.style.display = 'none';
    tableWrap.style.display = 'block';
    
    renderLiveMarketTable();
    
  } catch(e) {
    console.warn('Market dataset error', e);
    document.getElementById('market-last-updated').textContent = 'Dataset unavailable';
    loader.style.display = 'none';
    errorWrap.style.display = 'block';
  }
}

function renderLiveMarketTable() {
  const tbody = document.getElementById('market-table-body');
  if(!tbody) return;
  
  const filtered = liveMarketData.filter(item => item.rawName.toLowerCase().includes(marketFilter));
  
  if(filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);font-weight:600;padding:2rem;">No crops found for "${marketFilter}".</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    return `
      <tr>
        <td><strong>${item.crop}</strong></td>
        <td>₹${item.price.toLocaleString()}</td>
        <td>${item.market}</td>
        <td>${item.date}</td>
      </tr>
    `;
  }).join('');
}

let marketChart = null;

function initMarketChart() {
  const ctx = document.getElementById('market-chart');
  if (!ctx) return;

  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

  marketChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Rice',
          data: [1950, 2000, 2020, 2080, 2040, 2150],
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22, 163, 74, 0.08)',
          borderWidth: 2.5,
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 7,
        },
        {
          label: 'Wheat',
          data: [2100, 2120, 2180, 2200, 2200, 2275],
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.08)',
          borderWidth: 2.5,
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 7,
        },
        {
          label: 'Cotton',
          data: [6500, 6600, 6700, 6750, 6800, 6620],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          borderWidth: 2.5,
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 7,
        },
        {
          label: 'Tomato',
          data: [1500, 1800, 2000, 2100, 2200, 2800],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          borderWidth: 2.5,
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 7,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { family: 'Inter', size: 12 },
            usePointStyle: true,
            padding: 20,
          }
        },
        tooltip: {
          backgroundColor: '#111827',
          titleFont: { family: 'Inter', weight: '600' },
          bodyFont: { family: 'Inter' },
          padding: 12,
          cornerRadius: 12,
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ₹${ctx.raw.toLocaleString()}/Q`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 11 }, color: '#374151' },
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
          ticks: {
            font: { family: 'Inter', size: 11 },
            color: '#374151',
            callback: v => '₹' + v.toLocaleString(),
          },
        }
      },
      interaction: { intersect: false, mode: 'index' },
    }
  });
}


// ═══════════════════════════════════════════
// SMART SCHEDULER / CALENDAR
// ═══════════════════════════════════════════

let calendarDate = new Date();
let scheduledEvents = {}; // key: 'YYYY-MM-DD', value: [{type, label}]

function initCalendar() {
  renderCalendar();

  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');

  if (prevBtn) prevBtn.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
  });

  if (nextBtn) nextBtn.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
  });
}

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const label = document.getElementById('cal-month-label');
  if (!grid || !label) return;

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  label.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  let html = dayNames.map(d => `<div class="calendar-day-header">${d}</div>`).join('');

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="calendar-day other-month">${daysInPrevMonth - i}</div>`;
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const events = scheduledEvents[dateStr] || [];
    let classes = 'calendar-day';

    if (isCurrentMonth && d === today.getDate()) classes += ' today';

    // Check event types
    const hasWater = events.some(e => e.type === 'water');
    const hasFertilizer = events.some(e => e.type === 'fertilizer');
    const hasHarvest = events.some(e => e.type === 'harvest');

    if (hasHarvest) classes += ' has-event has-harvest';
    else if (hasFertilizer) classes += ' has-event has-fertilizer';
    else if (hasWater) classes += ' has-event has-water';

    html += `<div class="${classes}" data-date="${dateStr}" onclick="showDayDetail('${dateStr}', ${d})">${d}</div>`;
  }

  // Next month days
  const totalCells = firstDay + daysInMonth;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    html += `<div class="calendar-day other-month">${i}</div>`;
  }

  grid.innerHTML = html;
}

function showDayDetail(dateStr, day) {
  const panel = document.getElementById('day-detail');
  const title = document.getElementById('day-detail-title');
  const tasks = document.getElementById('day-detail-tasks');
  if (!panel || !title || !tasks) return;

  const events = scheduledEvents[dateStr] || [];

  // Highlight selected day
  document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
  const selectedDay = document.querySelector(`.calendar-day[data-date="${dateStr}"]`);
  if (selectedDay) selectedDay.classList.add('selected');

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  title.textContent = `Tasks for ${monthNames[calendarDate.getMonth()]} ${day}`;

  if (events.length === 0) {
    tasks.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">No tasks scheduled for this day.</p>';
  } else {
    tasks.innerHTML = events.map(e => `
      <div class="task-item ${e.type}">
        <span>${e.type === 'water' ? '💧' : e.type === 'fertilizer' ? '🧪' : '🌾'}</span>
        <span>${e.label}</span>
      </div>
    `).join('');
  }

  panel.style.display = 'block';
}


// ═══════════════════════════════════════════
// SCHEDULER FORM
// ═══════════════════════════════════════════

function setupScheduler() {
  const addBtn = document.getElementById('sched-add-btn');
  if (!addBtn) return;

  addBtn.addEventListener('click', () => {
    const cropName = document.getElementById('sched-crop').value.trim();
    const plantDate = document.getElementById('sched-date').value;

    if (!cropName || !plantDate) {
      if(window.UI) UI.toast('Please enter crop name and planting date.', 'error');
      return;
    }
    
    const selectedDate = new Date(plantDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (selectedDate < today) {
      if(window.UI) UI.toast('Planting date cannot be in the past.', 'error');
      return;
    }

    if(window.UI) UI.toast('Schedule generated successfully!', 'success');
    generateSchedule(cropName, plantDate);

    // Clear inputs
    document.getElementById('sched-crop').value = '';
    document.getElementById('sched-date').value = '';
  });
}

function generateSchedule(cropName, plantDateStr) {
  const plantDate = new Date(plantDateStr);
  const tasks = [];

  // Watering every 3 days for 90 days
  for (let i = 0; i <= 90; i += 3) {
    const d = new Date(plantDate);
    d.setDate(d.getDate() + i);
    const dateStr = formatDate(d);

    if (!scheduledEvents[dateStr]) scheduledEvents[dateStr] = [];
    scheduledEvents[dateStr].push({
      type: 'water',
      label: `💧 Water ${cropName}`
    });
  }

  // Remind the farmer to review a soil test at key stages. Do not prescribe a
  // blanket fertilizer schedule: dosage must follow the field's soil test.
  for (const i of [0, 30, 60]) {
    const d = new Date(plantDate);
    d.setDate(d.getDate() + i);
    const dateStr = formatDate(d);

    if (!scheduledEvents[dateStr]) scheduledEvents[dateStr] = [];
    scheduledEvents[dateStr].push({
      type: 'fertilizer',
      label: `🧪 Review soil test before fertilizing ${cropName}`
    });
  }

  // Harvest after 90 days
  const harvestDate = new Date(plantDate);
  harvestDate.setDate(harvestDate.getDate() + 90);
  const harvestStr = formatDate(harvestDate);

  if (!scheduledEvents[harvestStr]) scheduledEvents[harvestStr] = [];
  scheduledEvents[harvestStr].push({
    type: 'harvest',
    label: `🌾 Harvest ${cropName}`
  });

  // Store task info
  AppData.scheduledTasks.push({
    crop: cropName,
    planted: plantDateStr,
    harvest: harvestStr,
  });

  saveTasksToStorage();

  // Refresh calendar
  renderCalendar();
  renderScheduledTasks();
}

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function renderScheduledTasks() {
  const container = document.getElementById('sched-tasks-list');
  if (!container) return;

  if (AppData.scheduledTasks.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:0.82rem; margin-top:1rem;">No schedules yet. Add a crop to get started.</p>';
    return;
  }

  container.innerHTML = '<h4 style="font-size:0.85rem; margin-top:1rem; margin-bottom:0.5rem; color:var(--text-light);">Active Schedules</h4>' +
    AppData.scheduledTasks.map(t => `
      <div class="task-item harvest">
        <span>🌱</span>
        <span><strong>${t.crop}</strong> — Harvest: ${t.harvest}</span>
      </div>
    `).join('');
}


// ═══════════════════════════════════════════
// PROFIT ESTIMATOR
// ═══════════════════════════════════════════

let profitChart = null;

function setupProfitEstimator() {
  const calcBtn = document.getElementById('profit-calc-btn');
  if (!calcBtn) return;

  calcBtn.addEventListener('click', calculateProfit);
}

function calculateProfit() {
  const landArea = parseFloat(document.getElementById('profit-land').value);
  const cropType = document.getElementById('profit-crop').value;
  const yieldPerAcre = parseFloat(document.getElementById('profit-yield').value);
  const costPerAcre = parseFloat(document.getElementById('profit-cost').value);

  if (!landArea || !cropType || !yieldPerAcre || isNaN(costPerAcre)) {
    if(window.UI) UI.toast('Please fill in all profit estimator fields correctly.', 'error');
    return;
  }
  
  if (landArea <= 0 || yieldPerAcre <= 0 || costPerAcre < 0) {
    if(window.UI) UI.toast('Please enter positive valid numbers for estimation.', 'error');
    return;
  }

  const marketPrice = AppData.cropMarketPrices[cropType] || 2000;
  const totalYield = landArea * yieldPerAcre;
  const revenue = totalYield * marketPrice;
  const totalCost = landArea * costPerAcre;
  const profit = revenue - totalCost;

  // Show results
  const resultsGrid = document.getElementById('profit-results');
  const chartSection = document.getElementById('profit-chart-section');
  if (resultsGrid) resultsGrid.style.display = 'grid';
  if (chartSection) chartSection.style.display = 'grid';

  document.getElementById('result-yield').textContent = `${totalYield.toLocaleString()} Q`;
  document.getElementById('result-revenue').textContent = `₹${revenue.toLocaleString()}`;
  document.getElementById('result-cost').textContent = `₹${totalCost.toLocaleString()}`;

  const profitEl = document.getElementById('result-profit');
  profitEl.textContent = `₹${profit.toLocaleString()}`;
  profitEl.className = 'profit-result-value ' + (profit >= 0 ? 'positive' : 'negative');

  // Chart
  renderProfitChart(revenue, totalCost, profit);
}

function renderProfitChart(revenue, cost, profit) {
  const ctx = document.getElementById('profit-chart');
  if (!ctx) return;

  if (profitChart) profitChart.destroy();

  profitChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Revenue', 'Cost', 'Profit'],
      datasets: [{
        label: 'Amount (₹)',
        data: [revenue, cost, profit],
        backgroundColor: [
          'rgba(14, 165, 233, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          profit >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)',
        ],
        borderColor: [
          '#0ea5e9',
          '#ef4444',
          profit >= 0 ? '#22c55e' : '#ef4444',
        ],
        borderWidth: 2,
        borderRadius: 12,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111827',
          titleFont: { family: 'Inter', weight: '600' },
          bodyFont: { family: 'Inter' },
          padding: 12,
          cornerRadius: 12,
          callbacks: {
            label: (ctx) => `₹${ctx.raw.toLocaleString()}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 12, weight: '600' }, color: '#64748b' },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
          ticks: {
            font: { family: 'Inter', size: 11 },
            color: '#374151',
            callback: v => '₹' + (v / 1000).toFixed(0) + 'K'
          }
        }
      }
    }
  });
}


// ═══════════════════════════════════════════
// BEST CROP SUGGESTIONS
// ═══════════════════════════════════════════

function renderBestCrops() {
  const container = document.getElementById('best-crop-list');
  if (!container) return;

  if (window.UI) {
    container.innerHTML = `
      ${UI.createSkeleton({width: '100%', height: '70px', borderRadius: '12px', marginBottom: '10px'})}
      ${UI.createSkeleton({width: '100%', height: '70px', borderRadius: '12px', marginBottom: '10px'})}
      ${UI.createSkeleton({width: '100%', height: '70px', borderRadius: '12px'})}
    `;
    
    setTimeout(() => {
      renderActualBestCrops(container);
    }, 1200);
  } else {
    renderActualBestCrops(container);
  }
}

function renderActualBestCrops(container) {
  container.innerHTML = AppData.bestCrops.map((crop, i) => `
    <div class="best-crop-item" style="animation: panelFadeIn 0.4s ease ${i * 0.1}s both;">
      <span class="best-crop-emoji">${crop.emoji}</span>
      <div class="best-crop-info">
        <div class="best-crop-name">${crop.name}</div>
        <div class="best-crop-profit">${crop.profitPerAcre} / acre</div>
      </div>
    </div>
  `).join('');
}


// ═══════════════════════════════════════════
// SIMULATED DATA UPDATES
// ═══════════════════════════════════════════

function simulateDataUpdates() {
  // Simulate weather temperature fluctuation
  setInterval(() => {
    const tempEl = document.getElementById('weather-temp');
    const humEl = document.getElementById('weather-humidity');
    const rainEl = document.getElementById('weather-rain');

    if (tempEl) {
      const newTemp = AppData.weather.temperature + (Math.random() * 2 - 1);
      AppData.weather.temperature = Math.round(newTemp * 10) / 10;
      tempEl.textContent = `${Math.round(newTemp)}°C`;
    }

    if (humEl) {
      const newHum = Math.min(100, Math.max(30, AppData.weather.humidity + (Math.random() * 4 - 2)));
      AppData.weather.humidity = Math.round(newHum);
      humEl.textContent = `${Math.round(newHum)}%`;
    }

    if (rainEl) {
      const newRain = Math.min(100, Math.max(0, AppData.weather.rainProbability + (Math.random() * 6 - 3)));
      AppData.weather.rainProbability = Math.round(newRain);
      rainEl.textContent = `${Math.round(newRain)}%`;
    }
  }, 5000);

  // Simulate market price fluctuation
  setInterval(() => {
    AppData.marketPrices.forEach(item => {
      const change = Math.round((Math.random() * 40 - 20));
      item.prev = item.price;
      item.price = Math.max(100, item.price + change);
    });
    renderMarketTable();
  }, 8000);
}


// ═══════════════════════════════════════════
// NEW FEATURES
// ═══════════════════════════════════════════

// ── Local Storage for Scheduler ──
function saveTasksToStorage() {
  localStorage.setItem('agroease_tasks', JSON.stringify(AppData.scheduledTasks));
  localStorage.setItem('agroease_events', JSON.stringify(scheduledEvents));
}

function loadTasksFromStorage() {
  const savedTasks = localStorage.getItem('agroease_tasks');
  const savedEvents = localStorage.getItem('agroease_events');
  if (savedTasks) {
    AppData.scheduledTasks = JSON.parse(savedTasks);
  }
  if (savedEvents) {
    scheduledEvents = JSON.parse(savedEvents);
  }
  
  setTimeout(() => {
    if (typeof renderScheduledTasks === 'function') {
      renderScheduledTasks();
    }
  }, 100);
}

// ── Search Overlay ──
function setupSearchOverlay() {
  const searchBtn = document.getElementById('search-btn');
  const overlay = document.getElementById('search-overlay');
  const backdrop = document.getElementById('search-backdrop');
  const closeBtn = document.getElementById('search-close-btn');
  const input = document.getElementById('search-overlay-input');
  const results = document.getElementById('search-results');
  
  if (!searchBtn || !overlay) return;

  const closeSearch = () => {
    overlay.classList.remove('open');
    input.value = '';
    results.innerHTML = '';
  };

  searchBtn.addEventListener('click', () => {
    overlay.classList.add('open');
    input.focus();
  });
  
  backdrop.addEventListener('click', closeSearch);
  closeBtn.addEventListener('click', closeSearch);
  
  const searchItems = [
    { text: 'Dashboard', panel: 'dashboard', icon: '📊' },
    { text: 'Weather Intelligence', panel: 'weather', icon: '🌦️' },
    { text: 'Fertilizer Prediction', panel: 'fertilizer', icon: '🧪' },
    { text: 'Pest & Disease Advisory', panel: 'pest', icon: '🛡️' },
    { text: 'Soil Testing Quiz', panel: 'soil', icon: '🧪' },
    { text: 'Market Tracker', panel: 'market', icon: '💰' },
    { text: 'Farming Scheduler', panel: 'scheduler', icon: '📅' },
    { text: 'Profit Estimator', panel: 'profit', icon: '💸' },
    { text: 'Rice', panel: 'market', icon: '🌾' },
    { text: 'Cotton', panel: 'market', icon: '🏵️' },
    { text: 'Wheat', panel: 'market', icon: '🌿' }
  ];

  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      results.innerHTML = '';
      return;
    }
    
    const matches = searchItems.filter(item => item.text.toLowerCase().includes(query));
    if (matches.length === 0) {
      results.innerHTML = '<div class="search-no-results">No results found for "'+query+'"</div>';
      return;
    }
    
    results.innerHTML = matches.map(m => `
      <div class="search-result-item" data-target="${m.panel}">
        <span>${m.icon}</span>
        <span>${m.text}</span>
      </div>
    `).join('');
    
    results.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        closeSearch();
        const panelBtn = document.querySelector(`.sidebar-link[data-panel="${el.dataset.target}"]`);
        if(panelBtn) panelBtn.click();
      });
    });
  });

  const quickBtns = document.querySelectorAll('.search-quick-btn');
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeSearch();
      const panelBtn = document.querySelector(`.sidebar-link[data-panel="${btn.dataset.panel}"]`);
      if(panelBtn) panelBtn.click();
    });
  });
}

// ── Notifications ──
function setupNotifications() {
  const btn = document.getElementById('notification-btn');
  const dropdown = document.getElementById('notif-dropdown');
  const list = document.getElementById('notif-list');
  const badge = document.getElementById('notif-badge');
  const markAllBtn = document.getElementById('notif-markall-btn');
  
  if (!btn || !dropdown) return;

  const notifs = [
    { title: 'Rain Expected', body: 'Heavy rainfall expected in 24 hours. Consider postponing harvest.', time: '2h ago', icon: '🌧️', unread: true },
    { title: 'Price Alert', body: 'Tomato prices surged by ₹600/qtl in your local market.', time: '5h ago', icon: '🍅', unread: true },
    { title: 'Task Reminder', body: 'Watering scheduled for Rice crop tomorrow.', time: '1d ago', icon: '💧', unread: true }
  ];

  const renderNotifs = () => {
    let unreadCount = notifs.filter(n => n.unread).length;
    if (unreadCount > 0) {
      badge.style.display = 'block';
      badge.textContent = unreadCount;
    } else {
      badge.style.display = 'none';
    }

    if (notifs.length === 0) {
      list.innerHTML = '<div class="notif-empty">No new notifications</div>';
      return;
    }

    list.innerHTML = notifs.map((n, i) => `
      <div class="notif-item ${n.unread ? 'unread' : ''}" data-idx="${i}">
        <div class="notif-item-icon">${n.icon}</div>
        <div class="notif-item-content">
          <div class="notif-item-title">${n.title}</div>
          <div class="notif-item-body">${n.body}</div>
          <div class="notif-item-time">${n.time}</div>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.notif-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = el.dataset.idx;
        notifs[idx].unread = false;
        renderNotifs();
      });
    });
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });

  markAllBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notifs.forEach(n => n.unread = false);
    renderNotifs();
  });

  renderNotifs();
}

// ── Soil Edit Form ──
// ── Soil Testing & Crop Quiz ──
const soilSteps = [
  { id: 'color', question: 'What is the color of your soil?', options: ['Black', 'Red', 'Light Brown', 'Yellow'] },
  { id: 'texture', question: 'How does the soil feel? (Texture)', options: ['Sticky', 'Gritty', 'Soft', 'Loose'] },
  { id: 'water', question: 'How is its water retention capacity?', options: ['High', 'Medium', 'Low'] },
  { id: 'drainage', question: 'How fast does water drain?', options: ['Fast', 'Moderate', 'Slow'] }
];

const realCropData = {
  'Rice': { soil: 'Clay/Alluvial', temp: '20–35°C', water: 'High', dur: '120–150 days', fert: 'Urea, DAP', harvest: '4–5 months', icon: '🌾' },
  'Cotton': { soil: 'Black', temp: '25–35°C', water: 'Moderate', dur: '150–180 days', fert: 'Nitrogen + Potash', harvest: '5–6 months', icon: '🏵️' },
  'Groundnut': { soil: 'Sandy/Red', temp: '25–30°C', water: 'Low–Moderate', dur: '100–120 days', fert: 'Calcium + Phosphorus', harvest: '3–4 months', icon: '🥜' },
  'Maize': { soil: 'Alluvial/Loamy', temp: '18–27°C', water: 'Moderate', dur: '90–120 days', fert: 'Nitrogen-rich', harvest: '3–4 months', icon: '🌽' },
  'Wheat': { soil: 'Loamy/Alluvial', temp: '10–25°C', water: 'Moderate', dur: '110–140 days', fert: 'NPK Balanced', harvest: '4 months', icon: '🌿' }
};

const realSoilData = {
  'Black Soil': { ph: '6.5–8.5', tex: 'Clayey', water: 'High', desc: 'Rich in Calcium, Magnesium, and Iron. Ideal for cotton farming.', crops: ['Cotton', 'Maize'], class: 'theme-black-soil' },
  'Red Soil': { ph: '5.5–7.0', tex: 'Sandy-Loam', water: 'Low', desc: 'Iron-rich but low in nitrogen. Requires good irrigation.', crops: ['Groundnut', 'Maize'], class: 'theme-red-soil' },
  'Alluvial Soil': { ph: '6.0–8.0', tex: 'Loam/Clay', water: 'Medium', desc: 'Highly fertile soil deposited by rivers. Excellent for cash crops.', crops: ['Rice', 'Wheat', 'Maize'], class: 'theme-alluvial-soil' },
  'Sandy Soil': { ph: '5.0–7.0', tex: 'Loose', water: 'Low', desc: 'Drains quickly and warms up fast in spring. Needs frequent watering.', crops: ['Groundnut'], class: 'theme-sandy-soil' },
  'Loamy Soil': { ph: '6.0–7.5', tex: 'Balanced', water: 'Medium-High', desc: 'The perfect balance of sand, silt, and clay. Excellent for most crops.', crops: ['Wheat', 'Rice'], class: 'theme-loamy-soil' }
};

let soilQuizState = { step: 0, answers: {} };

function resetQuiz() {
  soilQuizState = { step: 0, answers: {} };

  const results = document.getElementById('soil-result-container');
  const container = document.getElementById('soil-quiz-container');
  const resetBtn = document.getElementById('soil-quiz-reset-btn');

  if (results) results.style.display = 'none';
  if (resetBtn) resetBtn.style.display = 'none';
  if (container) container.style.display = 'block';

  renderQuizStep();
}

function initSoilQuiz() {
  const container = document.getElementById('soil-quiz-container');
  const results = document.getElementById('soil-result-container');
  const resetBtn = document.getElementById('soil-quiz-reset-btn');
  
  if (!container || !results) return;

  resetBtn.onclick = resetQuiz;

  renderQuizStep();
}

function renderQuizStep() {
  const qTitle = document.getElementById('quiz-question-title');
  const qGrid = document.getElementById('quiz-options-grid');
  const pText = document.getElementById('quiz-step-current');
  const pFill = document.getElementById('quiz-progress-fill');

  qTitle.classList.remove('fade-in');
  qGrid.classList.remove('fade-in');
  qTitle.classList.add('fade-out');
  qGrid.classList.add('fade-out');
  
  setTimeout(() => {
    const stepData = soilSteps[soilQuizState.step];
    pText.textContent = soilQuizState.step + 1;
    let pct = ((soilQuizState.step) / soilSteps.length) * 100;
    if(soilQuizState.step === 0) pct = 25; // Minimum width
    pFill.style.width = pct + '%';
    
    qTitle.textContent = stepData.question;
    qGrid.innerHTML = stepData.options.map(opt => `<button class="quiz-option-btn">${opt}</button>`).join('');
    
    qTitle.classList.remove('fade-out');
    qGrid.classList.remove('fade-out');
    qTitle.classList.add('fade-in');
    qGrid.classList.add('fade-in');

    qGrid.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        soilQuizState.answers[stepData.id] = e.target.textContent;
        if (soilQuizState.step < soilSteps.length - 1) {
          soilQuizState.step++;
          renderQuizStep();
        } else {
          evaluateSoil();
        }
      });
    });
  }, 200);
}

function evaluateSoil() {
  const ans = soilQuizState.answers;
  let identity = 'Loamy Soil'; // Default

  if (ans.color === 'Black' || ans.texture === 'Sticky') identity = 'Black Soil';
  else if (ans.color === 'Red') identity = 'Red Soil';
  else if (ans.texture === 'Loose' || ans.water === 'Low' || ans.drainage === 'Fast') identity = 'Sandy Soil';
  else if (ans.color === 'Light Brown' && (ans.water === 'High' || ans.water === 'Medium')) identity = 'Alluvial Soil';
  
  const pFill = document.getElementById('quiz-progress-fill');
  pFill.style.width = '100%';
  
  setTimeout(() => showSoilResult(identity), 400);
}

function showSoilResult(identity) {
  const sData = realSoilData[identity];
  if (!sData) return;

  document.getElementById('soil-quiz-container').style.display = 'none';
  
  const resContainer = document.getElementById('soil-result-container');
  const hero = document.getElementById('soil-hero-card');
  const cropGrid = document.getElementById('recommended-crops-grid');
  const resetBtn = document.getElementById('soil-quiz-reset-btn');
  
  // Prepare Loading State
  resContainer.style.display = 'block';
  hero.style.display = 'none';
  resetBtn.style.display = 'none';
  
  // Inject Skeletons into Grid
  if (window.UI) {
    cropGrid.innerHTML = `
      ${UI.createSkeleton({width: '100%', height: '100px', borderRadius: '16px'})}
      ${UI.createSkeleton({width: '100%', height: '100px', borderRadius: '16px'})}
      ${UI.createSkeleton({width: '100%', height: '100px', borderRadius: '16px'})}
    `;
  }

  // Simulate AI Processing Delay
  setTimeout(() => {
    hero.style.display = 'block';
    hero.className = `soil-hero-card glass-card ${sData.class}`;
    document.getElementById('soil-identity-title').textContent = identity;
    document.getElementById('ident-ph').textContent = sData.ph;
    document.getElementById('ident-tex').textContent = sData.tex;
    document.getElementById('ident-water').textContent = sData.water;
    document.getElementById('soil-identity-desc').textContent = sData.desc;

    // Render actual crops with staggered animation
    cropGrid.innerHTML = sData.crops.map((cName, i) => {
      const cInfo = realCropData[cName];
      return `
        <div class="rec-crop-card" data-crop="${cName}" style="animation: panelFadeIn 0.5s ease ${i * 0.15}s both;">
          <span class="rec-crop-icon">${cInfo.icon}</span>
          <div class="rec-crop-title">${cName}</div>
          <div class="rec-crop-dur">${cInfo.dur}</div>
        </div>
      `;
    }).join('');

    cropGrid.querySelectorAll('.rec-crop-card').forEach(card => {
      card.addEventListener('click', () => openCropModal(card.dataset.crop));
    });

    resetBtn.style.display = 'inline-block';
  }, 1600);
}

function openCropModal(cropName) {
  const cInfo = realCropData[cropName];
  if(!cInfo) return;

  const overlay = document.getElementById('crop-modal-overlay');
  document.getElementById('cmodal-icon').textContent = cInfo.icon;
  document.getElementById('cmodal-title').textContent = cropName;
  document.getElementById('cmodal-soil').textContent = cInfo.soil;
  document.getElementById('cmodal-temp').textContent = cInfo.temp;
  document.getElementById('cmodal-water').textContent = cInfo.water;
  document.getElementById('cmodal-duration').textContent = cInfo.dur;
  document.getElementById('cmodal-fert').textContent = cInfo.fert;
  document.getElementById('cmodal-harvest').textContent = cInfo.harvest;

  overlay.classList.add('open');
  
  document.getElementById('cmodal-close').onclick = () => overlay.classList.remove('open');
  overlay.onclick = (e) => { if(e.target === overlay) overlay.classList.remove('open'); };
}

// ── OpenWeatherMap API Integration ──
const WEATHER_API_KEY = '3e5df347332ed43921d6127f44f81e78';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

function setupWeatherAPI() {
  const searchBtn = document.getElementById('weather-search-btn');
  const geoBtn = document.getElementById('weather-location-btn');
  const searchInput = document.getElementById('weather-city-input');
  
  if (!searchBtn) return;

  document.getElementById('api-key-notice').style.display = 'none';

  searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) fetchWeatherByCity(city);
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const city = searchInput.value.trim();
      if (city) fetchWeatherByCity(city);
    }
  });

  geoBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
      showWeatherLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          showWeatherError("Location access denied. Please search manually.");
        }
      );
    } else {
      showWeatherError("Geolocation is not supported by your browser.");
    }
  });
  
  // Default on load
  fetchWeatherByCity("Bhimavaram");
}

function showWeatherLoading(isLoading) {
  document.getElementById('weather-error').style.display = 'none';
  if (isLoading) {
    document.getElementById('weather-loader').style.display = 'flex';
    document.getElementById('weather-display').style.display = 'none';
  } else {
    document.getElementById('weather-loader').style.display = 'none';
    document.getElementById('weather-display').style.display = 'block';
  }
}

function showWeatherError(msg) {
  document.getElementById('weather-loader').style.display = 'none';
  document.getElementById('weather-display').style.display = 'none';
  document.getElementById('weather-error').style.display = 'block';
  document.getElementById('weather-error-msg').textContent = msg;
  
  document.getElementById('weather-retry-btn').onclick = () => {
    const cityStr = document.getElementById('weather-city-input').value.trim();
    if(cityStr) fetchWeatherByCity(cityStr);
    else fetchWeatherByCity("Bhimavaram");
  };
}

async function fetchWeatherByCity(city) {
  showWeatherLoading(true);
  try {
    const [current, forecast] = await Promise.all([
      fetch(`${WEATHER_BASE_URL}/weather?q=${city}&units=metric&appid=${WEATHER_API_KEY}`).then(res => { if(!res.ok) throw new Error("City not found"); return res.json();}),
      fetch(`${WEATHER_BASE_URL}/forecast?q=${city}&units=metric&appid=${WEATHER_API_KEY}`).then(res => res.json())
    ]);
    renderLiveWeather(current, forecast);
  } catch (err) {
    showWeatherError(err.message === "City not found" ? "City not found. Please check spelling." : "Failed to fetch weather data.");
  }
}

async function fetchWeatherByCoords(lat, lon) {
  showWeatherLoading(true);
  try {
    const [current, forecast] = await Promise.all([
      fetch(`${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`).then(res => res.json()),
      fetch(`${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`).then(res => res.json())
    ]);
    renderLiveWeather(current, forecast);
  } catch (err) {
    showWeatherError("Failed to fetch weather data for your location.");
  }
}

function renderLiveWeather(current, forecastData) {
  showWeatherLoading(false);
  
  document.getElementById('live-city').textContent = current.name;
  document.getElementById('live-country').textContent = current.sys.country || '';
  
  const updatedTime = new Date(current.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('live-updated').textContent = `As of ${updatedTime}`;

  const mainWeather = current.weather[0];
  document.getElementById('live-temp').innerHTML = `${Math.round(current.main.temp)}&deg;C`;
  document.getElementById('live-desc').textContent = mainWeather.description;
  document.getElementById('live-feels').innerHTML = `Feels like ${Math.round(current.main.feels_like)}&deg;C`;
  
  const iconMap = {
    'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 'Drizzle': '🌦️', 
    'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️', 'Fog': '🌫️', 'Haze': '🌫️'
  };
  const wCode = mainWeather.main;
  document.getElementById('live-icon').textContent = iconMap[wCode] || '🌡️';

  document.getElementById('live-humidity').textContent = `${current.main.humidity}%`;
  document.getElementById('live-wind').textContent = `${Math.round(current.wind.speed * 3.6)} km/h`;
  document.getElementById('live-visibility').textContent = `${(current.visibility / 1000).toFixed(1)} km`;
  document.getElementById('live-pressure').textContent = `${current.main.pressure} hPa`;
  
  const sunrise = new Date(current.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(current.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('live-sunrise').textContent = sunrise;
  document.getElementById('live-sunset').textContent = sunset;

  const heroCard = document.getElementById('weather-hero-card');
  heroCard.className = 'glass-card weather-hero-card'; 
  switch(wCode) {
    case 'Clear': heroCard.classList.add('theme-clear'); break;
    case 'Clouds': heroCard.classList.add('theme-clouds'); break;
    case 'Rain': heroCard.classList.add('theme-rain'); break;
    case 'Drizzle': heroCard.classList.add('theme-drizzle'); break;
    case 'Thunderstorm': heroCard.classList.add('theme-thunderstorm'); break;
    case 'Snow': heroCard.classList.add('theme-snow'); break;
    case 'Mist': case 'Fog': case 'Haze': heroCard.classList.add('theme-mist'); break;
  }

  const alertEl = document.getElementById('weather-alert');
  const alertText = document.getElementById('weather-alert-text');
  if (wCode === 'Rain' || wCode === 'Thunderstorm') {
    alertEl.style.display = 'flex';
    alertText.innerHTML = `<strong>Active ${wCode}:</strong> Expect precipitation. Avoid spraying fertilizers right now.`;
  } else if (current.main.temp > 40) {
    alertEl.style.display = 'flex';
    alertText.innerHTML = `<strong>Extreme Heat Warning:</strong> Limit field exposure. Ensure crops have adequate watering.`;
  } else {
    alertEl.style.display = 'none';
  }

  const forecastList = forecastData.list;
  const daysMap = {};
  
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dateStr = date.toLocaleDateString();
    
    if (!daysMap[dateStr] || Math.abs(date.getHours() - 12) < Math.abs(new Date(daysMap[dateStr].dt * 1000).getHours() - 12)) {
      daysMap[dateStr] = item;
    }
  });

  const dailyItems = Object.values(daysMap).slice(0, 5);
  const fContainer = document.getElementById('weather-forecast');
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  fContainer.innerHTML = dailyItems.map(dayInfo => {
    const d = new Date(dayInfo.dt * 1000);
    const dayLabel = dayNames[d.getDay()];
    const dMain = dayInfo.weather[0].main;
    const dIcon = iconMap[dMain] || '🌡️';
    const temp = Math.round(dayInfo.main.temp);
    
    return `
      <div class="glass-card forecast-day">
        <div class="forecast-day-name">${dayLabel}</div>
        <div class="forecast-icon">${dIcon}</div>
        <div class="forecast-temp">${temp}&deg;C</div>
        <div class="forecast-rain" style="${dMain === 'Rain' ? 'color:#0ea5e9' : 'color:var(--text-muted)'}">${dayInfo.weather[0].description}</div>
      </div>
    `;
  }).join('');
}
