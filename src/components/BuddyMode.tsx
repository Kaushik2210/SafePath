import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Share2, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Location } from '../types';

interface BuddyModeProps {
  currentLocation: Location;
}

const BuddyMode: React.FC<BuddyModeProps> = ({ currentLocation }) => {
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (isActive && auth.currentUser) {
      const id = auth.currentUser.uid;
      setSessionId(id);
      
      const sessionRef = doc(db, 'buddy_sessions', id);
      
      const updateLocation = async () => {
        await setDoc(sessionRef, {
          userId: id,
          currentLocation,
          lastUpdated: new Date().toISOString(),
          status: 'active',
          serverTimestamp: serverTimestamp()
        }, { merge: true });
      };

      updateLocation();
      const interval = setInterval(updateLocation, 30000); // Update every 30s

      return () => clearInterval(interval);
    }
  }, [isActive, currentLocation]);

  const toggleBuddyMode = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const shareLink = () => {
    const link = `${window.location.origin}/buddy/${sessionId}`;
    navigator.clipboard.writeText(link);
    alert('Tracking link copied to clipboard!');
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-20">
        <button
          onClick={toggleBuddyMode}
          className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl transition-all ${
            isActive 
              ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20' 
              : 'bg-zinc-900/80 border-white/10 text-white hover:bg-zinc-800'
          }`}
        >
          <div className={`p-1.5 rounded-lg ${isActive ? 'bg-black/10' : 'bg-white/5'}`}>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-mono uppercase tracking-widest opacity-50">Buddy Mode</div>
            <div className="text-xs font-bold uppercase tracking-tight">
              {isActive ? 'Live Tracking ON' : 'Start Tracking'}
            </div>
          </div>
          {isActive && (
            <div className="w-2 h-2 rounded-full bg-black animate-pulse ml-2" />
          )}
        </button>

        <AnimatePresence>
          {isActive && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={shareLink}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-white/10 border border-white/10 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all"
            >
              <Share2 className="w-3 h-3" />
              Share Link
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-emerald-500 text-black rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold uppercase tracking-tight text-sm">Buddy Mode Activated</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BuddyMode;
