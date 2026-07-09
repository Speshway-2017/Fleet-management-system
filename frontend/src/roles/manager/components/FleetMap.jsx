import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function FleetMap({ vehicles = [], center = [-122.4194, 37.7749], zoom = 10 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom,
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = vehicles.map((vehicle) =>
      new mapboxgl.Marker()
        .setLngLat([vehicle.longitude, vehicle.latitude])
        .setPopup(new mapboxgl.Popup().setText(vehicle.plateNumber))
        .addTo(mapRef.current),
    );
  }, [vehicles]);

  return <div ref={containerRef} className="h-96 w-full rounded-lg" />;
}
