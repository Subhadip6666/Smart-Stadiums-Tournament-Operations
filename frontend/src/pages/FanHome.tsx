import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Navigation, AlertTriangle, Shield, MapPin, Phone } from 'lucide-react';

const QUICK_LINKS = [
  { to: '/chat', icon: <MessageSquare className="h-6 w-6" />, label: 'AI Assistant', desc: 'Ask anything in 12 languages', color: 'from-blue-600 to-cyan-600', shadow: 'shadow-blue-600/20' },
  { to: '/navigate', icon: <Navigation className="h-6 w-6" />, label: 'Find My Way', desc: 'Shortest path navigation', color: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-600/20' },
  { to: '/incidents', icon: <AlertTriangle className="h-6 w-6" />, label: 'Report Issue', desc: 'Medical, security, facility', color: 'from-amber-600 to-orange-600', shadow: 'shadow-amber-600/20' },
];

export const FanHome: React.FC = () => {
  return (
    <div className="flex-1 w-full max-w-[800px] mx-auto p-4 lg:p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      {/* Hero */}
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-600/20">
          <span className="text-2xl font-bold text-white">AI</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Welcome to MetLife Stadium</h1>
        <p className="text-slate-400 text-base">FIFA World Cup 2026 — Your AI-powered stadium companion</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="px-2.5 py-1 rounded-full bg-red-600/15 border border-red-600/25 text-red-400 text-xs font-bold animate-pulse">LIVE</span>
          <span className="text-sm text-slate-300 font-medium">Brazil 1 — 1 Germany • 67'</span>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="glass-card-hover p-5 flex flex-col items-center text-center gap-3 group"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center text-white shadow-lg ${link.shadow} group-hover:scale-105 transition-transform duration-200`}>
              {link.icon}
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 mb-1">{link.label}</h3>
              <p className="text-xs text-slate-400">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Emergency */}
      <div className="glass-card p-5 border-red-900/30 bg-red-950/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-600/20 flex items-center justify-center shrink-0">
            <Phone className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-red-200">Emergency?</h3>
            <p className="text-sm text-red-300/70">Contact stadium security immediately at Info Desk or call the emergency hotline.</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-400 uppercase font-medium">Stadium</span>
          </div>
          <p className="text-sm font-semibold text-slate-200">MetLife Stadium</p>
          <p className="text-xs text-slate-400">East Rutherford, NJ</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-400 uppercase font-medium">Attendance</span>
          </div>
          <p className="text-sm font-semibold text-slate-200 font-mono-data">78,212</p>
          <p className="text-xs text-slate-400">/ 82,500 capacity</p>
        </div>
      </div>
    </div>
  );
};