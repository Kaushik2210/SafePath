import React from 'react';
import { motion } from 'motion/react';
import { Shield, Navigation, Clock, AlertCircle } from 'lucide-react';
import { getScoreColor, getScoreBg } from '../SafetyScoreEngine';

interface RouteSafetyPanelProps {
  score: number;
  destination?: string;
}

const RouteSafetyPanel: React.FC<RouteSafetyPanelProps> = ({ score, destination }) => {
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-20"
    >
      <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/5 rounded-lg">
                <Navigation className="w-4 h-4 text-white/50" />
              </div>
              <span className="text-sm font-medium text-white truncate max-w-[120px]">
                {destination || 'Current Route'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/5">
              <Clock className="w-3 h-3 text-white/30" />
              <span className="text-[10px] font-mono text-white/50 uppercase">Live</span>
            </div>
          </div>

          <div className="flex items-end justify-between mb-6">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-white/30 mb-1">Safety Score</h3>
              <div className={`text-5xl font-bold tracking-tighter ${getScoreColor(score)}`}>
                {score}<span className="text-lg opacity-50">/100</span>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getScoreBg(score)} text-black`}>
              {score >= 80 ? 'Safe' : score >= 50 ? 'Caution' : 'High Risk'}
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                className={`h-full ${getScoreBg(score)}`}
              />
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
              <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${getScoreColor(score)}`} />
              <p className="text-xs text-white/60 leading-relaxed">
                {score >= 80 
                  ? "This route has minimal recent incidents. Continue with normal awareness."
                  : score >= 50 
                  ? "Moderate incident density detected. Stay in well-lit areas and avoid distractions."
                  : "High incident density. Consider an alternative route or use Buddy Mode."}
              </p>
            </div>
          </div>
        </div>
        
        <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold uppercase tracking-widest transition-all border-t border-white/5 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" />
          View Safety Details
        </button>
      </div>
    </motion.div>
  );
};

export default RouteSafetyPanel;
