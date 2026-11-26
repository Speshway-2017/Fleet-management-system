import L from "leaflet";

/**
 * Mapbox & Leaflet Map Tile Helper
 * Reads `import.meta.env.VITE_MAPBOX_TOKEN` and provides safe, fallback-protected tile layers.
 */

export const getMapboxToken = () => {
  const token =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_MAPBOX_TOKEN) ||
    (typeof window !== "undefined" && window.__ENV__?.VITE_MAPBOX_TOKEN) ||
    "";

  if (!token || typeof token !== "string") return "";

  const trimmed = token.trim().replace(/^["']|["']$/g, "");

  const isInvalidPlaceholder =
    !trimmed ||
    trimmed === "your_mapbox_access_token" ||
    trimmed.startsWith("your_mapbox") ||
    trimmed === "your_token_here" ||
    trimmed === "undefined" ||
    trimmed === "null" ||
    trimmed.length < 15;

  if (isInvalidPlaceholder) {
    return "";
  }

  // Valid Mapbox public tokens start with 'pk.' (or 'sk.' for secret tokens)
  if (!trimmed.startsWith("pk.") && !trimmed.startsWith("sk.")) {
    return "";
  }

  return trimmed;
};

export const isMapboxTokenConfigured = () => {
  return Boolean(getMapboxToken());
};

/**
 * Creates a Leaflet tile layer with Mapbox Styles API or high-resolution fallback.
 * 
 * @param {'streets' | 'satellite' | 'traffic' | 'dark' | 'light'} style - Layer style
 * @param {Object} options - Leaflet tile layer options
 * @returns {L.TileLayer} Leaflet TileLayer instance
 */
export const createMapTileLayer = (style = "streets", options = {}) => {
  const mapboxToken = getMapboxToken();

  const fallbackUrls = {
    streets: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    traffic: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
  };

  const mapboxStyles = {
    streets: "streets-v12",
    satellite: "satellite-streets-v12",
    traffic: "navigation-day-v1",
    dark: "dark-v11",
    light: "light-v11"
  };

  if (mapboxToken) {
    const styleId = mapboxStyles[style] || mapboxStyles.streets;
    const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/${styleId}/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`;

    const layer = L.tileLayer(mapboxUrl, {
      maxZoom: 19,
      tileSize: 256,
      zoomOffset: 0,
      attribution: "© Mapbox © OpenStreetMap",
      ...options
    });

    // Seamlessly swap to fallback layer if Mapbox returns tile errors (401, quota, etc.)
    layer.on("tileerror", () => {
      const fallbackUrl = fallbackUrls[style] || fallbackUrls.streets;
      if (layer._url !== fallbackUrl) {
        layer.setUrl(fallbackUrl);
      }
    });

    return layer;
  }

  // Fallback tile layer when token is missing or placeholder
  const fallbackUrl = fallbackUrls[style] || fallbackUrls.streets;
  return L.tileLayer(fallbackUrl, {
    maxZoom: 19,
    subdomains: style === "satellite" ? [] : "abcd",
    attribution: style === "satellite" ? "© Esri" : "© CARTO © OpenStreetMap",
    ...options
  });
};
