import React, { useState } from 'react';

export const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(false);
  const [refresh, setRefresh] = useState("5");
  const [mapTheme, setMapTheme] = useState("dark");

  return (
    <div className="flex-1 w-full max-w-[1000px] mx-auto p-4 lg:p-6 overflow-hidden flex flex-col">
      <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-800 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 shrink-0">
          <h2 className="text-2xl font-bold text-slate-100">Settings</h2>
          <p className="text-sm text-slate-400 mt-1">Manage dashboard preferences and map options.</p>
        </div>
        
        {/* Settings Form Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Section: Notifications */}
          <section>
            <h3 className="text-lg font-semibold text-slate-200 mb-4 pb-2 border-b border-slate-800/60">Notification Preferences</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors">
                <div>
                  <div className="font-medium text-slate-200">Push Notifications</div>
                  <div className="text-sm text-slate-400">Receive alerts for High and Critical incidents.</div>
                </div>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded bg-slate-950 border-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
              </label>
              
              <label className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors">
                <div>
                  <div className="font-medium text-slate-200">Sound Alerts</div>
                  <div className="text-sm text-slate-400">Play a sound when a Critical incident is logged.</div>
                </div>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded bg-slate-950 border-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                />
              </label>
            </div>
          </section>

          {/* Section: Data Refresh */}
          <section>
            <h3 className="text-lg font-semibold text-slate-200 mb-4 pb-2 border-b border-slate-800/60">Data Polling Interval</h3>
            <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-800">
              <label className="block mb-2 font-medium text-slate-200">Map Refresh Rate</label>
              <select 
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                value={refresh}
                onChange={(e) => setRefresh(e.target.value)}
              >
                <option value="1">Real-time (1s)</option>
                <option value="5">Standard (5s)</option>
                <option value="15">Relaxed (15s)</option>
                <option value="60">Manual Only (60s)</option>
              </select>
            </div>
          </section>
          
          {/* Section: Display */}
          <section>
            <h3 className="text-lg font-semibold text-slate-200 mb-4 pb-2 border-b border-slate-800/60">Map Display Options</h3>
            <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-800">
              <label className="block mb-2 font-medium text-slate-200">Base Map Theme</label>
              <select 
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                value={mapTheme}
                onChange={(e) => setMapTheme(e.target.value)}
              >
                <option value="dark">NOC Dark (Default)</option>
                <option value="contrast">High Contrast</option>
                <option value="blueprint">Blueprint / Wireframe</option>
              </select>
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
};
