/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TIẾN'S FOOTPRINTS - Personal Interactive Travel Log
 * Upgraded Vanilla JavaScript implementation with Leaflet.js, Supabase,
 * Multi-Image Carousel, Edit Trip, Glowing Polylines, Vehicle Filtering, and PWA.
 */

// ============================================================================
// 1. CONFIGURATION & SUPABASE INITIALIZATION
// ============================================================================

const SUPABASE_URL_PLACEHOLDER = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY_PLACEHOLDER = 'YOUR_SUPABASE_ANON_KEY';

// Retrieve from localStorage or fallback to placeholders
const storedUrl = localStorage.getItem('supabase_url');
const storedKey = localStorage.getItem('supabase_anon_key');

const SUPABASE_URL = storedUrl || SUPABASE_URL_PLACEHOLDER;
const SUPABASE_ANON_KEY = storedKey || SUPABASE_ANON_KEY_PLACEHOLDER;

let supabase = null;
const isPlaceholderConfig = 
  !SUPABASE_URL || 
  !SUPABASE_ANON_KEY || 
  SUPABASE_URL.includes('YOUR_PROJECT_ID') || 
  SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY');

if (window.supabase && !isPlaceholderConfig) {
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client:', err);
  }
}

// Starting origin coordinate for Overland Vietnam Journeys: Cần Thơ
const START_ORIGIN_COORDS = [10.0452, 105.7469];

// Sample starter trips with multiple photography slides
const SAMPLE_TRIPS = [
  {
    id: 'demo-trip-1',
    title: 'Khám phá Miền Tây & Chợ Nổi Cái Răng',
    location: 'Cần Thơ, Đồng bằng Sông Cửu Long',
    lat: 10.0452,
    lng: 105.7469,
    distance_km: 175,
    travel_date: '2026-03-15',
    vehicle: 'Honda Winner X 150',
    description: 'Chuyến phượt dọc Quốc lộ 1A về miền sông nước Tây Đô. Buổi sáng sớm thức dậy từ 5 giờ đi ghe xuồng ra chợ nổi Cái Răng thưởng thức tô bún riêu đậm đà, nhâm nhi ly cà phê sữa đá giữa sông nước mênh mông, đón bình minh rạng ngời.',
    image_urls: [
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'demo-trip-2',
    title: 'Săn mây Đà Lạt qua Đèo Ngoạn Mục',
    location: 'Đà Lạt, Lâm Đồng',
    lat: 11.9404,
    lng: 108.4583,
    distance_km: 310,
    travel_date: '2026-02-20',
    vehicle: 'Honda Winner X 150',
    description: 'Vượt qua những khúc cua ngoằn ngoèo của đèo Sông Pha (Ngoạn Mục) trong làn sương mù mát lạnh. Cắm trại qua đêm trên đồi Đa Phú săn biển mây bồng bềnh lúc bình minh, rừng thông reo vi vu và hương cà phê sáng sớm thơm lừng.',
    image_urls: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'demo-trip-3',
    title: 'Chinh phục Đèo Hải Vân - Thiên hạ đệ nhất hùng quan',
    location: 'Đà Nẵng - Huế, Việt Nam',
    lat: 16.1966,
    lng: 108.1328,
    distance_km: 140,
    travel_date: '2026-01-10',
    vehicle: 'Yamaha Exciter 155',
    description: 'Cảm giác cầm lái ôm cua sát vách núi, phóng tầm mắt ngắm vịnh Lăng Cô xanh ngọc bích và bán đảo Sơn Trà từ đỉnh đèo. Dừng chân tại mỏm đá Hải Vân Quan uống ngụm nước suối mát lạnh và tận hưởng ngọn gió biển lồng lộng.',
    image_urls: [
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'demo-trip-4',
    title: 'Cung đường ven biển Quy Nhơn - Eo Gió',
    location: 'Bình Định, Nam Trung Bộ',
    lat: 13.7820,
    lng: 109.2194,
    distance_km: 260,
    travel_date: '2025-11-28',
    vehicle: 'Yamaha PG-1',
    description: 'Chạy xe dọc con đường biển Nhơn Lý ngắm hoàng hôn rực đỏ rọi xuống bờ đá Eo Gió hùng vĩ. Ghé làng chài thưởng thức hải sản tươi rói, người dân địa phương vô cùng mộc mạc và mến khách.',
    image_urls: [
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'demo-trip-5',
    title: 'Hùng vĩ Mã Pí Lèng & Cao nguyên đá Đồng Văn',
    location: 'Hà Giang, Đông Bắc',
    lat: 23.2389,
    lng: 105.4194,
    distance_km: 350,
    travel_date: '2025-10-18',
    vehicle: 'Honda Wave Alpha Phượt',
    description: 'Hành trình khó quên nơi địa đầu Tổ quốc. Dòng sông Nho Quế màu xanh ngọc bích uốn lượn dưới hẻm vực Tu Sản sâu thẳm. Những dốc cua tay áo dốc đứng và cờ Tổ quốc bay phấp phới trên đỉnh Cột cờ Lũng Cú.',
    image_urls: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'demo-trip-6',
    title: 'Hoàng hôn bãi Trường & Vườn tiêu Phú Quốc',
    location: 'Phú Quốc, Kiên Giang',
    lat: 10.2289,
    lng: 103.9572,
    distance_km: 95,
    travel_date: '2025-08-14',
    vehicle: 'Vespa Sprint 150',
    description: 'Chạy xe quanh đảo ngọc dưới bóng râm rợp mát của rừng nguyên sinh. Chiều tà dừng xe tại Bãi Sao và ngắm nhìn quả cầu lửa hoàng hôn từ từ chìm xuống mặt biển phẳng lặng.',
    image_urls: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80'
    ]
  }
];

// ============================================================================
// 2. APPLICATION STATE
// ============================================================================

const state = {
  trips: [],
  selectedTripId: null,
  activeMarker: null,
  mapMarkers: new Map(),       // tripId -> L.marker
  mapPolylines: new Map(),     // tripId -> L.polyline
  currentUser: null,
  isCoordinatePickerActive: false,
  pickedCoordinates: null,
  selectedVehicleFilter: 'all',
  editingTripId: null,         // Trip id being edited (null = adding new)
  currentCarouselIndex: 0,
  activeTripImages: [],
  selectedFiles: [],           // Newly selected File objects in form
  existingImageUrls: []        // Retained image URLs when editing
};

// ============================================================================
// 3. LEAFLET MAP INITIALIZATION & BASE LAYERS
// ============================================================================

const map = L.map('map', {
  center: [10.0452, 105.7469],
  zoom: 7,
  zoomControl: false
});

L.control.zoom({ position: 'bottomright' }).addTo(map);

// Reliable Tile Providers with Vietnamese diacritics
const MAP_LAYERS = {
  google_vi: {
    name: 'Bản đồ Tiếng Việt',
    layer: L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi', {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps (Tiếng Việt có dấu)'
    })
  },
  google_terrain: {
    name: 'Địa hình Topo',
    layer: L.tileLayer('https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&hl=vi', {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps Địa hình Topo'
    })
  },
  google_hybrid: {
    name: 'Vệ tinh Hybrid',
    layer: L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=vi', {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps Vệ tinh'
    })
  },
  carto_voyager: {
    name: 'Du lịch Voyager',
    layer: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    })
  },
  esri_topo: {
    name: 'Địa hình Esri',
    layer: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Tiles &copy; Esri &mdash; Esri World Topo Map'
    })
  }
};

let storedLayerKey = localStorage.getItem('preferred_map_layer');
if (!storedLayerKey || storedLayerKey === 'osm_vn' || !MAP_LAYERS[storedLayerKey]) {
  storedLayerKey = 'google_vi';
  localStorage.setItem('preferred_map_layer', 'google_vi');
}

let currentTileLayerKey = storedLayerKey;
let activeTileLayer = MAP_LAYERS[currentTileLayerKey].layer;
activeTileLayer.addTo(map);

setTimeout(() => {
  map.invalidateSize();
}, 250);

window.addEventListener('resize', () => {
  map.invalidateSize();
});

function setMapLayer(layerKey) {
  if (!MAP_LAYERS[layerKey]) return;
  if (activeTileLayer) {
    map.removeLayer(activeTileLayer);
  }
  currentTileLayerKey = layerKey;
  activeTileLayer = MAP_LAYERS[layerKey].layer;
  activeTileLayer.addTo(map);

  const labelEl = document.getElementById('current-layer-name');
  if (labelEl) labelEl.textContent = MAP_LAYERS[layerKey].name;

  document.querySelectorAll('.layer-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.layer === layerKey);
  });

  localStorage.setItem('preferred_map_layer', layerKey);
  showToast('Đổi bản đồ', `Đang hiển thị: ${MAP_LAYERS[layerKey].name}`, 'info');
}

// Temporary marker for coordinate picking mode
let pickPreviewMarker = null;

map.on('click', (e) => {
  if (state.isCoordinatePickerActive) {
    const { lat, lng } = e.latlng;
    const roundedLat = parseFloat(lat.toFixed(5));
    const roundedLng = parseFloat(lng.toFixed(5));

    const latInput = document.getElementById('input-lat');
    const lngInput = document.getElementById('input-lng');
    if (latInput) latInput.value = roundedLat;
    if (lngInput) lngInput.value = roundedLng;

    if (pickPreviewMarker) {
      map.removeLayer(pickPreviewMarker);
    }
    pickPreviewMarker = L.marker([lat, lng], {
      icon: createCustomDivIcon({ vehicle: 'Xe máy' }, false, true)
    }).addTo(map);

    showToast('Tọa độ đã chọn!', `${roundedLat}, ${roundedLng}`, 'info');
    toggleCoordinatePicker(false);
    openModal('modal-add-trip');
    return;
  }
});

// ============================================================================
// 4. CUSTOM LEAFLET DIVICON & ROUTE POLYLINES GENERATOR
// ============================================================================

function getVehicleIconClass(vehicleStr = '') {
  const v = (vehicleStr || '').toLowerCase();
  if (v.includes('ô tô') || v.includes('oto') || v.includes('car')) return 'fa-solid fa-car-side';
  if (v.includes('đạp') || v.includes('bike') || v.includes('bicycle')) return 'fa-solid fa-bicycle';
  if (v.includes('bộ') || v.includes('walk') || v.includes('trek')) return 'fa-solid fa-person-hiking';
  return 'fa-solid fa-motorcycle';
}

function createCustomDivIcon(trip, isActive = false, isPreview = false) {
  const iconClass = getVehicleIconClass(trip.vehicle);
  const activeClass = isActive ? 'active' : '';
  const previewClass = isPreview ? 'preview-pulse' : '';

  const html = `
    <div class="pin-anchor-wrap ${activeClass} ${previewClass}" data-trip-id="${trip.id || ''}">
      <div class="pin-pulse-ring"></div>
      <div class="pin-circle">
        <i class="${iconClass}"></i>
      </div>
      <div class="pin-pointer"></div>
      <div class="pin-shadow"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-trip-pin',
    html: html,
    iconSize: [44, 52],
    iconAnchor: [22, 50],
    popupAnchor: [0, -48]
  });
}

/**
 * Generates natural road-like curved waypoints connecting Cần Thơ to the destination
 */
function generateRouteWaypoints(start, end) {
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;

  if (Math.abs(lat1 - lat2) < 0.05 && Math.abs(lng1 - lng2) < 0.05) {
    return [start, end];
  }

  const points = [start];
  const steps = 7;
  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;

  // Gentle curved offset perpendicular to direct vector
  const curveFactor = 0.06;
  const ctrlLat = midLat - dLng * curveFactor;
  const ctrlLng = midLng + dLat * curveFactor;

  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    // Quadratic Bezier interpolation
    const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * ctrlLat + t * t * lat2;
    const lng = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * ctrlLng + t * t * lng2;
    points.push([lat, lng]);
  }

  points.push(end);
  return points;
}

// ============================================================================
// 5. DATA FETCHING & SYNCHRONIZATION
// ============================================================================

async function fetchTrips() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('travel_trips')
        .select('*')
        .order('travel_date', { ascending: false });

      if (error) {
        console.warn('[Supabase] Error fetching travel_trips:', error.message);
        useFallbackTrips(error.message);
      } else if (data && data.length > 0) {
        state.trips = data;
        updateSupabaseStatus(true, `${data.length} chuyến đi từ Supabase`);
        renderVehicleFilters();
        renderAllTripMarkers();
        updateSidebarStats();
        renderRecentTripsList();
      } else {
        useFallbackTrips('Bảng travel_trips đang trống. Đang hiển thị dữ liệu mẫu.');
      }
    } catch (err) {
      console.warn('[Supabase] Connection exception:', err);
      useFallbackTrips('Không kết nối được Supabase.');
    }
  } else {
    useFallbackTrips('Đang ở chế độ Demo (chưa cấu hình Supabase).');
  }
}

function useFallbackTrips(reasonText) {
  const localSaved = localStorage.getItem('local_travel_trips');
  if (localSaved) {
    try {
      state.trips = JSON.parse(localSaved);
    } catch {
      state.trips = [...SAMPLE_TRIPS];
    }
  } else {
    state.trips = [...SAMPLE_TRIPS];
  }

  updateSupabaseStatus(false, reasonText);
  renderVehicleFilters();
  renderAllTripMarkers();
  updateSidebarStats();
  renderRecentTripsList();
}

// ============================================================================
// 6. VEHICLE FILTER TAGS
// ============================================================================

function renderVehicleFilters() {
  const filterScroll = document.getElementById('vehicle-filter-scroll');
  const filterStat = document.getElementById('vehicle-filter-stat');
  if (!filterScroll) return;

  // Extract unique vehicle names
  const rawVehicles = state.trips.map(t => (t.vehicle || 'Khác').trim()).filter(Boolean);
  const uniqueVehicles = Array.from(new Set(rawVehicles));

  // Count per vehicle
  const counts = {};
  rawVehicles.forEach(v => counts[v] = (counts[v] || 0) + 1);

  const isAllActive = state.selectedVehicleFilter === 'all';
  if (filterStat) {
    filterStat.textContent = isAllActive ? `Tất cả (${state.trips.length})` : state.selectedVehicleFilter;
  }

  let html = `
    <button type="button" class="vehicle-filter-pill ${isAllActive ? 'active' : ''}" data-vehicle="all">
      <i class="fa-solid fa-globe"></i> Tất cả <span class="vehicle-pill-count">(${state.trips.length})</span>
    </button>
  `;

  uniqueVehicles.forEach(v => {
    const isActive = state.selectedVehicleFilter === v;
    const iconClass = getVehicleIconClass(v);
    html += `
      <button type="button" class="vehicle-filter-pill ${isActive ? 'active' : ''}" data-vehicle="${v}">
        <i class="${iconClass}"></i> ${v} <span class="vehicle-pill-count">(${counts[v] || 0})</span>
      </button>
    `;
  });

  filterScroll.innerHTML = html;

  // Add click listeners
  filterScroll.querySelectorAll('.vehicle-filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.vehicle;
      setVehicleFilter(v);
    });
  });
}

function setVehicleFilter(vehicleFilter) {
  state.selectedVehicleFilter = vehicleFilter;
  renderVehicleFilters();

  // Filter map markers and polylines
  state.trips.forEach(trip => {
    const isMatch = (vehicleFilter === 'all') || (trip.vehicle || 'Khác').trim() === vehicleFilter;
    const marker = state.mapMarkers.get(trip.id);
    const polyline = state.mapPolylines.get(trip.id);

    if (marker) {
      if (isMatch) {
        if (!map.hasLayer(marker)) map.addLayer(marker);
      } else {
        if (map.hasLayer(marker)) map.removeLayer(marker);
      }
    }

    if (polyline) {
      if (isMatch) {
        if (!map.hasLayer(polyline)) map.addLayer(polyline);
      } else {
        if (map.hasLayer(polyline)) map.removeLayer(polyline);
      }
    }
  });

  renderRecentTripsList();
}

// ============================================================================
// 7. MAP MARKERS & GLOWING ROUTE POLYLINES
// ============================================================================

function renderAllTripMarkers() {
  // Clear existing layers
  state.mapMarkers.forEach(m => map.removeLayer(m));
  state.mapMarkers.clear();

  state.mapPolylines.forEach(p => map.removeLayer(p));
  state.mapPolylines.clear();

  state.trips.forEach((trip) => {
    if (!trip.lat || !trip.lng) return;

    const isMatch = (state.selectedVehicleFilter === 'all') || (trip.vehicle || 'Khác').trim() === state.selectedVehicleFilter;
    const isActive = trip.id === state.selectedTripId;

    // 1. Draw glowing route polyline from Cần Thơ to Destination
    const routePoints = generateRouteWaypoints(START_ORIGIN_COORDS, [trip.lat, trip.lng]);
    const polyline = L.polyline(routePoints, {
      color: '#ea580c',
      weight: 3.5,
      opacity: 0.85,
      dashArray: '6, 8',
      lineCap: 'round',
      lineJoin: 'round',
      className: `route-polyline ${isActive ? 'active' : ''}`
    });

    if (isMatch) {
      polyline.addTo(map);
    }

    polyline.on('click', () => {
      selectTrip(trip.id, true);
    });

    state.mapPolylines.set(trip.id, polyline);

    // 2. Draw custom DivIcon marker
    const marker = L.marker([trip.lat, trip.lng], {
      icon: createCustomDivIcon(trip, isActive),
      title: trip.title,
      riseOnHover: true
    });

    if (isMatch) {
      marker.addTo(map);
    }

    marker.on('click', () => {
      selectTrip(trip.id, true);
    });

    state.mapMarkers.set(trip.id, marker);
  });
}

function selectTrip(tripId, shouldFitBounds = true) {
  const trip = state.trips.find((t) => t.id === tripId);
  if (!trip) return;

  state.selectedTripId = tripId;

  // Highlight active pin & dim others
  state.mapMarkers.forEach((marker, id) => {
    const isThisActive = id === tripId;
    const t = state.trips.find((item) => item.id === id);
    if (t) {
      marker.setIcon(createCustomDivIcon(t, isThisActive));
    }
  });

  // Highlight active polyline & fitBounds
  state.mapPolylines.forEach((polyline, id) => {
    const isThisActive = id === tripId;
    const pathEl = polyline.getElement();
    if (pathEl) {
      if (isThisActive) {
        pathEl.classList.add('active');
      } else {
        pathEl.classList.remove('active');
      }
    }
  });

  const activePolyline = state.mapPolylines.get(tripId);
  if (shouldFitBounds && activePolyline) {
    // FIT BOUNDS: map.fitBounds(polyline.getBounds(), { padding: [50, 50], maxZoom: 11 })
    map.fitBounds(activePolyline.getBounds(), {
      padding: [50, 50],
      maxZoom: 11
    });
  } else if (shouldFitBounds && trip.lat && trip.lng) {
    map.flyTo([trip.lat, trip.lng], 10, { duration: 1.2 });
  }

  // Inject active trip details & carousel
  renderActiveTripDetails(trip);

  document.querySelectorAll('.tab-pill').forEach(btn => btn.classList.remove('active'));
  const detailTab = document.getElementById('tab-detail');
  if (detailTab) detailTab.classList.add('active');

  const contentEl = document.querySelector('.sidebar-content');
  if (contentEl) contentEl.scrollTo({ top: 0, behavior: 'smooth' });
}

function deselectTrip() {
  state.selectedTripId = null;

  state.mapMarkers.forEach((marker, id) => {
    const t = state.trips.find((item) => item.id === id);
    if (t) {
      marker.setIcon(createCustomDivIcon(t, false));
    }
  });

  state.mapPolylines.forEach((polyline) => {
    const pathEl = polyline.getElement();
    if (pathEl) pathEl.classList.remove('active');
  });

  document.getElementById('empty-state-view').style.display = 'flex';
  document.getElementById('active-trip-view').classList.remove('visible');
  document.getElementById('active-trip-view').style.display = 'none';

  document.querySelectorAll('.tab-pill').forEach(btn => btn.classList.remove('active'));
  const allTab = document.getElementById('tab-all');
  if (allTab) allTab.classList.add('active');
}

// ============================================================================
// 8. SIDEBAR & MULTI-IMAGE CAROUSEL
// ============================================================================

function formatDate(dateStr) {
  if (!dateStr) return 'Chưa rõ ngày';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

function renderActiveTripDetails(trip) {
  const emptyView = document.getElementById('empty-state-view');
  const activeView = document.getElementById('active-trip-view');

  emptyView.style.display = 'none';
  activeView.style.display = 'block';
  activeView.classList.add('visible');

  // Multi-image collection
  const defaultFallback = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
  state.activeTripImages = (trip.image_urls && trip.image_urls.length > 0)
    ? trip.image_urls.filter(Boolean)
    : [defaultFallback];

  state.currentCarouselIndex = 0;
  updateCarouselSlide();

  // Populate text metadata
  document.getElementById('trip-detail-title').textContent = trip.title;
  document.getElementById('meta-location-val').textContent = trip.location || 'Việt Nam';
  document.getElementById('meta-distance-val').textContent = trip.distance_km ? `${trip.distance_km} km` : 'Tùy chọn';
  document.getElementById('meta-vehicle-val').textContent = trip.vehicle || 'Xe máy';
  document.getElementById('meta-date-val').textContent = formatDate(trip.travel_date);
  document.getElementById('trip-detail-desc').textContent = trip.description || 'Chưa có ghi chú nhật ký cho hành trình này.';
  document.getElementById('meta-coords-val').textContent = `${trip.lat.toFixed(4)}°N, ${trip.lng.toFixed(4)}°E`;

  // Admin buttons visibility (Delete & Edit)
  const delBtn = document.getElementById('btn-delete-trip');
  const editBtn = document.getElementById('btn-edit-trip');
  const isAdmin = !!state.currentUser;

  if (delBtn) delBtn.style.display = isAdmin ? 'inline-flex' : 'none';
  if (editBtn) editBtn.style.display = isAdmin ? 'inline-flex' : 'none';
}

function updateCarouselSlide() {
  const total = state.activeTripImages.length;
  if (total === 0) return;

  const currentIdx = state.currentCarouselIndex;
  const currentImgUrl = state.activeTripImages[currentIdx];

  const imgEl = document.getElementById('trip-detail-img');
  if (imgEl) {
    imgEl.src = currentImgUrl;
  }

  // Counter badge
  const counterText = document.getElementById('carousel-counter-text');
  if (counterText) {
    counterText.textContent = `${currentIdx + 1} / ${total}`;
  }

  const prevBtn = document.getElementById('carousel-prev-btn');
  const nextBtn = document.getElementById('carousel-next-btn');
  const dotsContainer = document.getElementById('carousel-dots');

  // Hide arrows & dots if only 1 image
  if (total <= 1) {
    if (prevBtn) prevBtn.classList.add('hidden');
    if (nextBtn) nextBtn.classList.add('hidden');
    if (dotsContainer) dotsContainer.classList.add('hidden');
  } else {
    if (prevBtn) prevBtn.classList.remove('hidden');
    if (nextBtn) nextBtn.classList.remove('hidden');
    if (dotsContainer) {
      dotsContainer.classList.remove('hidden');
      dotsContainer.innerHTML = state.activeTripImages.map((_, i) => `
        <button type="button" class="carousel-dot ${i === currentIdx ? 'active' : ''}" data-idx="${i}" aria-label="Xem ảnh ${i + 1}"></button>
      `).join('');

      dotsContainer.querySelectorAll('.carousel-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          state.currentCarouselIndex = parseInt(dot.dataset.idx, 10);
          updateCarouselSlide();
        });
      });
    }
  }
}

// Carousel Next / Prev listeners
const carouselPrevBtn = document.getElementById('carousel-prev-btn');
const carouselNextBtn = document.getElementById('carousel-next-btn');

if (carouselPrevBtn) {
  carouselPrevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const total = state.activeTripImages.length;
    if (total <= 1) return;
    state.currentCarouselIndex = (state.currentCarouselIndex - 1 + total) % total;
    updateCarouselSlide();
  });
}

if (carouselNextBtn) {
  carouselNextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const total = state.activeTripImages.length;
    if (total <= 1) return;
    state.currentCarouselIndex = (state.currentCarouselIndex + 1) % total;
    updateCarouselSlide();
  });
}

function updateSidebarStats() {
  const totalTrips = state.trips.length;
  const totalKm = state.trips.reduce((acc, curr) => acc + (parseInt(curr.distance_km, 10) || 0), 0);

  const tripsCountEl = document.getElementById('stat-total-trips');
  const totalKmEl = document.getElementById('stat-total-km');
  const mapOverlayCount = document.getElementById('map-badge-count');

  if (tripsCountEl) tripsCountEl.textContent = `${totalTrips}`;
  if (totalKmEl) totalKmEl.textContent = `${totalKm.toLocaleString('vi-VN')} km`;
  if (mapOverlayCount) mapOverlayCount.textContent = `${totalTrips} Điểm Đến`;
}

function renderRecentTripsList() {
  const container = document.getElementById('recent-trips-list');
  if (!container) return;

  const filteredTrips = state.trips.filter(t => {
    if (state.selectedVehicleFilter === 'all') return true;
    return (t.vehicle || 'Khác').trim() === state.selectedVehicleFilter;
  });

  if (filteredTrips.length === 0) {
    container.innerHTML = '<p style="font-size:0.8rem;color:var(--gray-400);text-align:center;padding:16px 0;">Không có chuyến đi nào phù hợp với bộ lọc.</p>';
    return;
  }

  container.innerHTML = filteredTrips.map(trip => {
    const thumbUrl = (trip.image_urls && trip.image_urls.length > 0)
      ? trip.image_urls[0]
      : 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80';
    
    const isSelected = trip.id === state.selectedTripId;

    return `
      <div class="trip-compact-card ${isSelected ? 'active' : ''}" onclick="window.appSelectTrip('${trip.id}')">
        <img class="compact-card-img" src="${thumbUrl}" alt="${trip.title}" loading="lazy" />
        <div class="compact-card-info">
          <div class="compact-card-title">${trip.title}</div>
          <div class="compact-card-meta">
            <span><i class="fa-solid fa-location-dot"></i> ${trip.location}</span>
            <span><i class="fa-solid fa-route"></i> ${trip.distance_km || 0} km</span>
            <span><i class="${getVehicleIconClass(trip.vehicle)}"></i> ${trip.vehicle}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.appSelectTrip = function(id) {
  selectTrip(id, true);
};

// ============================================================================
// 9. AUTHENTICATION & ADMIN MODE
// ============================================================================

async function initAuth() {
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      handleAuthSession(session);

      supabase.auth.onAuthStateChange((_event, session) => {
        handleAuthSession(session);
      });
    } catch (err) {
      console.warn('[Supabase Auth] Session error:', err);
    }
  } else {
    const isDemoAdmin = localStorage.getItem('demo_admin_active') === 'true';
    if (isDemoAdmin) {
      setAdminState(true, { email: 'tien.traveler@example.com' });
    }
  }
}

function handleAuthSession(session) {
  if (session && session.user) {
    state.currentUser = session.user;
    setAdminState(true, session.user);
  } else {
    state.currentUser = null;
    setAdminState(false);
  }
}

function setAdminState(isAdmin, user = null) {
  const adminBadge = document.getElementById('admin-badge');
  const floatingBtn = document.getElementById('floating-add-btn');
  const adminLockBtn = document.getElementById('btn-admin-login');
  const deleteBtn = document.getElementById('btn-delete-trip');
  const editBtn = document.getElementById('btn-edit-trip');

  if (isAdmin) {
    if (adminBadge) {
      adminBadge.classList.add('visible');
      const emailSpan = document.getElementById('admin-user-email');
      if (emailSpan) emailSpan.textContent = user?.email || 'Admin';
    }
    if (floatingBtn) floatingBtn.style.display = 'flex';
    if (adminLockBtn) adminLockBtn.style.display = 'none';
    if (deleteBtn && state.selectedTripId) deleteBtn.style.display = 'inline-flex';
    if (editBtn && state.selectedTripId) editBtn.style.display = 'inline-flex';
  } else {
    if (adminBadge) adminBadge.classList.remove('visible');
    if (floatingBtn) floatingBtn.style.display = 'none';
    if (adminLockBtn) adminLockBtn.style.display = 'flex';
    if (deleteBtn) deleteBtn.style.display = 'none';
    if (editBtn) editBtn.style.display = 'none';
  }
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const submitBtn = document.getElementById('btn-login-submit');

    if (!email || !password) {
      showToast('Thông báo', 'Vui lòng nhập đầy đủ Email và Mật khẩu.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang đăng nhập...';

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) {
          showToast('Đăng nhập thất bại', error.message, 'error');
        } else {
          showToast('Thành công', 'Đã đăng nhập vào Admin Mode!', 'success');
          closeModal('modal-login');
          handleAuthSession(data.session);
        }
      } catch (err) {
        showToast('Lỗi', err.message || 'Lỗi kết nối Supabase Auth', 'error');
      }
    } else {
      localStorage.setItem('demo_admin_active', 'true');
      state.currentUser = { email: email || 'tien.admin@travel.com' };
      setAdminState(true, state.currentUser);
      closeModal('modal-login');
      showToast('Admin Mode kích hoạt!', `Đã đăng nhập với tài khoản ${email}`, 'success');
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Đăng nhập';
  });
}

const logoutBtn = document.getElementById('btn-admin-logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('demo_admin_active');
    state.currentUser = null;
    setAdminState(false);
    showToast('Đã đăng xuất', 'Bạn đã rời khỏi chế độ quản trị.', 'info');
  });
}

const btnQuickDemoAdmin = document.getElementById('btn-demo-admin-login');
if (btnQuickDemoAdmin) {
  btnQuickDemoAdmin.addEventListener('click', () => {
    localStorage.setItem('demo_admin_active', 'true');
    state.currentUser = { email: 'tien.phuot@vietnam.vn' };
    setAdminState(true, state.currentUser);
    closeModal('modal-login');
    showToast('Admin Mode', 'Đã kích hoạt chế độ Admin!', 'success');
  });
}

// ============================================================================
// 10. MULTI-IMAGE UPLOAD & EDIT TRIP MODAL
// ============================================================================

const addTripForm = document.getElementById('add-trip-form');
const imageFileInput = document.getElementById('trip-image-file');
const imageDropzone = document.getElementById('image-dropzone');
const previewContainerMulti = document.getElementById('image-preview-container');
const previewGrid = document.getElementById('image-preview-grid');
const btnAddMoreImages = document.getElementById('btn-add-more-images');
const btnClearAllImages = document.getElementById('btn-clear-all-images');

if (imageDropzone && imageFileInput) {
  imageDropzone.addEventListener('click', () => imageFileInput.click());

  imageDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageDropzone.classList.add('drag-over');
  });

  imageDropzone.addEventListener('dragleave', () => {
    imageDropzone.classList.remove('drag-over');
  });

  imageDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    imageDropzone.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  });

  imageFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(Array.from(e.target.files));
    }
  });
}

if (btnAddMoreImages && imageFileInput) {
  btnAddMoreImages.addEventListener('click', () => imageFileInput.click());
}

if (btnClearAllImages) {
  btnClearAllImages.addEventListener('click', () => {
    state.selectedFiles = [];
    state.existingImageUrls = [];
    if (imageFileInput) imageFileInput.value = '';
    renderMultiPreviews();
  });
}

function handleFilesSelected(newFiles) {
  const validFiles = newFiles.filter(f => f.type.startsWith('image/'));
  if (validFiles.length === 0) {
    showToast('Tệp không hợp lệ', 'Vui lòng chọn các tệp hình ảnh (JPG, PNG, WebP).', 'error');
    return;
  }

  // Append to selectedFiles list
  state.selectedFiles.push(...validFiles);
  renderMultiPreviews();
}

function renderMultiPreviews() {
  if (!previewGrid || !previewContainerMulti) return;

  const totalItems = state.existingImageUrls.length + state.selectedFiles.length;

  if (totalItems === 0) {
    previewContainerMulti.classList.remove('active');
    if (imageDropzone) imageDropzone.style.display = 'block';
    return;
  }

  previewContainerMulti.classList.add('active');

  let html = '';

  // 1. Existing remote URLs
  state.existingImageUrls.forEach((url, idx) => {
    html += `
      <div class="preview-grid-item" title="Ảnh hiện tại ${idx + 1}">
        <img class="preview-grid-thumb" src="${url}" alt="Preview ${idx + 1}" />
        <button type="button" class="preview-grid-remove" onclick="window.appRemoveExistingImg(${idx})" title="Xóa ảnh này">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
  });

  // 2. Newly chosen local Files
  state.selectedFiles.forEach((file, idx) => {
    const objectUrl = URL.createObjectURL(file);
    html += `
      <div class="preview-grid-item" title="${file.name}">
        <img class="preview-grid-thumb" src="${objectUrl}" alt="${file.name}" />
        <button type="button" class="preview-grid-remove" onclick="window.appRemoveSelectedFile(${idx})" title="Xóa ảnh này">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
  });

  previewGrid.innerHTML = html;
}

window.appRemoveExistingImg = function(index) {
  state.existingImageUrls.splice(index, 1);
  renderMultiPreviews();
};

window.appRemoveSelectedFile = function(index) {
  state.selectedFiles.splice(index, 1);
  renderMultiPreviews();
};

// ============================================================================
// EDIT TRIP CAPABILITY (ADMIN MODE)
// ============================================================================

const btnEditTrip = document.getElementById('btn-edit-trip');
if (btnEditTrip) {
  btnEditTrip.addEventListener('click', () => {
    if (!state.selectedTripId) return;
    const trip = state.trips.find(t => t.id === state.selectedTripId);
    if (!trip) return;

    state.editingTripId = trip.id;

    // Switch title & submit button text to Edit Mode
    const modalTitle = document.getElementById('modal-add-trip-title');
    const submitBtn = document.getElementById('btn-add-trip-submit');
    if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> <span>Chỉnh sửa hành trình</span>';
    if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Cập nhật';

    // Populate existing fields
    document.getElementById('input-title').value = trip.title || '';
    document.getElementById('input-location').value = trip.location || '';
    document.getElementById('input-lat').value = trip.lat || '';
    document.getElementById('input-lng').value = trip.lng || '';
    document.getElementById('input-distance').value = trip.distance_km || 0;
    document.getElementById('input-date').value = trip.travel_date || '';
    document.getElementById('input-vehicle').value = trip.vehicle || '';
    document.getElementById('input-description').value = trip.description || '';
    document.getElementById('input-image-url').value = '';

    // Populate existing images
    state.existingImageUrls = trip.image_urls ? [...trip.image_urls] : [];
    state.selectedFiles = [];
    renderMultiPreviews();

    openModal('modal-add-trip');
  });
}

// Reset form to Add Mode when opening via Floating "+ Add Trip" button
const floatingAddBtn = document.getElementById('floating-add-btn');
if (floatingAddBtn) {
  floatingAddBtn.addEventListener('click', () => {
    if (!state.currentUser) {
      openModal('modal-login');
      showToast('Đăng nhập quản trị', 'Vui lòng đăng nhập tài khoản quản trị để thêm hành trình mới.', 'info');
    } else {
      prepareAddNewTrip();
      openModal('modal-add-trip');
    }
  });
}

function prepareAddNewTrip() {
  state.editingTripId = null;
  const modalTitle = document.getElementById('modal-add-trip-title');
  const submitBtn = document.getElementById('btn-add-trip-submit');
  if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-map-pin"></i> <span>Thêm Hành Trình Mới</span>';
  if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Lưu chuyến đi';

  if (addTripForm) addTripForm.reset();
  state.existingImageUrls = [];
  state.selectedFiles = [];
  renderMultiPreviews();

  if (pickPreviewMarker) {
    map.removeLayer(pickPreviewMarker);
    pickPreviewMarker = null;
  }
}

// Submit handler for both Add & Edit
if (addTripForm) {
  addTripForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('btn-add-trip-submit');

    const title = document.getElementById('input-title').value.trim();
    const location = document.getElementById('input-location').value.trim();
    const lat = parseFloat(document.getElementById('input-lat').value);
    const lng = parseFloat(document.getElementById('input-lng').value);
    const distance_km = parseInt(document.getElementById('input-distance').value, 10) || 0;
    const travel_date = document.getElementById('input-date').value;
    const vehicle = document.getElementById('input-vehicle').value.trim() || 'Honda Winner X 150';
    const description = document.getElementById('input-description').value.trim();
    const rawUrls = document.getElementById('input-image-url').value.trim();

    if (!title || !location || isNaN(lat) || isNaN(lng) || !travel_date) {
      showToast('Thiếu thông tin', 'Vui lòng điền đủ Tiêu đề, Địa điểm, Tọa độ và Ngày đi.', 'error');
      return;
    }

    const isEdit = !!state.editingTripId;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';

    const uploadedUrls = [];

    try {
      // 1. Upload all newly chosen files to Supabase Storage if available
      for (let i = 0; i < state.selectedFiles.length; i++) {
        const file = state.selectedFiles[i];
        if (supabase) {
          submitBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up fa-fade"></i> Tải ảnh ${i + 1}/${state.selectedFiles.length}...`;
          const ext = file.name.split('.').pop() || 'jpg';
          const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
          const uniqueFileName = `trip-${Date.now()}-${i}-${cleanName}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from('travel-photos')
            .upload(uniqueFileName, file, { cacheControl: '3600', upsert: false });

          if (!uploadError) {
            const { data: urlData } = supabase.storage.from('travel-photos').getPublicUrl(uniqueFileName);
            if (urlData && urlData.publicUrl) {
              uploadedUrls.push(urlData.publicUrl);
            }
          }
        } else {
          // Demo / local mode: read file as Base64 Data URL
          const dataUrl = await new Promise((res) => {
            const reader = new FileReader();
            reader.onload = (ev) => res(ev.target.result);
            reader.readAsDataURL(file);
          });
          uploadedUrls.push(dataUrl);
        }
      }

      // Combine existing URLs + newly uploaded URLs + any comma-separated URLs
      const manualUrls = rawUrls ? rawUrls.split(',').map(s => s.trim()).filter(Boolean) : [];
      let finalImageUrls = [...state.existingImageUrls, ...uploadedUrls, ...manualUrls];

      if (finalImageUrls.length === 0) {
        finalImageUrls = ['https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80'];
      }

      const tripData = {
        title,
        location,
        lat,
        lng,
        distance_km,
        travel_date,
        vehicle,
        description,
        image_urls: finalImageUrls
      };

      if (isEdit) {
        // UPDATE existing trip
        submitBtn.innerHTML = '<i class="fa-solid fa-database fa-fade"></i> Đang cập nhật...';

        if (supabase) {
          const { data: updated, error: updateError } = await supabase
            .from('travel_trips')
            .update(tripData)
            .eq('id', state.editingTripId)
            .select();

          if (updateError) throw new Error(updateError.message);
        }

        const idx = state.trips.findIndex(t => t.id === state.editingTripId);
        if (idx !== -1) {
          state.trips[idx] = { ...state.trips[idx], ...tripData };
        }
        localStorage.setItem('local_travel_trips', JSON.stringify(state.trips));

        closeModal('modal-add-trip');
        showToast('Cập nhật thành công', `Đã lưu thay đổi cho "${title}"`, 'success');

        renderVehicleFilters();
        renderAllTripMarkers();
        updateSidebarStats();
        renderRecentTripsList();
        selectTrip(state.editingTripId, true);
        state.editingTripId = null;

      } else {
        // INSERT new trip
        submitBtn.innerHTML = '<i class="fa-solid fa-database fa-fade"></i> Đang lưu...';

        let newTripId = `trip-${Date.now()}`;
        if (supabase) {
          const { data: inserted, error: insertError } = await supabase
            .from('travel_trips')
            .insert([tripData])
            .select();

          if (insertError) throw new Error(insertError.message);
          if (inserted && inserted[0]) newTripId = inserted[0].id;
        }

        const savedTrip = { id: newTripId, ...tripData };
        state.trips.unshift(savedTrip);
        localStorage.setItem('local_travel_trips', JSON.stringify(state.trips));

        closeModal('modal-add-trip');
        showToast('Thành công!', `Đã thêm chuyến đi "${title}"`, 'success');

        renderVehicleFilters();
        renderAllTripMarkers();
        updateSidebarStats();
        renderRecentTripsList();
        selectTrip(newTripId, true);
      }

    } catch (err) {
      console.error('[Form Submit Error]', err);
      showToast('Lỗi lưu dữ liệu', err.message || 'Không thể lưu vào cơ sở dữ liệu', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = isEdit ? '<i class="fa-solid fa-check"></i> Cập nhật' : '<i class="fa-solid fa-plus"></i> Lưu chuyến đi';
    }
  });
}

// Coordinate picker toggle
function toggleCoordinatePicker(active) {
  state.isCoordinatePickerActive = active;
  const banner = document.getElementById('coord-picker-banner');
  if (banner) {
    if (active) {
      banner.classList.add('active');
      closeModal('modal-add-trip');
    } else {
      banner.classList.remove('active');
    }
  }
}

const btnPickCoord = document.getElementById('btn-pick-coord');
if (btnPickCoord) {
  btnPickCoord.addEventListener('click', () => {
    toggleCoordinatePicker(true);
  });
}

const btnCancelPick = document.getElementById('btn-cancel-pick');
if (btnCancelPick) {
  btnCancelPick.addEventListener('click', () => {
    toggleCoordinatePicker(false);
    openModal('modal-add-trip');
  });
}

// Delete Trip (Admin only)
const btnDeleteTrip = document.getElementById('btn-delete-trip');
if (btnDeleteTrip) {
  btnDeleteTrip.addEventListener('click', async () => {
    if (!state.selectedTripId) return;
    const trip = state.trips.find(t => t.id === state.selectedTripId);
    if (!trip) return;

    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa chuyến đi "${trip.title}"?`);
    if (!confirmed) return;

    if (supabase) {
      try {
        const { error } = await supabase
          .from('travel_trips')
          .delete()
          .eq('id', state.selectedTripId);

        if (error) throw error;
      } catch (err) {
        showToast('Lỗi khi xóa', err.message, 'error');
        return;
      }
    }

    state.trips = state.trips.filter(t => t.id !== state.selectedTripId);
    localStorage.setItem('local_travel_trips', JSON.stringify(state.trips));

    showToast('Đã xóa', `Đã xóa chuyến đi "${trip.title}".`, 'info');
    deselectTrip();
    renderVehicleFilters();
    renderAllTripMarkers();
    updateSidebarStats();
    renderRecentTripsList();
  });
}

// ============================================================================
// 11. SUPABASE CONFIGURATION MODAL & STATUS
// ============================================================================

function updateSupabaseStatus(connected, message) {
  const pill = document.getElementById('supabase-status-pill');
  const dot = document.getElementById('supabase-status-dot');
  const text = document.getElementById('supabase-status-text');

  if (connected) {
    if (dot) dot.className = 'status-dot';
    if (text) text.textContent = 'Supabase: Connected';
    if (pill) pill.title = message || 'Connected to Supabase';
  } else {
    if (dot) dot.className = 'status-dot warning';
    if (text) text.textContent = 'Demo Mode';
    if (pill) pill.title = `${message} Click để cấu hình Supabase URL & Key`;
  }
}

const supabaseStatusPill = document.getElementById('supabase-status-pill');
if (supabaseStatusPill) {
  supabaseStatusPill.addEventListener('click', () => {
    const inputUrl = document.getElementById('cfg-supabase-url');
    const inputKey = document.getElementById('cfg-supabase-key');
    if (inputUrl) inputUrl.value = localStorage.getItem('supabase_url') || (SUPABASE_URL === SUPABASE_URL_PLACEHOLDER ? '' : SUPABASE_URL);
    if (inputKey) inputKey.value = localStorage.getItem('supabase_anon_key') || (SUPABASE_ANON_KEY === SUPABASE_ANON_KEY_PLACEHOLDER ? '' : SUPABASE_ANON_KEY);
    openModal('modal-supabase-config');
  });
}

const supabaseConfigForm = document.getElementById('supabase-config-form');
if (supabaseConfigForm) {
  supabaseConfigForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = document.getElementById('cfg-supabase-url').value.trim();
    const key = document.getElementById('cfg-supabase-key').value.trim();

    if (url && key) {
      localStorage.setItem('supabase_url', url);
      localStorage.setItem('supabase_anon_key', key);
      showToast('Đã lưu cấu hình', 'Đang tải lại dữ liệu với thông tin Supabase mới...', 'success');
      setTimeout(() => window.location.reload(), 800);
    } else {
      localStorage.removeItem('supabase_url');
      localStorage.removeItem('supabase_anon_key');
      showToast('Khôi phục mặc định', 'Đã chuyển về chế độ Demo.', 'info');
      setTimeout(() => window.location.reload(), 800);
    }
  });
}

const btnCopySql = document.getElementById('btn-copy-sql');
if (btnCopySql) {
  btnCopySql.addEventListener('click', () => {
    const sqlText = document.getElementById('schema-sql-text').innerText;
    navigator.clipboard.writeText(sqlText).then(() => {
      showToast('Đã sao chép SQL', 'Dán vào SQL Editor của Supabase để khởi tạo bảng và storage!', 'success');
    });
  });
}

// ============================================================================
// 12. UI MODAL, TOAST SYSTEM & LIGHTBOX
// ============================================================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    const body = modal.querySelector('.modal-body');
    if (body) body.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    const remainingOpen = document.querySelectorAll('.modal-backdrop.open');
    if (remainingOpen.length === 0) {
      document.body.style.overflow = '';
    }
  }
}

document.querySelectorAll('.modal-close-btn, .btn-modal-cancel').forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.modal-backdrop');
    if (modal) closeModal(modal.id);
  });
});

document.querySelectorAll('.modal-backdrop').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal.id);
    }
  });
});

function showToast(title, message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const iconClass = type === 'success' 
    ? 'fa-solid fa-circle-check' 
    : type === 'error' 
      ? 'fa-solid fa-circle-exclamation' 
      : 'fa-solid fa-circle-info';

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="${iconClass}"></i>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

// Lightbox for carousel images
const tripCarouselContainer = document.getElementById('trip-carousel-container');
const lightboxModal = document.getElementById('modal-lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');

if (tripCarouselContainer && lightboxModal) {
  tripCarouselContainer.addEventListener('click', (e) => {
    // If clicked on navigation button, don't open lightbox
    if (e.target.closest('.carousel-nav-btn') || e.target.closest('.carousel-dots-container')) {
      return;
    }
    const curImg = document.getElementById('trip-detail-img');
    const curTitle = document.getElementById('trip-detail-title');
    if (curImg && curImg.src) {
      lightboxImg.src = curImg.src;
      lightboxCaption.textContent = curTitle ? curTitle.textContent : '';
      openModal('modal-lightbox');
    }
  });
}

const btnResetMap = document.getElementById('btn-reset-map');
if (btnResetMap) {
  btnResetMap.addEventListener('click', () => {
    map.flyTo([10.0452, 105.7469], 7, { duration: 1.2 });
    deselectTrip();
  });
}

const btnBackToAll = document.getElementById('btn-back-to-all');
if (btnBackToAll) {
  btnBackToAll.addEventListener('click', () => {
    deselectTrip();
  });
}

const btnAdminLogin = document.getElementById('btn-admin-login');
if (btnAdminLogin) {
  btnAdminLogin.addEventListener('click', () => {
    openModal('modal-login');
  });
}

const tabAll = document.getElementById('tab-all');
const tabDetail = document.getElementById('tab-detail');
if (tabAll) {
  tabAll.addEventListener('click', () => {
    deselectTrip();
  });
}
if (tabDetail) {
  tabDetail.addEventListener('click', () => {
    if (state.selectedTripId) {
      selectTrip(state.selectedTripId, false);
    } else if (state.trips.length > 0) {
      selectTrip(state.trips[0].id, true);
    }
  });
}

const btnFlyToPin = document.getElementById('btn-fly-to-pin');
if (btnFlyToPin) {
  btnFlyToPin.addEventListener('click', () => {
    if (state.selectedTripId) {
      const trip = state.trips.find(t => t.id === state.selectedTripId);
      const polyline = state.mapPolylines.get(state.selectedTripId);
      if (polyline) {
        map.fitBounds(polyline.getBounds(), { padding: [50, 50], maxZoom: 11 });
      } else if (trip) {
        map.flyTo([trip.lat, trip.lng], 12, { duration: 1 });
      }
    }
  });
}

const btnShareTrip = document.getElementById('btn-share-trip');
if (btnShareTrip) {
  btnShareTrip.addEventListener('click', () => {
    if (state.selectedTripId) {
      const trip = state.trips.find(t => t.id === state.selectedTripId);
      if (trip) {
        const shareText = `Tiến's Footprints - Chuyến đi "${trip.title}" tại ${trip.location} (${trip.distance_km} km) trên ${trip.vehicle}!`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shareText);
          showToast('Đã sao chép!', 'Đã sao chép tóm tắt chuyến đi vào bộ nhớ tạm.', 'success');
        }
      }
    }
  });
}

// Layer switcher dropdown click handlers
const btnLayerDropdown = document.getElementById('btn-layer-dropdown');
const layerDropdownMenu = document.getElementById('layer-dropdown-menu');
const layerSwitcherWrapper = document.querySelector('.layer-switcher-wrapper');

if (btnLayerDropdown && layerDropdownMenu) {
  btnLayerDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    layerDropdownMenu.classList.toggle('show');
    if (layerSwitcherWrapper) layerSwitcherWrapper.classList.toggle('open');
  });

  document.querySelectorAll('.layer-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetLayer = btn.dataset.layer;
      setMapLayer(targetLayer);
      layerDropdownMenu.classList.remove('show');
      if (layerSwitcherWrapper) layerSwitcherWrapper.classList.remove('open');
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.layer-switcher-wrapper')) {
      layerDropdownMenu.classList.remove('show');
      if (layerSwitcherWrapper) layerSwitcherWrapper.classList.remove('open');
    }
  });
}

// ============================================================================
// 13. PWA REGISTRATION & INSTALL PROMPT
// ============================================================================

let deferredInstallPrompt = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('[PWA] Service Worker registered with scope:', reg.scope);
      })
      .catch(err => {
        console.warn('[PWA] Service Worker registration failed:', err);
      });
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const androidSection = document.getElementById('android-install-section');
  if (androidSection) androidSection.style.display = 'block';
});

const btnInstallApp = document.getElementById('btn-install-app');
if (btnInstallApp) {
  btnInstallApp.addEventListener('click', () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          showToast('Cài đặt thành công', 'Ứng dụng Tiến\'s Trips đã được cài đặt!', 'success');
        }
        deferredInstallPrompt = null;
      });
    } else {
      openModal('modal-pwa-install');
    }
  });
}

const btnPwaDirectInstall = document.getElementById('btn-pwa-direct-install');
if (btnPwaDirectInstall) {
  btnPwaDirectInstall.addEventListener('click', () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then(() => {
        deferredInstallPrompt = null;
        closeModal('modal-pwa-install');
      });
    } else {
      showToast('Thông báo', 'Vui lòng dùng tính năng "Thêm vào Màn hình chính" trên trình duyệt của bạn.', 'info');
    }
  });
}

// ============================================================================
// 14. BOOTSTRAP APPLICATION
// ============================================================================

window.addEventListener('DOMContentLoaded', async () => {
  await initAuth();
  await fetchTrips();
});
