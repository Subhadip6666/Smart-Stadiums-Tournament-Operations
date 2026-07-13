import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Incidents } from './pages/Incidents';
import { Settings } from './pages/Settings';

function App() {
  return (
    <div className="h-screen bg-slate-950 text-slate-50 flex flex-col font-sans overflow-hidden">
      <header className="bg-slate-900 border-b border-slate-800 p-4 shrink-0 z-50">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
              AI
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">StadiumAI NOC</h1>
          </div>
          <nav className="flex gap-2">
            <NavLink 
              to="/dashboard"
              className={({ isActive }) => 
                `px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  isActive 
                  ? 'bg-slate-800 text-slate-100 font-semibold' 
                  : 'text-slate-400 hover:bg-slate-800'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/incidents"
              className={({ isActive }) => 
                `px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  isActive 
                  ? 'bg-slate-800 text-slate-100 font-semibold' 
                  : 'text-slate-400 hover:bg-slate-800'
                }`
              }
            >
              Incidents
            </NavLink>
            <NavLink 
              to="/settings"
              className={({ isActive }) => 
                `px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  isActive 
                  ? 'bg-slate-800 text-slate-100 font-semibold' 
                  : 'text-slate-400 hover:bg-slate-800'
                }`
              }
            >
              Settings
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Content Area containing the Routes */}
      <main className="flex-1 w-full overflow-hidden flex flex-col">
        <Routes>
          {/* Default to dashboard on / */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
