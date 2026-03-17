import React, { useEffect, useRef, useState } from 'react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { AlertTriangle } from 'lucide-react';
import { Incident, Location } from '../types';

interface MapContainerProps {
  center: Location;
  incidents: Incident[];
  onMapClick: (location: Location) => void;
  onRouteSelected?: (score: number) => void;
}

/**
 * 1. CONFIGURATION (FIXES: setOptions() called once error)
 * We pull the API key and set options outside the component so it 
 * only runs once when the file is loaded, regardless of re-renders.
 */
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (GOOGLE_MAPS_API_KEY) {
  setOptions({
    key: GOOGLE_MAPS_API_KEY,
    v: 'weekly',
  });
}

const MapContainer: React.FC<MapContainerProps> = ({ center, incidents, onMapClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Using refs for layers to manage their lifecycle without triggering re-renders
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const visualizationLibRef = useRef<google.maps.VisualizationLibrary | null>(null);

  // 2. INITIALIZATION EFFECT
  // This runs exactly once on mount.
  useEffect(() => {
    const initMap = async () => {
      if (!GOOGLE_MAPS_API_KEY) {
        setError('Google Maps API key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Import necessary libraries
        const { Map } = await importLibrary('maps') as google.maps.MapsLibrary;
        const visualizationLib = await importLibrary('visualization') as google.maps.VisualizationLibrary;
        visualizationLibRef.current = visualizationLib;

        if (mapRef.current && !map) {
          const newMap = new Map(mapRef.current, {
            center,
            zoom: 14,
            /**
             * FIXES: "styles property cannot be set when a mapId is present"
             * If you use 'DEMO_MAP_ID', you must set your Dark Mode styles 
             * in the Google Cloud Console. I have removed the 'styles' array 
             * here to stop the error.
             */
            mapId: 'DEMO_MAP_ID',
            disableDefaultUI: true,
            zoomControl: true,
          });

          // Click Listener
          newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            }
          });

          setMap(newMap);
        }
        setError(null);
      } catch (err: any) {
        console.error('Error initializing map:', err);
        setError('Failed to load Google Maps. Check your API key permissions and authorized domains.');
      } finally {
        setIsLoading(false);
      }
    };

    initMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run ONLY once

  // 3. REACTIVE CENTER UPDATES
  // Panning the map when the 'center' prop changes without re-initializing the whole map.
  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [center, map]);

  // 4. HEATMAP UPDATE EFFECT
  // Updates the heatmap whenever the incidents list changes.
  useEffect(() => {
    if (map && visualizationLibRef.current) {
      // Clean up existing heatmap
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
      }

      if (incidents.length > 0) {
        const heatmapData = incidents.map(incident => ({
          location: new google.maps.LatLng(incident.location.lat, incident.location.lng),
          weight: 1
        }));

        heatmapRef.current = new visualizationLibRef.current.HeatmapLayer({
          data: heatmapData,
          map: map,
          radius: 30,
          opacity: 0.7,
          gradient: [
            'rgba(0, 255, 255, 0)',
            'rgba(0, 255, 255, 1)',
            'rgba(0, 191, 255, 1)',
            'rgba(0, 127, 255, 1)',
            'rgba(0, 63, 255, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(0, 0, 223, 1)',
            'rgba(0, 0, 191, 1)',
            'rgba(0, 0, 159, 1)',
            'rgba(0, 0, 127, 1)',
            'rgba(63, 0, 91, 1)',
            'rgba(127, 0, 63, 1)',
            'rgba(191, 0, 31, 1)',
            'rgba(255, 0, 0, 1)'
          ]
        });
      }
    }
  }, [map, incidents]);

  return (
    <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mb-4" />
          <p className="text-white/60 font-mono text-xs uppercase tracking-widest">Initializing Map...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-900 p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
          <h3 className="text-white font-bold mb-2">Map Load Error</h3>
          <p className="text-white/60 text-sm max-w-xs mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full" id="google-map" />

      {/* Floating UI Overlay */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-xl z-10">
        <h2 className="text-xs font-mono uppercase tracking-widest text-white/50 mb-1">Live Safety Heatmap</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-sm font-medium text-white">{incidents.length} Active Reports</span>
        </div>
      </div>
    </div>
  );
};

export default MapContainer;