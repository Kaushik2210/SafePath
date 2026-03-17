import { differenceInHours, parseISO } from 'date-fns';
import { Incident } from './types';

export function calculateSafetyScore(
  location: { lat: number; lng: number },
  incidents: Incident[],
  currentTime: Date = new Date()
): number {
  let score = 100;
  
  // Time multiplier (10pm-5am): ×1.5 penalty
  const hour = currentTime.getHours();
  const isNightTime = hour >= 22 || hour < 5;
  const timeMultiplier = isNightTime ? 1.5 : 1.0;

  incidents.forEach((incident) => {
    // Check proximity (roughly 500m for simplicity in this demo)
    const distance = getDistance(location, incident.location);
    if (distance > 0.5) return; // Skip if too far

    const hoursAgo = differenceInHours(currentTime, parseISO(incident.timestamp));
    
    let penalty = 0;
    if (hoursAgo <= 1) {
      penalty = 15;
    } else if (hoursAgo <= 6) {
      penalty = 8;
    } else if (hoursAgo <= 24) {
      penalty = 3;
    }

    // Apply lighting penalty specifically if it's a lighting incident
    if (incident.type === 'lighting') {
      penalty = 10;
    }

    score -= penalty * timeMultiplier;
  });

  return Math.max(0, Math.min(100, Math.round(score)));
}

// Simple Haversine distance in km
function getDistance(loc1: { lat: number; lng: number }, loc2: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = deg2rad(loc2.lat - loc1.lat);
  const dLng = deg2rad(loc2.lng - loc1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(loc1.lat)) * Math.cos(deg2rad(loc2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-rose-500';
}

export function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-rose-500';
}
