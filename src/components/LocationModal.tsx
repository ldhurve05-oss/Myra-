import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink, X, RefreshCw, Compass } from 'lucide-react';

interface LocationModalProps {
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ onClose }) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>('Detecting location via GPS...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lng: longitude });
          setAddress(`Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)} • High Precision GPS`);
          setLoading(false);
        },
        err => {
          console.warn('Geolocation error:', err);
          // Default fallback
          setCoords({ lat: 28.6139, lng: 77.209 });
          setAddress('New Delhi, India (Default Simulated GPS)');
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setCoords({ lat: 28.6139, lng: 77.209 });
      setAddress('New Delhi, India');
      setLoading(false);
    }
  };

  const mapsUrl = coords
    ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
    : 'https://maps.google.com';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-600/30">
              <MapPin className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Live GPS Location</h3>
              <p className="text-[10px] text-slate-400">Android Location Services</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-rose-500/10 border-2 border-rose-500/40 flex items-center justify-center animate-pulse">
              <Compass className="w-10 h-10 text-rose-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>

          <h4 className="text-sm font-bold text-white mb-1">
            {loading ? 'Acquiring GPS Signal...' : 'Current Location Locked'}
          </h4>
          <p className="text-xs text-slate-300 max-w-xs mb-4">{address}</p>

          {coords && (
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 mb-5 w-full">
              GPS: {coords.lat.toFixed(5)}° N, {coords.lng.toFixed(5)}° E
            </div>
          )}

          <div className="flex items-center gap-2 w-full">
            <button
              onClick={fetchLocation}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              title="Refresh GPS"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 transition active:scale-95"
            >
              <Navigation className="w-4 h-4 fill-white" />
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
