import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, Shield, MapPin } from 'lucide-react';
import { INCIDENT_TYPES, Location } from '../types';

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
  onSubmit: (type: string, description: string) => void;
}

const IncidentReportModal: React.FC<IncidentReportModalProps> = ({ isOpen, onClose, location, onSubmit }) => {
  const [selectedType, setSelectedType] = React.useState('');
  const [description, setDescription] = React.useState('');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                </div>
                <h2 className="text-xl font-semibold text-white">Report Incident</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest mb-2">
                <MapPin className="w-3 h-3" />
                <span>Incident Location</span>
              </div>
              <p className="text-sm text-white font-mono">
                {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <label className="text-xs font-mono uppercase tracking-widest text-white/30">Select Type</label>
              <div className="grid grid-cols-2 gap-2">
                {INCIDENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all border ${
                      selectedType === type.id
                        ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/20'
                        : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <label className="text-xs font-mono uppercase tracking-widest text-white/30">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-rose-500/50 transition-colors resize-none h-24"
              />
            </div>

            <button
              onClick={() => onSubmit(selectedType, description)}
              disabled={!selectedType}
              className="w-full py-4 bg-white text-black font-semibold rounded-2xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Submit Anonymous Report
            </button>
            
            <p className="text-center text-[10px] text-white/30 mt-4 uppercase tracking-tighter">
              Your report is anonymous and helps keep the community safe.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default IncidentReportModal;
