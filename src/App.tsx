import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, AlertTriangle, Search, Menu, Bell } from 'lucide-react';
import { auth, db } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import MapContainer from './components/MapContainer';
import IncidentReportModal from './components/IncidentReportModal';
import RouteSafetyPanel from './components/RouteSafetyPanel';
import BuddyMode from './components/BuddyMode';
import { Incident, Location } from './types';
import { calculateSafetyScore } from './SafetyScoreEngine';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location>({ lat: 40.7128, lng: -74.0060 }); // NYC Default
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [clickedLocation, setClickedLocation] = useState<Location | null>(null);
  const [safetyScore, setSafetyScore] = useState(100);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Auth setup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setIsAuthReady(true);
        setAuthError(null);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error('Auth error:', error);
          if (error.code === 'auth/admin-restricted-operation') {
            setAuthError('Anonymous Authentication is disabled in Firebase Console. Please enable it in Build > Authentication > Sign-in method.');
          } else {
            setAuthError(error.message);
          }
        });
      }
    });
    return unsubscribe;
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error('Error getting location:', error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Fetch incidents
  useEffect(() => {
    if (!isAuthReady) return;

    const q = query(collection(db, 'incidents'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedIncidents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Incident[];
      setIncidents(fetchedIncidents);
    });

    return unsubscribe;
  }, [isAuthReady]);

  // Update safety score
  useEffect(() => {
    const score = calculateSafetyScore(currentLocation, incidents);
    setSafetyScore(score);
  }, [currentLocation, incidents]);

  const handleMapClick = (location: Location) => {
    setClickedLocation(location);
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = async (type: string, description: string) => {
    if (!clickedLocation || !user) return;

    try {
      await addDoc(collection(db, 'incidents'), {
        type,
        description,
        location: clickedLocation,
        timestamp: new Date().toISOString(),
        reporterId: user.uid,
        serverTimestamp: serverTimestamp()
      });
      setIsReportModalOpen(false);
      setClickedLocation(null);
    } catch (error) {
      console.error('Error reporting incident:', error);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans selection:bg-rose-500/30">
      {/* Auth Error Overlay */}
      <AnimatePresence>
        {authError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
          >
            <div className="max-w-md w-full bg-zinc-900 border border-white/10 p-8 rounded-3xl shadow-2xl text-center">
              <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">Configuration Required</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                {authError}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all"
              >
                Retry Connection
              </button>
              <p className="mt-4 text-[10px] text-white/20 uppercase tracking-widest">
                Firebase Authentication Error
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
            <Shield className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">SafePath</h1>
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">Real-time Safety</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button className="p-3 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-zinc-800 transition-all">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-3 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-zinc-800 transition-all">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="absolute top-20 left-4 right-4 z-20 sm:left-1/2 sm:-translate-x-1/2 sm:w-96">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-white/30 group-focus-within:text-white transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search destination..."
            className="w-full bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all shadow-2xl"
          />
        </div>
      </div>

      {/* Main Map */}
      <main className="w-full h-full">
        <MapContainer
          center={currentLocation}
          incidents={incidents}
          onMapClick={handleMapClick}
        />
      </main>

      {/* UI Panels */}
      <RouteSafetyPanel score={safetyScore} />
      <BuddyMode currentLocation={currentLocation} />

      {/* Modals */}
      <IncidentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        location={clickedLocation}
        onSubmit={handleReportSubmit}
      />

      {/* Report Trigger Button (Mobile) */}
      <button
        onClick={() => {
          setClickedLocation(currentLocation);
          setIsReportModalOpen(true);
        }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 px-8 py-4 bg-rose-500 text-white font-bold rounded-full shadow-2xl shadow-rose-500/40 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
      >
        <AlertTriangle className="w-5 h-5" />
        Report Incident
      </button>

      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-black to-transparent opacity-80" />
      </div>
    </div>
  );
}
